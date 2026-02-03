# Build and Development Guide

## Prerequisites

- Node.js 18+ and npm
- TypeScript 5.9+
- n8n (for testing)

## Development Setup

```bash
# Navigate to the nodes directory
cd src/n8n-nodes-adp

# Install dependencies
npm install

# Install dev dependencies
npm install --save-dev @types/uuid

# Build the project
npm run build

# Start development mode (watches for changes)
npm run dev
```

## Project Structure

```
n8n-nodes-adp/
├── credentials/
│   └── ADPApi.credentials.ts    # API credential definition
├── nodes/
│   ├── ADPSyncExtract/
│   │   ├── ADPSyncExtract.node.ts
│   │   ├── ADPSyncExtract.node.json
│   │   ├── adp.svg
│   │   └── adp.dark.svg
│   ├── ADPAsyncTask/
│   │   ├── ADPAsyncTask.node.ts
│   │   ├── ADPAsyncTask.node.json
│   │   ├── adp.svg
│   │   └── adp.dark.svg
│   └── ADPTaskQuery/
│       ├── ADPTaskQuery.node.ts
│       ├── ADPTaskQuery.node.json
│       ├── adp.svg
│       └── adp.dark.svg
├── package.json
├── tsconfig.json
├── README.md
├── EXAMPLES.md
└── BUILD.md
```

## Building

```bash
# Build for production
npm run build

# This will:
# 1. Compile TypeScript to JavaScript in dist/
# 2. Copy all necessary files
# 3. Prepare the package for distribution
```

## Testing Locally

### Option 1: Link to Local n8n

```bash
# In n8n-nodes-adp directory
npm link

# In your n8n directory
npm link n8n-nodes-adp

# Restart n8n
```

### Option 2: Install from Local Path

```bash
# In your n8n directory
npm install /path/to/src/n8n-nodes-adp

# Restart n8n
```

### Option 3: Use Dev Mode

```bash
# In n8n-nodes-adp directory
npm run dev

# This will:
# - Build the nodes
# - Watch for file changes
# - Rebuild on changes
```

## Linting

```bash
# Run linter
npm run lint

# Fix linting issues automatically
npm run lint:fix
```

## Releasing

```bash
# Update version in package.json
npm version patch  # or minor or major

# Build the package
npm run build

# Publish to npm (if publishing publicly)
npm publish

# Or create a release package
npm run release
```

## Installation in n8n

### Development Installation

```bash
cd /path/to/n8n
npm install /path/to/src/n8n-nodes-adp
```

### Production Installation

```bash
# From npm registry (when published)
npm install n8n-nodes-adp

# Or from GitHub
npm install git+https://github.com/your-org/n8n-nodes-adp.git
```

## Troubleshooting

### Nodes Not Showing Up

1. Check if nodes are properly built:
```bash
ls -la dist/nodes/
```

2. Check package.json configuration:
```bash
cat package.json | grep -A 10 "n8n"
```

3. Restart n8n completely:
```bash
# Stop n8n
# Start n8n again
```

### Type Errors

```bash
# Clear TypeScript cache
rm -rf node_modules/.cache

# Rebuild
npm run build
```

### Import Errors

Make sure all dependencies are installed:
```bash
npm install
npm install --save-dev @types/uuid
```

## Debugging

### Enable Debug Logging

In n8n, set environment variable:
```bash
export NODE_ENV=development
export DEBUG=n8n:nodes
```

### View Node Outputs

Use a "Code" node after ADP nodes to inspect full output:
```javascript
console.log('ADP Output:', JSON.stringify(items, null, 2));
return items;
```

### Test API Calls Directly

Use curl to test the API directly:
```bash
curl -X POST "https://adp.laiye.com/open/agentic_doc_processor/laiye/v1/app/doc/extract" \
  -H "X-Access-Key: your-access-key" \
  -H "X-Timestamp: $(date +%s)" \
  -H "X-Signature: test-signature" \
  -H "Content-Type: application/json" \
  -d '{
    "app_key": "your-app-key",
    "app_secret": "your-app-secret",
    "file_base64": "base64-encoded-content"
  }'
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## Support

For issues and questions:
- GitHub Issues: [Create an issue]
- Email: xiangshuyu@laiye.com

---

**Last Updated**: 2025-01-30
