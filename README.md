# Song UI

React + Tailwind + MUI frontend for the Song API assignment.

## Live references
- API repo: https://github.com/richardhub10/song-api
- UI repo: https://github.com/richardhub10/song-ui
- API example URL: https://song-api-rde1.onrender.com
- UI URL: https://song-ui.onrender.com/

## Local development
1. Install dependencies.
2. Run `npm run dev`.
3. Set `VITE_API_URL` if you want to point at a different backend endpoint.

## Render deployment
This repo is set up as a static site for Render.
- Build command: `npm ci && npm run build`
- Publish directory: `dist`

If the API is already deployed elsewhere, update `VITE_API_URL` in Render to point at it.
