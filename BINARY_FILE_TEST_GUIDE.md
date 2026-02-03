# 快速测试指南 - 从文件输入到结果输出

## 🎯 新的实现方式

**节点现在自动接收上游传入的文件！**

上游节点 → **传入文件** → ADP Overseas Extract → 自动抽取字段 → 输出结果

---

## 📝 完整测试步骤

### 第一步：安装和启动 n8n

```bash
# 1. 安装 n8n（如果还没安装）
npm install n8n -g

# 2. 启动 n8n
n8n start
```

浏览器会自动打开：`http://localhost:5678`

---

### 第二步：部署节点

**打开新的 CMD 窗口**（保持 n8n 运行），执行：

```bash
# 进入项目目录
cd E:\ADP\AdpProject\adp-aiem\src\n8n-nodes-adp

# 构建项目（如果还没构建）
npm run build

# 复制到 n8n 目录
mkdir %USERPROFILE%\.n8n\custom
xcopy /E /I /Y dist %USERPROFILE%\.n8n\custom\n8n-nodes-adp
```

**重启 n8n：**
1. 回到 n8n 窗口，按 `Ctrl + C` 停止
2. 重新运行：`n8n start`
3. 刷新浏览器页面

---

### 第三步：创建测试工作流

#### 方案 1：从本地文件读取（最简单）

**工作流：**
```
Read Files from Disk → ADP Overseas Extract → 查看结果
```

**步骤：**

1. **添加 "Read/Write Files from Disk" 节点**
   - 点击 "+" 按钮
   - 搜索 "Read/Write Files from Disk"
   - 添加到工作流

2. **配置 Read Files 节点**
   ```
   Operation: Read File From Disk
   File Path: C:\path\to\your\invoice.pdf
     （修改为你的测试文件路径）
   ```

3. **添加 "ADP Overseas Extract" 节点**
   - 点击 "+" 按钮
   - 搜索 "ADP Overseas Extract"
   - 添加到工作流并连接到 Read Files 节点

4. **配置 ADP Overseas Extract 节点**
   ```
   Document Type: Invoice
   Input Source: From Previous Node (Binary File)
   With Recognition Result: [不勾选]
   ```

5. **配置 API 凭证**
   - 点击 "Credential to connect with"
   - 选择 "Create New credential"
   - 填写：
     ```
     Name: ADP 测试
     Base URL: https://adp.laiye.com
     Access Key: c114c81ad02511f0ad8100163e358400
     App Key: AS1gEParppb5KHF6ZEg4IDfa
     App Secret: GAvj8o5tmVDvtGO1ZKeQPJpgtJkHp5YfS51p
     Tenant Name: laiye
     ```
   - 点击 "Save"

6. **测试工作流**
   - 点击 "Test workflow" 按钮
   - 等待 5-20 秒
   - 点击 ADP Overseas Extract 节点查看结果

---

#### 方案 2：从 Webhook 接收文件上传

**工作流：**
```
Webhook (接收文件上传) → ADP Overseas Extract → 返回结果
```

**步骤：**

1. **添加 Webhook 节点**
   - 添加 "Webhook" 节点
   - 配置：
     ```
     HTTP Method: POST
     Path: invoice-upload
     Response Mode: On Last Node
     ```

2. **点击 "Listen for Test Event"**

3. **添加 "ADP Overseas Extract" 节点**
   - 连接到 Webhook
   - 配置：
     ```
     Document Type: Invoice
     Input Source: From Previous Node (Binary File)
     ```

4. **使用 Postman 或 curl 测试**

   **使用 curl：**
   ```bash
   curl -X POST http://localhost:5678/webhook/invoice-upload \
     -F "file=@/path/to/your/invoice.pdf"
   ```

   **使用 Postman：**
   - Method: POST
   - URL: http://localhost:5678/webhook/invoice-upload
   - Body: form-data
     - Key: file (type: File)
     - Value: 选择你的 PDF 文件

5. **查看结果**
   - 在 n8n 中查看执行结果
   - ADP Overseas Extract 节点会显示抽取的数据

---

#### 方案 3：从 HTTP Request 下载文件

**工作流：**
```
HTTP Request (下载文件) → ADP Overseas Extract → 保存结果
```

**步骤：**

1. **添加 HTTP Request 节点**
   - 添加 "HTTP Request" 节点
   - 配置：
     ```
     Method: GET
     URL: https://example.com/invoice.pdf
       （公网可访问的 PDF URL）
     Response Format: File
     ```

2. **添加 ADP Overseas Extract 节点**
   - 连接到 HTTP Request
   - 配置：
     ```
     Document Type: Receipt
     Input Source: From Previous Node (Binary File)
     ```

