import { z } from 'zod';
import 'dotenv/config';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),

  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),

  JWT_ACCESS_SECRET:    z.string().min(8, 'JWT_ACCESS_SECRET must be ≥ 32 chars'),
  JWT_REFRESH_SECRET:   z.string().min(8, 'JWT_REFRESH_SECRET must be ≥ 32 chars'),
  JWT_ACCESS_EXPIRES_IN:  z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  CLIENT_URL: z.string().default('http://localhost:5173'),

  EMAILJS_SERVICE_ID:  z.string().default(''),
  EMAILJS_TEMPLATE_ID: z.string().default(''),
  EMAILJS_PUBLIC_KEY:  z.string().default(''),
  EMAILJS_PRIVATE_KEY: z.string().default(''),

  VAPID_PUBLIC_KEY:  z.string().default(''),
  VAPID_PRIVATE_KEY: z.string().default(''),
  VAPID_EMAIL:       z.string().default('mailto:admin@yourdomain.com'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('\n❌  Invalid / missing environment variables:\n');
  Object.entries(parsed.error.flatten().fieldErrors).forEach(([k, v]) =>
    console.error(`  ${k}: ${v.join(', ')}`)
  );
  console.error('\nCopy .env.example → .env and fill in the required values.\n');
  process.exit(1);
}

export const env = parsed.data;
