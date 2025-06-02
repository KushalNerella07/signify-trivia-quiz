# 🧠 Signify Trivia Quiz App

A full-stack, Docker-ready trivia platform that lets users:

1. pick a **category** (only those that really have questions)
2. pick a **difficulty** (tabs appear dynamically per category)
3. answer **paginated** questions one-by-one
4. **shuffle** the quiz pool on demand
5. get **instant scoring** on submission

| Layer        | Tech Stack                                                |
| ------------ | --------------------------------------------------------- |
| **Frontend** | React 19 · Vite 6 · TypeScript 5 · MUI v7 · Redux Toolkit |
| **Backend**  | Node 20 · Express 5 · TypeScript 5                        |
| **Database** | MongoDB 6                                                 |
| **Tooling**  | Jest 29 (+ RTL) · ESLint 9 · Docker 24                    |

---

## 1 Project Highlights

| Feature               | Detail                                                                                                    |
| --------------------- | --------------------------------------------------------------------------------------------------------- |
| **Category-aware**    | `/categories/meta` returns each category plus which difficulties are available.                           |
| **Difficulty-aware**  | Tabs (`easy · medium · hard`) are rendered only if that category has data.                                |
| **Pagination UX**     | One question per page. Answers are cached locally and POSTed once to `/quiz/score`.                       |
| **Answer security**   | Correct answer is stored as a **SHA-256 hash**; the raw answer text never leaves the DB.                  |
| **Type safety**       | Front + back share `CategoryMeta`, `Question`, `ScoreResult` interfaces → zero runtime shape drift.       |
| **One-command setup** | `docker compose up --build` seeds Mongo, builds both images, wires Vite’s dev proxy to the API container. |

---

## 2 Quick Start ( Docker )

```bash
git clone https://github.com/YOUR_ORG/signify-quizapp.git
cd signify-quizapp
docker compose up --build
```
