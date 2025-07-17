// src/index.ts

import dotenv from 'dotenv';
dotenv.config();
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createPersonTool } from "./tools/people.js";
import { createOrganizationTool } from "./tools/organizations.js";
import { createProjectTool } from "./tools/projects.js";
// TODO: Import other tools/resources as you modularize them

const server = new McpServer({
  name: "workiro",
  version: "1.0.0",
  capabilities: {
    resources: {},
    tools: {},
  },
});

// Register modularized tools
server.tool(
  createPersonTool.name,
  createPersonTool.schema,
  { title: createPersonTool.description },
  createPersonTool.handler
);

server.tool(
  createOrganizationTool.name,
  createOrganizationTool.schema,
  { title: createOrganizationTool.description },
  createOrganizationTool.handler
);

server.tool(
  createProjectTool.name,
  createProjectTool.schema,
  { title: createProjectTool.description },
  createProjectTool.handler
);

// TODO: Register other tools/resources as you modularize them

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Workiro MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});