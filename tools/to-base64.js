/**
 * 文件转 Base64 工具
 * 使用方法：
 * 1. 将此文件保存为 to-base64.js
 * 2. 修改下面的 filePath 为你的文档路径
 * 3. 运行: node to-base64.js
 * 4. 复制输出的 Base64 字符串
 */

const fs = require('fs');
const path = require('path');

// ===== 配置你的文件路径 =====
const filePath = 'C:\\path\\to\\your\\invoice.pdf';
// ============================

try {
  // 读取文件
  const fileBuffer = fs.readFileSync(filePath);

  // 转换为 Base64
  const base64 = fileBuffer.toString('base64');

  // 输出结果
  console.log('=== 文件信息 ===');
  console.log('文件路径:', filePath);
  console.log('文件大小:', (fileBuffer.length / 1024).toFixed(2), 'KB');
  console.log('Base64 长度:', base64.length);
  console.log('\n=== Base64 内容 ===');
  console.log(base64);

  // 可选：保存到文件
  const outputFile = filePath + '.base64.txt';
  fs.writeFileSync(outputFile, base64);
  console.log('\n已保存到:', outputFile);

} catch (error) {
  console.error('错误:', error.message);
  console.log('\n请确认:');
  console.log('1. 文件路径正确');
  console.log('2. 文件存在且可读');
  console.log('3. 文件格式为 PDF, PNG, JPG 或 JPEG');
}
