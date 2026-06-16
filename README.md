# Trishul Eco-Homestays Review Sentiment Classifier

An AI-powered review analysis tool designed to help hospitality staff quickly understand guest feedback, identify key themes, and generate professional response suggestions.

## Overview

The application allows staff to paste multiple guest reviews and automatically:

- Classify review sentiment (Positive, Neutral, Negative)
- Identify the primary review theme
- Generate a suggested response
- Analyze reviews in batches
- Export results to CSV format
- View sentiment summaries through an interactive dashboard

Built using React, TypeScript, TanStack Start, TanStack Router, React Query, and Tailwind CSS.

---

## Features

### Sentiment Analysis
Automatically classifies reviews into:
- Positive
- Neutral
- Negative

### Theme Detection
Identifies the primary topic discussed in the review:
- Food
- Host & Staff
- Location
- Cleanliness
- Value
- Experience

### Suggested Responses
Generates response templates tailored to the review sentiment and theme.

### Batch Processing
Analyze up to 50 reviews at once.

### Progress Tracking
Displays real-time processing progress while reviews are being analyzed.

### CSV Export
Download analyzed reviews as a CSV file.

### Dashboard Summary
View counts of:
- Positive Reviews
- Neutral Reviews
- Negative Reviews

---

## Tech Stack

### Frontend
- React 19
- TypeScript
- TanStack Start
- TanStack Router
- React Query
- Tailwind CSS
- Lucide React

### Development Tools
- Vite
- ESLint
- Prettier

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

## How It Works

1. Paste guest reviews into the input area.
2. Click **Analyse Reviews**.
3. Reviews are processed individually.
4. The system:
   - Determines sentiment
   - Detects the main theme
   - Generates a suggested response
5. Results are displayed in a structured table.
6. Export results as CSV if needed.

---

## Sample Input

```text
The host was incredibly warm and the breakfast was delicious.

Room was clean but the view wasn't what we expected.

Terrible experience — bathroom was dirty and staff were rude.
```

---

## Sample Output

| Sentiment | Theme | Suggested Response |
|------------|--------|-------------------|
| Positive | Food | Thank you for the kind words about our kitchen. |
| Neutral | Location | Thank you for the feedback. |
| Negative | Cleanliness | We deeply regret the housekeeping issue. |

---

## Installation

Clone the repository:

```bash
git clone https://github.com/yourusername/trishul-review-classifier.git
```

Move into the project folder:

```bash
cd trishul-review-classifier
```

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

---

## Build for Production

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```



## Use Cases

This project can help hospitality businesses:

- Understand guest sentiment quickly
- Improve response quality
- Identify recurring issues
- Reduce manual review analysis
- Improve customer satisfaction

---

## License

This project was developed for educational and internship purposes. It may be modified and extended for personal, academic, or commercial use.
