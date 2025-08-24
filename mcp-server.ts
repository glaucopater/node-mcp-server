// mcp-server.ts

// Import necessary modules from Node.js and the 'ws' library.
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

// Create a new MCP server
const server = new Server(
  {
    name: 'node-mcp-server',
    version: '1.0.0',
  }
);

// Register tool handlers
server.setRequestHandler(ListToolsRequestSchema, async () => {
  console.error(`[MCP] Tools list requested`);
  return {
    tools: [
      {
        name: 'get_system_info',
        description: 'Get system information about the current environment',
        inputSchema: {
          type: 'object',
          properties: {},
          required: [],
        },
      },
      {
        name: 'get_random_data',
        description: 'Fetch random data from JSONPlaceholder API (todos 1-100)',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'number',
              description: 'Todo ID between 1 and 100 (optional, random if not provided)',
              minimum: 1,
              maximum: 100
            }
          },
          required: []
        },
      }
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  // Log incoming tool call
  console.error(`[MCP] Tool call received: ${name} with args:`, JSON.stringify(args || {}));

  try {
    switch (name) {
      case 'get_system_info':
        console.error(`[MCP] Executing get_system_info tool`);
        const systemInfo = {
          platform: process.platform,
          nodeVersion: process.version,
          arch: process.arch,
          cwd: process.cwd(),
          env: Object.keys(process.env).length,
          memoryUsage: process.memoryUsage(),
          uptime: process.uptime(),
        };
        console.error(`[MCP] get_system_info completed successfully`);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(systemInfo, null, 2),
            },
          ],
        };

      case 'get_random_data':
        console.error(`[MCP] Executing get_random_data tool`);
        // Generate random ID between 1-100 if not provided
        const todoId = args?.id || Math.floor(Math.random() * 100) + 1;
        console.error(`[MCP] Fetching todo data for ID: ${todoId}`);
        
        try {
          const response = await fetch(`https://jsonplaceholder.typicode.com/todos/${todoId}`);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const data = await response.json();
          console.error(`[MCP] get_random_data completed successfully for ID: ${todoId}`);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  message: `Fetched todo data for ID: ${todoId}`,
                  data: data,
                  api_url: `https://jsonplaceholder.typicode.com/todos/${todoId}`
                }, null, 2),
              },
            ],
          };
        } catch (fetchError) {
          console.error(`[MCP] get_random_data failed:`, fetchError instanceof Error ? fetchError.message : String(fetchError));
          return {
            content: [
              {
                type: 'text',
                text: `Error fetching data: ${fetchError instanceof Error ? fetchError.message : String(fetchError)}`,
              },
            ],
            isError: true,
          };
        }

      default:
        console.error(`[MCP] Unknown tool requested: ${name}`);
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    console.error(`[MCP] Error executing tool ${name}:`, error instanceof Error ? error.message : String(error));
    return {
      content: [
        {
          type: 'text',
          text: `Error executing tool ${name}: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
});

// Register resource handlers
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: 'file:///README.md',
        name: 'README',
        description: 'Project README file',
        mimeType: 'text/markdown',
      },
      {
        uri: 'file:///package.json',
        name: 'Package Configuration',
        description: 'Node.js package configuration',
        mimeType: 'application/json',
      },
    ],
  };
});

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;

  try {
    if (uri.startsWith('file:///')) {
      const fs = await import('fs/promises');
      const path = uri.replace('file:///', '');
      const content = await fs.readFile(path, 'utf-8');

      return {
        contents: [
          {
            uri,
            mimeType: 'text/plain',
            text: content,
          },
        ],
      };
    }

    throw new Error(`Unsupported URI scheme: ${uri}`);
  } catch (error) {
    return {
      contents: [
        {
          uri,
          mimeType: 'text/plain',
          text: `Error reading resource: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
});

// Register prompt handlers
server.setRequestHandler(ListPromptsRequestSchema, async () => {
  console.error(`[MCP] Prompts list requested`);
  return {
    prompts: [
      {
        name: 'system_info',
        description: 'Get system information',
        arguments: [
          {
            name: 'none',
            description: 'No arguments required',
            type: 'string',
            required: false,
          },
        ],
      },
      {
        name: 'get_random_data',
        description: 'Fetch random todo data from JSONPlaceholder API',
        arguments: [
          {
            name: 'id',
            description: 'Optional todo ID (1-100), random if not provided',
            type: 'number',
            required: false,
          },
        ],
      }
    ],
  };
});

server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case 'system_info':
      return {
        prompt: `You are a helpful assistant. The user wants to get system information. 
        Use the get_system_info tool to retrieve current system details and present them in a clear, organized format.`,
        arguments: args,
      };

    case 'get_random_data':
      return {
        prompt: `You are a helpful assistant. The user wants to fetch random todo data from the JSONPlaceholder API. 
        Use the get_random_data tool to retrieve todo data. You can optionally specify an ID between 1-100, 
        or let it fetch a random todo. Present the data in a clear, organized format showing the todo details.`,
        arguments: args,
      };

    default:
      throw new Error(`Unknown prompt: ${name}`);
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('MCP Server started and connected via stdio');
}

main().catch((error) => {
  console.error('Failed to start MCP server:', error);
  process.exit(1);
});
