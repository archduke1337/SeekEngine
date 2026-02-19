/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}

// ─── Build-time environment validation ───
// Only enforce on CI/production (Vercel sets VERCEL=1)
const required = ['OPENROUTER_API_KEY']
const missing = required.filter((k) => !process.env[k])
if (missing.length > 0 && process.env.VERCEL === '1') {
  throw new Error(`❌ Missing required env vars: ${missing.join(', ')}`)
} else if (missing.length > 0) {
  console.warn(`⚠️  Missing env vars (non-fatal in dev): ${missing.join(', ')}`)
}

module.exports = nextConfig
