/**
 * Get brightness of a hex color
 *
 * Source: https://stackoverflow.com/a/12043228/402412
 *
 * @param {String} of RGB hex color
 * @returns {Number} luma
 */
export function brightness(v) {
  if (v.startsWith('#')) v = v.slice(1)
  const rgb = parseInt(v, 16)
  const r = (rgb >> 16) & 0xff
  const g = (rgb >>  8) & 0xff
  const b = (rgb >>  0) & 0xff
  return 0.2126 * r + 0.7152 * g + 0.0722 * b; // per ITU-R BT.709
}

/**
 * Is the color a light color?
 *
 * @param {String} of RGB hex color
 * @returns {Boolean} if the color is light
 */
export function isLight(v) {
  return brightness(v) >= 128
}

/**
 * ArrayBuffer to hex string
 *
 * @param {ArrayBuffer} to convert to hex string
 * @returns {String} hex
 */
export function buf2hex(buffer) {
  const hashArray = Array.from(new Uint8Array(buffer));                     // convert buffer to byte array
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Return sha1 hash of string
 *
 * @param {String} to hash with SHA-1
 * @returns {string} hex digest
 */
export async function sha1(v) {
  const bufIn = new TextEncoder().encode(v)
  const bufOut = await crypto.subtle.digest('SHA-1', bufIn)
  return buf2hex(bufOut)
}

/**
 * Return 6-char hex string hash of string
 *
 * @param {String} to hash with SHA-1
 * @returns {string} hex digest
 */
export async function rgbHash(v) {
  const hash = await sha1(v)
  return `#${hash.slice(-6)}`
}
