# ADP Overseas Extract Node - Usage Guide

## Overview

The **ADP Overseas Extract** node enables n8n workflows to **synchronously** extract structured data from overseas business documents including:
- **Invoices** (B2B)
- **Receipts** (B2E)
- **Purchase Orders** (Procurement)

## Key Features

- ✅ **Synchronous Processing**: Extract data immediately, no polling required
- ✅ **Automatic Document Classification**: AI-powered detection for Invoice vs Receipt
- ✅ **Purchase Order Support**: Dedicated processing for POs
- ✅ **Unified Field Structure**: Consistent data schema across document types
- ✅ **Multiple File Sources**: Support Base64 or URL input

## API Endpoint

**POST** `/open/agentic_doc_processor/{tenant_name}/v1/app/doc/extract`

This is a **synchronous** endpoint that processes the document and returns extraction results immediately.

## Prerequisites

1. **ADP API Credentials**:
   - Base URL: `https://adp.laiye.com`
   - Access Key: Your tenant access key
   - App Key: Your application key
   - App Secret: Your application secret
   - Tenant Name: Your tenant name (default: `laiye`)

2. **n8n Setup**:
   - Install the n8n-nodes-adp package
   - Configure ADP API credentials in n8n credentials manager

## Node Configuration

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| **Document Type** | Options | Yes | Select document type: Invoice, Receipt, or Purchase Order |
| **File Source** | Options | Yes | Choose Base64 or URL |
| **File Base64** | String | Conditional | Base64-encoded file content (if Base64 selected) |
| **File URL** | String | Conditional | URL of the file (if URL selected) |
| **With Recognition Result** | Boolean | No | Include OCR results in response (default: false) |

### Supported File Formats

- **PDF**: `.pdf`
- **Images**: `.png`, `.jpg`, `.jpeg`

## Workflow Examples

### Example 1: Simple Invoice Extraction (Base64)

```json
{
  "nodes": [
    {
      "name": "Manual Trigger",
      "type": "n8n-nodes-base.manualTrigger",
      "position": [250, 300]
    },
    {
      "name": "ADP Overseas Extract",
      "type": "n8n-nodes-adp.adpOverseasExtract",
      "position": [450, 300],
      "parameters": {
        "documentType": "INVOICE",
        "fileSource": "base64",
        "fileBase64": "JVBERi0xLjQKJ...",
        "withRecResult": false
      },
      "credentials": {
        "adpApi": {
          "id": "1",
          "name": "ADP API account"
        }
      }
    }
  ]
}
```

### Example 2: Receipt Extraction from URL

```
Manual Trigger → ADP Overseas Extract → Process Results
```

**Node Configuration:**
- Document Type: `RECEIPT`
- File Source: `URL`
- File URL: `https://example.com/receipt.jpg`
- With Recognition Result: `false`

**Response:**
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "document_type": "RECEIPT",
    "extraction_result": {
      "merchantName": "Starbucks",
      "merchantAddress": "123 Main St",
      "documentDate": "2024-01-15",
      "currency": "USD",
      "totalAmount": 12.50,
      "taxAmount": 1.13,
      "lineItems": [
        {
          "description": "Cappuccino",
          "quantity": 2,
          "unitPrice": 4.50,
          "totalPrice": 9.00
        }
      ]
    }
  }
}
```

### Example 3: Purchase Order Processing

```
Manual Trigger → ADP Overseas Extract (PO) → Save to Database
```

**Node Configuration:**
- Document Type: `Purchase Order`
- File Source: `URL`
- File URL: `https://example.com/po-12345.pdf`

## Response Structure

### Success Response (HTTP 200)

```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "document_type": "INVOICE",
    "extraction_result": {
      "merchantName": "Acme Corporation",
      "merchantAddress": "456 Business Ave, Suite 100, New York, NY 10001",
      "documentDate": "2024-01-15",
      "currency": "USD",
      "totalAmount": 1500.00,
      "taxAmount": 300.00,
      "invoiceNumber": "INV-2024-001234",
      "lineItems": [
        {
          "description": "Software License Annual Subscription",
          "quantity": 1,
          "unitPrice": 1200.00,
          "totalPrice": 1200.00
        },
        {
          "description": "Technical Support Package",
          "quantity": 1,
          "unitPrice": 300.00,
          "totalPrice": 300.00
        }
      ]
    }
  }
}
```

### Unified Field Structure

All overseas document types return a unified data structure:

```typescript
interface OverseasExtractionResult {
  code: number;
  message: string;
  data: {
    document_type: "INVOICE" | "RECEIPT" | "PURCHASE_ORDER";
    extraction_result: {
      merchantName: string;
      merchantAddress: string;
      documentDate: string;
      currency: string;
      totalAmount: number;
      taxAmount: number;
      lineItems: Array<{
        description: string;
        quantity: number;
        unitPrice: number;
        totalPrice: number;
      }>;
      invoiceNumber?: string;  // Invoice only
      purchaseOrderNumber?: string;  // PO only
      shipToAddress?: string;  // PO only
    };
  };
}
```

