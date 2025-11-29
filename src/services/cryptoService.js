// --- E2EE CRYPTO SERVICE ---
// --- Helper Functions ---
function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}
function base64ToArrayBuffer(base64) {
    const binary_string = window.atob(base64);
    const len = binary_string.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
}
// --- Key Management ---
const KEY_ALGO = { name: 'ECDH', namedCurve: 'P-256' };
const ENCRYPT_ALGO = { name: 'AES-GCM', length: 256 };
const IV_LENGTH = 12; // 12 bytes for AES-GCM is recommended
/**
 * Generates an ECDH key pair for a user and stores it in localStorage.
 * @param userId The ID of the user to generate keys for.
 * @returns The public key in JWK format.
 */
export async function generateAndStoreKeyPair(userId) {
    const keyPair = await window.crypto.subtle.generateKey(KEY_ALGO, true, ['deriveKey']);
    const privateKeyJwk = await window.crypto.subtle.exportKey('jwk', keyPair.privateKey);
    const publicKeyJwk = await window.crypto.subtle.exportKey('jwk', keyPair.publicKey);
    localStorage.setItem(`private_key_${userId}`, JSON.stringify(privateKeyJwk));
    localStorage.setItem(`public_key_${userId}`, JSON.stringify(publicKeyJwk));
    return { publicKeyJwk };
}
/**
 * Retrieves a user's private key from localStorage.
 * @param userId The user's ID.
 * @returns The private key as a CryptoKey or null if not found.
 */
export async function getPrivateKey(userId) {
    const jwkString = localStorage.getItem(`private_key_${userId}`);
    if (!jwkString)
        return null;
    const jwk = JSON.parse(jwkString);
    return window.crypto.subtle.importKey('jwk', jwk, KEY_ALGO, true, ['deriveKey']);
}
/**
 * Retrieves a user's public key from localStorage.
 * @param userId The user's ID.
 * @returns The public key as a JWK or null if not found.
 */
export async function getPublicKey(userId) {
    const jwkString = localStorage.getItem(`public_key_${userId}`);
    if (!jwkString)
        return null;
    return JSON.parse(jwkString);
}
/**
 * Derives a shared secret for encrypting/decrypting messages between two users.
 * @param currentUserId The ID of the current user.
 * @param otherUserPublicKeyJwk The public key of the other user in JWK format.
 * @returns A CryptoKey representing the shared secret.
 */
export async function deriveSharedSecret(currentUserId, otherUserPublicKeyJwk) {
    const privateKey = await getPrivateKey(currentUserId);
    if (!privateKey) {
        throw new Error('Current user private key not found.');
    }
    const publicKey = await window.crypto.subtle.importKey('jwk', otherUserPublicKeyJwk, KEY_ALGO, true, []);
    return window.crypto.subtle.deriveKey({ name: 'ECDH', public: publicKey }, privateKey, ENCRYPT_ALGO, true, ['encrypt', 'decrypt']);
}
// --- Encryption/Decryption ---
/**
 * Encrypts a plaintext string using a shared secret.
 * @param secret The shared secret CryptoKey.
 * @param plaintext The string to encrypt.
 * @returns A base64 encoded string containing the IV and ciphertext.
 */
export async function encrypt(secret, plaintext) {
    const iv = window.crypto.getRandomValues(new Uint8Array(IV_LENGTH));
    const encodedText = new TextEncoder().encode(plaintext);
    const ciphertext = await window.crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv }, secret, encodedText);
    // Combine IV and ciphertext for storage/transmission
    const ivB64 = arrayBufferToBase64(iv.buffer);
    const ciphertextB64 = arrayBufferToBase64(ciphertext);
    return `${ivB64}.${ciphertextB64}`;
}
/**
 * Decrypts a combined IV and ciphertext string.
 * @param secret The shared secret CryptoKey.
 * @param encryptedData The base64 string in "iv.ciphertext" format.
 * @returns The decrypted plaintext string.
 */
export async function decrypt(secret, encryptedData) {
    const [ivB64, ciphertextB64] = encryptedData.split('.');
    if (!ivB64 || !ciphertextB64) {
        throw new Error('Invalid encrypted data format.');
    }
    const iv = base64ToArrayBuffer(ivB64);
    const ciphertext = base64ToArrayBuffer(ciphertextB64);
    const decryptedBuffer = await window.crypto.subtle.decrypt({ name: 'AES-GCM', iv: iv }, secret, ciphertext);
    return new TextDecoder().decode(decryptedBuffer);
}
