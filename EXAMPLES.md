# n8n-nodes-adp Usage Examples

This document provides practical examples for using the ADP nodes in n8n workflows.

## Example 1: Simple Synchronous ID Card Extraction

Extract data from an ID card (Mainland China) using Base64 input.

### Workflow Setup

```
1. Manual Trigger
2. Read Binary File (optional - if reading from disk)
3. ADP Sync Extract
4. Process Result
```

### Node Configuration: ADP Sync Extract

```json
{
  "fileSource": "base64",
  "fileBase64": "{{ $json.base64 }}",
  "withRecResult": false,
  "additionalOptions": {
    "cardType": "身份证_大陆"
  }
}
```

### Expected Output

```json
{
  "code": 0,
  "data": {
    "task_id": "task-123",
    "status": 5,
    "extraction_result": [
      {
        "姓名": "张三",
        "性别": "男",
        "民族": "汉",
        "出生": "1990年1月1日",
        "住址": "北京市朝阳区xxx",
        "身份证号码": "110101199001011234",
        "签发机构": "北京市公安局朝阳分局",
        "有效期限": "2010.01.01-2030.01.01"
      }
    ],
    "metadata": {
      "card_type": "身份证_大陆",
      "extract_method": "vlm_card_extract"
    }
  },
  "message": "success"
}
```

## Example 2: Async Document Processing with Polling

Process a document from URL asynchronously with automatic polling.

### Workflow Setup

```
1. Manual Trigger / Webhook
2. ADP Create Async Task
3. Wait (10 seconds)
4. ADP Query Task
5. Switch (check status)
   - If status != 5 and status != 6, go back to Wait
   - If status == 5, process success
   - If status == 6, process error
6. Process Extraction Result
```

### Node 1: ADP Create Async Task

```json
{
  "fileSource": "url",
  "fileUrl": "https://example.com/document.pdf",
  "withRecResult": false
}
```

### Node 2: Wait

Configure a Wait node with 10 seconds delay.

### Node 3: ADP Query Task

```json
{
  "taskIdSource": "previous"
}
```

### Node 4: Switch (IF)

```javascript
// Condition to check if task is still running
return [
  {
    json: {
      shouldLoop: $json.data.status < 5
    }
  }
];
```

Connect "True" output back to Wait node, "False" output to next node.

## Example 3: Batch Processing Multiple Documents

Process multiple documents in parallel.

### Workflow Setup

```
1. Manual Trigger
2. Split In Batches (with list of URLs)
3. ADP Sync Extract
4. Merge (optional)
5. Aggregate Results
```

### Node 1: Manual Trigger

Provide a list of documents to process:

```json
[
  {
    "fileUrl": "https://example.com/doc1.pdf",
    "documentType": "身份证_大陆"
  },
  {
    "fileUrl": "https://example.com/doc2.pdf",
    "documentType": "驾驶证"
  }
]
```

### Node 2: Split In Batches

- Batch size: 1 (process one at a time)
- OR batch size: 5 (process 5 in parallel)

### Node 3: ADP Sync Extract

```json
{
  "fileSource": "url",
  "fileUrl": "{{ $json.fileUrl }}",
  "additionalOptions": {
    "cardType": "{{ $json.documentType }}"
  }
}
```

## Example 4: Processing File Uploads from Webhook

Handle file uploads through a webhook and extract information.

### Workflow Setup

```
1. Webhook (POST /process-document)
2. Code (convert to base64 if needed)
3. ADP Sync Extract
4. Format Response
5. Respond to Webhook
```

### Node 1: Webhook

- Path: `process-document`
- Method: POST
- Response Mode: 'last node'

### Node 2: Code (JavaScript)

If files are uploaded as multipart/form-data:

```javascript
// Extract file data from webhook
const fileData = items[0].binary.data;

// Convert to base64 if not already
let base64Data;
if (fileData.mime_type.includes('application/pdf') ||
    fileData.mime_type.includes('image/')) {
  base64Data = fileData.data;
} else {
  // Convert if needed
  base64Data = Buffer.from(fileData.data).toString('base64');
}

return [{
  json: {
    fileName: items[0].json.fileName || 'document',
    fileBase64: base64Data
  }
}];
```

