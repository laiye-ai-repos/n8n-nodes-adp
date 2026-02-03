# n8n-nodes-adp

This is an n8n community node package for [ADP (Agentic Document Processor)](https://adp.laiye.com), an AI-powered document processing platform that provides intelligent document extraction capabilities.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/sustainable-use-license/) workflow automation platform.

## Features

This integration provides four nodes for interacting with ADP's document extraction APIs:

1. **ADP Sync Extract** - Synchronously extract data from documents
2. **ADP Create Async Task** - Create an asynchronous document extraction task
3. **ADP Query Task** - Query the status and result of an async task
4. **ADP Overseas Extract** - Extract data from overseas invoices, receipts, and purchase orders 🆕

## Capabilities

### Supported Document Types
- PDF documents
- Images (PNG, JPG, JPEG, etc.)
- Office documents (Word, Excel, PowerPoint)
- 16+ card types including:
  - ID Cards (Mainland China, Hong Kong)
  - Driver License, Vehicle License
  - Business License
  - Bank Card, Passport
  - And more...
- **Overseas Business Documents** 🆕:
  - Invoices (B2B)
  - Receipts (B2E)
  - Purchase Orders

### AI-Powered Extraction
- OCR-based text recognition
- VLM (Vision Language Model) for direct image understanding
- Intelligent field extraction and normalization
- Support for multiple languages (Chinese, English, Japanese, Korean)

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

### Quick Install
```bash
# In your n8n installation directory
npm install n8n-nodes-adp
```

## Credentials

To use these nodes, you need to configure ADP API credentials:

1. **Base URL**: The ADP API base URL (e.g., `https://adp.laiye.com`)
2. **Access Key**: Your tenant-level access key
3. **App Key**: Your application key
4. **App Secret**: Your application secret
5. **Tenant Name**: Your tenant name (defaults to "laiye")

### Getting Your Credentials

Contact your ADP administrator or visit the [ADP documentation](https://docs.adp.example.com) to obtain your API credentials.

## Usage

### 1. ADP Sync Extract Node

Extract data from documents synchronously. The workflow waits for the extraction to complete.

**Parameters:**
- **File Source**: Choose between Base64 or URL
- **File Base64** (if Base64 selected): The base64-encoded file content
- **File URL** (if URL selected): The URL of the file
- **With Recognition Result**: Include OCR results in the response
- **Card Type** (optional): Specify card type for card extraction

**Example Workflow:**
```json
{
  "fileSource": "base64",
  "fileBase64": "iVBORw0KGgo...",
  "withRecResult": false,
  "additionalOptions": {
    "cardType": "身份证_大陆"
  }
}
```

### 2. ADP Create Async Task Node

Create an asynchronous document extraction task. Returns immediately with a task ID.

**Parameters:**
- Same as Sync Extract node

**Example Workflow:**
```json
{
  "fileSource": "url",
  "fileUrl": "https://example.com/document.pdf",
  "withRecResult": false
}
```

**Response:**
```json
{
  "code": 0,
  "data": {
    "task_id": "xxx-xxx-xxx",
    "metadata": {}
  },
  "message": "success"
}
```

### 3. ADP Query Task Node

Query the status and result of an asynchronous task.

**Parameters:**
- **Task ID Source**: Manual input or from previous node
- **Task ID** (if manual): The task ID to query

**Example Workflow:**
```
ADP Create Async Task → Wait (delay) → ADP Query Task → Process Results
```

**Response:**
```json
{
  "code": 0,
  "data": {
    "task_id": "xxx-xxx-xxx",
    "status": 5,
    "extraction_result": [
      {
        "field_name": "extracted value"
      }
    ],
    "metadata": {}
  }
}
```

### 4. ADP Overseas Extract Node

Extract data from overseas business documents (invoices, receipts, purchase orders) using AI-powered automatic classification.

**Parameters:**
- **Document Type**: Choose between Invoice, Receipt, or Purchase Order
- **File Source**: Choose between Base64 or URL
- **File Base64** (if Base64 selected): The base64-encoded file content
- **File URL** (if URL selected): The URL of the file
- **With Recognition Result**: Include OCR results in the response

**Example Workflow:**
```json
{
  "documentType": "INVOICE",
  "fileSource": "base64",
  "fileBase64": "iVBORw0KGgo...",
  "withRecResult": false
}
```

**Response:**
```json
{
  "code": 200,
  "message": "Task created successfully",
  "data": {
    "task_id": "task_1234567890",
    "agent_type": "classifier-extractor"
  }
}
```

**Note:** Use with the "ADP Query Task" node to retrieve extraction results. The node uses intelligent agents:
- **classifier-extractor**: Auto-classifies Invoice/Receipt and extracts
- **po-specialist**: Specialized Purchase Order processing

See [OVERSEAS_EXAMPLE.md](OVERSEAS_EXAMPLE.md) for detailed usage guide and examples.

### Complete Async Workflow Example

For long-running tasks, use the async nodes:

```
1. ADP Create Async Task (creates task, returns task_id)
2. Wait node (poll every 5-10 seconds)
3. ADP Query Task (check status)
4. Switch node (check if status == 5 for success)
5. If not complete, loop back to Wait
6. Process extraction results
```

## Task Status Codes

| Status | Code | Description |
|--------|------|-------------|
| Pending | 1 | Task created, waiting to start |
| Running Conversion | 2 | Converting document format |
| Running Recognition | 3 | Performing OCR/VLM recognition |
| Running Extraction | 4 | Extracting structured data |
| Success | 5 | Task completed successfully |
| Failed | 6 | Task failed |
| Cancelled | 7 | Task was cancelled |

## Error Handling

All nodes support "Continue On Fail" option. When enabled:
- Failed items will return error details instead of stopping the workflow
- Error response format:
```json
{
  "error": "Error message",
  "details": {...}
}
```

## API Reference

### Endpoints

- `POST /v1/app/doc/extract` - Synchronous extraction
- `POST /v1/app/doc/extract/create/task` - Create async task
- `GET /v1/app/doc/extract/query/task/{task_id}` - Query task
- `POST /v1/app/doc/extract/create/task` with `document_type_hint` - Overseas document extraction 🆕

### Authentication

The nodes use custom headers for authentication:
```
X-Access-Key: {access_key}
X-Timestamp: {timestamp}
X-Signature: {uuid}
```

## Compatibility

- **Minimum n8n version**: 1.0.0
- **Tested with**: n8n 1.50.0+
- **Node API Version**: 1

## Resources

- [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
- [ADP API Documentation](https://docs.adp.example.com)
- [ADP Portal](https://adp.laiye.com)
- [Overseas Extract Usage Guide](OVERSEAS_EXAMPLE.md) - Detailed guide for overseas document processing

## Version History

### 0.1.0 (2025-01-30)
- Initial release
- ADP Sync Extract node
- ADP Create Async Task node
- ADP Query Task node
- Support for 16+ card types
- Base64 and URL file input support
- ADP Overseas Extract node for invoices, receipts, and purchase orders

## License

MIT

## Support

For issues and questions:
- Create an issue in the GitHub repository
- Contact: xiangshuyu@laiye.com

---

**Built with ❤️ for the n8n community**
