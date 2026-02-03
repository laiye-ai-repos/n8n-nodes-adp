# Build and Test Guide - ADP Overseas Extract Node

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- n8n installed and running
- ADP API credentials

## Quick Start

### 1. Build the Node Package

```bash
# Navigate to the n8n-nodes-adp directory
cd src/n8n-nodes-adp

# Install dependencies (first time only)
npm install

# Build the package
npm run build

# Or build with watch mode for development
npm run build:watch
```

The build process will:
1. Compile TypeScript files to JavaScript in the `dist/` directory
2. Verify node definitions
3. Generate proper n8n node metadata

### 2. Install in n8n (Development)

#### Method A: Using npm link (Recommended for development)

```bash
# In the n8n-nodes-adp directory
npm link

# In your n8n custom nodes directory
cd ~/.n8n/custom
npm link n8n-nodes-adp

# Restart n8n
n8n start
```

#### Method B: Local npm install

```bash
# In the n8n-nodes-adp directory
npm run build

# In your n8n directory
cd ~/.n8n/custom
npm install /path/to/src/n8n-nodes-adp

# Restart n8n
n8n start
```

### 3. Verify Installation

1. Open n8n in your browser
2. Click "Add Node" (+) button
3. Search for "ADP Overseas Extract"
4. The node should appear in the node list

## Testing the Node

### Test 1: Configure Credentials

1. Click on the newly added "ADP Overseas Extract" node
2. Click on "Credential to connect with"
3. Select "Create New Credential"
4. Fill in the following:
   - **Base URL**: `https://adp.laiye.com`
   - **Access Key**: Your access key (e.g., `c114c81ad02511f0ad8100163e358400`)
   - **App Key**: Your app key (e.g., `AS1gEParppb5KHF6ZEg4IDfa`)
   - **App Secret**: Your app secret (e.g., `GAvj8o5tmVDvtGO1ZKeQPJpgtJkHp5YfS51p`)
   - **Tenant Name**: `laiye` (or your tenant name)
5. Click "Save"

### Test 2: Basic Invoice Extraction

**Workflow:**
1. **Manual Trigger** → ADP Overseas Extract

**Node Configuration:**
- Document Type: `Invoice`
- File Source: `URL`
- File URL: `https://example.com/test-invoice.pdf`
- With Recognition Result: `false` (unchecked)

**Expected Output:**
```json
{
  "task_id": "task_1234567890",
  "agent_type": "classifier-extractor",
  "document_type_hint": "INVOICE",
  "message": "Task created successfully",
  "full_response": { ... }
}
```

### Test 3: Complete Async Workflow with Polling

**Workflow:**
```
Manual Trigger
  ↓
ADP Overseas Extract (Invoice)
  ↓
Wait (10 seconds)
  ↓
ADP Query Task
  ↓
IF (Check status === 5)
  ↓ (if not complete)
Loop back to Wait
  ↓ (if complete)
Process Results
```

**Step 1: ADP Overseas Extract**
- Document Type: `RECEIPT`
- File Source: `Base64`
- File Base64: `{{ $json.base64Data }}`

**Step 2: Wait Node**
- Wait Time: `10 seconds`

**Step 3: ADP Query Task**
- Task ID Source: `From Previous Node`
- Task ID Field: `task_id`

**Step 4: IF Node**
- Condition: `{{ $json.status === 5 }}`

**Expected Final Output:**
```json
{
  "task_id": "task_1234567890",
  "status": 5,
  "document_type": "RECEIPT",
  "extraction_result": {
    "merchantName": "Example Store",
    "merchantAddress": "123 Main St",
    "documentDate": "2024-01-15",
    "currency": "USD",
    "totalAmount": 125.50,
    "taxAmount": 15.50,
    "lineItems": [
      {
        "description": "Product A",
        "quantity": 2,
        "unitPrice": 55.00,
        "totalPrice": 110.00
      }
    ]
  }
}
```

### Test 4: Purchase Order Extraction

**Workflow:**
```
Manual Trigger → ADP Overseas Extract (PO) → Wait → ADP Query Task
```

**Node Configuration:**
- Document Type: `Purchase Order`
- File Source: `URL`
- File URL: Your PO file URL

