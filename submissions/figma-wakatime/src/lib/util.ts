const PREFIX = "[WakaTime for Figma]";
const STYLE = "color: #007acc; font-weight: bold;";

export const log = {
  debug: (...args: unknown[]) => console.debug(`%c${PREFIX}`, STYLE, ...args),
  info: (...args: unknown[]) => console.log(`%c${PREFIX}`, STYLE, ...args),
  warn: (...args: unknown[]) => console.warn(`%c${PREFIX}`, STYLE, ...args),
  error: (...args: unknown[]) => console.error(`%c${PREFIX}`, STYLE, ...args),
};

export function sha256(string: string) {
  const utf8 = new TextEncoder().encode(string);
  return crypto.subtle.digest('SHA-256', utf8).then((hashBuffer) => {
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((bytes) => bytes.toString(16).padStart(2, '0'))
      .join('');
    return hashHex;
  });
}

export async function base64Encode(str: string) {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(str);
  const base64 = btoa(
    String.fromCharCode(...new Uint8Array(bytes))
  );
  return base64;
}