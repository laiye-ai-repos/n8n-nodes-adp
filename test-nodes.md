# Node Configuration Summary

## Created Nodes

### 1. ADP Sync Extract (adpSyncExtract)
- **File**: `nodes/ADPSyncExtract/ADPSyncExtract.node.ts`
- **Description**: Synchronously extract data from documents
- **API Endpoint**: `POST /v1/app/doc/extract`
- **Features**:
  - Base64 or URL file input
  - Optional card type selection
  - OCR results inclusion option
  - Continue on fail support

### 2. ADP Create Async Task (adpAsyncTask)
- **File**: `nodes/ADPAsyncTask/ADPAsyncTask.node.ts`
- **Description**: Create an asynchronous extraction task
- **API Endpoint**: `POST /v1/app/doc/extract/create/task`
- **Features**:
  - Returns immediately with task_id
  - Same input options as sync node
  - Suitable for long-running tasks

### 3. ADP Query Task (adpTaskQuery)
- **File**: `nodes/ADPTaskQuery/ADPTaskQuery.node.ts`
- **Description**: Query async task status and results
- **API Endpoint**: `GET /v1/app/doc/extract/query/task/{task_id}`
- **Features**:
  - Manual task ID input
  - Automatic task ID from previous node
  - Returns task status and extraction results

## Authentication

### ADP API Credentials
- **File**: `credentials/ADPApi.credentials.ts`
- **Fields**:
  - `baseUrl`: API base URL (default: https://adp.laiye.com)
  - `accessKey`: Tenant-level access key
  - `appKey`: Application key
  - `appSecret`: Application secret
  - `tenantName`: Tenant name (default: laiye)

### Authentication Headers
```typescript
{
  'X-Access-Key': accessKey,
  'X-Timestamp': timestamp,
  'X-Signature': uuid,
  'Content-Type': 'application/json'
}
```

## Package Configuration

### package.json
```json
{
  "name": "n8n-nodes-adp",
  "version": "0.1.0",
  "n8n": {
    "credentials": [
      "dist/credentials/ADPApi.credentials.js"
    ],
    "nodes": [
      "dist/nodes/ADPSyncExtract/ADPSyncExtract.node.js",
      "dist/nodes/ADPAsyncTask/ADPAsyncTask.node.js",
      "dist/nodes/ADPTaskQuery/ADPTaskQuery.node.js"
    ]
  },
  "dependencies": {
    "uuid": "^9.0.0"
  }
}
```

## Installation Steps

### 1. Build the Package
```bash
cd src/n8n-nodes-adp
npm install
npm run build
```

### 2. Install in n8n
```bash
# From n8n directory
npm install /path/to/src/n8n-nodes-adp

# Or link for development
npm link
```

### 3. Configure Credentials in n8n
1. Open n8n
2. Go to Credentials → New
3. Search for "ADP API"
4. Fill in:
   - Base URL: https://adp.laiye.com (or your custom URL)
   - Access Key: your access key
   - App Key: your app key
   - App Secret: your app secret
   - Tenant Name: laiye (or your tenant)

### 4. Use in Workflows
- Add any ADP node to your workflow
- Select your ADP API credentials
- Configure parameters
- Run the workflow

## Quick Test Workflow

### Simple Sync Test
```
1. Manual Trigger
2. ADP Sync Extract
   - File Source: base64
   - File Base64: <your base64 data>
   - Card Type: 身份证_大陆
3. Code Node (view result)
```

### Async Test
```
1. Manual Trigger
2. ADP Create Async Task
   - File Source: url
   - File URL: https://example.com/doc.pdf
3. Wait (10s)
4. ADP Query Task
   - Task ID Source: From Previous Node
5. Code Node (view result)
```

## API Endpoints Mapping

| Node | Method | Endpoint |
|------|--------|----------|
| ADP Sync Extract | POST | `/open/agentic_doc_processor/{tenant}/v1/app/doc/extract` |
| ADP Create Async Task | POST | `/open/agentic_doc_processor/{tenant}/v1/app/doc/extract/create/task` |
| ADP Query Task | GET | `/open/agentic_doc_processor/{tenant}/v1/app/doc/extract/query/task/{task_id}` |

## Card Types Supported

- 身份证_大陆 (Mainland China ID Card)
- 身份证_香港 (Hong Kong ID Card)
- 驾驶证 (Driver License)
- 行驶证 (Vehicle License)
- 营业执照 (Business License)
- 银行卡 (Bank Card)
- 护照 (Passport)
- 户口本 (Household Register)
- 结婚证 (Marriage Certificate)
- 港澳通行证 (HK/Macau Pass)

## Task Status Codes

| Code | Status | Description |
|------|--------|-------------|
| 1 | Pending | Task created |
| 2 | Running Conversion | Converting document |
| 3 | Running Recognition | OCR/VLM processing |
| 4 | Running Extraction | Extracting data |
| 5 | Success | Completed successfully |
| 6 | Failed | Task failed |
| 7 | Cancelled | Task cancelled |

## Response Structure

### Success Response
```json
{
  "code": 0,
  "data": {
    "task_id": "string",
    "status": 5,
    "extraction_result": [
      {
        "field_name": "extracted_value"
      }
    ],
    "metadata": {
      "card_type": "string",
      "extract_method": "string"
    }
  },
  "message": "success"
}
```

### Error Response
```json
{
  "code": 400,
  "message": "Error message",
  "data": null
}
```

## Files Created

### Credentials
- ✅ `credentials/ADPApi.credentials.ts`

### Nodes
- ✅ `nodes/ADPSyncExtract/ADPSyncExtract.node.ts`
- ✅ `nodes/ADPSyncExtract/ADPSyncExtract.node.json`
- ✅ `nodes/ADPAsyncTask/ADPAsyncTask.node.ts`
- ✅ `nodes/ADPAsyncTask/ADPAsyncTask.node.json`
- ✅ `nodes/ADPTaskQuery/ADPTaskQuery.node.ts`
- ✅ `nodes/ADPTaskQuery/ADPTaskQuery.node.json`

### Icons
- ✅ `nodes/ADPSyncExtract/adp.svg`
- ✅ `nodes/ADPSyncExtract/adp.dark.svg`
- ✅ `nodes/ADPAsyncTask/adp.svg`
- ✅ `nodes/ADPAsyncTask/adp.dark.svg`
- ✅ `nodes/ADPTaskQuery/adp.svg`
- ✅ `nodes/ADPTaskQuery/adp.dark.svg`

### Documentation
- ✅ `README.md` (updated)
- ✅ `EXAMPLES.md`
- ✅ `BUILD.md`
- ✅ `package.json` (updated)

## Next Steps

1. **Install dependencies**:
   ```bash
   cd src/n8n-nodes-adp
   npm install
   ```

2. **Build the package**:
   ```bash
   npm run build
   ```

3. **Fix any TypeScript errors** (if any)

4. **Install in n8n**:
   ```bash
   # In your n8n directory
   npm install ../src/n8n-nodes-adp
   ```

5. **Test the nodes**:
   - Create a new workflow
   - Add an ADP node
   - Configure credentials
   - Test with a sample document

## Troubleshooting

### Build Errors
```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

### TypeScript Errors
```bash
# Install missing type definitions
npm install --save-dev @types/uuid @types/node
```

### Node Not Showing in n8n
1. Check `package.json` nodes array
2. Verify `dist/` folder exists and contains compiled files
3. Restart n8n completely

---

**Status**: ✅ All nodes created and configured successfully
**Last Updated**: 2025-01-30
