package com.grad.backend.contracts.util;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Arrays;
import java.util.Base64;
import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;

/**
 * Utility for computing a SHA-256 integrity hash over a finalized ContractRecord.
 *
 * The hash is computed over a deterministic canonical string built from:
 *   submissionId | contractType | contractPayloadJson |
 *   clientSignatureBase64 | companySignatureBase64 | pdfBytes
 *
 * This means ANY change to the PDF bytes, JSON payload, or either signature
 * in the database will produce a completely different hash, making tampering
 * immediately detectable by re-computing and comparing.
 *
 * The hash is stored in the database as a 64-character lowercase hex string.
 * It is returned to the frontend as plain text (hex) — it is NOT re-hashed.
 */
public class Contracthashutil {

    private static final String SEPARATOR = "||";

    private Contracthashutil() {
        // static utility — no instances
    }

    /**
     * Compute the SHA-256 integrity hash for a contract that is about to be saved.
     *
     * Call this BEFORE calling recordRepository.save(record) so the hash
     * covers exactly what lands in the database.
     *
     * @param submissionId           the submission this contract belongs to
     * @param contractType           "NDA" or "MAIN_CONTRACT"
     * @param contractPayloadJson    the final JSON payload (as stored)
     * @param clientSignatureBase64  client's base-64 signature string
     * @param companySignatureBase64 company's base-64 signature string
     * @param pdfBytes               the generated PDF bytes
     * @return 64-character lowercase hex SHA-256 digest
     */
    public static String computeHash(
            Long submissionId,
            String contractType,
            String contractPayloadJson,
            String clientSignatureBase64,
            String companySignatureBase64,
            byte[] pdfBytes) {

        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");

            // ── Part 1: canonical text fields ────────────────────────────────────
            String textPart = String.join(SEPARATOR,
                    safeStr(submissionId != null ? submissionId.toString() : null),
                    safeStr(contractType),
                    safeStr(contractPayloadJson),
                    safeStr(clientSignatureBase64),
                    safeStr(companySignatureBase64)
            );
            digest.update(textPart.getBytes(StandardCharsets.UTF_8));

            // ── Part 2: raw PDF bytes ────────────────────────────────────────────
            // Feeding them separately avoids any charset issues with binary data.
            if (pdfBytes != null && pdfBytes.length > 0) {
                digest.update(pdfBytes);
            }

            return bytesToHex(digest.digest());

        } catch (NoSuchAlgorithmException e) {
            // SHA-256 is mandated by the JVM spec — this will never happen
            throw new IllegalStateException("SHA-256 algorithm not available", e);
        }
    }

    /**
     * Generate a random 12-character alphanumeric password (no ambiguous chars).
     * Called once at contract signing time; result is stored in the DB.
     */
    public static String generatePassword() {
        String chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
        SecureRandom random = new SecureRandom();
        StringBuilder sb = new StringBuilder(12);
        for (int i = 0; i < 12; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        return sb.toString();
    }

    /** AES-encrypt a plaintext password. Returns a Base64-encoded ciphertext safe for VARCHAR storage. */
    public static String encrypt(String plaintext, String key) {
        try {
            SecretKeySpec secretKey = new SecretKeySpec(Arrays.copyOf(key.getBytes(StandardCharsets.UTF_8), 16), "AES");
            Cipher cipher = Cipher.getInstance("AES/ECB/PKCS5Padding");
            cipher.init(Cipher.ENCRYPT_MODE, secretKey);
            return Base64.getEncoder().encodeToString(cipher.doFinal(plaintext.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception e) {
            throw new RuntimeException("Contract password encryption failed", e);
        }
    }

    /** AES-decrypt a Base64-encoded ciphertext produced by {@link #encrypt}. */
    public static String decrypt(String ciphertext, String key) {
        try {
            SecretKeySpec secretKey = new SecretKeySpec(Arrays.copyOf(key.getBytes(StandardCharsets.UTF_8), 16), "AES");
            Cipher cipher = Cipher.getInstance("AES/ECB/PKCS5Padding");
            cipher.init(Cipher.DECRYPT_MODE, secretKey);
            return new String(cipher.doFinal(Base64.getDecoder().decode(ciphertext)), StandardCharsets.UTF_8);
        } catch (Exception e) {
            throw new RuntimeException("Contract password decryption failed", e);
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    /** Treat null values as the empty string so the hash is always defined. */
    private static String safeStr(String value) {
        return value != null ? value : "";
    }

    /** Convert a byte array to a lowercase hex string (e.g. "a3f9..."). */
    private static String bytesToHex(byte[] bytes) {
        StringBuilder sb = new StringBuilder(bytes.length * 2);
        for (byte b : bytes) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }
}