# Quick Start Guide - ADP Overseas Extract Node

## 5-Minute Setup

### Step 1: Build and Install (2 minutes)

```bash
# Navigate to the project directory
cd E:\ADP\AdpProject\adp-aiem\src\n8n-nodes-adp

# Install dependencies
npm install

# Build the package
npm run build

# Link to n8n (development mode)
npm link

# In your n8n custom directory
cd ~/.n8n/custom
npm link n8n-nodes-adp

# Start n8n
n8n start
```

### Step 2: Configure Credentials (1 minute)

1. Open n8n in your browser
2. Create a new workflow
3. Add "ADP Overseas Extract" node
4. Click "Credential to connect with"
5. Select "Create New credential"
6. Fill in:
   - **Name**: ADP Production (or any name)
   - **Base URL**: `https://adp.laiye.com`
   - **Access Key**: `c114c81ad02511f0ad8100163e358400`
   - **App Key**: `AS1gEParppb5KHF6ZEg4IDfa`
   - **App Secret**: `GAvj8o5tmVDvtGO1ZKeQPJpgtJkHp5YfS51p`
   - **Tenant Name**: `laiye`
7. Click "Save"

### Step 3: Create Your First Workflow (2 minutes)

#### Simple Invoice Extraction Workflow

```
┌──────────────────┐
│  Manual Trigger  │
└────────┬─────────┘
         │
         ▼
┌──────────────────────────────┐
│   ADP Overseas Extract       │
│   - Document Type: Invoice   │
│   - File Source: URL         │
│   - File URL: <your file>    │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│   View Results (Immediate)   │
└──────────────────────────────┘
```

#### Configuration Details

**Node 1: Manual Trigger**
- Default settings

**Node 2: ADP Overseas Extract**
- Document Type: `Invoice`
- File Source: `URL`
- File URL: `https://example.com/test-invoice.pdf`
- With Recognition Result: `Unchecked`

### Step 4: Test the Workflow (30 seconds)

1. Click "Test workflow" button
2. Wait for processing (5-20 seconds)
3. Check the execution result
4. You should see extraction results immediately!

## Expected Results

### Synchronous Response (Immediate)

```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "document_type": "INVOICE",
    "extraction_result": {
      "merchantName": "Example Company Inc.",
      "merchantAddress": "123 Business Street, Suite 100",
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

## Common Use Cases

### Use Case 1: Receipt Expense Management

Extract receipt data for expense reports:

```
Manual Trigger → ADP Overseas Extract (Receipt) → Save to Google Sheets
```

**Configuration:**
- Document Type: `Receipt`
- File Source: `URL`
- Output: Merchant, amount, date, line items

### Use Case 2: Invoice Processing Automation

Automate invoice data entry:

```
Webhook (Upload) → ADP Overseas Extract (Invoice) → Create Accounting Record
```

**Configuration:**
- Document Type: `Invoice`
- Output: Vendor, invoice number, amounts, tax

### Use Case 3: Purchase Order Validation

Validate and extract PO data:

```
File Upload → ADP Overseas Extract (PO) → Validate against Database
```

**Configuration:**
- Document Type: `Purchase Order`
- Output: PO number, items, shipping address

## Troubleshooting

### Problem: Node not appearing
**Solution:**
1. Check `npm run build` completed successfully
2. Restart n8n completely
3. Clear browser cache and refresh

### Problem: Credential error
**Solution:**
1. Verify all credential fields are filled
2. Check Base URL is correct
3. Confirm Access Key, App Key, App Secret are valid

### Problem: Processing timeout
**Solution:**
1. Sync processing may take 5-20 seconds - be patient
2. Check file size (should be < 10MB)
3. Verify file URL is publicly accessible
4. Try with a smaller file first

### Problem: No extraction results
**Solution:**
1. Check if `extraction_result` field exists in response
2. Verify file quality (high resolution, clear text)
3. Ensure correct document type is selected
4. Try with OCR results enabled to debug

## Tips for Best Results

### 1. File Quality
- Use high-resolution scans (300 DPI minimum)
- Ensure good lighting for photos
- Avoid blurry or skewed images
- PDF should be text-based when possible

### 2. File Size
- Optimal size: 100KB - 5MB
- Larger files take longer (up to 20s)
- Compress images if needed

### 3. Document Type Selection
- **Invoice**: B2B invoices with line items
- **Receipt**: B2E expense receipts
- **Purchase Order**: Procurement documents

### 4. Error Handling
- Enable "Continue On Fail" for batch processing
- Add error notification workflow
- Log failed extractions for review

## Advanced Workflow Examples

### Batch Invoice Processing

Process multiple invoices from a folder:

```
1. Read Files from Folder (PDF files)
   ↓
2. Loop Over Items
   ↓
3. ADP Overseas Extract (Invoice)
   ↓
4. IF: extraction_result exists?
   ↓ Yes: Save to Database
   ↓ No:  Log Error
```

### Receipt to Google Sheets

```
1. Webhook (File Upload)
   ↓
2. ADP Overseas Extract (Receipt)
   ↓
3. Google Sheets → Append Row
   - Merchant: {{ $json.data.extraction_result.merchantName }}
   - Date: {{ $json.data.extraction_result.documentDate }}
   - Amount: {{ $json.data.extraction_result.totalAmount }}
```

### Data Validation

```
1. ADP Overseas Extract
   ↓
2. IF: totalAmount > 0?
   ↓ Yes: 3. Save to Database
   ↓ No:  4. Send Alert Email
```

## API Endpoint Details

### Synchronous API
```
POST /open/agentic_doc_processor/{tenant_name}/v1/app/doc/extract
```

**Request Body:**
```json
{
  "app_key": "{app_key}",
  "app_secret": "{app_secret}",
  "document_type_hint": "INVOICE|RECEIPT|PURCHASE_ORDER",
  "file_base64": "{base64_content}",
  "with_rec_result": false
}
```

**Response:**
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "document_type": "INVOICE",
    "extraction_result": { ... }
  }
}
```

## Next Steps

Now that you have a working workflow:

1. ✅ Test with different document types
2. ✅ Add data validation
3. ✅ Integrate with your systems (database, sheets, etc.)
4. ✅ Set up automated processing
5. ✅ Monitor and optimize performance

## Resources

- **Full Documentation**: See `OVERSEAS_EXAMPLE.md`
- **Build & Test Guide**: See `BUILD_AND_TEST.md`
- **API Reference**: https://adp.laiye.com
- **Support**: xiangshuyu@laiye.com

---

**You're all set! 🎉**

Start processing overseas documents in seconds with ADP Overseas Extract node.
**No polling required - results are immediate!**
