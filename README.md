# Lurker's Clean Toilets

Find toilets in **London** with cleanliness ratings and paid/free info. Search is public. Sign in to rate a toilet or add one the map is missing.

**Live:** [https://clean-toilets.vercel.app](https://clean-toilets.vercel.app)

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Without Supabase keys the app shows a small sample of London toilets so you can try the map, filters, and detail pages.

## Supabase (auth + live listings)

1. Create a free project at [supabase.com](https://supabase.com).
2. Paste **Project URL** and **anon public** key into `.env.local` as `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. In the SQL editor, run [`supabase/migrations/001_init.sql`](supabase/migrations/001_init.sql).
4. Authentication → URL configuration:
   - Site URL: `https://clean-toilets.vercel.app`
   - Redirect URLs (add all of these):
     - `https://clean-toilets.vercel.app/auth/callback`
     - `http://localhost:3000/auth/callback`
     - `http://localhost:3001/auth/callback`
5. Restart `npm run dev`. Sign-in uses an email magic link.

## Import London toilets from OpenStreetMap

The service role key is only for this local script (never expose it in the browser).

1. Add `SUPABASE_SERVICE_ROLE_KEY` to `.env.local` (Project Settings → API).
2. Run:

```bash
npm run import-osm
```

That pulls `amenity=toilets` inside Greater London from Overpass and upserts by `osm_id`. Safe to re-run.

Optional: `OVERPASS_URL` if the default Overpass instance is busy.

## Scripts

- `npm run dev` — development server
- `npm run build` — production build
- `npm run lint` — ESLint
- `npm run import-osm` — OSM import into Supabase