3. **测试工作流**
   - 点击 "Test workflow"
   - 查看结果

---

### 第四步：验证结果

**成功响应示例：**

点击 ADP Overseas Extract 节点，查看 JSON 输出：

```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "document_type": "INVOICE",
    "extraction_result": {
      "merchantName": "Acme Corporation",
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

## 🎨 节点参数说明

| 参数 | 说明 | 默认值 |
|------|------|--------|
| **Document Type** | 文档类型：Invoice/Receipt/Purchase Order | Invoice |
| **Input Source** | 文件来源：<br>• From Previous Node - 接收上游节点的文件<br>• From URL - 手动输入 URL | From Previous Node |
| **File URL** | 文件 URL（仅当 Input Source = URL 时显示） | 空 |
| **With Recognition Result** | 是否包含 OCR 识别结果 | false |

---

## ✅ 测试清单

### 基础功能测试
- [ ] 从本地文件读取并抽取 Invoice
- [ ] 从本地文件读取并抽取 Receipt
- [ ] 从本地文件读取并抽取 Purchase Order
- [ ] 从 HTTP Request 下载文件并抽取
- [ ] 从 Webhook 接收文件并抽取

### 数据验证
- [ ] 返回 code: 200
- [ ] 返回 extraction_result 对象
- [ ] merchantName 字段有值
- [ ] totalAmount 字段有值
- [ ] currency 字段有值
- [ ] lineItems 数组有内容（如果有商品明细）

---

## 🔍 常见问题

### Q1: "No binary file found in input"

**原因：** 上游节点没有输出二进制文件

**解决方法：**
1. 确认上游节点是 "Read/Write Files from Disk" 或 "HTTP Request"（Response Format: File）
2. 检查上游节点是否正确配置
3. 测试上游节点单独运行，确认它输出 binary 数据

---

### Q2: 找不到 "ADP Overseas Extract" 节点

**解决方法：**
1. 确认 `npm run build` 成功
2. 确认文件已复制到 `%USERPROFILE%\.n8n\custom\`
3. 完全重启 n8n（Ctrl+C 停止后重新运行）
4. 清除浏览器缓存并刷新（Ctrl+F5）

---

### Q3: 401 Unauthorized 错误

**解决方法：**
1. 检查凭证配置是否正确
2. 确认 Access Key, App Key, App Secret 无多余空格
3. 联系 API 提供方确认凭证有效性

---

### Q4: 如何确认上游节点输出了 binary 文件？

**检查方法：**

1. 单独测试上游节点（如 Read Files）
2. 点击节点查看执行结果
3. 切换到 "Binary" 标签页
4. 应该能看到 data 字段包含文件内容

---

## 📊 完整工作流示例

### 示例 1：批量处理本地文件夹

```
1. Read Files from Disk (Read Directory)
   - File Path: C:\Documents\Invoices\*.pdf

2. Loop Over Items (Split In Batches)
   - Batch Size: 1

3. ADP Overseas Extract
   - Document Type: Invoice
   - Input Source: From Previous Node

4. Google Sheets
   - Operation: Append
   - 将抽取结果保存到表格
```

---

### 示例 2：Web 上传并处理发票

```
1. Webhook
   - POST /upload-invoice
   - 接收 multipart/form-data 上传的文件

2. ADP Overseas Extract
   - Document Type: Invoice
   - Input Source: From Previous Node

3. Set (提取字段)
   - merchantName: {{ $json.data.extraction_result.merchantName }}
   - totalAmount: {{ $json.data.extraction_result.totalAmount }}

4. HTTP Request
   - 返回结果给客户端
```

---

### 示例 3：从 URL 下载并处理

```
1. Manual Trigger

2. HTTP Request
   - Method: GET
   - URL: {{ $json.fileUrl }}
   - Response Format: File

3. ADP Overseas Extract
   - Document Type: Receipt
   - Input Source: From Previous Node

4. Code Node (格式化数据)
   - 自定义处理逻辑

5. Save to Database
```

---

## 🎉 完成测试！

测试成功后，你可以：

1. **集成到实际工作流**：将发票处理集成到业务流程中
2. **批量处理**：使用 Loop Over Items 处理多个文件
3. **自动化**：使用 Webhook 或定时任务自动触发
4. **导出数据**：将抽取结果导出到数据库、表格或 API

---

**需要帮助？**

如果遇到问题，请提供：
1. 完整的错误信息
2. 工作流截图
3. 上游节点的配置
4. n8n 日志文件（%USERPROFILE%\.n8n\logs\）

---

**现在你可以开始测试了！** 🚀
