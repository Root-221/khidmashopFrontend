export type JwtPayload = Record<string, unknown> & { exp?: number };

function addBase64Padding(input: string) {
  const mod = input.length % 4;
  if (mod === 2) return `${input}==`;
  if (mod === 3) return `${input}=`;
  if (mod === 1) return `${input}===`;
  return input;
}

function decodeBase64(input: string) {
  const normalized = addBase64Padding(input).replace(/-/g, '+').replace(/_/g, '/');
  if (typeof window !== 'undefined' && window.atob) {
    return window.atob(normalized);
  }
  return Buffer.from(normalized, 'base64').toString('binary');
}

export function decodeJwt<T extends JwtPayload = JwtPayload>(token: string): T | null {
  if (!token) return null;
  try {
    const [, payload] = token.split('.');
    if (!payload) return null;
    const decoded = decodeBase64(payload);
    return JSON.parse(decoded) as T;
  } catch (error) {
    return null;
  }
}
