export const LIMITS = {
  title: 140,
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
