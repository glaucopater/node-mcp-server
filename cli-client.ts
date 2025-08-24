#!/usr/bin/env ts-node

import { spawn, ChildProcess } from 'child_process';
import * as path from 'path';

// MCP Protocol Types
interface MCPMessage {
  jsonrpc: "2.0";
  id: number;
  method: string;
  params: any;
}

interface MCPResponse {
  jsonrpc: "2.0";
  id?: number;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

interface SystemInfo {
  platform: string;
  nodeVersion: string;
  arch: string;
  cwd: string;
  env: number;
  memoryUsage: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
    arrayBuffers: number;
  };
  uptime: number;
}

// Parse command line arguments
const args = process.argv.slice(2);
const command = args[0];

if (!command) {
  console.log('Usage: npx ts-node cli-client.ts <command>');
  console.log('Available commands:');
  console.log('  list-tools    - List available tools');
  console.log('  system-info   - Get system information');
  console.log('  random-data   - Get random todo data from API');
  console.log('  list-resources - List available resources');
  console.log('  list-prompts  - List available prompts');
  process.exit(1);
}

// Start the MCP server
const server: ChildProcess = spawn('node', [path.join(__dirname, 'dist', 'mcp-server.js')], {
  stdio: ['pipe', 'pipe', 'pipe']
});

// MCP protocol messages
const messages: Record<string, MCPMessage> = {
  listTools: {
    jsonrpc: "2.0",
    id: 1,
    method: "tools/list",
    params: {}
  },
  getSystemInfo: {
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "get_system_info",
      arguments: {}
    }
  },
  getRandomData: {
    jsonrpc: "2.0",
    id: 3,
    method: "tools/call",
    params: {
      name: "get_random_data",
      arguments: {}
    }
  },
  listResources: {
    jsonrpc: "2.0",
    id: 4,
    method: "resources/list",
    params: {}
  },
  listPrompts: {
    jsonrpc: "2.0",
    id: 5,
    method: "prompts/list",
    params: {}
  }
};

let responseCount = 0;
const expectedResponses = 1;

server.stdout?.on('data', (data: Buffer) => {
  try {
    const response: MCPResponse = JSON.parse(data.toString());
    
    if (response.result) {
      console.log('\n=== MCP Response ===');
      
      // Pretty print system info if that's what we requested
      if (command === 'system-info' && response.result.content) {
        const systemInfo: SystemInfo = JSON.parse(response.result.content[0].text);
        console.log('System Information:');
        console.log(`  Platform: ${systemInfo.platform}`);
        console.log(`  Node.js Version: ${systemInfo.nodeVersion}`);
        console.log(`  Architecture: ${systemInfo.arch}`);
        console.log(`  Current Directory: ${systemInfo.cwd}`);
        console.log(`  Environment Variables: ${systemInfo.env}`);
        console.log(`  Memory Usage:`);
        console.log(`    RSS: ${(systemInfo.memoryUsage.rss / 1024 / 1024).toFixed(2)} MB`);
        console.log(`    Heap Total: ${(systemInfo.memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`);
        console.log(`    Heap Used: ${(systemInfo.memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`);
        console.log(`    External: ${(systemInfo.memoryUsage.external / 1024 / 1024).toFixed(2)} MB`);
        console.log(`    Array Buffers: ${(systemInfo.memoryUsage.arrayBuffers / 1024).toFixed(2)} KB`);
        console.log(`  Uptime: ${systemInfo.uptime.toFixed(2)} seconds`);
      } else {
        console.log(JSON.stringify(response.result, null, 2));
      }
    } else if (response.error) {
      console.error('\n=== MCP Error ===');
      console.error(JSON.stringify(response.error, null, 2));
    }
    
    responseCount++;
    if (responseCount >= expectedResponses) {
      server.kill();
      process.exit(0);
    }
  } catch (error) {
    console.log('Raw output:', data.toString());
  }
});

server.stderr?.on('data', (data: Buffer) => {
  // Ignore server startup messages
  if (!data.toString().includes('MCP Server started')) {
    console.log('Server stderr:', data.toString());
  }
});

// Send the appropriate message based on command
let messageToSend: MCPMessage;
switch (command) {
  case 'list-tools':
    messageToSend = messages.listTools;
    break;
  case 'system-info':
    messageToSend = messages.getSystemInfo;
    break;
  case 'random-data':
    messageToSend = messages.getRandomData;
    break;
  case 'list-resources':
    messageToSend = messages.listResources;
    break;
  case 'list-prompts':
    messageToSend = messages.listPrompts;
    break;
  default:
    console.error(`Unknown command: ${command}`);
    server.kill();
    process.exit(1);
}

// Send the message
server.stdin?.write(JSON.stringify(messageToSend) + '\n');

server.on('close', (code: number) => {
  if (code !== 0) {
    console.log(`Server process exited with code ${code}`);
  }
});

// Handle process termination
process.on('SIGINT', () => {
  server.kill();
  process.exit(0);
});
