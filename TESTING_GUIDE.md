# 完整测试指南 - 从零开始

## 第一步：安装 n8n

### 方法 1：使用 npm 安装（推荐）

打开 **命令提示符（CMD）** 或 **PowerShell**：

```bash
# 1. 全局安装 n8n
npm install n8n -g

# 2. 启动 n8n
n8n start
```

n8n 会自动启动并打开浏览器，通常地址是：`http://localhost:5678`

### 方法 2：使用 npx（无需安装）

```bash
# 直接运行 n8n
npx n8n
```

---

## 第二步：构建并安装 ADP 节点

### 1. 打开新的命令行窗口

保持 n8n 运行在第一个窗口，打开一个新的 CMD 窗口。

### 2. 导航到项目目录

```bash
# 进入项目目录
cd E:\ADP\AdpProject\adp-aiem\src\n8n-nodes-adp

# 查看目录内容（确认路径正确）
dir
```

你应该能看到：`package.json`, `nodes/`, `README.md` 等文件。

### 3. 安装依赖

```bash
npm install
```

等待安装完成（可能需要几分钟）。

### 4. 构建项目

```bash
npm run build
```

你应该看到：
```
✓ Build successful
```

### 5. 创建 n8n 自定义节点目录

```bash
# 创建目录（如果不存在）
mkdir %USERPROFILE%\.n8n\custom
```

### 6. 复制构建好的节点到 n8n 目录

```bash
# 复制整个 dist 目录
xcopy /E /I /Y dist %USERPROFILE%\.n8n\custom\n8n-nodes-adp
```

或者使用 npm link：

```bash
npm link
cd %USERPROFILE%\.n8n\custom
npm link n8n-nodes-adp
```

---

## 第三步：重启 n8n

### 1. 停止 n8n

在运行 n8n 的命令行窗口按 `Ctrl + C` 停止 n8n。

### 2. 重新启动 n8n

```bash
n8n start
```

### 3. 打开 n8n 界面

在浏览器中访问：`http://localhost:5678`

---

## 第四步：创建 ADP API 凭证

### 1. 登录 n8n

如果需要，创建一个 n8n 账户并登录。

### 2. 创建新工作流

点击 **"New workflow"** 创建一个新的空白工作流。

### 3. 添加 ADP Overseas Extract 节点

- 点击节点面板右上角的 **"+"** 按钮
- 在搜索框中输入：`ADP Overseas Extract`
- 你应该能看到这个节点出现在列表中
- 点击添加节点

### 4. 配置 API 凭证

1. 点击节点上的 **"Credential to connect with"**
2. 选择 **"Create New"**
3. 选择 **"ADP API"** 凭证类型
4. 填写以下信息：

   ```
   Name: ADP 测试环境（或任何你喜欢的名称）
   Base URL: https://adp.laiye.com
   Access Key: c114c81ad02511f0ad8100163e358400
   App Key: AS1gEParppb5KHF6ZEg4IDfa
   App Secret: GAvj8o5tmVDvtGO1ZKeQPJpgtJkHp5YfS51p
   Tenant Name: laiye
   ```

5. 点击 **"Save"** 保存凭证

---

## 第五步：准备测试文档

### 准备测试文件

你需要一个海外发票、收据或采购订单的 PDF 或图片文件。

#### 选项 1：使用现有文档

如果你有测试文档，记下文件路径。

#### 选项 2：创建测试文档

创建一个简单的测试发票 PDF 或使用在线示例。

### 将文档转换为 Base64（可选）

如果你想测试 Base64 输入，可以使用以下方法：

#### 方法 A：使用在线工具

1. 访问：https://www.base64-image.de/
2. 上传你的 PDF 或图片
3. 复制生成的 Base64 字符串

#### 方法 B：使用 Node.js 脚本

创建文件 `to-base64.js`：

```javascript
const fs = require('fs');
const path = require('path');

// 读取文件
const filePath = 'C:\\path\\to\\your\\invoice.pdf';
const fileBuffer = fs.readFileSync(filePath);
const base64 = fileBuffer.toString('base64');

console.log(base64);
```

运行：
```bash
node to-base64.js
```

复制输出的 Base64 字符串。

---

## 第六步：创建测试工作流

### 方案 A：使用 Base64 文件输入

#### 1. 添加 Manual Trigger 节点

- 点击 **"+"**
- 搜索 **"Manual Trigger"**
- 添加到工作流

#### 2. 添加 ADP Overseas Extract 节点

- 点击 **"+"**
- 搜索 **"ADP Overseas Extract"**
- 添加到工作流
- 连接 Manual Trigger → ADP Overseas Extract

#### 3. 配置 ADP Overseas Extract 节点

在节点配置面板中：

```
Document Type: Invoice
File Source: Base64
File Base64: [粘贴你的 Base64 字符串]
With Recognition Result: [不勾选]
```

#### 4. 保存工作流

点击右上角 **"Save workflow"**

---

### 方案 B：使用 URL 文件输入（需要公网可访问的 URL）

#### 1-2 步同上

#### 3. 配置 ADP Overseas Extract 节点

```
Document Type: Invoice
File Source: URL
File URL: https://example.com/test-invoice.pdf
  （替换为你的公网可访问的 PDF URL）
With Recognition Result: [不勾选]
```

---

## 第七步：执行测试

### 1. 测试工作流

