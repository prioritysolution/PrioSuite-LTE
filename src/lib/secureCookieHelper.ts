import CookiesJS from "js-cookie";
import CryptoJS from "crypto-js";

const SECRET_KEY = process.env.NEXT_PUBLIC_COOKIE_SECRET_KEY || "default-cookie-secret-key-prio-bank";

const encryptVal = (value: unknown): string => {
  if (value === undefined || value === null) return "";
  const stringVal =
    typeof value === "object" ? JSON.stringify(value) : String(value);
  return CryptoJS.AES.encrypt(stringVal, SECRET_KEY).toString();
};

const decryptVal = (cipherText: string): string | null => {
  if (!cipherText) return null;
  try {
    const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    if (!decrypted) return null;
    return decrypted;
  } catch (e) {
    console.error("Cookie decryption failed", e);
    return null;
  }
};

interface CookieOptions {
  expires?: number | Date;
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: "strict" | "Lax" | "None" | "Strict" | "lax" | "none";
}

const Cookies = {
  set: (key: string, value: unknown, options: CookieOptions = {}) => {
    const encrypted = encryptVal(value);
    const mergedOptions: any = {
      sameSite: "strict",
      path: "/",
      ...options,
      secure: true,
    };
    if (mergedOptions.sameSite) {
      const ss = String(mergedOptions.sameSite).toLowerCase();
      // Adjust casing to match js-cookie type declarations if needed,
      // js-cookie supports 'strict' | 'Strict' | 'lax' | 'Lax' | 'none' | 'None'
      mergedOptions.sameSite = (ss.charAt(0).toUpperCase() + ss.slice(1)) as "Strict" | "Lax" | "None";
    }
    CookiesJS.set(key, encrypted, mergedOptions);
  },
  get: (key: string): string | undefined => {
    const val = CookiesJS.get(key);
    if (!val) return undefined;
    const decrypted = decryptVal(val);
    return decrypted === null ? undefined : decrypted;
  },
  remove: (key: string, options: CookieOptions = {}) => {
    CookiesJS.remove(key, { path: "/", ...options });
  },
};

export default Cookies;
