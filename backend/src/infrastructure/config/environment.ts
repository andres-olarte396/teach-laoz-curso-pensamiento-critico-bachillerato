import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.string().transform(Number).default('3000'),
  HOST: z.string().default('0.0.0.0'),
  CONTENT_BASE_PATH: z.string().default('./content/courses'),
  CORS_ORIGIN: z.string().default('*'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  LOG_PRETTY: z.string().transform(v => v === 'true').default('true'),
  MARKDOWN_SANITIZE: z.string().transform(v => v === 'true').default('true'),
  MARKDOWN_ALLOW_HTML: z.string().transform(v => v === 'true').default('false'),
  JWT_SECRET: z.string().default('super-secret-key-change-in-prod'),
  GITHUB_URL: z.string().optional().default('https://github.com'),
  TWITTER_URL: z.string().optional().default('https://twitter.com'),
  LINKEDIN_URL: z.string().optional().default('https://linkedin.com'),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error('❌ Invalid environment variables:', result.error.format());
  process.exit(1);
}

export const env = result.data;
export type Env = z.infer<typeof envSchema>;
