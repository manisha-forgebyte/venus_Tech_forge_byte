export function extractBearerToken(header?: string | null) {
  if (!header) {
    return null;
  }

  const [type, token] = header.trim().split(/\s+/, 2);
  return type?.toLowerCase() === 'bearer' && token ? token.trim() : null;
}

export function maskToken(token?: string | null) {
  if (!token) {
    return '';
  }

  if (token.length <= 12) {
    return '***';
  }

  return `${token.slice(0, 6)}...${token.slice(-4)}`;
}
