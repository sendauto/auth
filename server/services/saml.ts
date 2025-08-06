/**
 * SAML 2.0 Service Implementation
 * Enterprise SAML authentication and configuration management
 */

import { type SamlConfig, type InsertSamlConfig } from "@shared/schema";
import { type IStorage } from "../storage";
import crypto from 'crypto';
import { XMLParser, XMLBuilder } from 'fast-xml-parser';

export interface SAMLAssertionData {
  nameID: string;
  attributes: Record<string, string>;
  sessionIndex?: string;
  notOnOrAfter?: Date;
}

export interface SAMLMetadata {
  entityID: string;
  singleSignOnService: string;
  singleLogoutService?: string;
  certificate: string;
  nameIDFormat?: string;
}

export interface SAMLServiceProviderMetadata {
  entityID: string;
  assertionConsumerService: string;
  singleLogoutService?: string;
  certificate: string;
  privateKey?: string;
}

export class SAMLService {
  constructor(private storage: IStorage) {}

  /**
   * Create SAML configuration for tenant
   */
  async createSAMLConfig(tenantId: number, config: Omit<InsertSamlConfig, 'tenantId'>): Promise<SamlConfig> {
    const samlConfig = await this.storage.createSamlConfig({
      ...config,
      tenantId
    });

    return samlConfig;
  }

  /**
   * Get SAML configuration by tenant
   */
  async getSAMLConfig(tenantId: number): Promise<SamlConfig | undefined> {
    return this.storage.getSamlConfigByTenant(tenantId);
  }

  /**
   * Update SAML configuration
   */
  async updateSAMLConfig(configId: number, updates: Partial<SamlConfig>): Promise<SamlConfig> {
    return this.storage.updateSamlConfig(configId, updates);
  }

  /**
   * Delete SAML configuration
   */
  async deleteSAMLConfig(configId: number): Promise<void> {
    return this.storage.deleteSamlConfig(configId);
  }

  /**
   * Generate Service Provider metadata XML
   */
  generateServiceProviderMetadata(baseUrl: string, entityId: string, certificate: string): string {
    const metadata = {
      'md:EntityDescriptor': {
        '@_xmlns:md': 'urn:oasis:names:tc:SAML:2.0:metadata',
        '@_entityID': entityId,
        'md:SPSSODescriptor': {
          '@_AuthnRequestsSigned': 'true',
          '@_WantAssertionsSigned': 'true',
          '@_protocolSupportEnumeration': 'urn:oasis:names:tc:SAML:2.0:protocol',
          'md:KeyDescriptor': {
            '@_use': 'signing',
            'ds:KeyInfo': {
              '@_xmlns:ds': 'http://www.w3.org/2000/09/xmldsig#',
              'ds:X509Data': {
                'ds:X509Certificate': certificate.replace(/-----BEGIN CERTIFICATE-----\n?|-----END CERTIFICATE-----\n?/g, '').replace(/\n/g, '')
              }
            }
          },
          'md:AssertionConsumerService': {
            '@_Binding': 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST',
            '@_Location': `${baseUrl}/api/auth/saml/acs`,
            '@_index': '0',
            '@_isDefault': 'true'
          },
          'md:SingleLogoutService': {
            '@_Binding': 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect',
            '@_Location': `${baseUrl}/api/auth/saml/sls`
          }
        }
      }
    };

    const builder = new XMLBuilder({ 
      ignoreAttributes: false, 
      format: true,
      suppressEmptyNode: true
    });

    return `<?xml version="1.0" encoding="UTF-8"?>\n${builder.build(metadata)}`;
  }

  /**
   * Parse Identity Provider metadata XML
   */
  parseIdentityProviderMetadata(metadataXml: string): SAMLMetadata {
    const parser = new XMLParser({ ignoreAttributes: false });
    const metadata = parser.parse(metadataXml);

    const entityDescriptor = metadata['md:EntityDescriptor'] || metadata.EntityDescriptor;
    const idpDescriptor = entityDescriptor['md:IDPSSODescriptor'] || entityDescriptor.IDPSSODescriptor;

    if (!entityDescriptor || !idpDescriptor) {
      throw new Error('Invalid SAML metadata: Missing EntityDescriptor or IDPSSODescriptor');
    }

    const ssoServices = Array.isArray(idpDescriptor['md:SingleSignOnService']) 
      ? idpDescriptor['md:SingleSignOnService'] 
      : [idpDescriptor['md:SingleSignOnService']];

    const ssoService = ssoServices.find((service: any) => 
      service['@_Binding'] === 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect' ||
      service['@_Binding'] === 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST'
    );

    if (!ssoService) {
      throw new Error('No supported SSO service binding found in metadata');
    }

    const keyDescriptor = idpDescriptor['md:KeyDescriptor'] || idpDescriptor.KeyDescriptor;
    const certificate = keyDescriptor?.['ds:KeyInfo']?.['ds:X509Data']?.['ds:X509Certificate'] ||
                       keyDescriptor?.KeyInfo?.X509Data?.X509Certificate;

    if (!certificate) {
      throw new Error('No certificate found in SAML metadata');
    }

    return {
      entityID: entityDescriptor['@_entityID'] || entityDescriptor.entityID,
      singleSignOnService: ssoService['@_Location'] || ssoService.Location,
      certificate: this.formatCertificate(certificate),
      nameIDFormat: 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress'
    };
  }

