import { NextResponse } from "next/server";

const BASE_URL = "https://api.asari.pro/site";

function buildHeaders(): HeadersInit {
  const userId = process.env.ASARI_USER_ID ?? "";
  const token = process.env.ASARI_TOKEN ?? "";
  return { SiteAuth: `${userId}:${token}` };
}

async function asariPostRaw(path: string, queryParams?: Record<string, string>) {
  const url = new URL(`${BASE_URL}${path}`);
  if (queryParams) {
    for (const [k, v] of Object.entries(queryParams)) url.searchParams.set(k, v);
  }
  const body = new FormData();
  body.append("_", "1");
  const res = await fetch(url.toString(), {
    method: "POST",
    headers: buildHeaders(),
    body,
    cache: "no-store",
  });
  const text = await res.text();
  return { status: res.status, body: text };
}

export async function GET() {
  // 1. Raw response from exportedListingIdList
  const idsRaw = await asariPostRaw("/exportedListingIdList");
  let ids: unknown[] = [];
  try {
    const parsed = JSON.parse(idsRaw.body);
    ids = parsed?.data ?? [];
  } catch {
    // leave empty
  }

  // 2. Fetch first listing details (if any)
  const firstListings: unknown[] = [];
  const idSlice = (ids as Array<{ id: number }>).slice(0, 3);
  for (const ref of idSlice) {
    const raw = await asariPostRaw("/listing", { id: String(ref.id) });
    try {
      const parsed = JSON.parse(raw.body);
      firstListings.push({ id: ref.id, status: raw.status, data: parsed?.data });
    } catch {
      firstListings.push({ id: ref.id, status: raw.status, raw: raw.body.slice(0, 200) });
    }
  }

  return NextResponse.json({
    exportedListingIdList: {
      httpStatus: idsRaw.status,
      count: ids.length,
      ids,
    },
    firstThreeListings: firstListings,
    env: {
      hasUserId: !!process.env.ASARI_USER_ID,
      hasToken: !!process.env.ASARI_TOKEN,
    },
  });
}
