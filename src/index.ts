import dotenv from 'dotenv';
dotenv.config();
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// const identity_domain = "http://localhost:8181"
const identity_domain = "https://testidentity.dev.workiro.com"
const api_domain = "https://testapi.dev.getbusy.com"
const userName = "gbusertest.gregf+workexperience@gmail.com";
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
    const clientSecret =  "LHSPassword1";
    const tokenUrl =  `${identity_domain}/identity/connect/token`;

    if (!userName || !clientSecret || !tokenUrl) {
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
          username: userName,
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

    const endpoint = `${api_domain}/api/v1/user/profile`
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
    email_address: z.string().email("Invalid email address"),
    relationships: z.array(
      z.object({
        id: z.string(),
        properties: z.array(
          z.object({
            id: z.string(),
            value: z.string(),
            is_key: z.boolean()
          })
        )
      })
    ).optional()
  },
  {
    title: "Create a person using the provided schema and POST to /api/v1/contacts/person with OAuth2 authentication"
  },
  async (args, _extra) => {
    // OAuth2 credentials (should be from env in production)
    
    const clientSecret = "LHSPassword1";
    const tokenUrl = `${identity_domain}/identity/connect/token`;

    if (!userName || !clientSecret || !tokenUrl) {
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
          username: userName,
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

    const endpoint = `${api_domain}/api/v1/contacts/person`;
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
server.tool(
  "create_organization",
  {
    name: z.string(),
    notes: z.string(),
    relationships: z.array(
      z.object({
        id: z.string(),
        properties: z.array(
          z.object({
            id: z.string(),
            value: z.string(),
            is_key: z.boolean()
          })
        )
      })
    )
  },
  {
    title: "Create an organization using the provided schema and POST to /api/v1/contacts/organization with OAuth2 authentication"
  },
  async (args, _extra) => {
    const clientSecret = "LHSPassword1";
    const tokenUrl = `${identity_domain}/identity/connect/token`;

    if (!userName || !clientSecret || !tokenUrl) {
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
          username: userName,
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

    const endpoint = `${api_domain}/api/v1/contacts/organization`;
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
server.tool(
  "update_organization",
  {
    id: z.string(),
    name: z.string().optional(),
    notes: z.string().optional(),
    relationships: z.array(
      z.object({
        id: z.string(),
        properties: z.array(
          z.object({
            id: z.string(),
            value: z.string(),
            is_key: z.boolean()
          })
        )
      })
    ).optional()
  },
  {
    title: "Update an organization using the provided schema and PATCH to /api/v1/contacts/organization/{id} with OAuth2 authentication"
  },
  async (args, _extra) => {
    const clientSecret = "LHSPassword1";
    const tokenUrl = `${identity_domain}/identity/connect/token`;

    if (!userName || !clientSecret || !tokenUrl) {
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
          username: userName,
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

    const { id, ...updateFields } = args;
    const endpoint = `${api_domain}/api/v1/contacts/organization/${id}`;
    try {
      const res = await fetch(endpoint, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateFields),
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
server.tool(
  "update_person",
  {
    id: z.string(),
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    email_address: z.string().email("Invalid email address").optional(),
    relationships: z.array(
      z.object({
        id: z.string(),
        properties: z.array(
          z.object({
            id: z.string(),
            value: z.string(),
            is_key: z.boolean()
          })
        )
      })
    ).optional()
  },
  {
    title: "Update a person using the provided schema and PATCH to /api/v1/contacts/person/{id} with OAuth2 authentication"
  },
  async (args, _extra) => {
    const clientSecret = "LHSPassword1";
    const tokenUrl = `${identity_domain}/identity/connect/token`;

    if (!userName || !clientSecret || !tokenUrl) {
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
          username: userName,
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

    const { id, ...updateFields } = args;
    const endpoint = `${api_domain}/api/v1/contacts/person/${id}`;
    try {
      const res = await fetch(endpoint, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateFields),
      });
server.tool(
  "get_organizations",
  "Get a list of organizations using the provided API endpoint with OAuth2 authentication",
  async () => {
    const clientSecret = "LHSPassword1";
    const tokenUrl = `${identity_domain}/identity/connect/token`;

    if (!userName || !clientSecret || !tokenUrl) {
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
          username: userName,
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

    const endpoint = "https://testapi.dev.getbusy.com/api/v1/contacts/organization";
    try {
      const res = await fetch(endpoint, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
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

server.tool(
  "get_people",
  "Get a list of people using the provided API endpoint with OAuth2 authentication",
  async () => {
    const clientSecret = "LHSPassword1";
    const tokenUrl = `${identity_domain}/identity/connect/token`;

    if (!userName || !clientSecret || !tokenUrl) {
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
          username: userName,
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

    const endpoint = "https://testapi.dev.getbusy.com/api/v1/contacts/person?withBlankEmails=true&withStats=false";
    try {
      const res = await fetch(endpoint, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });
      const text = await res.text();
// Parse and log relationship properties for each person
try {
  const json = JSON.parse(text);
  if (json.result && Array.isArray(json.result)) {
    json.result.forEach((person: any, idx: number) => {
      if (person.relationships && Array.isArray(person.relationships)) {
        person.relationships.forEach((rel: any, rIdx: number) => {
          if (rel.properties && Array.isArray(rel.properties)) {
            console.log(
              `Person #${idx + 1} Relationship #${rIdx + 1} Properties:`,
              rel.properties
            );
          }
        });
      }
    });
  }
} catch (e) {
  console.error("Failed to parse and extract relationship properties:", e);
}
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
)

const createProjectSchema = {
  name: z.string(),
  description: z.string(),
  properties: z.array(
    z.object({
      id: z.string(),
      value: z.string()
    })
  ),
  workspace_unit: z.object({
    properties: z.array(z.unknown()),
    id: z.string(),
    type_id: z.string(),
    type_version: z.number()
  }),
  relates_to: z.object({
    contacts: z.array(z.object({ id: z.string() })),
    projects: z.array(z.object({ id: z.string() }))
  })
};

server.tool(
  "create_project",
  createProjectSchema,
  {
    title: "Create a project using the provided schema and POST to /api/v1/project with OAuth2 authentication"
  },
  async (args, _extra) => {
    const clientSecret = "LHSPassword1";
    const tokenUrl = `${identity_domain}/identity/connect/token`;

    if (!userName || !clientSecret || !tokenUrl) {
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
          username: userName,
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

    const endpoint = `${api_domain}/api/v1/project`;
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

server.resource(
  "workspaces",
  "workiro://workspaces",
  async (uri: any) => {
    const clientSecret = "LHSPassword1";
    const tokenUrl = `${identity_domain}/identity/connect/token`;

    if (!userName || !clientSecret || !tokenUrl) {
      throw new Error("OAuth2 credentials are not set in environment variables.");
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
          username: userName,
          password: clientSecret,
          scope: 'conversationsmanagement openid offline_access'
        }),
      });
      const tokenJson = await tokenRes.json();
      accessToken = tokenJson.access_token;
    } catch (err) {
      throw new Error("Error obtaining OAuth2 token: " + (err as Error).message);
    }

    if (!accessToken) {
      throw new Error("No access token received from OAuth2 server.");
    }

    const endpoint = "https://testapi.dev.getbusy.com/api/v1/workspaces";
    try {
      const res = await fetch(endpoint, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
      });
      const text = await res.text();
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text,
          },
        ],
      };
    } catch (err) {
      throw new Error("Error calling API: " + (err as Error).message);
    }
  }
);
server.tool(
  "get_relationships",
  "Get a list of relationships using the provided API endpoint with OAuth2 authentication",
  async () => {
    const clientSecret = "LHSPassword1";
    const tokenUrl = `${identity_domain}/identity/connect/token`;

    if (!userName || !clientSecret || !tokenUrl) {
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
          username: userName,
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

    const endpoint = "https://testapi.dev.getbusy.com/api/v1/contacts/relationships";
    try {
      const res = await fetch(endpoint, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
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
// TypeScript interfaces for get_people response

interface Property {
  id: string;
  name: string;
  value: string;
}

interface Relationship {
  id: string;
  name: string;
  properties: Property[];
}

interface RelatesTo {
  projects: { id: string }[];
  contacts: { type: string; id: string }[];
}

interface GroupAccess {
  allow: { id: string }[];
}

interface Person {
  contact_guid: string;
  account_guid: string;
  owner_guid: string;
  last_activity: string;
  is_hidden: boolean;
  relationships: Relationship[];
  props: Record<string, string>;
  type: string;
  relates_to: RelatesTo;
  group_access: GroupAccess;
}

interface ErrorInfo {
  http_status_code: number;
  error_code: string;
  messages: string[];
}

interface GetPeopleResponse {
  result: Person[];
  error?: ErrorInfo;
}

// Uncomment to run
// showPeopleRelationshipProperties();

export function parseGetPeopleResponse(response: GetPeopleResponse): Person[] {
  if (response.error && response.error.messages.length > 0) {
    throw new Error(`API Error: ${response.error.messages.join(', ')}`);
  }
  return response.result;
}
// Function to parse and print all properties of each person in the get_people response

export function printPeopleProperties(response: GetPeopleResponse): void {
  if (response.error && response.error.messages.length > 0) {
    console.error("API Error:", response.error.messages.join(", "));
    return;
  }
  response.result.forEach((person, idx) => {
    console.log(`Person #${idx + 1}:`);
    Object.entries(person).forEach(([key, value]) => {
      console.log(`  ${key}:`, value);
    });
  });
}