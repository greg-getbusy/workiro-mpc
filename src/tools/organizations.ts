// src/tools/organizations.ts

import { z } from "zod";
import { getAccessToken, apiRequest } from "../auth.js";
import { api_domain, identity_domain, userName, clientSecret } from "./shared.js";

export const createOrganizationTool = {
  name: "create_organization",
  schema: {
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
  description: "Create an organization using the provided schema and POST to /api/v1/contacts/organization with OAuth2 authentication",
  handler: async (args: any) => {
    try {
      const accessToken = await getAccessToken({
        tokenUrl: `${identity_domain}/identity/connect/token`,
        clientId: "POSTMAN",
        clientSecret,
        username: userName,
        password: clientSecret
      });
      const { status, body } = await apiRequest({
        endpoint: `${api_domain}/api/v1/contacts/organization`,
        method: "POST",
        token: accessToken,
        data: args
      });
      return {
        content: [
          {
            type: "text",
            text: `Status: ${status}\nResponse:\n${body}`
          }
        ]
      };
    } catch (err: any) {
      return {
        content: [
          {
            type: "text",
            text: "Error: " + err.message
          }
        ]
      };
    }
  }
};