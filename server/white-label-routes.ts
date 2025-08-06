import express from 'express';
import { z } from 'zod';
import { whiteLabelService } from './services/whiteLabelService';
import { insertWhiteLabelConfigSchema, insertDomainMappingSchema } from '@shared/schema';

const router = express.Router();

// Create white label configuration
router.post('/config', async (req, res) => {
  try {
    // Convert numeric revenueSharePercentage to string if needed
    if (req.body.revenueSharePercentage && typeof req.body.revenueSharePercentage === 'number') {
      req.body.revenueSharePercentage = req.body.revenueSharePercentage.toString();
    }
    
    const validatedData = insertWhiteLabelConfigSchema.parse(req.body);
    const config = await whiteLabelService.createWhiteLabelConfig(validatedData);
    res.json({ success: true, config });
  } catch (error) {
    console.error('Error creating white label config:', error);
    res.status(400).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create configuration' 
    });
  }
});

// Get white label configuration by tenant
router.get('/config/:tenantId', async (req, res) => {
  try {
    const { tenantId } = req.params;
    const config = await whiteLabelService.getWhiteLabelConfigByTenant(tenantId);
    
    if (!config) {
      return res.status(404).json({ success: false, error: 'Configuration not found' });
    }
    
    res.json({ success: true, config });
  } catch (error) {
    console.error('Error fetching white label config:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch configuration' 
    });
  }
});

// Update white label configuration
router.put('/config/:id', async (req, res) => {
  try {
    const configId = parseInt(req.params.id);
    const updates = req.body;
    
    const config = await whiteLabelService.updateWhiteLabelConfig(configId, updates);
    res.json({ success: true, config });
  } catch (error) {
    console.error('Error updating white label config:', error);
    res.status(400).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update configuration' 
    });
  }
});

// Delete white label configuration
router.delete('/config/:id', async (req, res) => {
  try {
    const configId = parseInt(req.params.id);
    await whiteLabelService.deleteWhiteLabelConfig(configId);
    res.json({ success: true, message: 'Configuration deleted successfully' });
  } catch (error) {
    console.error('Error deleting white label config:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete configuration' 
    });
  }
});

// Verify custom domain
router.post('/domain/verify', async (req, res) => {
  try {
    const { domain } = req.body;
    
    if (!domain) {
      return res.status(400).json({ success: false, error: 'Domain is required' });
    }
    
    const result = await whiteLabelService.verifyDomain(domain);
    res.json(result);
  } catch (error) {
    console.error('Error verifying domain:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to verify domain' 
    });
  }
});

// Get DNS instructions for domain setup
router.get('/domain/dns-instructions/:domain', async (req, res) => {
  try {
    const { domain } = req.params;
    const instructions = await whiteLabelService.generateDNSInstructions(domain);
    res.json({ success: true, ...instructions });
  } catch (error) {
    console.error('Error generating DNS instructions:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to generate DNS instructions' 
    });
  }
});

// Get white label configuration for current request
router.get('/config-for-domain/:domain', async (req, res) => {
  try {
    const { domain } = req.params;
    const config = await whiteLabelService.getWhiteLabelConfigForRequest(domain);
    
    if (!config) {
      return res.status(404).json({ success: false, error: 'Configuration not found for domain' });
    }
    
    res.json({ success: true, config });
  } catch (error) {
    console.error('Error fetching config for domain:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch configuration' 
    });
  }
});

// Generate embed code for white label widget
router.get('/embed-code/:configId', async (req, res) => {
  try {
    const configId = parseInt(req.params.configId);
    const embedCode = await whiteLabelService.generateEmbedCode(configId);
    res.json({ success: true, embedCode });
  } catch (error) {
    console.error('Error generating embed code:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to generate embed code' 
    });
  }
});

// Get revenue share report
router.get('/revenue-share/:tenantId', async (req, res) => {
  try {
    const { tenantId } = req.params;
    const report = await whiteLabelService.getRevenueShareReport(tenantId);
    res.json({ success: true, report });
  } catch (error) {
    console.error('Error generating revenue share report:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to generate revenue share report' 
    });
  }
});

// Get domain mapping
router.get('/domain-mapping/:domain', async (req, res) => {
  try {
    const { domain } = req.params;
    const mapping = await whiteLabelService.getDomainMapping(domain);
    
    if (!mapping) {
      return res.status(404).json({ success: false, error: 'Domain mapping not found' });
    }
    
    res.json({ success: true, mapping });
  } catch (error) {
    console.error('Error fetching domain mapping:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch domain mapping' 
    });
  }
});

// Test white label configuration endpoint for debugging
router.get('/test/:domain', async (req, res) => {
  try {
    const { domain } = req.params;
    
    // Test domain lookup
    const config = await whiteLabelService.getWhiteLabelConfigByDomain(domain);
    const mapping = await whiteLabelService.getDomainMapping(domain);
    
    res.json({
      success: true,
      test: {
        domain,
        configFound: !!config,
        mappingFound: !!mapping,
        config: config || null,
        mapping: mapping || null
      }
    });
  } catch (error) {
    console.error('Error testing white label config:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to test configuration' 
    });
  }
});

export { router as whiteLabelRoutes };