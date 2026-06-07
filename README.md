# GitPulse — MERN Stack GitHub Analytics Dashboard

A full-stack MERN application that lets you search any GitHub username and explore their repositories, commits, contributors, and activity graphs — all in one place. Includes Google and GitHub OAuth authentication with a personalized favourites system.

## 🔗 Links

- **Live Demo:** https://gitpulse-github-analytics-dashboard.vercel.app
- **Backend API:** https://gitpulse-mern.onrender.com
- **GitHub Repo:** https://github.com/akshitmalia/GitPulse-MERN

---

## ✨ Features

- 🔍 Search GitHub users with debounced input
- 📁 View all repositories with filter and sort (name, stars, forks, issues)
- 📖 Render repository README as formatted markdown
- 📝 View recent commits and personal commits
- 👥 View contributors with contribution count
- 📊 Commit activity bar graph using Chart.js
- ⭐ Save repositories to favourites (CRUD)
- ✏️ Edit favourite description
- 🔐 GitHub and Google OAuth login via Passport.js
- 🍪 JWT authentication with httpOnly cookies
- 📱 Fully responsive with Bootstrap

---

## 🛠️ Tech Stack

### Frontend
- React + Vite
- Redux Toolkit
- React Router DOM
- Axios
- Bootstrap
- Chart.js + react-chartjs-2
- Marked.js

### Backend
- Node.js + Express
- MongoDB + Mongoose
- Passport.js (GitHub OAuth + Google OAuth)
- JSON Web Tokens (JWT)
- Cookie Parser
- CORS

---

## 📁 Project Structure

```
GitPulse-MERN/
├── backend/
│   ├── config/
│   │   ├── db.js
│   │   └── passport.js
│   ├── middleware/
│   │   └── protect.js
│   ├── models/
│   │   └── user.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── favouritesRoutes.js
│   ├── server.js
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── public/
    ├── src/
    │   ├── api/
    │   │   └── axios.js
    │   ├── app/
    │   │   └── store.js
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   └── FavouriteCard.jsx
    │   ├── features/
    │   │   ├── auth/
    │   │   │   └── authSlice.js
    │   │   └── favourites/
    │   │       └── favouritesSlice.js
    │   ├── pages/
    │   │   ├── Home.jsx
    │   │   ├── Repos.jsx
    │   │   ├── RepoDetail.jsx
    │   │   └── Favourites.jsx
    │   ├── App.jsx
    │   └── main.jsx
    ├── vercel.json
    └── package.json
```

---

## ⚙️ Local Setup

### 1. Clone the repository
```bash
git clone https://github.com/akshitmalia/GitPulse-MERN.git
cd GitPulse-MERN
```

### 2. Backend setup
```bash
cd backend
npm install
```

Create `.env` file in backend folder:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=your_jwt_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=http://localhost:5000/gitpulse/auth/github/callback
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/gitpulse/auth/google/callback
CLIENT_URL=http://localhost:5173
```

```bash
npm run dev
```

### 3. Frontend setup
```bash
cd frontend
npm install
```

Create `.env` file in frontend folder:
```env
VITE_API_URL=http://localhost:5000
```

```bash
npm run dev
```

### 4. Open in browser
```
http://localhost:5173
```

---

## 🔐 OAuth Setup

### GitHub OAuth
1. Go to GitHub → Settings → Developer Settings → OAuth Apps → New OAuth App
2. Homepage URL: `http://localhost:5173`
3. Callback URL: `http://localhost:5000/gitpulse/auth/github/callback`
4. Copy Client ID and Client Secret to `.env`

### Google OAuth
1. Go to Google Cloud Console → APIs & Services → Credentials → Create OAuth Client ID
2. Authorized origins: `http://localhost:5173`
3. Authorized redirect URIs: `http://localhost:5000/gitpulse/auth/google/callback`
4. Copy Client ID and Client Secret to `.env`

---

## 🚀 Deployment

- **Frontend** → Vercel (root directory: `frontend`)
- **Backend** → Render (root directory: `backend`, start command: `node server.js`)

### Production environment variables

**Render (Backend):**
```env
NODE_ENV=production
MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=your_jwt_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=https://your-render-url.onrender.com/gitpulse/auth/github/callback
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=https://your-render-url.onrender.com/gitpulse/auth/google/callback
CLIENT_URL=https://your-vercel-url.vercel.app
```

**Vercel (Frontend):**
```env
VITE_API_URL=https://your-render-url.onrender.com
```

---

## 📝 API Endpoints

### Auth Routes `/gitpulse/auth`
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/github` | GitHub OAuth login |
| GET | `/github/callback` | GitHub OAuth callback |
| GET | `/google` | Google OAuth login |
| GET | `/google/callback` | Google OAuth callback |
| GET | `/me` | Get current user |
| POST | `/logout` | Logout user |

### Favourites Routes `/gitpulse/favourites`
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get all favourites |
| POST | `/` | Add a favourite |
| PUT | `/:repoId` | Update favourite description |
| DELETE | `/:repoId` | Remove a favourite |

---

## 🌐 Environment Variables — `.env.example`

```env
PORT=5000
NODE_ENV=development
MONGO_URI=
JWT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_CALLBACK_URL=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=
CLIENT_URL=
```

---

## 👨‍💻 Author

**Akshit Malia**
- GitHub: [@akshitmalia](https://github.com/akshitmalia)
- LinkedIn: [akshitmalia](https://linkedin.com/in/akshitmalia)
