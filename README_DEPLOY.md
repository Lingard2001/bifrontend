Deployment (Free Tiers)

Backend (Render):
1) In backend/index.js we enabled dynamic CORS via FRONTEND_URL.
2) Push to GitHub.
3) Create new Web Service on Render from /backend folder.
4) Set Build Command: npm install; Start Command: node index.js.
5) Add env FRONTEND_URL to your deployed frontend URL.

Frontend (Vercel/Netlify):
- Environment: set REACT_APP_API_BASE to your backend URL (e.g. https://bi-backend.onrender.com)
- Build Command: npm run build; Output directory: build
- SPA rewrites already added (_redirects and vercel.json).

Local .env for development:
REACT_APP_API_BASE=http://localhost:5000 