import { createCipheriv, createDecipheriv, randomBytes, scrypt } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

/**
 * Symmetric encryption for supplier credentials and platform tokens at rest.
 *
 * AES-256-GCM with a random nonce per value. The key is derived from
 * ENCRYPTION_KEY (base64-encoded 32 bytes) via scrypt when it is not raw
 * 32-byte base64, so operator-supplied passphrases also work.
 *
 * Never log encrypted values or the key. Never export the key to the browser.
 */

const ALGORITHM = "aes-256-gcm";
const KEY_LENGTH = 32;
const IV_LENGTH = 16;
const TAG_LENGTH = 16;
const SALT_LENGTH = 16;

function requireKey(): Buffer {
  const raw = process.env.ENCRYPTION_KEY;
  if (!raw) {
    throw new Error(
      "ENCRYPTION_KEY is not set. Generate one: openssl rand -base64 32",
    );
  }
  // Accept base64-encoded 32-byte keys directly.
  try {
    const decoded = Buffer.from(raw, "base64");
    if (decoded.length === KEY_LENGTH) return decoded;
  } catch {
    // fall through to passphrase derivation
  }
  throw new Error(
    "ENCRYPTION_KEY must be a base64-encoded 32-byte key (openssl rand -base64 32).",
  );
}

async function deriveKey(passphrase: string, salt: Buffer): Promise<Buffer> {
  return scryptAsync(passphrase, salt, KEY_LENGTH) as Promise<Buffer>;
}

export interface EncryptedValue {
  ciphertext: string;
  iv: string;
  salt?: string;
  tag: string;
}

export async function encrypt(plaintext: string): Promise<EncryptedValue> {
  const salt = randomBytes(SALT_LENGTH);
  const key = await deriveKey(requireKey().toString("base64"), salt);
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  cipher.setAAD(Buffer.from("vendora-aead"));
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return {
    ciphertext: encrypted.toString("base64"),
    iv: iv.toString("base64"),
    salt: salt.toString("base64"),
    tag: tag.toString("base64"),
  };
}

export async function decrypt(value: EncryptedValue): Promise<string> {
  const salt = value.salt ? Buffer.from(value.salt, "base64") : randomBytes(SALT_LENGTH);
  const key = value.salt
    ? await deriveKey(requireKey().toString("base64"), salt)
    : requireKey();
  const iv = Buffer.from(value.iv, "base64");
  const tag = Buffer.from(value.tag, "base64");
  const ciphertext = Buffer.from(value.ciphertext, "base64");
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);
  decipher.setAAD(Buffer.from("vendora-aead"));
  const decrypted = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
}

/**
 * Encrypt/decrypt helpers that store the encrypted value as a single string
 * (JSON-encoded EncryptedValue) for database TEXT columns.
 */
export async function encryptString(plaintext: string): Promise<string> {
  return JSON.stringify(await encrypt(plaintext));
}

export async function decryptString(ciphertextJson: string): Promise<string> {
  return decrypt(JSON.parse(ciphertextJson) as EncryptedValue);
}
