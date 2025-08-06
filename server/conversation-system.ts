import fs from 'fs-extra';
import crypto from 'crypto';
import path from 'path';

// Configuration
const ARCHIVE_PATH = './CONVERSATION_ARCHIVE.md';
const METADATA_PATH = './archive-metadata.json';
const BUFFER_PATH = './conversation-buffer.json';
const ACTIVITY_BUFFER_SIZE = 10;
const ARCHIVE_COOLDOWN_MINUTES = 10;
const CONTENT_HASH_LENGTH = 100;

// State management
let conversationBuffer = [];
let lastArchiveHash = '';
let sessionStartTime = Date.now();
let lastArchiveTime = 0;

/**
 * Main archiving function with 3-layer duplicate detection
 */
async function updateConversationArchive() {
  try {
    if (conversationBuffer.length === 0) return;

    // Generate content hash for duplicate detection (Method 1)
    const newContentHash = conversationBuffer.map(item => 
      `${item.timestamp}:${item.activity}`
    ).join('|');
    
    const hashedContent = crypto.createHash('sha256').update(newContentHash).digest('hex');
    
    // Method 1: Content hash comparison
    if (hashedContent === lastArchiveHash) {
      console.log('[XM] Skipping duplicate archive (hash match)');
      return;
    }

    // Method 3: Time-based prevention (same session/minute)
    const currentMinute = Math.floor(Date.now() / 60000);
    const lastArchiveMinute = Math.floor(lastArchiveTime / 60000);
    if (currentMinute === lastArchiveMinute && Date.now() - lastArchiveTime < 60000) {
      console.log('[XM] Skipping duplicate archive (time-based)');
      return;
    }

    // Read existing archive content
    let existingContent = '';
    if (await fs.pathExists(ARCHIVE_PATH)) {
      existingContent = await fs.readFile(ARCHIVE_PATH, 'utf8');
    }

    // Method 2: Recent content scanning
    const existingLines = existingContent.split('\n');
    const recentContent = existingLines.slice(-20).join('\n');
    const contentSample = newContentHash.substring(0, CONTENT_HASH_LENGTH);
    
    if (recentContent.includes(contentSample)) {
      console.log('[XM] Skipping duplicate archive (content scan)');
      return;
    }

    // Create archive entry
    const timestamp = new Date().toISOString();
    const updateSection = `\n### **Auto-Update ${timestamp}**\n` +
      conversationBuffer.map(item => 
        `**${new Date(item.timestamp).toISOString()}:** ${item.activity}`
      ).join('\n') + '\n';

    // Initialize archive file if it doesn't exist
    if (!await fs.pathExists(ARCHIVE_PATH)) {
      const initialContent = `# Auth247 - Conversation Archive

## Key Insights From Current Session
- Enterprise authentication system with multi-provider SSO support
- Production-ready security with role-based access control
- Comprehensive audit logging and session management
- UI streamlining to eliminate duplicate authentication options

## Recurring Issues Identified
- UI duplication problems requiring systematic component review
- Need for comprehensive end-to-end testing rather than isolated fixes
- Memory reset challenges requiring better documentation practices
- Importance of completing solutions thoroughly in single sessions

`;
      await fs.writeFile(ARCHIVE_PATH, initialContent);
      existingContent = initialContent;
    }

    // Check for content existence before writing
    if (existingContent.includes(updateSection.trim())) {
      console.log('[XM] Content already exists in archive');
      return;
    }

    // Append new content
    await fs.appendFile(ARCHIVE_PATH, updateSection);
    
    // Update metadata
    await updateMetadata(hashedContent, conversationBuffer.length);
    
    // Clear buffer and update state
    const archivedCount = conversationBuffer.length;
    conversationBuffer = [];
    lastArchiveHash = hashedContent;
    lastArchiveTime = Date.now();
    
    console.log(`[XM] Archived ${archivedCount} activities to conversation archive`);
    
    // Save empty buffer state
    await saveBuffer();
    
  } catch (error) {
    console.error('[XM] Error updating conversation archive:', error);
  }
}

