export function extractBearerToken(header?: string | null) {
  if (!header) {
    return null;
  }

  const prefix = 'Bearer ';
  return header.startsWith(prefix) ? header.slice(prefix.length).trim() : null;
}
