// src/types.ts

export interface Property {
  id: string;
  name: string;
  value: string;
}

export interface Relationship {
  id: string;
  name: string;
  properties: Property[];
}

export interface RelatesTo {
  projects: { id: string }[];
  contacts: { type: string; id: string }[];
}

export interface GroupAccess {
  allow: { id: string }[];
}

export interface Person {
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

export interface ErrorInfo {
  http_status_code: number;
  error_code: string;
  messages: string[];
}

export interface GetPeopleResponse {
  result: Person[];
  error?: ErrorInfo;
}

// Utility functions

export function parseGetPeopleResponse(response: GetPeopleResponse): Person[] {
  if (response.error && response.error.messages.length > 0) {
    throw new Error(`API Error: ${response.error.messages.join(', ')}`);
  }
  return response.result;
}

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