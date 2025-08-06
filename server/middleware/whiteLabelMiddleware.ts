import { Request, Response, NextFunction } from 'express';
import { whiteLabelService } from '../services/whiteLabelService';

export interface WhiteLabelRequest extends Request {
  whiteLabelConfig?: any;
}

/**
 * Middleware to inject white label configuration based on domain
 */
export const whiteLabelMiddleware = async (req: WhiteLabelRequest, res: Response, next: NextFunction) => {
  try {
    const hostname = req.get('host') || '';
    
    // Skip white label for auth247.net domain (main Auth247 site)
    if (hostname.includes('auth247.net') || hostname.includes('localhost')) {
      return next();
    }
    
    // Check if this is a white label domain
    const config = await whiteLabelService.getWhiteLabelConfigForRequest(hostname);
    
    if (config && config.isActive) {
      // Attach white label configuration to request
      req.whiteLabelConfig = config;
      
      // Add custom headers for white label
      res.setHeader('X-White-Label-Domain', config.customDomain);
      res.setHeader('X-White-Label-Company', config.companyName);
      
      // Inject custom CSS and JS if available
      if (config.customCSS || config.customJS) {
        const originalSend = res.send;
        res.send = function(body: any) {
          if (typeof body === 'string' && body.includes('<head>')) {
            let modifiedBody = body;
            
            // Inject custom CSS
            if (config.customCSS) {
              const customStyles = `<style>${config.customCSS}</style>`;
              modifiedBody = modifiedBody.replace('</head>', customStyles + '</head>');
            }
            
            // Inject custom JS
            if (config.customJS) {
              const customScript = `<script>${config.customJS}</script>`;
              modifiedBody = modifiedBody.replace('</body>', customScript + '</body>');
            }
            
            // Inject theme variables
            const themeVariables = `
              <style>
                :root {
                  --wl-primary-color: ${config.primaryColor};
                  --wl-secondary-color: ${config.secondaryColor};
                  --wl-background-color: ${config.backgroundColor};
                  --wl-text-color: ${config.textColor};
                }
                .white-label-primary { color: var(--wl-primary-color) !important; }
                .white-label-bg-primary { background-color: var(--wl-primary-color) !important; }
                .white-label-secondary { color: var(--wl-secondary-color) !important; }
                .white-label-bg-secondary { background-color: var(--wl-secondary-color) !important; }
              </style>
            `;
            modifiedBody = modifiedBody.replace('</head>', themeVariables + '</head>');
            
            return originalSend.call(this, modifiedBody);
          }
          return originalSend.call(this, body);
        };
      }
    }
    
    next();
  } catch (error) {
    console.error('[White Label] Middleware error:', error);
    // Continue without white label configuration if there's an error
    next();
  }
};

/**
 * API middleware to check white label permissions
 */
export const requireWhiteLabelAccess = (req: WhiteLabelRequest, res: Response, next: NextFunction) => {
  // Check if user has access to white label features
  // This would typically check user's subscription plan
  const user = (req as any).user;
  
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  // For now, allow admin and super_admin roles
  if (!user.roles?.includes('admin') && !user.roles?.includes('super_admin')) {
    return res.status(403).json({ error: 'White label features require admin access' });
  }
  
  next();
};