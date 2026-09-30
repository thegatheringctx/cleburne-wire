# Cleburne Wire

Automated hyperlocal news, guide and sponsor site for Cleburne, Texas. Live at https://cleburnewire.com.

- Site: Astro on Netlify, deployed automatically from the `main` branch of this repo.
- Data and automation: Supabase project `cleburne-wire` (edge functions, cron jobs, database).
- Towns are data, not code: pages are keyed by `[town]`, so new towns roll out by adding a row, not by copying the site.

Secrets live in Netlify environment variables and the Supabase vault, never in this repo.
