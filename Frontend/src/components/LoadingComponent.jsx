import { useState, useEffect } from 'react';

const LoadingComponent = ({ message, minDuration = 2000 }) => {
  const [currentQuote, setCurrentQuote] = useState(0);
  const [isMinDurationMet, setIsMinDurationMet] = useState(false);

  // Quotes in Kannada and English for Bengaluru context
  const bangaloreQuotes = [
    "Macha, biryani ready agtide...", // Friend, biryani is getting ready...
    "Ee masala dosa best saar!", // This masala dosa is the best, sir!
    "Chaat khano? Super maga!", // Want to eat chaat? Super, son!
    "One coffee ready maadi!", // Make one coffee ready!
    "Butter chicken bartha ide!", // Butter chicken is coming!
    "Paneer full loaded guru!", // Paneer is fully loaded, guru!
    "Namma Bengaluru best food!", // Our Bengaluru has the best food!
    "Macha wait maadi, superb food!", // Friend, wait, superb food!
    "Menu nodtidira? Bega decide maadi!", // Looking at the menu? Decide fast!
    "Tindi ready madtidini, cool!", // Making snacks ready, cool!
  ];

  // Enforce minimum display duration
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMinDurationMet(true);
    }, minDuration);

    return () => clearTimeout(timer);
  }, [minDuration]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % bangaloreQuotes.length);
    }, 3000); // Cycle quotes every 3 seconds

    return () => clearInterval(interval);
  }, [bangaloreQuotes.length]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-brand-offwhite p-6 text-brand-gray">
      {/* Animated Food Icons */}
      <div className="relative mb-8">
        <div className="flex gap-4 items-center">
          <span className="text-6xl text-brand-orange animate-bounce" style={{ animationDelay: '0ms' }}>🍔</span>
          <span className="text-6xl text-brand-orange animate-bounce" style={{ animationDelay: '200ms' }}>🍕</span>
          <span className="text-6xl text-brand-orange animate-bounce" style={{ animationDelay: '400ms' }}>🍜</span>
        </div>
      </div>

      {/* Loading Spinner */}
      <div className="relative mb-6">
        <div className="w-16 h-16 border-4 border-transparent border-t-brand-orange rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 bg-brand-orange rounded-full animate-pulse"></div>
        </div>
      </div>

      {/* Loading Message */}
      {message && (
        <div className="text-xl font-heading mb-4">
          {message}
        </div>
      )}

      {/* Bangalore Quote */}
      <div className="text-center max-w-md">
        <div key={currentQuote} className="text-brand-orange text-lg font-medium italic transition-opacity duration-500 ease-in-out animate-fade-in font-body">
          "{bangaloreQuotes[currentQuote]}"
        </div>
      </div>

      {/* Loading Dots */}
      <div className="flex gap-2 mt-6">
        <div className="w-3 h-3 bg-brand-orange rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
        <div className="w-3 h-3 bg-brand-orange rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></div>
        <div className="w-3 h-3 bg-brand-orange rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
      </div>
    </div>
  );
};

export default LoadingComponent;