## Document Type Behavior

### Invoice (B2B)
- **Agent**: classifier-extractor
- **Auto-classification**: Classifies as Invoice
- **Fields**: Invoice number, vendor info, line items, tax, totals

### Receipt (B2E)
- **Agent**: classifier-extractor
- **Auto-classification**: Classifies as Receipt
- **Fields**: Merchant info, date, amount, line items, tax

### Purchase Order
- **Agent**: po-specialist
- **Classification**: Skips auto-classification (explicit type)
- **Fields**: PO number, items, shipping address, vendor info

## Error Handling

### Common Errors

| Error Code | Message | Solution |
|------------|---------|----------|
| 401 | Unauthorized | Check your API credentials |
| 400 | Bad Request | Verify file format and parameters |
| 406 | File Type Not Supported | Use PDF, PNG, JPG, or JPEG |
| 500 | Internal Server Error | Contact support or retry |

### Using Continue On Fail

Enable "Continue On Fail" in node settings to handle errors gracefully:

```json
{
  "error": "File type not supported",
  "details": { "errorCode": 406 }
}
```

## Complete Workflow Examples

### Workflow 1: Batch Invoice Processing

Process multiple invoices from a folder:

```
1. Read Files from Folder (PDF files)
2. Loop Over Items
3. ADP Overseas Extract (Invoice, Base64)
4. IF: extraction_result exists?
5. Yes: Save to Database
6. No: Log Error
```

### Workflow 2: Receipt to Google Sheets

Extract receipt data and save to Google Sheets:

```
1. Manual Trigger (or Webhook for uploads)
2. ADP Overseas Extract (Receipt)
3. Google Sheets → Append Row
   - Merchant Name: {{ $json.data.extraction_result.merchantName }}
   - Date: {{ $json.data.extraction_result.documentDate }}
   - Amount: {{ $json.data.extraction_result.totalAmount }}
```

### Workflow 3: PO Validation

Validate purchase order against database:

```
1. File Upload (Webhook)
2. ADP Overseas Extract (Purchase Order)
3. Code Node: Extract PO number
4. PostgreSQL → Check if PO exists
5. IF: PO exists?
6. Yes: Update with new data
7. No: Create new record
```

## Building and Installation

### Build the Node

```bash
cd src/n8n-nodes-adp
npm install
npm run build
```

### Install in n8n (Development)

```bash
# Link the package
npm link

# In n8n custom nodes directory
cd ~/.n8n/custom
npm link n8n-nodes-adp

# Restart n8n
n8n start
```

### Install from npm (Production)

```bash
# In your n8n directory
cd ~/.n8n/custom
npm install /path/to/src/n8n-nodes-adp

# Restart n8n
n8n restart
```

## Testing

1. Open n8n editor
2. Search for "ADP Overseas Extract"
3. Configure credentials
4. Set document type and file source
5. Execute node
6. View extraction results immediately (no polling needed)

## Best Practices

### 1. File Quality
- Use high-resolution scans (300 DPI minimum)
- Ensure good lighting for photos
- Avoid blurry or skewed images
- PDF should be text-based when possible

### 2. Processing Time
- Sync processing typically takes 5-20 seconds
- Larger files may take longer
- For very large files, consider using async API

### 3. Error Handling
- Enable "Continue On Fail" for batch processing
- Add IF nodes to validate extraction results
- Log errors for troubleshooting

### 4. Data Validation
- Always check if `extraction_result` exists
- Validate required fields (e.g., totalAmount, merchantName)
- Handle missing optional fields gracefully

## Limitations

- Single document per request (no batch processing)
- Maximum file size: 10MB (check API limits)
- Processing time: 5-20 seconds per document (sync wait)
- Rate limiting: May apply based on your plan

## Comparison with Async Approach

### Sync (This Node) ✅
- ✅ Simpler workflow (no polling)
- ✅ Immediate results
- ✅ Easier to debug
- ⚠️ Workflow waits for completion (5-20s)

### Async (ADP Create Async Task + Query)
- ✅ Better for large files
- ✅ Non-blocking workflow
- ✅ Can process multiple files in parallel
- ⚠️ More complex workflow (polling required)

## Support

For issues or questions:
- Documentation: See `QUICKSTART.md` for 5-minute setup
- Build Guide: See `BUILD_AND_TEST.md`
- API Docs: https://adp.laiye.com
- Email: xiangshuyu@laiye.com

## Changelog

### Version 1.0.0
- Initial release
- Synchronous extraction for Invoice, Receipt, and Purchase Order
- Base64 and URL file input support
- Unified field structure across document types

---

**Ready to extract overseas business data in seconds! 🚀**
