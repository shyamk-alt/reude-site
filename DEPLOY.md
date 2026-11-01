# Deploy REUDE site (GitHub → Vercel)

1. Unzip this file. You get a folder `reude-site` (package.json is directly inside it).
2. GitHub → New repository → name `reude-site` → Create.
3. On the empty repo page click **"uploading an existing file"**, open the unzipped `reude-site` folder and drag **everything inside it** (app, components, lib, public, package.json, tsconfig.json, next.config.mjs, postcss.config.mjs, README.md …) into the page. Commit.
   - GitHub allows 100 files per upload; this project has about 75.
   - `.gitignore` and `.env.example` start with a dot and may be hidden in your file picker; they are optional.
4. vercel.com → Add New → Project → Import `reude-site` → Framework "Next.js" (auto-detected) → Deploy.
5. Optional: Project → Settings → Environment Variables → `LEAD_WEBHOOK_URL` (a Formspree / Make / Apps Script URL) so form submissions reach you.

If the build fails, copy the red error lines from the Vercel build log and send them to Claude.
