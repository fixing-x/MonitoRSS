import { createCipheriv, randomBytes } from "crypto";

const encrypt = (data: string, hexKey: string) => {
  const iv = randomBytes(16);
  const key = Buffer.from(hexKey, "hex");
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = cipher.update(data, "utf8", "hex") + cipher.final("hex");
  const authtag = cipher.getAuthTag().toString("hex");

  return `${iv.toString("hex")}.${encrypted}.${authtag}`;
};

export default encrypt;
