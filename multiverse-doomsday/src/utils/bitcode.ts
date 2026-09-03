/**
 * Bit packing and base64url, shared by every share code in the app.
 *
 * There is no server, so anything two people need to compare has to survive a
 * paste into a chat message. That means: no padding, no characters a client
 * might linkify or eat, and a reader that *refuses* a corrupt code rather than
 * silently decoding it into something plausible and wrong.
 */

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

/** Names travel inside codes, so they are capped and ASCII-only. */
export const MAX_NAME_BYTES = 16;

export function toBase64Url(bytes: number[]): string {
  let out = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const b0 = bytes[i];
    const b1 = bytes[i + 1];
    const b2 = bytes[i + 2];
    const has1 = b1 !== undefined;
    const has2 = b2 !== undefined;

    out += ALPHABET[b0 >> 2];
    out += ALPHABET[((b0 & 0x03) << 4) | (has1 ? b1 >> 4 : 0)];
    if (has1) out += ALPHABET[((b1 & 0x0f) << 2) | (has2 ? b2 >> 6 : 0)];
    if (has2) out += ALPHABET[b2 & 0x3f];
  }
  return out;
}

export function fromBase64Url(text: string): number[] | null {
  const bytes: number[] = [];
  let buffer = 0;
  let bits = 0;

  for (const char of text) {
    const value = ALPHABET.indexOf(char);
    if (value < 0) return null; // reject rather than skip: a typo must not decode
    buffer = (buffer << 6) | value;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      bytes.push((buffer >> bits) & 0xff);
    }
  }
  return bytes;
}

export class BitWriter {
  private bytes: number[] = [];
  private current = 0;
  private filled = 0;

  write(value: number, width: number): void {
    for (let i = width - 1; i >= 0; i -= 1) {
      this.current = (this.current << 1) | ((value >> i) & 1);
      this.filled += 1;
      if (this.filled === 8) {
        this.bytes.push(this.current);
        this.current = 0;
        this.filled = 0;
      }
    }
  }

  finish(): number[] {
    if (this.filled > 0) {
      this.bytes.push(this.current << (8 - this.filled));
      this.current = 0;
      this.filled = 0;
    }
    return this.bytes;
  }
}

export class BitReader {
  private index = 0;

  constructor(private readonly bytes: number[]) {}

  read(width: number): number {
    let value = 0;
    for (let i = 0; i < width; i += 1) {
      const byte = this.bytes[this.index >> 3] ?? 0;
      const bit = (byte >> (7 - (this.index & 7))) & 1;
      value = (value << 1) | bit;
      this.index += 1;
    }
    return value;
  }

  get remainingBits(): number {
    return this.bytes.length * 8 - this.index;
  }
}

/** ASCII-only, capped. A code has to survive being pasted through any client. */
export function encodeName(name: string): number[] {
  const bytes: number[] = [];
  for (const char of name) {
    const code = char.codePointAt(0) ?? 0;
    if (code >= 32 && code < 127) bytes.push(code);
    if (bytes.length >= MAX_NAME_BYTES) break;
  }
  return bytes;
}
