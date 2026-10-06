export const LIMITS = {
  title: 100,
  description: 2000,
  roomDetail: 80,
  unit: 20,
  streetNumber: 20,
  streetName: 80,
  area: 60,
  city: 60,
  postcode: 10,
  handle: 40,
  resolvedNote: 500,
  message: 2000,
  email: 120,
} as const;

export function tooLong(value: unknown, max: number) {
  return String(value ?? "").length > max;
}

const PLACE_NAME = /^[\p{L}][\p{L}\s]*$/u;
const STREET_NAME = /^[\p{L}][\p{L}\d\s'-]*$/u;
const STREET_NO = /^\d{1,5}[A-Za-z]?$/;
const UNIT = /^(?:\d{1,3}[A-Za-z]{0,2}|[A-Za-z]{1,2}\d{0,3})$/;
const POSTCODE = /^\d{4}$/;
const HAS_LETTER = /\p{L}/u;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LABEL = /^[\p{L}\d\s.,'\-\/:&?!:";()$%]+$/u;

export function validateIssueFields(fields: {
  title?: string;
  description?: string;
  roomDetail?: string;
  unit?: string;
  streetNumber?: string;
  streetName?: string;
  area?: string;
  city?: string;
  postcode?: string;
  handle?: string;
}) {
  const title = String(fields.title || "").trim();
  const description = String(fields.description || "").trim();
  const roomDetail = String(fields.roomDetail || "").trim();
  const unit = String(fields.unit || "").trim();
  const streetNumber = String(fields.streetNumber || "").trim();
  const streetName = String(fields.streetName || "").trim();
  const area = String(fields.area || "").trim();
  const city = String(fields.city || "").trim();
  const postcode = String(fields.postcode || "").trim();
  const handle = String(fields.handle || "").trim();

  if (!HAS_LETTER.test(title) || !LABEL.test(title)) {
    return "Title can only use letters, numbers and basic punctuation.";
  }
  if (!HAS_LETTER.test(description) || !LABEL.test(description)) {
    return "Description can only use letters, numbers and basic punctuation.";
  }
  if (roomDetail && !LABEL.test(roomDetail)) {
    return "More detail can only use letters, numbers and basic punctuation.";
  }
  if (unit && !UNIT.test(unit)) {
    return "Unit should look like 2, 12A or A2.";
  }
  if (!STREET_NO.test(streetNumber)) return "Street number should look like 44 or 44A.";
  if (!STREET_NAME.test(streetName) || letterCount(streetName) < 3) {
    return "Street name should be a real street name.";
  }
  if (area && (!PLACE_NAME.test(area) || letterCount(area) < 3)) {
    return "Suburb should be letters and spaces only.";
  }
  if (!PLACE_NAME.test(city) || letterCount(city) < 3) {
    return "City should be letters and spaces only.";
  }
  if (postcode && !POSTCODE.test(postcode)) {
    return "Postcode should be 4 numbers.";
  }
  if (handle && handle !== "Anonymous" && !LABEL.test(handle)) {
    return "Display name can only use letters, numbers and basic punctuation.";
  }
  if (handle && handle.length > LIMITS.handle) return "Display name is too long.";
  return "";
}

export function validateEmail(value: string) {
  const email = value.trim();
  if (!email) return "";
  if (!EMAIL.test(email)) return "Enter a valid email or leave it blank.";
  return "";
}

export function validateContactMessage(value: string) {
  const message = value.trim();
  if (!message) return "Please include a topic and message.";
  if (!HAS_LETTER.test(message)) return "Describe the issue in words.";
  if (tooLong(message, LIMITS.message)) return "A field is too long.";
  return "";
}

export function validateResolvedNote(value: string) {
  const note = value.trim();
  if (!note) return "Add a brief note about how the issue was resolved.";
  if (!HAS_LETTER.test(note) || !LABEL.test(note)) {
    return "Note can only use letters, numbers and basic punctuation.";
  }
  if (tooLong(note, LIMITS.resolvedNote)) return "A field is too long.";
  return "";
}

