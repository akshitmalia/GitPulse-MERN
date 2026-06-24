# GitPulse — MERN Stack GitHub Analytics Dashboard

A full-stack MERN application that lets you search any GitHub username and explore their repositories, commits, contributors, and activity graphs in one place. Includes GitHub and Google OAuth authentication, a personalized favourites system with full CRUD operations, and AI-generated repository summaries powered by Groq's Llama 3.3 model.

## Live Links

- Live Demo: https://gitpulse-github-analytics-dashboard.vercel.app
- Backend API: https://gitpulse-mern.onrender.com
- Repository: https://github.com/akshitmalia/GitPulse-MERN

## Overview

GitPulse allows a user to search for any GitHub profile and inspect their public repositories in detail, including commit history, contributors, open issues, and a chronological commit activity chart. Authenticated users can save repositories to a personal favourites list, persisted in MongoDB, with full create, read, update, and delete functionality. Each repository page also offers an AI-generated summary that explains what the project does, grounded in its actual README content and GitHub topics rather than assumptions based on the repository name alone.

## Core Features

- GitHub user search with debounced input to minimize redundant API calls
- Repository listing with client-side filtering and sorting by name, stars, forks, and open issues
- Repository README rendered as formatted HTML using Markdown parsing
- Recent commit history and commits attributed to the repository owner
- Contributor list with individual contribution counts
- Commit activity visualized as a chronological bar chart using Chart.js
- AI-generated repository summaries using Groq's Llama 3.3 model, built with prompt engineering that prioritizes README content and repository topics over the repository name to avoid inaccurate inferences
- Personalized favourites system with full CRUD operations, backed by MongoDB
- GitHub and Google OAuth 2.0 authentication via Passport.js
- JWT-based session management using httpOnly cookies
- Authenticated GitHub API requests to raise the rate limit from 60 to 5,000 requests per hour
- Fully responsive interface built with Bootstrap

## Tech Stack

**Frontend**
- React (Vite)
- Redux Toolkit
- React Router DOM
- Axios
- Bootstrap
- Chart.js with react-chartjs-2
- Marked.js for Markdown rendering

**Backend**
- Node.js with Express
- MongoDB with Mongoose
- Passport.js (GitHub OAuth and Google OAuth strategies)
- JSON Web Tokens (JWT)
- Cookie Parser
- CORS
- Groq SDK for LLM-based repository summarization

## Project Structure

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
│   │   ├── favouritesRoutes.js
│   │   └── aiRoutes.js
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

## Local Setup

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

Create a `.env` file inside the `backend` folder:

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
GROQ_API_KEY=your_groq_api_key
```

Start the backend:

```bash
npm run dev
```

### 3. Frontend setup

```bash
cd frontend
npm install
```

Create a `.env` file inside the `frontend` folder:

```env
VITE_API_URL=http://localhost:5000
VITE_GITHUB_TOKEN=your_github_personal_access_token
```

Start the frontend:

```bash
npm run dev
```

### 4. Open the application

```
http://localhost:5173
```

## OAuth Configuration

### GitHub OAuth

1. Go to GitHub Settings, Developer Settings, OAuth Apps, and create a new OAuth App
2. Set Homepage URL to `http://localhost:5173`
3. Set Authorization callback URL to `http://localhost:5000/gitpulse/auth/github/callback`
4. Copy the generated Client ID and Client Secret into the backend `.env` file

### Google OAuth

1. Go to Google Cloud Console, APIs and Services, Credentials, and create a new OAuth Client ID
2. Add `http://localhost:5173` as an authorized JavaScript origin
3. Add `http://localhost:5000/gitpulse/auth/google/callback` as an authorized redirect URI
4. Copy the generated Client ID and Client Secret into the backend `.env` file

### Groq API

1. Create an account at console.groq.com
2. Generate an API key
3. Copy the key into the `GROQ_API_KEY` variable in the backend `.env` file

## Deployment

- Frontend is deployed on Vercel, with the root directory set to `frontend`
- Backend is deployed on Render, with the root directory set to `backend` and the start command set to `node server.js`

### Production environment variables

**Render (Backend)**

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
GROQ_API_KEY=your_groq_api_key
```

**Vercel (Frontend)**

```env
VITE_API_URL=https://your-render-url.onrender.com
VITE_GITHUB_TOKEN=your_github_personal_access_token
```

## API Reference

### Authentication routes — `/gitpulse/auth`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/github` | Initiates GitHub OAuth login |
| GET | `/github/callback` | GitHub OAuth callback handler |
| GET | `/google` | Initiates Google OAuth login |
| GET | `/google/callback` | Google OAuth callback handler |
| GET | `/me` | Returns the currently authenticated user |
| POST | `/logout` | Logs out the current user |

### Favourites routes — `/gitpulse/favourites`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Retrieves all favourites for the authenticated user |
| POST | `/` | Adds a repository to favourites |
| PUT | `/:repoId` | Updates the description of a favourite |
| DELETE | `/:repoId` | Removes a repository from favourites |

### AI routes — `/gitpulse/ai`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/summarize` | Generates an AI summary of a repository using its README content, topics, and metadata |

## Environment Variables Reference — `.env.example`

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
GROQ_API_KEY=
```

## Author

**Akshit Malia**

- GitHub: https://github.com/akshitmalia
- LinkedIn: https://linkedin.com/in/akshitmalia

## License

This project is open source and available under the MIT License.
