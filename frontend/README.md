# Trishul Eco-Homestays – Review Sentiment Classifier (Frontend)

## Overview

This project is the frontend interface for the Trishul Eco-Homestays Review Sentiment Classifier.

The application allows staff members to:

- Paste multiple guest reviews
- Analyze reviews using AI-powered sentiment classification
- View sentiment categories (Positive, Neutral, Negative)
- Identify review themes
- Generate suggested responses
- Export analyzed reviews as CSV files

The interface is designed with a clean pastel-green theme inspired by eco-tourism and hospitality branding.

---

## Features

### Review Input
- Paste multiple reviews
- One review per line
- Supports batch processing

### Sentiment Analysis
Classifies reviews into:
- Positive
- Neutral
- Negative

### Theme Detection
Detects major review topics such as:
- Food
- Host
- Location
- Cleanliness
- Value
- Overall Experience

### Suggested Responses
Generates ready-to-use responses for staff.

### Dashboard Summary
Displays:
- Total Positive Reviews
- Total Neutral Reviews
- Total Negative Reviews

### CSV Export
Export analyzed review data for reporting and record keeping.

---

## Tech Stack

- React
- TypeScript
- TanStack Router
- TanStack Query
- Tailwind CSS
- Vite
- Lucide React Icons

---

## Project Structure

```text
src/
│
├── components/
│   ├── ReviewTable.tsx
│   └── SummaryBar.tsx
│
├── routes/
│   ├── __root.tsx
│   ├── index.tsx
│   └── api/
│       └── classify.ts
│
├── lib/
│   └── review-types.ts
│
├── styles.css
├── router.tsx
├── start.ts
└── server.ts
```

---

## Installation

Clone the repository:

```bash
git clone <repository-url>
```

Move into the project directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Run development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

