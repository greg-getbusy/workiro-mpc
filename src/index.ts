import dotenv from 'dotenv';
dotenv.config();
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const NWS_API_BASE = "https://api.weather.gov";
const USER_AGENT = "weather-app/1.0";

// Create server instance
const server = new McpServer({
  name: "workiro",
  version: "1.0.0",
  capabilities: {
    resources: {},
    tools: {},
  },
});


server.tool(
  "call_custom_api",
  "Call a custom REST API using OAuth2 Client Credentials flow",
  async () => {
    // OAuth2 credentials from environment variables
    const clientId = "gbusertest.gregf+mcp_server_1@gmail.com";
    const clientSecret =  "LHSPassword1";
    const tokenUrl =  "http://localhost:8181/identity/connect/token";

    if (!clientId || !clientSecret || !tokenUrl) {
      return {
        content: [
          {
            type: "text",
            text: "OAuth2 credentials are not set in environment variables.",
          },
        ],
      };
    }

    // Get access token
    let accessToken: string | null = null;
    try {
      const tokenRes = await fetch(tokenUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "password",
          client_id: 'POSTMAN',
          client_secret: clientSecret,
          username: clientId,
          password: clientSecret,
          scope: 'conversationsmanagement openid offline_access'
        }),
      });
      // if (!tokenRes.ok) throw new Error("Failed to obtain access token");
      const tokenJson = await tokenRes.json();
      accessToken = tokenJson.access_token;
      console.error("OAuth2 token response:", tokenJson);
      console.error("Access token:", accessToken);
    } catch (err) {
      return {
        content: [
          {
            type: "text",
            text: "Error obtaining OAuth2 token: " + (err as Error).message,
          },
        ],
      };
    }

    if (!accessToken) {
      return {
        content: [
          {
            type: "text",
            text: "No access token received from OAuth2 server.",
          },
        ],
      };
    }

    const endpoint = "http://localhost:7050/api/v1/user/profile"
    const method = "GET"
    // Make authenticated API request
    try {
      const apiRes = await fetch(endpoint, {
        method,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        // body: method === "POST" && data ? JSON.stringify(data) : undefined,
      });
      const apiText = await apiRes.text();
      console.error("API response status:", apiRes.status);
      console.error("API response headers:", Object.fromEntries(apiRes.headers.entries()));
      console.error("API response body:", apiText);
      return {
        content: [
          {
            type: "text",
            text: `Status: ${apiRes.status}\nResponse:\n${apiText}`,
          },
        ],
      };
    } catch (err) {
      return {
        content: [
          {
            type: "text",
            text: "Error calling API: " + (err as Error).message,
          },
        ],
      };
    }
  }
);

server.tool(
  "create_person",
  {
    first_name: z.string(),
    last_name: z.string(),
    email_address: z.string().email("Invalid email address")ssssssssss
  },
  {
    title: "Create a person using the provided schema and POST to /api/v1/contacts/person with OAuth2 authentication"
  },
  async (args, _extra) => {
    // OAuth2 credentials (should be from env in production)
    const clientId = "gbusertest.gregf+mcp_server_1@gmail.com";
    const clientSecret = "LHSPassword1";
    const tokenUrl = "http://localhost:8181/identity/connect/token";

    if (!clientId || !clientSecret || !tokenUrl) {
      return {
        content: [
          {
            type: "text",
            text: "OAuth2 credentials are not set in environment variables.",
          },
        ],
      };
    }

    // Get access token
    let accessToken: string | null = null;
    try {
      const tokenRes = await fetch(tokenUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "password",
          client_id: 'POSTMAN',
          client_secret: clientSecret,
          username: clientId,
          password: clientSecret,
          scope: 'conversationsmanagement openid offline_access'
        }),
      });
      const tokenJson = await tokenRes.json();
      accessToken = tokenJson.access_token;
    } catch (err) {
      return {
        content: [
          {
            type: "text",
            text: "Error obtaining OAuth2 token: " + (err as Error).message,
          },
        ],
      };
    }

    if (!accessToken) {
      return {
        content: [
          {
            type: "text",
            text: "No access token received from OAuth2 server.",
          },
        ],
      };
    }

    const endpoint = "http://localhost:7050/api/v1/contacts/person";
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(args),
      });
      const text = await res.text();
      return {
        content: [
          {
            type: "text",
            text: `Status: ${res.status}\nResponse:\n${text}`,
          },
        ],
      };
    } catch (err) {
      return {
        content: [
          {
            type: "text",
            text: "Error calling API: " + (err as Error).message,
          },
        ],
      };
    }
  }
);
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Weather MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
/**
 * MCP tool "call_custom_api" uses OAuth2 Client Credentials flow.
 * 
 * Usage:
 * - Set environment variables:
 *   OAUTH2_CLIENT_ID, OAUTH2_CLIENT_SECRET, OAUTH2_TOKEN_URL
 * - Tool input:
 *   endpoint: string (API URL)
 *   method: "GET" | "POST"
 *   data: object (optional, for POST)
 * 
 * Security:
 * - Do NOT hardcode secrets. Use environment variables.
 * 
 * Token Expiration:
 * - Token is fetched for each request. For APIs with long-lived tokens, consider caching.
 */