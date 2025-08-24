# Quick Start Guide

## 🚀 Get Started in 3 Steps

### 1. Install & Build
```bash
yarn install
yarn build
```

### 2. Test the Server
```bash
# List available tools
yarn test:cli list-tools

# Get system information
yarn test:cli system-info

# Get random todo data
yarn test:cli random-data
```

### 3. Use with Cursor
1. Open Cursor IDE
2. Go to Settings → Tools & Integrations → MCP Tools
3. Toggle `node-mcp-server` ON
4. Ask Cursor to "show me system information" or "fetch random todo data"

## 🛠️ Available Tools

| Tool | Description | Usage |
|------|-------------|-------|
| `get_system_info` | Get system details | "What's my system information?" |
| `get_random_data` | Fetch random todo | "Get me some random todo data" |

## 🔧 CLI Commands

```bash
# Test individual tools
npx ts-node cli-client.ts system-info
npx ts-node cli-client.ts random-data

# List everything
npx ts-node cli-client.ts list-tools
npx ts-node cli-client.ts list-resources
npx ts-node cli-client.ts list-prompts
```

## 🚨 Troubleshooting

**"No tools or prompts" error?**
- Restart Cursor completely
- Toggle MCP server OFF then ON
- Check that `yarn build` completed successfully

**Server not responding?**
- Ensure Node.js is installed
- Check that all dependencies are installed
- Verify the server path in `.cursor/mcp.json`

## 📚 More Information

- Full documentation: [README.md](./README.md)
- MCP Protocol: [modelcontextprotocol.io](https://modelcontextprotocol.io/)
- JSONPlaceholder API: [jsonplaceholder.typicode.com](https://jsonplaceholder.typicode.com/)