### Node 3: ADP Sync Extract

```json
{
  "fileSource": "base64",
  "fileBase64": "{{ $json.fileBase64 }}",
  "withRecResult": false
}
```

### Node 4: Code (Format Response)

```javascript
// Format the extraction result
const result = items[0].json;

if (result.code === 0) {
  return [{
    json: {
      success: true,
      taskId: result.data.task_id,
      extractedData: result.data.extraction_result[0],
      metadata: result.data.metadata
    }
  }];
} else {
  return [{
    json: {
      success: false,
      error: result.message
    }
  }];
}
```

## Example 5: Conditional Processing Based on Document Type

Auto-detect document type and process accordingly.

### Workflow Setup

```
1. Manual Trigger
2. ADP Create Async Task (without card type)
3. Wait
4. ADP Query Task
5. Switch (based on detected document type)
6. Process based on type
```

### Switch Node Configuration

```javascript
const result = items[0].json.data.extraction_result[0];
const docType = items[0].json.data.metadata.doc_type;

// Return different outputs based on type
if (docType === '身份证') {
  return [{ json: { type: 'id_card', data: result } }];
} else if (docType === '驾驶证') {
  return [{ json: { type: 'driver_license', data: result } }];
} else {
  return [{ json: { type: 'general', data: result } }];
}
```

## Example 6: Error Handling with Continue On Fail

Process documents but continue even if some fail.

### Workflow Setup

```
1. Manual Trigger
2. Split In Batches
3. ADP Sync Extract (with Continue On Fail = true)
4. IF (check for errors)
5. Process successful results
6. Handle errors separately
```

### ADP Sync Extract Node

Enable "Continue On Fail" in node settings.

### Error Checking Node

```javascript
const successfulItems = [];
const failedItems = [];

items.forEach(item => {
  if (item.json.error) {
    failedItems.push({
      json: {
        originalData: item.json,
        error: item.json.error
      }
    });
  } else {
    successfulItems.push(item);
  }
});

return successfulItems.length > 0 ? successfulItems : [{ json: { noSuccess: true } }];
```

## Tips and Best Practices

### 1. Memory Management for Large Files

For large files (> 10MB), use URL input instead of Base64:

```json
{
  "fileSource": "url",
  "fileUrl": "https://storage.example.com/large-file.pdf"
}
```

### 2. Timeout Settings

For complex documents, the sync extraction might timeout. Use async mode:

```json
// Use ADP Create Async Task instead
{
  "fileSource": "url",
  "fileUrl": "{{ $json.url }}"
}
```

Then poll with ADP Query Task every 5-10 seconds.

### 3. Retry Failed Tasks

Implement retry logic:

```
ADP Create Async Task → Wait → ADP Query Task
                                    ↓
                              IF (status === 6)
                                    ↓
                              Count Retries
                                    ↓
                              IF (retries < 3)
                                    ↓
                              Go back to Create Task
```

### 4. Store Results for Audit

Save extraction results to a database:

```
ADP Sync Extract → Format Data → Insert into Database (PostgreSQL/MongoDB)
```

### 5. Combine with Human Review

Implement human-in-the-loop for low confidence results:

```
ADP Sync Extract → Check Confidence
                              ↓
                    IF (confidence < 0.8)
                              ↓
                    Send to Slack/Email for Review
```

## Common Workflows

### Invoice Processing

```
Webhook (invoice upload) → ADP Sync Extract → Extract Line Items →
Calculate Totals → Update Accounting System
```

### ID Verification

```
User Submit ID → ADP Sync Extract → Validate Fields →
Check Database → Approve/Reject User
```

### Contract Review

```
Upload Contract → ADP Sync Extract → Extract Clauses →
Legal Review → Store in Database
```

---

For more information, see the main [README.md](./README.md)