**Expected Agent Type:**
```json
{
  "agent_type": "po-specialist"
}
```

### Test 5: Error Handling

**Test "Continue On Fail":**
1. Enable "Continue On Fail" in node settings
2. Use invalid file URL
3. Execute workflow
4. Check error response format

**Expected Error Response:**
```json
{
  "error": "Failed to fetch file",
  "details": { ... }
}
```

## Testing with Real Documents

### Sample Document Preparation

1. **Prepare Base64 encoded file:**
```javascript
// In a Code node to encode file
const fs = require('fs');
const path = require('path');

const filePath = '/path/to/your/invoice.pdf';
const fileBuffer = fs.readFileSync(filePath);
const base64 = fileBuffer.toString('base64');

return [{ json: { base64Data: base64 } }];
```

2. **Or use publicly accessible URL:**
   - Upload your test document to a public URL
   - Use the URL in the node configuration

### Test Documents Matrix

| Document Type | File Format | Expected Document Type | Expected Agent |
|--------------|-------------|------------------------|----------------|
| Invoice | PDF | INVOICE | classifier-extractor |
| Invoice | PNG | INVOICE | classifier-extractor |
| Receipt | JPG | RECEIPT | classifier-extractor |
| Purchase Order | PDF | PURCHASE_ORDER | po-specialist |
| Mixed (Invoice) | PDF | INVOICE | classifier-extractor |

## Debugging

### Enable Debug Logging

Add to your n8n configuration:
```bash
export N8N_LOG_LEVEL=debug
export N8N_LOG_OUTPUT=console
```

### Check Node Output

1. Execute workflow
2. Click on node execution result
3. Check "JSON Output" tab for response
4. Check "Execution Time" for performance

### Common Issues

**Issue 1: Node not appearing**
- Solution: Check `package.json` has node registered
- Solution: Run `npm run build` again
- Solution: Restart n8n completely

**Issue 2: Credential errors**
- Solution: Verify all credential fields are filled
- Solution: Check Base URL is correct
- Solution: Test credentials with API directly

**Issue 3: Task not completing**
- Solution: Increase wait time between polls
- Solution: Check task status manually with ADP Query Task
- Solution: Verify file format is supported

**Issue 4: Wrong document type detected**
- Solution: This is expected for Invoice/Receipt (auto-classified)
- Solution: Check `document_type` field in query response
- Solution: Purchase Orders should skip classification

## Performance Testing

### Test with Different File Sizes

| File Size | Expected Time | Notes |
|-----------|--------------|-------|
| < 1MB | 5-10s | Fast |
| 1-5MB | 10-20s | Normal |
| > 5MB | 20-30s | Slow, consider optimizing |

### Load Testing

Process multiple documents in parallel:
```
1. Create workflow with multiple ADP Overseas Extract nodes
2. Connect to same Wait and Query nodes
3. Execute and monitor processing times
4. Check for rate limiting errors
```

## Production Deployment

### Publish to npm (Optional)

```bash
# Update version in package.json
npm version patch  # or minor, major

# Build and publish
npm run build
npm publish
```

Users can then install:
```bash
npm install n8n-nodes-adp
```

### Install from GitHub

Users can install directly from your repository:
```bash
cd ~/.n8n/custom
npm install https://github.com/your-org/n8n-nodes-adp.git
```

## Validation Checklist

Before considering the node ready for production:

- [ ] Node compiles without errors
- [ ] Node appears in n8n node list
- [ ] Credentials can be created and saved
- [ ] Invoice extraction works with Base64 input
- [ ] Invoice extraction works with URL input
- [ ] Receipt extraction works
- [ ] Purchase Order extraction works
- [ ] Query task returns results correctly
- [ ] Error handling works with "Continue On Fail"
- [ ] README documentation is complete
- [ ] Example workflows are tested

## Next Steps

After successful testing:

1. **Create example workflows** in n8n workflow gallery
2. **Write blog post** about the node capabilities
3. **Submit to n8n community nodes** list
4. **Gather user feedback** for improvements
5. **Monitor API usage** and optimize if needed

## Support

For issues during testing:
- Check n8n logs: `~/.n8n/logs/`
- Review ADP API documentation
- Check browser console for errors
- Enable n8n debug logging

---

**Happy Testing! 🚀**
