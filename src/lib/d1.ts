const D1_BASE_URL = `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/d1/database/${process.env.CLOUDFLARE_D1_DATABASE_ID}`;

interface D1Result<T> {
  results: T[];
  success: boolean;
  meta: Record<string, unknown>;
}

interface D1Response<T> {
  result: D1Result<T>[];
  success: boolean;
  errors: { message: string }[];
}

async function d1Fetch<T>(
  endpoint: string,
  body: Record<string, unknown>
): Promise<D1Response<T>> {
  const res = await fetch(`${D1_BASE_URL}${endpoint}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`D1 API error ${res.status}: ${text}`);
  }

  return res.json();
}

export async function queryD1<T>(
  sql: string,
  params: (string | number | null)[] = []
): Promise<T[]> {
  const data = await d1Fetch<T>("/query", { sql, params });
  if (!data.success) {
    throw new Error(`D1 query failed: ${data.errors.map((e) => e.message).join(", ")}`);
  }
  return data.result[0]?.results ?? [];
}

export async function mutateD1(
  sql: string,
  params: (string | number | null)[] = []
): Promise<void> {
  const data = await d1Fetch<unknown>("/query", { sql, params });
  if (!data.success) {
    throw new Error(`D1 mutate failed: ${data.errors.map((e) => e.message).join(", ")}`);
  }
}
