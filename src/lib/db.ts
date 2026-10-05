import { newManageCode, type Issue } from "./types";

function clean(value?: string) {
  return (value || "").trim().replace(/^["']|["']$/g, "");
}

const url = () =>
  clean(process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL)
    .replace(/\/+$/, "")
    .replace(/\/rest\/v1$/i, "");
const key = () => clean(process.env.SUPABASE_SERVICE_ROLE_KEY).replace(/\s+/g, "");

export function dbConfigured() {
  return Boolean(url() && key());
}

function headers(extra?: Record<string, string>) {
  return {
    apikey: key(),
    Authorization: `Bearer ${key()}`,
    "Content-Type": "application/json",
    ...extra,
  };
}

async function rest<T>(path: string, init?: RequestInit): Promise<T> {
  const endpoint = `${url()}/rest/v1/${path}`;
  let res: Response;
  try {
    res = await fetch(endpoint, {
    ...init,
    headers: { ...headers(init?.headers as Record<string, string>), ...(init?.headers || {}) },
    cache: "no-store",
    });
  } catch (err) {
    const cause = err instanceof Error && "cause" in err ? String((err as Error & { cause?: unknown }).cause) : "";
    throw new Error(`Could not reach ${url()} (${cause || (err instanceof Error ? err.message : "fetch failed")})`);
  }
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Database error ${res.status}`);
  }
  const body = await res.text();
  return (body ? JSON.parse(body) : null) as T;
}

export type DbIssue = {
  id: string;
  title: string;
  description: string;
  category: string;
  room_area: string | null;
  room_detail: string | null;
  responses: string[] | null;
  unit: string | null;
  street_number: string;
  street_name: string;
  city: string;
  area: string | null;
  postcode: string | null;
  reported_to_landlord_on: string;
  handle: string | null;
  status: string;
  resolved_at: string | null;
  resolved_note: string | null;
  manage_code: string;
  hidden: boolean;
  posted_at: string;
  photo_urls: string[] | null;
};

export function toIssue(row: DbIssue, includeCode = false): Issue {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category as Issue["category"],
    roomArea: (row.room_area || undefined) as Issue["roomArea"],
    roomDetail: row.room_detail || undefined,
    responses: (row.responses || []) as Issue["responses"],
    unit: row.unit || undefined,
    streetNumber: row.street_number,
    streetName: row.street_name,
    city: row.city,
    area: row.area || undefined,
    postcode: row.postcode || undefined,
    reportedToLandlordOn: row.reported_to_landlord_on,
    postedAt: row.posted_at,
    handle: row.handle || "Anonymous",
    status: row.status === "resolved" ? "resolved" : "open",
    resolvedAt: row.resolved_at || undefined,
    resolvedNote: row.resolved_note || undefined,
    hidden: row.hidden,
    manageCode: includeCode ? row.manage_code : "",
    photoUrls: row.photo_urls || [],
  };
}

export function fromFields(fields: Partial<Issue>) {
  return {
    title: fields.title,
    description: fields.description,
    category: fields.category,
    room_area: fields.roomArea || null,
    room_detail: fields.roomDetail || null,
    responses: fields.responses || [],
    unit: fields.unit || null,
    street_number: fields.streetNumber,
    street_name: fields.streetName,
    city: fields.city,
    area: fields.area || null,
    postcode: fields.postcode || null,
    reported_to_landlord_on: fields.reportedToLandlordOn,
    handle: fields.handle || "Anonymous",
    photo_urls: fields.photoUrls || [],
  };
}

export async function dbListPublic(): Promise<Issue[]> {
  const rows = await rest<DbIssue[]>(
    "issues?hidden=eq.false&select=id,title,description,category,room_area,room_detail,responses,unit,street_number,street_name,city,area,postcode,reported_to_landlord_on,handle,status,resolved_at,resolved_note,hidden,posted_at,photo_urls&order=posted_at.desc",
  );
  return rows.map((row) => {
    const issue = toIssue(row);
    return {
      ...issue,
      photoUrls: (issue.photoUrls || []).filter((src) => src && !src.startsWith("data:")),
    };
  });
}

export async function dbListAll(): Promise<Issue[]> {
  const rows = await rest<DbIssue[]>("issues?select=*&order=posted_at.desc");
  return rows.map((row) => toIssue(row, true));
}

export async function dbGet(id: string, includeCode = false): Promise<DbIssue | null> {
  const rows = await rest<DbIssue[]>(`issues?id=eq.${id}&select=*`);
  return rows[0] || null;
}

export async function dbInsert(fields: Partial<Issue>): Promise<Issue> {
  const manageCode = newManageCode();
  const rows = await rest<DbIssue[]>("issues", {
    method: "POST",
    headers: headers({ Prefer: "return=representation" }),
    body: JSON.stringify({
      ...fromFields(fields),
      status: "open",
      hidden: false,
      manage_code: manageCode,
    }),
  });
  const created = toIssue(rows[0], true);
  return created;
}

export async function dbUpdate(id: string, patch: Record<string, unknown>) {
  const rows = await rest<DbIssue[]>(`issues?id=eq.${id}`, {
    method: "PATCH",
    headers: headers({ Prefer: "return=representation" }),
    body: JSON.stringify(patch),
  });
  return rows[0];
}

export async function dbDeleteIssue(id: string) {
  const row = await dbGet(id, true);
  if (row?.photo_urls?.length) await deleteStoredPhotos(row.photo_urls);
  await rest(`issues?id=eq.${id}`, { method: "DELETE", headers: headers({ Prefer: "return=minimal" }) });
}

async function deleteStoredPhotos(urls: string[]) {
  for (const src of urls) {
    const name = src.split("/issue-photos/")[1];
    if (!name) continue;
    await fetch(`${url()}/storage/v1/object/issue-photos/${decodeURIComponent(name)}`, {
      method: "DELETE",
      headers: {
        apikey: key(),
        Authorization: `Bearer ${key()}`,
      },
    });
  }
}

export async function dbDeleteContact(id: string) {
  await rest(`contact_messages?id=eq.${id}`, {
    method: "DELETE",
    headers: headers({ Prefer: "return=minimal" }),
  });
}

export async function dbMarkContactRead(id: string, read: boolean) {
  await rest(`contact_messages?id=eq.${id}`, {
    method: "PATCH",
    headers: headers({ Prefer: "return=minimal" }),
    body: JSON.stringify({ read }),
  });
}

export async function uploadPhotos(photos: string[]) {
  const out: string[] = [];
  for (const photo of photos) {
    if (!photo.startsWith("data:")) {
      out.push(photo);
      continue;
    }
    const match = photo.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/);
    if (!match) continue;
    const mime = match[1];
    const bin = Buffer.from(match[2], "base64");
    const ext = mime.includes("png") ? "png" : "jpg";
    const name = `${crypto.randomUUID()}.${ext}`;
    const res = await fetch(`${url()}/storage/v1/object/issue-photos/${name}`, {
      method: "POST",
      headers: {
        apikey: key(),
        Authorization: `Bearer ${key()}`,
        "Content-Type": mime,
        "x-upsert": "true",
      },
      body: bin,
    });
    if (!res.ok) throw new Error(await res.text());
    out.push(`${url()}/storage/v1/object/public/issue-photos/${name}`);
  }
  return out;
}

export async function dbAddContact(input: {
  topic: string;
  message: string;
  email?: string;
}) {
  await rest("contact_messages", {
    method: "POST",
    headers: headers({ Prefer: "return=minimal" }),
    body: JSON.stringify({
      topic: input.topic,
      message: input.message,
      email: input.email || null,
    }),
  });
}

export async function dbListContact() {
  return rest<
    { id: string; topic: string; message: string; email: string | null; created_at: string }[]
  >("contact_messages?select=*&order=created_at.desc");
}
