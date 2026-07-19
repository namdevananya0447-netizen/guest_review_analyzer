# Prompt Engineering Log — Guest Review Classifier

This document tracks the prompt variations tested for the AI-powered guest review sentiment classification feature, built for Trishul Eco-Homestays using the Groq API (`llama-3.3-70b-versatile`).

---

## Variation 1: Basic / Simple Prompt

**Prompt:**
```
Analyze this hotel review and tell me the sentiment, theme, and a suggested response.
```

**Example Input:**
```
The food was absolutely delicious! Fresh organic ingredients from their garden. The host was very warm.
```

**Example Output:**
```
This review is positive, mainly about the food and the host. The management could respond by
thanking the guest for their kind words about the food and hospitality.
```

**Advantages:**
- Quick to write, minimal setup
- Works for a general understanding of the review

**Disadvantages:**
- Output is free-form text, not structured JSON — unusable directly in the frontend without further parsing
- No fixed category options, so "theme" labels are inconsistent between requests (e.g., "food" vs "the food and hospitality")
- No instruction to avoid extra commentary, so the model sometimes adds preamble like "Sure, here's my analysis:"

---

## Variation 2: Structured Prompt with Explicit Rules

**Prompt:**
```
Analyze the following hotel guest review. Classify the sentiment as one of: Positive, Neutral, or Negative.
Identify the main theme as one of: Food, Host, Location, Cleanliness, Value, or Experience.
Write a one-line suggested response a hotel manager could send back to the guest.
Return your answer as sentiment, theme, and suggested response, clearly labeled.

Review: {review}
```

**Example Input:**
```
The room was dusty and the bathroom wasn't clean when we arrived. Disappointed for this price.
```

**Example Output:**
```
Sentiment: Negative
Theme: Cleanliness
Suggested Response: We sincerely apologize for the cleanliness issues you encountered and will address this with our housekeeping team immediately.
```

**Advantages:**
- Fixed category options improve consistency across requests
- Output is more predictable and easier to read
- Reduces the model inventing new theme categories

**Disadvantages:**
- Still returns plain text, not valid JSON — requires string-parsing on the backend, which is fragile (e.g., breaks if the model changes label wording or punctuation)
- No system role, so the model's "voice"/consistency can drift between calls
- No explicit instruction against extra commentary, so occasional extra text still appears

---

## Variation 3: Production-Quality Prompt (Used in Final App)

**System Prompt:**
```
You are an expert hospitality analytics assistant. Analyze the provided guest reviews.
Return a JSON object with a "review" array. Each object in the array must have:
- "sentiment" (Positive/Neutral/Negative)
- "theme" (Food/Host/Location/Cleanliness/Value/Experience)
- "suggested_response" (One-line management reply)
Do not return any text other than the raw JSON.
```

**User Message:** `{review text}`

**API call configuration:** `response_format={"type": "json_object"}` (Groq's structured JSON mode)

**Example Input:**
```
Stunning mountain location and very peaceful. Great value, though finding the property was tricky.
```

**Example Output:**
```json
{
  "review": [
    {
      "sentiment": "Positive",
      "theme": "Location",
      "suggested_response": "Thank you for highlighting our peaceful mountain setting — we're working on clearer directions for future guests!"
    }
  ]
}
```

**Advantages:**
- Returns strictly valid, parseable JSON every time (enforced by both the system prompt and Groq's `json_object` response format)
- System role clearly frames the model's persona ("expert hospitality analytics assistant"), improving consistency and tone
- Fixed enum-style categories for both sentiment and theme prevent invalid or inconsistent labels
- Explicit "no extra text" instruction eliminates preamble/postamble that would break JSON parsing
- Directly maps to the app's `Review_result` Pydantic model, so the response can be used immediately without additional cleanup

**Disadvantages:**
- Slightly more verbose prompt to write and maintain
- Relies on the API supporting a JSON-mode response format (not all providers/models support this natively)

---

## Recommendation

**Variation 3 is used in the production application.** It is the only variation that reliably returns strictly structured, valid JSON that can be parsed directly into the app's `Review_result` model without additional string manipulation or error-prone regex parsing. The system role and explicit category lists also make the sentiment and theme labels consistent across hundreds of different review inputs, which matters for a real dashboard where staff need predictable, comparable data rather than free-form text. Combined with Groq's native JSON response mode, this prompt gives the best balance of reliability, consistency, and direct usability in a production FastAPI + React application.
