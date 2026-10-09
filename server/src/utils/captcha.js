import crypto from 'crypto';
import { env } from '../config/env.js';
import { ApiError } from './ApiError.js';

const CAPTCHA_CHARS = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

function generateRandomText(length = 5) {
  let text = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * CAPTCHA_CHARS.length);
    text += CAPTCHA_CHARS[randomIndex];
  }
  return text;
}

/**
 * Generates an SVG visual captcha image.
 * Uses wave lines, random rotations, and colors to create a clean visual challenge.
 */
function generateSvg(text) {
  const width = 160;
  const height = 48;
  const chars = text.split('');

  // Random noise lines
  let lines = '';
  for (let i = 0; i < 4; i++) {
    const x1 = Math.floor(Math.random() * width);
    const y1 = Math.floor(Math.random() * height);
    const x2 = Math.floor(Math.random() * width);
    const y2 = Math.floor(Math.random() * height);
    const stroke = i % 2 === 0 ? '#94a3b8' : '#cbd5e1';
    lines += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="1.5" opacity="0.6" />`;
  }

  // Draw characters with random angles & positions
  const colors = ['#2563eb', '#1d4ed8', '#7c3aed', '#059669', '#d97706'];
  const textElements = chars
    .map((char, index) => {
      const x = 20 + index * 26 + (Math.random() * 4 - 2);
      const y = 32 + (Math.random() * 6 - 3);
      const rot = Math.floor(Math.random() * 24 - 12);
      const color = colors[index % colors.length];
      return `<text x="${x}" y="${y}" font-family="monospace, sans-serif" font-size="26" font-weight="bold" fill="${color}" transform="rotate(${rot}, ${x}, ${y})">${char}</text>`;
    })
    .join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" style="background-color: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; user-select: none;">
    <rect width="100%" height="100%" fill="#f8fafc" rx="8" />
    ${lines}
    ${textElements}
  </svg>`;
}

function signCaptcha(answer) {
  const payload = {
    answer: answer.toLowerCase().trim(),
    exp: Date.now() + 5 * 60 * 1000, // 5 min TTL
  };
  const payloadStr = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', env.JWT_ACCESS_SECRET)
    .update(payloadStr)
    .digest('base64url');

  return `${payloadStr}.${signature}`;
}

/**
 * Creates a new captcha challenge.
 * Returns: { captchaSvg: string, captchaToken: string }
 */
export function createCaptchaChallenge() {
  const text = generateRandomText(5);
  const svg = generateSvg(text);
  const captchaToken = signCaptcha(text);

  return {
    captchaSvg: svg,
    captchaToken,
  };
}

/**
 * Validates a user's captcha answer against the signed captcha token.
 * Throws ApiError if invalid, expired, or missing.
 */
export function verifyCaptchaAnswer(captchaToken, captchaAnswer) {
  if (!captchaToken || !captchaAnswer) {
    throw new ApiError(400, 'Captcha verification required. Please complete the captcha.');
  }

  const parts = captchaToken.split('.');
  if (parts.length !== 2) {
    throw new ApiError(400, 'Invalid captcha token.');
  }

  const [payloadStr, signature] = parts;
  const expectedSig = crypto
    .createHmac('sha256', env.JWT_ACCESS_SECRET)
    .update(payloadStr)
    .digest('base64url');

  if (signature !== expectedSig) {
    throw new ApiError(400, 'Captcha token signature verification failed.');
  }

  let payload;
  try {
    payload = JSON.parse(Buffer.from(payloadStr, 'base64url').toString('utf8'));
  } catch {
    throw new ApiError(400, 'Malformed captcha token.');
  }

  if (Date.now() > payload.exp) {
    throw new ApiError(400, 'Captcha has expired. Please refresh the captcha challenge.');
  }

  if (payload.answer !== captchaAnswer.toLowerCase().trim()) {
    throw new ApiError(400, 'Incorrect captcha answer. Please try again.');
  }

  return true;
}