/**
 * Log activity with buffer management
 */
async function logActivity(activity) {
  try {
    const timestamp = Date.now();
    conversationBuffer.push({ timestamp, activity });
    
    console.log(`[XM] Logged activity: ${activity}`);
    
    // Save buffer state
    await saveBuffer();
    
    // Auto-archive after buffer size limit
    if (conversationBuffer.length >= ACTIVITY_BUFFER_SIZE) {
      await updateConversationArchive();
    }
    
  } catch (error) {
    console.error('[XM] Error logging activity:', error);
  }
}

/**
 * Update metadata file
 */
async function updateMetadata(contentHash, entriesArchived) {
  try {
    let metadata = {
      lastArchiveTime: new Date().toISOString(),
      sessionStartTime: new Date(sessionStartTime).toISOString(),
      totalArchives: 1,
      lastContentHash: contentHash,
      duplicatesPreventedToday: 0,
      archiveTriggers: []
    };
    
    if (await fs.pathExists(METADATA_PATH)) {
      const existing = await fs.readJson(METADATA_PATH);
      metadata = {
        ...existing,
        lastArchiveTime: new Date().toISOString(),
        lastContentHash: contentHash,
        totalArchives: (existing.totalArchives || 0) + 1
      };
    }
    
    await fs.writeJson(METADATA_PATH, metadata, { spaces: 2 });
    
  } catch (error) {
    console.error('[XM] Error updating metadata:', error);
  }
}

/**
 * Save conversation buffer to disk
 */
async function saveBuffer() {
  try {
    await fs.writeJson(BUFFER_PATH, {
      buffer: conversationBuffer,
      sessionStartTime,
      lastArchiveTime
    }, { spaces: 2 });
  } catch (error) {
    console.error('[XM] Error saving buffer:', error);
  }
}

/**
 * Load conversation buffer from disk
 */
async function loadBuffer() {
  try {
    if (await fs.pathExists(BUFFER_PATH)) {
      const data = await fs.readJson(BUFFER_PATH);
      conversationBuffer = data.buffer || [];
      sessionStartTime = data.sessionStartTime || Date.now();
      lastArchiveTime = data.lastArchiveTime || 0;
      console.log(`[XM] Loaded ${conversationBuffer.length} buffered activities`);
    }
  } catch (error) {
    console.error('[XM] Error loading buffer:', error);
  }
}

/**
 * Start conversation auto-update system
 */
async function startConversationAutoUpdate() {
  console.log('[XM] Starting conversation archive system...');
  
  // Load existing buffer
  await loadBuffer();
  
  // Log system startup
  await logActivity('Auth247 server started - XM conversation system initialized');
  
  // Set up periodic backup (every 10 minutes)
  setInterval(async () => {
    if (conversationBuffer.length > 0) {
      await logActivity('Periodic backup triggered');
      await updateConversationArchive();
    }
  }, ARCHIVE_COOLDOWN_MINUTES * 60 * 1000);
  
  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    await logActivity('Auth247 server shutting down gracefully');
    await updateConversationArchive();
    process.exit(0);
  });
  
  process.on('SIGTERM', async () => {
    await logActivity('Auth247 server terminated');
    await updateConversationArchive();
    process.exit(0);
  });
  
  console.log('[XM] Conversation archive system ready');
}

/**
 * Get current buffer status
 */
function getBufferStatus() {
  return {
    bufferLength: conversationBuffer.length,
    lastArchive: lastArchiveTime ? new Date(lastArchiveTime).toISOString() : null,
    sessionStart: new Date(sessionStartTime).toISOString(),
    lastHash: lastArchiveHash.substring(0, 16) + '...'
  };
}

/**
 * Manual archive trigger
 */
async function triggerManualArchive(triggerType = 'manual') {
  await logActivity(`Manual archive triggered: ${triggerType}`);
  await updateConversationArchive();
  return getBufferStatus();
}

export {
  startConversationAutoUpdate,
  logActivity,
  updateConversationArchive,
  getBufferStatus,
  triggerManualArchive
};