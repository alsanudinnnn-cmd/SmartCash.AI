# Publish SmartCash AI ke Cloudflare

1. Log masuk ke Cloudflare dengan `npx wrangler login`.
2. Cipta database D1: `npx wrangler d1 create smartcash-ai-db`.
3. Salin nilai `database_id` yang Cloudflare paparkan ke `wrangler.jsonc`, menggantikan `PASTE_YOUR_D1_DATABASE_ID_HERE`.
4. Cipta storage resit: `npx wrangler r2 bucket create smartcash-ai-receipts`.
5. Jalankan migrasi database: `npm run db:migrate:remote`.
6. Simpan secret production berikut, satu demi satu:
   - `npx wrangler secret put GEMINI_API_KEY`
   - `npx wrangler secret put GEMINI_MODEL`
   - `npx wrangler secret put RESEND_API_KEY`
   - `npx wrangler secret put RESEND_FROM_EMAIL`
7. Terbitkan aplikasi: `npm run deploy`.

Cloudflare akan memberi URL percuma seperti `https://smartcash-ai.<akaun-anda>.workers.dev` selepas deploy berjaya.

Jangan letakkan API key dalam `wrangler.jsonc` atau commit `.dev.vars` ke Git.
