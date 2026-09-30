// SHA-256 hash — returns lowercase hex string
export async function sha256(input) {
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(input)
  );
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Derive a 256-bit AES-GCM key from a passphrase via PBKDF2
async function deriveKey(passphrase) {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(passphrase),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: new TextEncoder().encode("route404-2026"),
      iterations: 100_000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

// AES-256-GCM encrypt — returns base64 string (iv + ciphertext)
export async function encrypt(plaintext, passphrase) {
  const key = await deriveKey(passphrase);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    new TextEncoder().encode(plaintext)
  );
  // Prepend 12-byte IV to ciphertext
  const combined = new Uint8Array(12 + ciphertext.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ciphertext), 12);
  return btoa(String.fromCharCode(...combined));
}

// AES-256-GCM decrypt — takes base64 (iv+ciphertext), returns plaintext
export async function decrypt(ciphertextB64, passphrase) {
  const key = await deriveKey(passphrase);
  const combined = new Uint8Array(
    atob(ciphertextB64)
      .split("")
      .map((c) => c.charCodeAt(0))
  );
  const iv = combined.slice(0, 12);
  const ciphertext = combined.slice(12);
  const plainBuf = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    ciphertext
  );
  return new TextDecoder().decode(plainBuf);
}

// Hash and compare an answer string against a stored hash
export async function verifyAnswer(answer, storedHashHex) {
  const normalised = answer.trim().toLowerCase();
  const hash = await sha256(normalised);
  return hash === storedHashHex;
}

// Generate a random secret token (hex)
export function generateSecretToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
