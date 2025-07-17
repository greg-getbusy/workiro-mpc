// src/auth.test.ts
import { describe, it, expect, vi } from "vitest";
import * as auth from "./auth";

// Mock fetch for token and API requests
globalThis.fetch = vi.fn();

describe("auth.getAccessToken", () => {
  it("throws if no access token is returned", async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({})
    });
    await expect(
      auth.getAccessToken({
        tokenUrl: "https://example.com/token",
        clientId: "id",
        clientSecret: "secret",
        username: "user",
        password: "pass"
      })
    ).rejects.toThrow("No access token received from OAuth2 server.");
  });

  it("returns access token if present", async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ access_token: "abc123" })
    });
    const token = await auth.getAccessToken({
      tokenUrl: "https://example.com/token",
      clientId: "id",
      clientSecret: "secret",
      username: "user",
      password: "pass"
    });
    expect(token).toBe("abc123");
  });

  it("throws on HTTP error", async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 400,
      statusText: "Bad Request",
      json: async () => ({})
    });
    await expect(
      auth.getAccessToken({
        tokenUrl: "https://example.com/token",
        clientId: "id",
        clientSecret: "secret",
        username: "user",
        password: "pass"
      })
    ).rejects.toThrow("Failed to obtain access token: 400 Bad Request");
  });
});

describe("auth.apiRequest", () => {
  it("returns status and body", async () => {
    (fetch as any).mockResolvedValueOnce({
      status: 200,
      text: async () => "ok"
    });
    const result = await auth.apiRequest({
      endpoint: "https://example.com/api",
      token: "abc",
      method: "GET"
    });
    expect(result).toEqual({ status: 200, body: "ok" });
  });
});