- 点击工作流左上角的 **"Test workflow"** 按钮
- 等待执行完成（可能需要 5-20 秒）

### 2. 查看结果

点击 **ADP Overseas Extract** 节点，你应该看到：

#### 成功响应示例：

```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "document_type": "INVOICE",
    "extraction_result": {
      "merchantName": "Example Company Inc.",
      "merchantAddress": "123 Business Street",
      "documentDate": "2024-01-15",
      "currency": "USD",
      "totalAmount": 1250.00,
      "taxAmount": 250.00,
      "invoiceNumber": "INV-2024-001234",
      "lineItems": [
        {
          "description": "Software License",
          "quantity": 1,
          "unitPrice": 1000.00,
          "totalPrice": 1000.00
        }
      ]
    }
  }
}
```

---

## 第八步：验证测试结果

### ✅ 成功标志

1. **节点执行成功**：节点显示为绿色
2. **返回 code: 200**：HTTP 状态码为 200
3. **包含 extraction_result**：响应中有抽取的数据
4. **字段完整**：merchantName, totalAmount 等字段有值

### ❌ 失败情况及解决

#### 错误 1：401 Unauthorized

**原因**：API 凭证错误

**解决**：
1. 检查 Access Key, App Key, App Secret 是否正确
2. 确认没有多余的空格
3. 联系 API 提供方确认凭证有效性

#### 错误 2：400 Bad Request

**原因**：请求参数错误

**解决**：
1. 检查文件格式是否为 PDF、PNG、JPG
2. 确认 Base64 字符串完整
3. 检查文档类型是否正确选择

#### 错误 3：406 File Type Not Supported

**原因**：文件格式不支持

**解决**：
1. 使用 PDF、PNG、JPG 格式
2. 确保文件没有损坏
3. 尝试使用更小的文件

#### 错误 4：500 Internal Server Error

**原因**：服务器内部错误

**解决**：
1. 检查网络连接
2. 稍后重试
3. 联系 API 支持团队

---

## 第九步：测试不同文档类型

### 测试 Receipt（收据）

1. 创建新工作流或复制现有工作流
2. 修改配置：

```
Document Type: Receipt
File Source: [保持不变]
```

3. 执行测试
4. 验证返回的 `document_type` 为 `RECEIPT`

### 测试 Purchase Order（采购订单）

1. 创建新工作流
2. 修改配置：

```
Document Type: Purchase Order
File Source: [保持不变]
```

3. 执行测试
4. 验证返回的 `document_type` 为 `PURCHASE_ORDER`

---

## 第十步：高级测试（可选）

### 测试 1：批量处理

创建工作流处理多个文档：

```
1. Manual Trigger
2. Code Node (生成多个文档的 Base64 数组)
3. Loop Over Items (Split In Batches)
4. ADP Overseas Extract
5. Google Sheets (保存结果)
```

### 测试 2：错误处理

启用 **"Continue On Fail"**：

1. 在节点设置中启用 **"Continue On Fail"**
2. 故意使用无效的 Base64
3. 验证节点不会中断工作流
4. 检查错误响应格式

### 测试 3：包含 OCR 结果

1. 勾选 **"With Recognition Result"**
2. 执行测试
3. 检查响应中是否包含 OCR 识别结果

---

## 故障排查清单

### 节点不出现

- [ ] 确认 `npm run build` 成功
- [ ] 检查 `dist/nodes/ADPOverseasExtract/` 目录存在
- [ ] 确认节点已复制到 `%USERPROFILE%\.n8n\custom\`
- [ ] 完全重启 n8n（不是刷新页面）
- [ ] 清除浏览器缓存并刷新

### 凭证错误

- [ ] 检查所有凭证字段已填写
- [ ] 确认没有前导/尾随空格
- [ ] 验证 Base URL 正确：`https://adp.laiye.com`
- [ ] 确认租户名称：`laiye`

### 执行超时

- [ ] 等待更长时间（最多 30 秒）
- [ ] 检查文件大小（< 10MB）
- [ ] 验证网络连接
- [ ] 尝试更小的测试文件

### 无抽取结果

- [ ] 检查 `data.extraction_result` 字段是否存在
- [ ] 验证文档质量（清晰、高分辨率）
- [ ] 确认选择了正确的文档类型
- [ ] 尝试启用 OCR 结果查看详细信息

---

## 测试报告模板

完成测试后，你可以记录：

```
测试日期：_____________
测试人员：_____________

环境信息：
- n8n 版本：_____________
- 操作系统：Windows
- Node.js 版本：_____________

测试结果：

1. Invoice 测试：✅ / ❌
   - 响应时间：____ 秒
   - 抽取准确度：____ %

2. Receipt 测试：✅ / ❌
   - 响应时间：____ 秒
   - 抽取准确度：____ %

3. Purchase Order 测试：✅ / ❌
   - 响应时间：____ 秒
   - 抽取准确度：____ %

遇到的问题：
1. _________________
2. _________________

总体评价：_____________
```

---

## 需要帮助？

如果遇到问题：

1. 查看 `BUILD_AND_TEST.md` 获取详细的构建和测试信息
2. 查看 `OVERSEAS_EXAMPLE.md` 获取更多使用示例
3. 查看 `QUICKSTART.md` 获取快速入门指南
4. 检查 n8n 日志：`%USERPROFILE%\.n8n\logs\`

---

**准备好了吗？让我们开始测试！** 🚀
