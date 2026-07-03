<<<<<<< HEAD
import { useState, useCallback, useMemo } from 'react';
import { Download, Trash2, Leaf, RefreshCw, Layers, Sparkles } from 'lucide-react';
import SummaryBar from './components/SummaryBar';
import ReviewTable from './components/ReviewTable';
import DarkModeToggle from './components/ui/DarkModeToggle';

const DEFAULT_PLACEHOLDER = `The food was absolutely delicious! Fresh organic ingredients from their garden. The host was very warm.

The room was dusty and the bathroom wasn't clean when we arrived. Disappointed for this price.

Stunning mountain location and very peaceful. Great value, though finding the property was tricky.`;

export default function App() {
  const [inputText, setInputText] = useState('');
  const [reviews, setReviews] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Memoize summary stats counts
  const stats = useMemo(() => {
    let positive = 0;
    let neutral = 0;
    let negative = 0;
    reviews.forEach(r => {
      if (r.status === 'success') {
  if (r.sentiment?.toLowerCase() === 'positive') positive++;
  else if (r.sentiment?.toLowerCase() === 'neutral') neutral++;
  else if (r.sentiment?.toLowerCase() === 'negative') negative++;
}
    });
    return { positive, neutral, negative };
  }, [reviews]);

  /**
   * Helper to perform API classification for a single review at a given index
   */
  const classifySingleReview = useCallback(async (index, reviewsList = null) => {
    const targetList = reviewsList || reviews;
    const reviewItem = targetList[index];
    if (!reviewItem) return;

    // Update row status to loading
    setReviews(prev => prev.map((r, i) => i === index ? { ...r, status: 'loading', error: null } : r));

   try {
  const response = await fetch("http://127.0.0.1:8000/classify", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      review: reviewItem.text,
    }),
  });

  if (!response.ok) {
    throw new Error(`Server returned ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();

const result = data;
setReviews(prev =>
  prev.map((r, i) =>
    i === index
      ? {
          ...r,
          status: "success",
          dbId: result.id,
          sentiment: result.sentiment,
          theme: result.theme,
          response: result.suggested_response,
        }
      : r
  )
);
} catch (err) {
  console.error(`Error classifying review at index ${index}:`, err);

  setReviews(prev =>
    prev.map((r, i) =>
      i === index
        ? {
            ...r,
            status: "error",
            error: err.message,
          }
        : r
    )
  );
}
  }, [reviews]);

  /**
   * Main sequential batch processor
   */
  const analyseReviews = async () => {
    if (!inputText.trim()) return;

    // Split reviews by newline, filter empty, limit to 50
    const rawLines = inputText.split('\n');
    const filteredLines = rawLines
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .slice(0, 50);

    if (filteredLines.length === 0) return;

    // Setup initial reviews state
    const newReviews = filteredLines.map((text, idx) => ({
      id: `${Date.now()}-${idx}`,
      text,
      status: 'idle',
      sentiment: null,
      theme: null,
      response: null,
      error: null
    }));

    setReviews(newReviews);
    setIsProcessing(true);
    setCurrentIndex(0);

    // Sequentially process each review
    for (let i = 0; i < newReviews.length; i++) {
      setCurrentIndex(i);
      await classifySingleReview(i, newReviews);
    }

    setIsProcessing(false);
  };

  /**
   * Row-level re-run handler
   */
  const handleReRunRow = useCallback(async (index) => {
    await classifySingleReview(index);
  }, [classifySingleReview]);
  /**
 * Update handler — edits the suggested response for a single review
 */
const handleUpdateRow = useCallback(async (index, newResponseText) => {
  const reviewItem = reviews[index];
  if (!reviewItem?.dbId) return;

  try {
    const response = await fetch(`http://127.0.0.1:8000/update/${reviewItem.dbId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        review_text: reviewItem.text,
        sentiment: reviewItem.sentiment,
        theme: reviewItem.theme,
        suggested_response: newResponseText,
      }),
    });

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}: ${response.statusText}`);
    }

    setReviews(prev =>
      prev.map((r, i) => (i === index ? { ...r, response: newResponseText } : r))
    );
  } catch (err) {
    console.error(`Error updating review at index ${index}:`, err);
  }
}, [reviews]);

/**
 * Delete handler — removes a single review
 */
const handleDeleteRow = useCallback(async (index) => {
  const reviewItem = reviews[index];
  
  if (!reviewItem?.dbId) return;

  try {
    const response = await fetch(`http://127.0.0.1:8000/delete/${reviewItem.dbId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}: ${response.statusText}`);
    }

    setReviews(prev => prev.filter((_, i) => i !== index));
  } catch (err) {
    console.error(`Error deleting review at index ${index}:`, err);
  }
}, [reviews]);

  /**
   * Clear all reviews and inputs
   */
  const handleClearAll = () => {
    setReviews([]);
    setInputText('');
    setIsProcessing(false);
    setCurrentIndex(0);
  };

  /**
   * CSV Exporter
   */
  const handleExportCSV = () => {
    if (reviews.length === 0) return;

    const headers = ['#', 'Review', 'Sentiment', 'Theme', 'Suggested Response', 'Status'];
    const rows = reviews.map((r, idx) => [
      idx + 1,
      r.text,
      r.status === 'success' ? r.sentiment : '',
      r.status === 'success' ? r.theme : '',
      r.status === 'success' ? r.response : '',
      r.status
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `trishul_reviews_classification_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-eco-bg text-eco-dark antialiased">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-eco-border shadow-xs">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <svg className="w-10 h-10" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 38L20 14L30 31L34 25L42 38H6Z" fill="#A8D5B5" fillOpacity="0.4" stroke="#4CAF7D" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M26 22C32 20 37 23 37 29C37 34 33 37 29 37C25 37 22 33 22 28C22 25 24 23 26 22Z" fill="#4CAF7D" stroke="#FFFFFF" strokeWidth="1.5" />
              <path d="M22 28C26 31 29 37 29 37" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight text-eco-dark m-0 leading-none">
                Trishul Eco-Homestays
              </h1>
              <p className="text-[11px] text-eco-muted font-medium tracking-wide mt-1 uppercase">
                Understand every guest. Respond with care.
              </p>
            </div>
          </div>

          {/* Right Header: Tagline + Dark Mode Toggle */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-eco-muted font-medium tracking-wider bg-eco-bg/80 border border-eco-border px-3 py-1.5 rounded-full hidden sm:inline-flex items-center gap-1.5 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-eco-primary" />
              Review Intelligence · Powered by AI
            </span>
            <DarkModeToggle />
          </div>
        </div>
      </header>

      {/* Main Content Dashboard */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Side: Input & Configuration */}
          <section className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-eco-border rounded-2xl p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <label className="text-xs font-bold uppercase tracking-wider text-eco-muted flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-eco-primary" />
                  Paste Guest Reviews
                </label>
              </div>

              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={DEFAULT_PLACEHOLDER}
                disabled={isProcessing}
                className="w-full min-h-[200px] p-4 bg-eco-bg/30 border border-eco-border rounded-xl font-sans text-sm text-eco-dark placeholder-eco-muted/60 focus:outline-none focus:ring-2 focus:ring-eco-primary/20 focus:border-eco-primary transition-all resize-y disabled:opacity-60"
              />

              <div className="flex justify-between items-center mt-3 mb-5">
                <span className="text-xs text-eco-muted font-medium">
                  One review per line · supports batch of up to 50
                </span>
                {inputText && (
                  <span className="text-xs font-semibold text-eco-primary">
                    {inputText.split('\n').filter(l => l.trim().length > 0).length} reviews detected
                  </span>
                )}
              </div>

              <button
                onClick={analyseReviews}
                disabled={isProcessing || !inputText.trim()}
                className="w-full h-12 bg-eco-primary text-white font-semibold text-sm rounded-[14px] flex items-center justify-center gap-2 hover:bg-eco-primary-hover active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none shadow-xs cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Processing Batch...
                  </>
                ) : (
                  <>
                    <Leaf className="w-4 h-4" />
                    Analyse Reviews
                  </>
                )}
              </button>
            </div>
            
            {/* Quick Helper Info Card */}
            <div className="bg-white border border-eco-border rounded-2xl p-5 shadow-xs text-xs text-eco-muted space-y-2">
              <h3 className="font-semibold text-eco-dark uppercase tracking-wider text-[10px]">Staff Guide</h3>
              <p>1. The classifier automatically identifies key themes (Food, cleanliness, host, location, etc.) and tags sentiment.</p>
              <p>2. Suggested responses can be copied with one click to reply back to guests with a natural, caring tone.</p>
            </div>
          </section>

          {/* Right Side: Progress, Stats & Results */}
          <section className="lg:col-span-7 space-y-6">
            
            {/* Loading / Progress State */}
            {isProcessing && (
              <div className="bg-white border border-eco-border rounded-2xl p-5 shadow-xs animate-pulse">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-eco-dark">
                      Analysing reviews with AI…
                    </span>
                    {/* Bouncing Dots */}
                    <div className="flex space-x-1 items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-eco-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="w-1.5 h-1.5 bg-eco-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-1.5 h-1.5 bg-eco-primary rounded-full animate-bounce"></div>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-eco-primary">
                    {Math.round(((currentIndex + 1) / reviews.length) * 100)}%
                  </span>
                </div>
                
                {/* Progress Bar */}
                <div className="h-1.5 w-full bg-eco-primary/10 rounded-full overflow-hidden mb-2">
                  <div 
                    className="bg-eco-primary h-full transition-all duration-300 rounded-full"
                    style={{ width: `${((currentIndex + 1) / reviews.length) * 100}%` }}
                  ></div>
                </div>

                <div className="text-xs text-eco-muted font-medium">
                  Analysing review {currentIndex + 1} of {reviews.length}…
                </div>
              </div>
            )}

            {/* Results Exist State */}
            {reviews.length > 0 ? (
              <div className="space-y-6">
                {/* Summary Bar */}
                <SummaryBar 
                  positiveCount={stats.positive}
                  neutralCount={stats.neutral}
                  negativeCount={stats.negative}
                />

                {/* Table Control Bar */}
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-eco-dark">
                    {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'} analysed
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleExportCSV}
                      className="px-4 py-2 border border-eco-primary text-eco-primary font-semibold text-xs rounded-lg flex items-center gap-1.5 hover:bg-eco-primary/5 active:scale-95 transition-all cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Export CSV
                    </button>
                    <button
                      onClick={handleClearAll}
                      className="px-3 py-2 text-eco-muted hover:text-red-600 font-semibold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Clear All
                    </button>
                  </div>
                </div>

                {/* Table Component */}
                <ReviewTable 
                  reviews={reviews}
                  onReRun={handleReRunRow}
                  onUpdate={handleUpdateRow}
                  onDelete={handleDeleteRow}
                />
              </div>
            ) : (
              /* Empty State */
              <div className="bg-white border border-eco-border rounded-2xl p-12 text-center shadow-xs flex flex-col items-center justify-center min-h-[350px]">
                <div className="w-16 h-16 rounded-full bg-eco-bg flex items-center justify-center mb-4 text-eco-primary/60 border border-eco-border/40">
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c-1 3.5-2 6.5-6.5 10.2A7 7 0 0 1 11 20z" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M9 16c1.5-2.5 3-4 6-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h2 className="text-xl font-display font-semibold text-eco-dark mb-2">
                  Your analysis will appear here
                </h2>
                <p className="text-sm text-eco-muted max-w-sm">
                  Paste reviews on the left and click Analyse to begin. The AI will classify sentiment and suggest responses.
                </p>
              </div>
            )}
          </section>

        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto py-6 border-t border-eco-border bg-white text-center">
        <p className="text-xs text-eco-muted">
          &copy; {new Date().getFullYear()} Trishul Eco-Homestays. Internal Staff Portal.
        </p>
      </footer>
    </div>
  );
}
=======
import { useState, useCallback, useMemo } from 'react';
import { Download, Trash2, Leaf, RefreshCw, Layers, Sparkles } from 'lucide-react';
import SummaryBar from './components/SummaryBar';
import ReviewTable from './components/ReviewTable';
import DarkModeToggle from './components/ui/DarkModeToggle';

const DEFAULT_PLACEHOLDER = `The food was absolutely delicious! Fresh organic ingredients from their garden. The host was very warm.

The room was dusty and the bathroom wasn't clean when we arrived. Disappointed for this price.

Stunning mountain location and very peaceful. Great value, though finding the property was tricky.`;

export default function App() {
  const [inputText, setInputText] = useState('');
  const [reviews, setReviews] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Memoize summary stats counts
  const stats = useMemo(() => {
    let positive = 0;
    let neutral = 0;
    let negative = 0;
    reviews.forEach(r => {
      if (r.status === 'success') {
        if (r.sentiment === 'positive') positive++;
        else if (r.sentiment === 'neutral') neutral++;
        else if (r.sentiment === 'negative') negative++;
      }
    });
    return { positive, neutral, negative };
  }, [reviews]);

  /**
   * Helper to perform API classification for a single review at a given index
   */
  const classifySingleReview = useCallback(async (index, reviewsList = null) => {
    const targetList = reviewsList || reviews;
    const reviewItem = targetList[index];
    if (!reviewItem) return;

    // Update row status to loading
    setReviews(prev => prev.map((r, i) => i === index ? { ...r, status: 'loading', error: null } : r));

    try {
      // Real API Call
      const response = await fetch('/api/classify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ review: reviewItem.text }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setReviews(prev => prev.map((r, i) => i === index ? {
        ...r,
        status: 'success',
        sentiment: data.sentiment,
        theme: data.theme,
        response: data.response,
      } : r));
    } catch (err) {
      console.error(`Error classifying review at index ${index}:`, err);
      setReviews(prev => prev.map((r, i) => i === index ? {
        ...r,
        status: 'error',
        error: err.message,
      } : r));
    }
  }, [reviews]);

  /**
   * Main sequential batch processor
   */
  const analyseReviews = async () => {
    if (!inputText.trim()) return;

    // Split reviews by newline, filter empty, limit to 50
    const rawLines = inputText.split('\n');
    const filteredLines = rawLines
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .slice(0, 50);

    if (filteredLines.length === 0) return;

    // Setup initial reviews state
    const newReviews = filteredLines.map((text, idx) => ({
      id: `${Date.now()}-${idx}`,
      text,
      status: 'idle',
      sentiment: null,
      theme: null,
      response: null,
      error: null
    }));

    setReviews(newReviews);
    setIsProcessing(true);
    setCurrentIndex(0);

    // Sequentially process each review
    for (let i = 0; i < newReviews.length; i++) {
      setCurrentIndex(i);
      await classifySingleReview(i, newReviews);
    }

    setIsProcessing(false);
  };

  /**
   * Row-level re-run handler
   */
  const handleReRunRow = useCallback(async (index) => {
    await classifySingleReview(index);
  }, [classifySingleReview]);

  /**
   * Clear all reviews and inputs
   */
  const handleClearAll = () => {
    setReviews([]);
    setInputText('');
    setIsProcessing(false);
    setCurrentIndex(0);
  };

  /**
   * CSV Exporter
   */
  const handleExportCSV = () => {
    if (reviews.length === 0) return;

    const headers = ['#', 'Review', 'Sentiment', 'Theme', 'Suggested Response', 'Status'];
    const rows = reviews.map((r, idx) => [
      idx + 1,
      r.text,
      r.status === 'success' ? r.sentiment : '',
      r.status === 'success' ? r.theme : '',
      r.status === 'success' ? r.response : '',
      r.status
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `trishul_reviews_classification_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-eco-bg text-eco-dark antialiased">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-eco-border shadow-xs">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <svg className="w-10 h-10" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 38L20 14L30 31L34 25L42 38H6Z" fill="#A8D5B5" fillOpacity="0.4" stroke="#4CAF7D" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M26 22C32 20 37 23 37 29C37 34 33 37 29 37C25 37 22 33 22 28C22 25 24 23 26 22Z" fill="#4CAF7D" stroke="#FFFFFF" strokeWidth="1.5" />
              <path d="M22 28C26 31 29 37 29 37" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight text-eco-dark m-0 leading-none">
                Trishul Eco-Homestays
              </h1>
              <p className="text-[11px] text-eco-muted font-medium tracking-wide mt-1 uppercase">
                Understand every guest. Respond with care.
              </p>
            </div>
          </div>

          {/* Right Header: Tagline + Dark Mode Toggle */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-eco-muted font-medium tracking-wider bg-eco-bg/80 border border-eco-border px-3 py-1.5 rounded-full hidden sm:inline-flex items-center gap-1.5 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-eco-primary" />
              Review Intelligence · Powered by AI
            </span>
            <DarkModeToggle />
          </div>
        </div>
      </header>

      {/* Main Content Dashboard */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Side: Input & Configuration */}
          <section className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-eco-border rounded-2xl p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <label className="text-xs font-bold uppercase tracking-wider text-eco-muted flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-eco-primary" />
                  Paste Guest Reviews
                </label>
              </div>

              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={DEFAULT_PLACEHOLDER}
                disabled={isProcessing}
                className="w-full min-h-[200px] p-4 bg-eco-bg/30 border border-eco-border rounded-xl font-sans text-sm text-eco-dark placeholder-eco-muted/60 focus:outline-none focus:ring-2 focus:ring-eco-primary/20 focus:border-eco-primary transition-all resize-y disabled:opacity-60"
              />

              <div className="flex justify-between items-center mt-3 mb-5">
                <span className="text-xs text-eco-muted font-medium">
                  One review per line · supports batch of up to 50
                </span>
                {inputText && (
                  <span className="text-xs font-semibold text-eco-primary">
                    {inputText.split('\n').filter(l => l.trim().length > 0).length} reviews detected
                  </span>
                )}
              </div>

              <button
                onClick={analyseReviews}
                disabled={isProcessing || !inputText.trim()}
                className="w-full h-12 bg-eco-primary text-white font-semibold text-sm rounded-[14px] flex items-center justify-center gap-2 hover:bg-eco-primary-hover active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none shadow-xs cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Processing Batch...
                  </>
                ) : (
                  <>
                    <Leaf className="w-4 h-4" />
                    Analyse Reviews
                  </>
                )}
              </button>
            </div>
            
            {/* Quick Helper Info Card */}
            <div className="bg-white border border-eco-border rounded-2xl p-5 shadow-xs text-xs text-eco-muted space-y-2">
              <h3 className="font-semibold text-eco-dark uppercase tracking-wider text-[10px]">Staff Guide</h3>
              <p>1. The classifier automatically identifies key themes (Food, cleanliness, host, location, etc.) and tags sentiment.</p>
              <p>2. Suggested responses can be copied with one click to reply back to guests with a natural, caring tone.</p>
            </div>
          </section>

          {/* Right Side: Progress, Stats & Results */}
          <section className="lg:col-span-7 space-y-6">
            
            {/* Loading / Progress State */}
            {isProcessing && (
              <div className="bg-white border border-eco-border rounded-2xl p-5 shadow-xs animate-pulse">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-eco-dark">
                      Analysing reviews with AI…
                    </span>
                    {/* Bouncing Dots */}
                    <div className="flex space-x-1 items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-eco-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="w-1.5 h-1.5 bg-eco-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-1.5 h-1.5 bg-eco-primary rounded-full animate-bounce"></div>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-eco-primary">
                    {Math.round(((currentIndex + 1) / reviews.length) * 100)}%
                  </span>
                </div>
                
                {/* Progress Bar */}
                <div className="h-1.5 w-full bg-eco-primary/10 rounded-full overflow-hidden mb-2">
                  <div 
                    className="bg-eco-primary h-full transition-all duration-300 rounded-full"
                    style={{ width: `${((currentIndex + 1) / reviews.length) * 100}%` }}
                  ></div>
                </div>

                <div className="text-xs text-eco-muted font-medium">
                  Analysing review {currentIndex + 1} of {reviews.length}…
                </div>
              </div>
            )}

            {/* Results Exist State */}
            {reviews.length > 0 ? (
              <div className="space-y-6">
                {/* Summary Bar */}
                <SummaryBar 
                  positiveCount={stats.positive}
                  neutralCount={stats.neutral}
                  negativeCount={stats.negative}
                />

                {/* Table Control Bar */}
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-eco-dark">
                    {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'} analysed
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleExportCSV}
                      className="px-4 py-2 border border-eco-primary text-eco-primary font-semibold text-xs rounded-lg flex items-center gap-1.5 hover:bg-eco-primary/5 active:scale-95 transition-all cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Export CSV
                    </button>
                    <button
                      onClick={handleClearAll}
                      className="px-3 py-2 text-eco-muted hover:text-red-600 font-semibold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Clear All
                    </button>
                  </div>
                </div>

                {/* Table Component */}
                <ReviewTable 
                  reviews={reviews}
                  onReRun={handleReRunRow}
                />
              </div>
            ) : (
              /* Empty State */
              <div className="bg-white border border-eco-border rounded-2xl p-12 text-center shadow-xs flex flex-col items-center justify-center min-h-[350px]">
                <div className="w-16 h-16 rounded-full bg-eco-bg flex items-center justify-center mb-4 text-eco-primary/60 border border-eco-border/40">
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c-1 3.5-2 6.5-6.5 10.2A7 7 0 0 1 11 20z" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M9 16c1.5-2.5 3-4 6-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h2 className="text-xl font-display font-semibold text-eco-dark mb-2">
                  Your analysis will appear here
                </h2>
                <p className="text-sm text-eco-muted max-w-sm">
                  Paste reviews on the left and click Analyse to begin. The AI will classify sentiment and suggest responses.
                </p>
              </div>
            )}
          </section>

        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto py-6 border-t border-eco-border bg-white text-center">
        <p className="text-xs text-eco-muted">
          &copy; {new Date().getFullYear()} Trishul Eco-Homestays. Internal Staff Portal.
        </p>
      </footer>
    </div>
  );
}
>>>>>>> 5750c773f3f4c838418aec8aca7a39714945568f
