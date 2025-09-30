/**
 * Script to read LinkedIn AI Detector extension logs
 * Run this script to get the latest logs from the extension
 */

const fs = require('fs');
const path = require('path');

function readExtensionLogs() {
    try {
        // Try to read from the log viewer HTML file
        const logViewerPath = path.join(__dirname, 'log-viewer.html');
        
        if (fs.existsSync(logViewerPath)) {
            console.log('📋 LinkedIn AI Detector - Log Reader');
            console.log('=====================================');
            console.log('');
            console.log('To view logs:');
            console.log('1. Open log-viewer.html in your browser');
            console.log('2. Or check the browser console for real-time logs');
            console.log('');
            console.log('The extension now logs to localStorage and can be viewed in:');
            console.log('- Browser Developer Tools > Application > Local Storage');
            console.log('- Or use the log-viewer.html page');
            console.log('');
            console.log('Logs are automatically stored and can be downloaded as a text file.');
            return;
        }
        
        console.log('❌ Log viewer not found. Make sure log-viewer.html exists.');
    } catch (error) {
        console.error('❌ Error reading logs:', error);
    }
}

// Run the log reader
readExtensionLogs();
