/**
 * Centralized Logging System for LinkedIn AI Detector Extension
 * Writes all logs to a file that can be read directly
 */

class ExtensionLogger {
  constructor() {
    this.logFile = 'linkedin-ai-detector-logs.txt';
    this.logs = [];
    this.maxLogs = 1000; // Keep last 1000 log entries
  }

  log(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      data: data ? JSON.stringify(data, null, 2) : null
    };

    this.logs.push(logEntry);
    
    // Keep only the last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Write to file
    this.writeToFile(logEntry);

    // Also log to console for immediate feedback
    console.log(`[${timestamp}] ${level}: ${message}`, data || '');
  }

  info(message, data = null) {
    this.log('INFO', message, data);
  }

  warn(message, data = null) {
    this.log('WARN', message, data);
  }

  error(message, data = null) {
    this.log('ERROR', message, data);
  }

  debug(message, data = null) {
    this.log('DEBUG', message, data);
  }

  writeToFile(logEntry) {
    try {
      // Create log entry string
      const logString = `[${logEntry.timestamp}] ${logEntry.level}: ${logEntry.message}${logEntry.data ? '\n' + logEntry.data : ''}\n`;
      
      // For browser environment, we'll use a different approach
      // Store in localStorage and provide a way to download
      this.storeLog(logString);
    } catch (error) {
      console.error('Failed to write log:', error);
    }
  }

  storeLog(logString) {
    try {
      // Store logs in localStorage
      const existingLogs = localStorage.getItem('linkedin-ai-detector-logs') || '';
      const newLogs = existingLogs + logString;
      
      // Keep only last 50KB of logs
      const maxSize = 50 * 1024; // 50KB
      const finalLogs = newLogs.length > maxSize ? newLogs.slice(-maxSize) : newLogs;
      
      localStorage.setItem('linkedin-ai-detector-logs', finalLogs);
    } catch (error) {
      console.error('Failed to store log:', error);
    }
  }

  getLogs() {
    try {
      return localStorage.getItem('linkedin-ai-detector-logs') || '';
    } catch (error) {
      console.error('Failed to get logs:', error);
      return '';
    }
  }

  clearLogs() {
    try {
      localStorage.removeItem('linkedin-ai-detector-logs');
      this.logs = [];
    } catch (error) {
      console.error('Failed to clear logs:', error);
    }
  }

  downloadLogs() {
    try {
      const logs = this.getLogs();
      const blob = new Blob([logs], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = this.logFile;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download logs:', error);
    }
  }

  getRecentLogs(count = 50) {
    return this.logs.slice(-count);
  }
}

// Create global logger instance
window.extensionLogger = new ExtensionLogger();

// Note: Console override removed to prevent recursion issues
// Use window.extensionLogger.log() directly in content.js for logging

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ExtensionLogger;
}