  /**
   * Generate SAML AuthnRequest
   */
  generateAuthnRequest(
    issuer: string, 
    destination: string, 
    assertionConsumerServiceURL: string,
    relayState?: string
  ): { requestXml: string, requestId: string } {
    const requestId = `_${crypto.randomUUID()}`;
    const issueInstant = new Date().toISOString();

    const authnRequest = {
      'samlp:AuthnRequest': {
        '@_xmlns:samlp': 'urn:oasis:names:tc:SAML:2.0:protocol',
        '@_xmlns:saml': 'urn:oasis:names:tc:SAML:2.0:assertion',
        '@_ID': requestId,
        '@_Version': '2.0',
        '@_IssueInstant': issueInstant,
        '@_Destination': destination,
        '@_AssertionConsumerServiceURL': assertionConsumerServiceURL,
        '@_ProtocolBinding': 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST',
        'saml:Issuer': issuer,
        'samlp:NameIDPolicy': {
          '@_Format': 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress',
          '@_AllowCreate': 'true'
        }
      }
    };

    const builder = new XMLBuilder({ 
      ignoreAttributes: false, 
      format: false,
      suppressEmptyNode: true
    });

    const requestXml = `<?xml version="1.0" encoding="UTF-8"?>\n${builder.build(authnRequest)}`;

    return { requestXml, requestId };
  }

  /**
   * Parse and validate SAML Response
   */
  parseSAMLResponse(responseXml: string, expectedRequestId?: string): SAMLAssertionData {
    const parser = new XMLParser({ ignoreAttributes: false });
    const response = parser.parse(responseXml);

    const samlResponse = response['samlp:Response'] || response.Response;
    if (!samlResponse) {
      throw new Error('Invalid SAML Response: Missing Response element');
    }

    // Validate InResponseTo if provided
    if (expectedRequestId && samlResponse['@_InResponseTo'] !== expectedRequestId) {
      throw new Error('SAML Response InResponseTo does not match request ID');
    }

    const assertion = samlResponse['saml:Assertion'] || samlResponse.Assertion;
    if (!assertion) {
      throw new Error('Invalid SAML Response: Missing Assertion');
    }

    const subject = assertion['saml:Subject'] || assertion.Subject;
    const nameID = subject?.['saml:NameID'] || subject?.NameID;

    if (!nameID) {
      throw new Error('Invalid SAML Response: Missing NameID');
    }

    // Extract attributes
    const attributeStatement = assertion['saml:AttributeStatement'] || assertion.AttributeStatement;
    const attributes: Record<string, string> = {};

    if (attributeStatement) {
      const attributeArray = Array.isArray(attributeStatement['saml:Attribute']) 
        ? attributeStatement['saml:Attribute']
        : [attributeStatement['saml:Attribute']];

      attributeArray?.forEach((attr: any) => {
        if (attr && attr['@_Name']) {
          const attrValue = attr['saml:AttributeValue'] || attr.AttributeValue;
          if (attrValue) {
            attributes[attr['@_Name']] = typeof attrValue === 'string' ? attrValue : attrValue['#text'] || attrValue.toString();
          }
        }
      });
    }

    // Extract session information
    const authnStatement = assertion['saml:AuthnStatement'] || assertion.AuthnStatement;
    const sessionIndex = authnStatement?.['@_SessionIndex'];

    // Extract validity period
    const conditions = assertion['saml:Conditions'] || assertion.Conditions;
    const notOnOrAfter = conditions?.['@_NotOnOrAfter'] ? new Date(conditions['@_NotOnOrAfter']) : undefined;

    return {
      nameID: typeof nameID === 'string' ? nameID : nameID['#text'] || nameID.toString(),
      attributes,
      sessionIndex,
      notOnOrAfter
    };
  }

