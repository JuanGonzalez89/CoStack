import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 12

function getKey() {
  const key = process.env.ENCRYPTION_KEY
  if (!key) throw new Error('ENCRYPTION_KEY is not set')
  // Expect base64 string of 32 bytes
  return Buffer.from(key, 'base64')
}

export function encrypt(text: string) {
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv)
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return Buffer.concat([iv, tag, encrypted]).toString('base64')
}

export function decrypt(cipherText: string) {
  const data = Buffer.from(cipherText, 'base64')
  const iv = data.slice(0, IV_LENGTH)
  const tag = data.slice(IV_LENGTH, IV_LENGTH + 16)
  const encrypted = data.slice(IV_LENGTH + 16)
  const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv)
  decipher.setAuthTag(tag)
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()])
  return decrypted.toString('utf8')
}

export default { encrypt, decrypt }
