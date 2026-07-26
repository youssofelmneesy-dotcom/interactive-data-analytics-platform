# 📊 Interactive Data Analytics Platform

> A professional, AI-powered data analytics platform built with **React + FastAPI** for uploading, cleaning, visualizing, analyzing, and exporting datasets.

![React](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-Backend-green)
![Python](https://img.shields.io/badge/Python-3.11-yellow)
![License](https://img.shields.io/badge/License-MIT-lightgrey)

---

# ✨ Features

## 📁 Upload

- Drag & Drop CSV / Excel upload
- Automatic parsing
- Intelligent data type detection
- Large dataset support

---

## 🧹 Data Cleaning

- Missing value detection
- Duplicate detection
- Outlier detection
- Type conversion
- Quality scoring
- Cleaning recommendations

---

## 📈 Interactive Visualization

Supports:

- Bar Chart
- Line Chart
- Pie Chart
- Histogram
- Scatter Plot
- Box Plot
- Heatmap

---

## 🤖 AI Insights

Powered by Google Gemini.

Automatically generates:

- Dataset summary
- Trend analysis
- Correlation analysis
- Outlier explanation
- Business insights
- Recommendations

---

## 📄 PDF Reports

Generate professional reports including:

- Charts
- Tables
- Statistics
- AI Summary
- Dataset metadata

---

## 🌙 UI

- Dark Mode
- Light Mode
- System Theme
- Responsive Design
- Mobile Friendly
- Accessible Components

---

# 🏗 Architecture

```
React + TypeScript
        │
        ▼
 REST API (FastAPI)
        │
 ┌───────────────┐
 │ Service Layer │
 └───────────────┘
        │
 ┌───────────────┐
 │ Engine Layer  │
 └───────────────┘
        │
 SQLite Database
```

---

# 🛠 Tech Stack

## Frontend

- React 18
- TypeScript
- Vite
- Tailwind CSS
- TanStack Query
- React Router
- Recharts
- Lucide Icons

---

## Backend

- FastAPI
- Python 3.11
- Pandas
- NumPy
- Pydantic
- SQLite
- Playwright
- Google Gemini API

---

## Deployment

Frontend

- Vercel

Backend

- Render

Database

- SQLite

---

# 📂 Project Structure

```
data-analytics-platform/

├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── pages/
│   │   ├── types/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── vite.config.ts
│   └── vercel.json
│
├── server/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── db/
│   │   ├── engines/
│   │   ├── services/
│   │   └── main.py
│   ├── Dockerfile
│   ├── render.yaml
│   ├── requirements.txt
│   └── .env.example
│
├── README.md
└── .gitignore
```

---

# 🚀 Installation

## Prerequisites

- Node.js 18+
- Python 3.11+
- Git
- Google Gemini API Key (optional)

---

## Clone Repository

```bash
git clone https://github.com/your-username/data-analytics-platform.git

cd data-analytics-platform
```

---

## Backend Setup

```bash
cd server

python -m venv .venv

# Windows
.venv\Scripts\activate

# Linux / macOS
source .venv/bin/activate

pip install -r requirements.txt

playwright install chromium

cp .env.example .env
```

Edit `.env`

```env
GEMINI_API_KEY=YOUR_API_KEY
```

Run server

```bash
uvicorn app.main:app --reload
```

Backend

```
http://localhost:8000
```

Swagger

```
http://localhost:8000/docs
```

---

## Frontend Setup

```bash
cd client

npm install

npm run dev
```

Frontend

```
http://localhost:5173
```

---

# ⚙ Environment Variables

## Backend

| Variable | Description |
|------------|------------|
| APP_NAME | Application Name |
| APP_VERSION | Version |
| HOST | Host |
| PORT | Port |
| DATABASE_URL | SQLite Database |
| GEMINI_API_KEY | Google AI API Key |

---

## Frontend

| Variable | Description |
|------------|------------|
| VITE_API_URL | Backend URL |

---

# 📚 API Overview

## Upload

```
POST /api/upload
```

---

## Dataset

```
GET /api/datasets
GET /api/datasets/{id}
GET /api/datasets/{id}/preview
GET /api/datasets/{id}/stats
```

---

## Cleaning

```
GET /quality
POST /clean
```

---

## Charts

```
GET /recommendations
POST /charts
GET /charts
DELETE /charts/{id}
```

---

## AI Insights

```
POST /insights/generate
GET /insights
DELETE /insights/{id}
```

---

## Reports

```
POST /reports
GET /reports
GET /download
DELETE /reports
```

---

# 🌍 Deployment

## Frontend

Deploy with:

- Vercel

---

## Backend

Deploy with:

- Render
- Docker

---

# 📸 Screenshots

Add screenshots here.

- Home
- Upload
- Dataset
- Dashboard
- AI Insights
- Reports

---

# 🔮 Future Improvements

- User Authentication
- PostgreSQL Support
- Team Collaboration
- Machine Learning Models
- Forecasting
- Dashboard Sharing
- Scheduled Reports
- Plugin Marketplace
- Custom Themes

---

# 📄 License

This project is licensed under the **MIT License**.

---

# 👨‍💻 Author

Developed as a professional portfolio project demonstrating:

- Full Stack Development
- Data Analytics
- AI Integration
- Dashboard Design
- Modern React
- FastAPI
- TypeScript
- Clean Architecture

