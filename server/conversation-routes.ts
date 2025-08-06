import express from 'express';
import { logActivity, getBufferStatus, triggerManualArchive } from './conversation-system';

const router = express.Router();

/**
 * POST /api/conversation/log
 * Log individual activities
 */
router.post('/log', async (req, res) => {
  try {
    const { activity } = req.body;
    
    if (!activity) {
      return res.status(400).json({ 
        success: false, 
        error: 'Activity description required' 
      });
    }
    
    await logActivity(activity);
    
    res.json({ success: true });
    
  } catch (error) {
    console.error('[XM API] Error logging activity:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to log activity' 
    });
  }
});

/**
 * POST /api/conversation/update
 * Trigger immediate archive
 */
router.post('/update', async (req, res) => {
  try {
    const { trigger = 'manual', timestamp } = req.body;
    
    const status = await triggerManualArchive(trigger);
    
    res.json({ 
      success: true, 
      entriesArchived: status.bufferLength,
      trigger,
      timestamp: timestamp || new Date().toISOString()
    });
    
  } catch (error) {
    console.error('[XM API] Error triggering archive:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to trigger archive' 
    });
  }
});

/**
 * GET /api/conversation/status
 * Return buffer status and last archive info
 */
router.get('/status', async (req, res) => {
  try {
    const status = getBufferStatus();
    
    res.json({
      success: true,
      ...status
    });
    
  } catch (error) {
    console.error('[XM API] Error getting status:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get status' 
    });
  }
});

export default router;