  /**
   * Generate SAML Logout Request
   */
  generateLogoutRequest(
    issuer: string,
    destination: string,
    nameID: string,
    sessionIndex?: string
  ): { requestXml: string, requestId: string } {
    const requestId = `_${crypto.randomUUID()}`;
    const issueInstant = new Date().toISOString();

    const logoutRequest = {
      'samlp:LogoutRequest': {
        '@_xmlns:samlp': 'urn:oasis:names:tc:SAML:2.0:protocol',
        '@_xmlns:saml': 'urn:oasis:names:tc:SAML:2.0:assertion',
        '@_ID': requestId,
        '@_Version': '2.0',
        '@_IssueInstant': issueInstant,
        '@_Destination': destination,
        'saml:Issuer': issuer,
        'saml:NameID': {
          '@_Format': 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress',
          '#text': nameID
        },
        ...(sessionIndex && {
          'samlp:SessionIndex': sessionIndex
        })
      }
    };

    const builder = new XMLBuilder({ 
      ignoreAttributes: false, 
      format: false,
      suppressEmptyNode: true
    });

    const requestXml = `<?xml version="1.0" encoding="UTF-8"?>\n${builder.build(logoutRequest)}`;

    return { requestXml, requestId };
  }

  /**
   * Validate SAML certificate
   */
  validateCertificate(certificate: string): boolean {
    try {
      // Basic certificate format validation
      const certRegex = /^-----BEGIN CERTIFICATE-----[\s\S]+-----END CERTIFICATE-----$/;
      return certRegex.test(certificate.trim());
    } catch (error) {
      return false;
    }
  }

  /**
   * Map SAML attributes to user data
   */
  mapAttributesToUser(
    attributes: Record<string, string>, 
    attributeMapping: Record<string, string>
  ): Record<string, any> {
    const userData: Record<string, any> = {};

    Object.entries(attributeMapping).forEach(([samlAttribute, userField]) => {
      if (attributes[samlAttribute]) {
        userData[userField] = attributes[samlAttribute];
      }
    });

    return userData;
  }

  /**
   * Generate SAML certificate and private key pair
   */
  async generateCertificateKeyPair(): Promise<{ certificate: string, privateKey: string }> {
    return new Promise((resolve, reject) => {
      const { generateKeyPair } = crypto;
      
      generateKeyPair('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: {
          type: 'spki',
          format: 'pem'
        },
        privateKeyEncoding: {
          type: 'pkcs8',
          format: 'pem'
        }
      }, (err, publicKey, privateKey) => {
        if (err) {
          reject(err);
          return;
        }

        // Generate self-signed certificate
        const certificate = this.generateSelfSignedCertificate(publicKey, privateKey);
        
        resolve({
          certificate,
          privateKey
        });
      });
    });
  }

  /**
   * Format certificate for storage
   */
  private formatCertificate(certificate: string): string {
    const cleanCert = certificate.replace(/\s+/g, '');
    return `-----BEGIN CERTIFICATE-----\n${cleanCert.match(/.{1,64}/g)?.join('\n')}\n-----END CERTIFICATE-----`;
  }

  /**
   * Generate self-signed certificate (for development/testing)
   */
  private generateSelfSignedCertificate(publicKey: string, privateKey: string): string {
    // This is a simplified implementation
    // In production, use proper certificate generation libraries
    const certData = Buffer.from(publicKey).toString('base64');
    return `-----BEGIN CERTIFICATE-----\n${certData.match(/.{1,64}/g)?.join('\n')}\n-----END CERTIFICATE-----`;
  }

  /**
   * Test SAML configuration
   */
  async testSAMLConfiguration(tenantId: number): Promise<{ success: boolean, message: string, details?: any }> {
    try {
      const config = await this.getSAMLConfig(tenantId);
      
      if (!config) {
        return { success: false, message: 'SAML configuration not found' };
      }

      // Validate certificate
      if (!this.validateCertificate(config.certificate)) {
        return { success: false, message: 'Invalid SAML certificate format' };
      }

      // Validate URLs
      try {
        new URL(config.ssoUrl);
        if (config.sloUrl) {
          new URL(config.sloUrl);
        }
      } catch (error) {
        return { success: false, message: 'Invalid SAML URLs' };
      }

      return { 
        success: true, 
        message: 'SAML configuration is valid',
        details: {
          entityId: config.entityId,
          ssoUrl: config.ssoUrl,
          nameIdFormat: config.nameIdFormat,
          attributeMappingCount: Object.keys(config.attributeMapping || {}).length
        }
      };

    } catch (error) {
      return { 
        success: false, 
        message: `SAML configuration test failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }
}

// SAMLService class is already exported via the class declaration above