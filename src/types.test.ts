// src/types.test.ts
import { describe, it, expect } from "vitest";
import { parseGetPeopleResponse, printPeopleProperties, GetPeopleResponse } from "./types.js";

describe("parseGetPeopleResponse", () => {
  it("throws on error in response", () => {
    const response: GetPeopleResponse = {
      result: [],
      error: {
        http_status_code: 400,
        error_code: "ERR",
        messages: ["Something went wrong"]
      }
    };
    expect(() => parseGetPeopleResponse(response)).toThrow("API Error: Something went wrong");
  });

  it("returns result if no error", () => {
    const response: GetPeopleResponse = {
      result: [{ contact_guid: "1", account_guid: "2", owner_guid: "3", last_activity: "", is_hidden: false, relationships: [], props: {}, type: "", relates_to: { projects: [], contacts: [] }, group_access: { allow: [] } }]
    };
    expect(parseGetPeopleResponse(response)).toEqual(response.result);
  });
});

describe("printPeopleProperties", () => {
  it("logs error if present", () => {
    const response: GetPeopleResponse = {
      result: [],
      error: {
        http_status_code: 400,
        error_code: "ERR",
        messages: ["Something went wrong"]
      }
    };
    // Should not throw
    printPeopleProperties(response);
  });

  it("prints properties for each person", () => {
    const response: GetPeopleResponse = {
      result: [
        {
          contact_guid: "1",
          account_guid: "2",
          owner_guid: "3",
          last_activity: "",
          is_hidden: false,
          relationships: [],
          props: {},
          type: "",
          relates_to: { projects: [], contacts: [] },
          group_access: { allow: [] }
        }
      ]
    };
    // Should not throw
    printPeopleProperties(response);
  });
});