// src/auth.ts

export async function getAccessToken({
  tokenUrl,
  clientId,
  clientSecret,
  username,
  password,
  scope = "conversationsmanagement openid offline_access"
}: {
  tokenUrl: string;
  clientId: string;
  clientSecret: string;
  username: string;
  password: string;
  scope?: string;
}): Promise<string> {
  const res = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      grant_type: "password",
      client_id: clientId,
      client_secret: clientSecret,
      username,
      password,
      scope
    })
  });
  if (!res.ok) {
    throw new Error(`Failed to obtain access token: ${res.status} ${res.statusText}`);
  }
  const json = await res.json();
  if (!json.access_token) {
    throw new Error("No access token received from OAuth2 server.");
  }
  return json.access_token;
}

export async function apiRequest({
  endpoint,
  method = "GET",
  token,
  data
}: {
  endpoint: string;
  method?: string;
  token: string;
  data?: any;
}): Promise<{ status: number; body: string }> {
  const res = await fetch(endpoint, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: method === "POST" || method === "PUT" || method === "PATCH"
      ? JSON.stringify(data)
      : undefined
  });
  const body = await res.text();
  return { status: res.status, body };
}