# Node.js MCP Server

A Model Context Protocol (MCP) server implementation in Node.js that provides secure tools and resources for AI assistants.

## What is MCP?

The Model Context Protocol (MCP) is a standard protocol that allows AI assistants to interact with external tools, resources, and data sources. It enables AI models to:

- Execute tools and functions
- Access external resources (files, APIs, databases)
- Retrieve contextual prompts and instructions
- Maintain persistent connections with external services

## Features

This MCP server provides:

### Tools
- **`get_system_info`**: Retrieve system information (platform, Node.js version, memory usage, etc.)
- **`get_random_data`**: Fetch random todo data from JSONPlaceholder API (todos 1-100)

### Resources
- File system access through `file:///` URIs (read-only)
- Package configuration files
- Project documentation

### Prompts
- **`system_info`**: Context for system information requests
- **`get_random_data`**: Context for API data fetching assistance

### Monitoring & Logging
- **Comprehensive logging** of all MCP requests and tool executions
- **Request tracking** with arguments and execution status
- **Error logging** for debugging and monitoring
- **Performance insights** for tool execution times

## Security Features

✅ **Secure by Design**: Only read-only operations and safe external API calls  
✅ **No File Operations**: Cannot modify, delete, or write files  
✅ **No Command Execution**: Cannot run system commands  
✅ **Limited External APIs**: Only accesses JSONPlaceholder API for demo purposes  
✅ **Input Validation**: All inputs are validated and sanitized  

## Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd node-mcp-server
```

2. Install dependencies:
```bash
yarn install
```

3. Build the project:
```bash
yarn build
```

## Usage

### Starting the MCP Server

The server communicates via stdio (standard input/output), which is the standard transport method for MCP servers:

```bash
yarn start
```

Or run directly:
```bash
node dist/mcp-server.js
```

### Testing with the CLI Client

Run the TypeScript CLI client to test the server:

```bash
# List available tools
npx ts-node cli-client.ts list-tools

# Get system information
npx ts-node cli-client.ts system-info

# Get random todo data
npx ts-node cli-client.ts random-data

# List available resources
npx ts-node cli-client.ts list-resources

# List available prompts
npx ts-node cli-client.ts list-prompts
```

### Development Mode

For development, you can use ts-node to run TypeScript directly:
```bash
yarn dev          # Run server in dev mode
yarn dev:client   # Run client in dev mode
```

## Configuration

### Environment Variables

- `NODE_ENV`: Environment mode (development/production)

### Server Configuration

The server is configured in `mcp-server.ts` with:

- Server name and version
- Capabilities (tools, resources, prompts)
- Request handlers for each MCP operation type

## Architecture

### Server Structure

```
MCP Server
├── Tools Handler
│   ├── System Info
│   └── Random Data API
├── Resources Handler
│   └── File System Access (Read-only)
└── Prompts Handler
    ├── System Info Context
    └── Random Data Context
```

### Transport Layer

The server uses stdio transport, which is:
- Standard for MCP implementations
- Compatible with most AI assistant frameworks
- Simple to integrate and debug

## Integration with AI Assistants

### Cursor IDE

Add to your `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "node-mcp": {
      "command": "node",
      "args": ["/path/to/your/node-mcp-server/dist/mcp-server.js"],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

### Other MCP Clients

The server follows the official MCP specification and should work with any compliant client.

## Extending the Server

### Adding New Tools

1. Define the tool in the `ListToolsRequestSchema` handler
2. Implement the tool logic in the `CallToolRequestSchema` handler
3. Add proper error handling and validation
4. Update the CLI client for testing

Example:
```typescript
// In ListToolsRequestSchema handler
{
  name: 'new_tool',
  description: 'Description of the new tool',
  inputSchema: {
    type: 'object',
    properties: {
      param1: { type: 'string' }
    },
    required: ['param1']
  }
}

// In CallToolRequestSchema handler
case 'new_tool':
  const { param1 } = args;
  // Implement tool logic here
  return {
    content: [{ type: 'text', text: `Tool executed with: ${param1}` }]
  };
```

### Adding New Resources

1. Define the resource in the `ListResourcesRequestSchema` handler
2. Implement reading logic in the `ReadResourceRequestSchema` handler

### Adding New Prompts

1. Define the prompt in the `ListPromptsRequestSchema` handler
2. Implement prompt retrieval in the `GetPromptRequestSchema` handler

## Security Considerations

✅ **This MCP server is configured for security:**

- No file write/delete operations
- No command execution capabilities
- Limited external API access
- Input validation and sanitization
- Safe for use in any environment

## Troubleshooting

### Common Issues

1. **Build Errors**: Ensure TypeScript is properly installed and configured
2. **Import Errors**: Check that all dependencies are installed
3. **MCP Connection Issues**: Restart Cursor or toggle the MCP server off/on

### Debug Mode

Enable debug logging by setting the environment variable:
```bash
DEBUG=mcp:* yarn dev
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Resources

- [Model Context Protocol Specification](https://modelcontextprotocol.io/)
- [MCP SDK Documentation](https://github.com/modelcontextprotocol/js-sdk)
- [MCP Tools and Servers](https://github.com/modelcontextprotocol/tools-and-servers)
- [JSONPlaceholder API](https://jsonplaceholder.typicode.com/) - Demo API used for testing
