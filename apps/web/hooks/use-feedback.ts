import * as React from "react"

export function useFeedback() {
  const [feedback, setFeedback] = React.useState<'up' | 'down' | null>(null);
  const [animating, setAnimating] = React.useState(false);
  
  const handleFeedback = (type: 'up' | 'down') => {
    setAnimating(true);
    setFeedback(prev => prev === type ? null : type);
    
    setTimeout(() => {
      setAnimating(false);
    }, 500);
  };

  return { feedback, animating, handleFeedback };
} 