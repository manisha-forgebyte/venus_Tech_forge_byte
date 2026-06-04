export function toIsoDate(value: Date | string | number | null | undefined) {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export function toDateOrNull(value: Date | string | number | null | undefined) {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function toDateOnly(value: Date | string | number | null | undefined) {
  const iso = toIsoDate(value);
  return iso ? iso.slice(0, 10) : null;
}

export function nowIso() {
  return new Date().toISOString();
}
