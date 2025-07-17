// src/tools/projects.ts

import { z } from "zod";
import { getAccessToken, apiRequest } from "../auth.js";
import { api_domain, identity_domain, userName, clientSecret } from "./shared.js";

export const createProjectTool = {
  name: "create_project",
  schema: {
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
  },
  description: "Create a project using the provided schema and POST to /api/v1/project with OAuth2 authentication",
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
        endpoint: `${api_domain}/api/v1/project`,
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