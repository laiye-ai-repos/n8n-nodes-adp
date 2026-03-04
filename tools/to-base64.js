/**
 * File to Base64 Converter Utility
 * Usage:
 * 1. Save this file as to-base64.js
 * 2. Update the filePath below to your document path
 * 3. Run: node to-base64.js
 * 4. Copy the output Base64 string
 */

const fs = require('fs');
const path = require('path');

// ===== Configure your file path =====
const filePath = 'C:\\path\\to\\your\\invoice.pdf';
// ===================================

try {
  // Read file
  const fileBuffer = fs.readFileSync(filePath);

  // Convert to Base64
  const base64 = fileBuffer.toString('base64');

  // Optionally save to file
  const outputFile = filePath + '.base64.txt';
  fs.writeFileSync(outputFile, base64);

} catch (error) {
  // Silently handle errors for production use
  process.exit(1);
}
