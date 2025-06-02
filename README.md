# 🧠 Signify Trivia Quiz App

A **full-stack, Docker-ready** trivia platform that lets users  

1. pick a _category_ (only those that actually have questions)  
2. pick a _difficulty_ (tabs appear dynamically per category)  
3. answer **one question per page** – with Back/Next navigation  
4. _shuffle_ the quiz pool on demand  
5. receive **instant, secure scoring** on submission  

---

## Tech Stack

| Layer        | Tech / Version                                    |
|--------------|---------------------------------------------------|
| **Frontend** | React 19 &nbsp;·&nbsp; Vite 6 &nbsp;·&nbsp; TypeScript 5 &nbsp;·&nbsp; MUI 7 &nbsp;·&nbsp; Redux Toolkit |
| **Backend**  | Node 20 &nbsp;·&nbsp; Express 5 &nbsp;·&nbsp; TypeScript 5 |
| **Database** | MongoDB 6                                         |
| **Tooling**  | Jest 29 (+ React Testing Library) · ESLint 9 · Docker 24 |

---

## 1 Project Highlights

| Feature              | Detail |
|----------------------|--------|
| **Category-aware**   | `/categories/meta` returns every category **plus** which difficulties exist. UI only shows tabs that are real. |
| **Pagination UX**    | One question at a time. Answers cached locally → single POST to `/quiz/score`. |
| **Answer security**  | Correct choice stored as SHA-256 hash; raw text never leaves DB. |
| **Type-safety**      | Shared `CategoryMeta` / `Question` / `ScoreResult` interfaces across front & back. |
| **One-command spin-up** | `docker compose up --build` seeds Mongo, builds both images, sets up Vite dev-proxy to the API container. |
| **CI-ready tests**   | Pure **Jest + RTL** suites for key components; `npm run test` is green. |

---

## 2 Live Demo (local)

| URL                        | Purpose |
|----------------------------|---------|
| `http://localhost:5173`    | Vite dev server (React UI) |
| `http://localhost:8080`    | Express API root |
| `GET /health`              | `{ "status": "ok" }` |

---

## 3 Getting Started

### 3-A Docker (recommended)

```bash
gh repo clone KushalNerella07/signify-trivia-quiz
cd signify-trivia-quiz
docker compose up --build        # seeds Mongo + runs both services


## 4 Scripts

| Location   | Script          | What it does                         |
| ---------- | --------------- | ------------------------------------ |
| **client** | `npm run dev`   | Vite dev server + React fast-refresh |
|            | `npm run build` | Production build to `dist/`          |
|            | `npm run test`  | Jest + RTL component tests           |
|            | `npm run lint`  | ESLint (`eslint .`)                  |
| **server** | `npm run dev`   | ts-node watch (nodemon)              |
|            | `npm run build` | `tsc` → `dist/`                      |
|            | `npm run seed`  | import seed data into Mongo          |

## 5 API Reference

| Method | URL & Query                              | Body / Notes                              | Returns                                    |   |              |
| ------ | ---------------------------------------- | ----------------------------------------- | ------------------------------------------ | - | ------------ |
| `GET`  | `/health`                                | —                                         | `{ status: "ok" }`                         |   |              |
| `GET`  | `/categories`                            | —                                         | `[ { apiId, name } ]`                      |   |              |
| `GET`  | `/categories/meta`                       | —                                         | `[ { apiId, name, available: ["easy"] } ]` |   |              |
| `GET`  | \`/quiz?category=<id>\&difficulty=\<easy | medium                                    | hard>\&amount=<n>\`                        | — | `Question[]` |
| `POST` | `/quiz/score`                            | `{ answers: [ { questionId, answer } ] }` | `{ totalCorrect, results }`                |   |              |

## 6 Folder Structure 
.
├── client/     # React front-end
│   ├── src/
│   ├── vite.config.ts
│   └── ...
├── server/     # Express API
│   ├── src/
│   ├── seed.ts
│   └── ...
├── docker-compose.yml
└── README.md

