export const CATEGORIES = [
  "Mold & damp",
  "Plumbing",
  "Drainage",
  "Electrical",
  "Pests",
  "Heating & cooling",
  "Ventilation",
  "Safety",
  "Structural",
  "Smells / odours",
  "Insulation",
  "Windows / doors",
  "Appliances",
  "Hot water",
] as const;

export function displayCategory(category: string) {
  return category === "Insulation / Healthy Homes" ? "Insulation" : category;
}

export const RESPONSES = [
  "Dismissive / brushed off",
  "Hard to contact / no reply",
  "Nothing getting done after reporting",
  "Repeated delays / excuses",
  "Denied there was a problem",
  "Hostile or intimidating response",
  "Threatened eviction after the issue was raised",
  "Seems nice enough, just overwhelmed",
] as const;

export const ROOM_AREAS = [
  "Bathroom",
  "Kitchen",
  "Dining room",
  "Living room",
  "Bedroom",
  "Laundry",
  "Hallway / stairs",
  "Garage",
  "Sleepout",
  "Roof / ceiling",
  "Under house / basement",
  "Exterior / grounds",
  "Swimming pool",
  "Multiple rooms / areas",
  "Whole home",
] as const;

export type Category = (typeof CATEGORIES)[number];
export type RoomArea = (typeof ROOM_AREAS)[number];
export type ResponseTag = (typeof RESPONSES)[number];
export type IssueStatus = "open" | "resolved";

export type Issue = {
  id: string;
  title: string;
  description: string;
  category: Category;
  roomArea?: RoomArea;
  roomDetail?: string;
  responses?: ResponseTag[];
  unit?: string;
  streetNumber: string;
  streetName: string;
  city: string;
  area?: string;
  postcode?: string;
  reportedToLandlordOn: string;
  postedAt: string;
  handle?: string;
  posterEmail?: string;
  status: IssueStatus;
  resolvedAt?: string;
  resolvedNote?: string;
  hidden?: boolean;
  manageCode: string;
  photoUrls?: string[];
};

export function newManageCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export function formatAddress(issue: {
  unit?: string;
  streetNumber: string;
  streetName: string;
  city: string;
  area?: string;
  postcode?: string;
}) {
  const line = [
    issue.unit ? `Unit ${issue.unit}` : null,
    `${issue.streetNumber} ${issue.streetName}`,
  ]
    .filter(Boolean)
    .join(", ");
  const place = [issue.area, issue.city, issue.postcode].filter(Boolean).join(", ");
  return place ? `${line}, ${place}` : line;
}

function expandStreet(name: string) {
  return name
    .toLowerCase()
    .replace(/\./g, "")
    .replace(/\bmt\b/g, "mount")
    .replace(/\brd\b/g, "road")
    .replace(/\bst\b/g, "street")
    .replace(/\bave\b/g, "avenue")
    .replace(/\bpl\b/g, "place")
    .replace(/\bcrt\b/g, "court")
    .replace(/\bct\b/g, "court")
    .replace(/\bcres\b/g, "crescent")
    .replace(/\s+/g, " ")
    .trim();
}

function expandPlace(name: string) {
  return name
    .toLowerCase()
    .replace(/\./g, "")
    .replace(/\bmt\b/g, "mount")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeUnit(unit?: string) {
  if (!unit) return "";
  const raw = unit.trim().toLowerCase().replace(/^unit\s+/, "").replace(/^flat\s+/, "");
  const words: Record<string, string> = {
    one: "1",
    two: "2",
    three: "3",
    four: "4",
    five: "5",
    six: "6",
    seven: "7",
    eight: "8",
    nine: "9",
    ten: "10",
  };
  return words[raw] || raw;
}

export function propertySlug(issue: {
  unit?: string;
  streetNumber: string;
  streetName: string;
  city: string;
  area?: string;
}) {
  const unit = normalizeUnit(issue.unit);
  return [
    unit ? `unit-${unit}` : null,
    issue.streetNumber,
    expandStreet(issue.streetName),
    expandPlace(issue.city),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function addressSearchText(issue: {
  unit?: string;
  streetNumber: string;
  streetName: string;
  city: string;
  area?: string;
  postcode?: string;
  roomArea?: string;
  roomDetail?: string;
  responses?: string[];
}) {
  return [
    issue.unit,
    issue.streetNumber,
    issue.streetName,
    issue.area,
    issue.city,
    issue.postcode,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}
