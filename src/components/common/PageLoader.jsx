/**
 * PageLoader - Brick building animation loader
 */

import { useState, useEffect } from 'react';

const PageLoader = ({ onLoadComplete }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => {
        setIsLoading(false);
        onLoadComplete?.();
      }, 500);
    }, 1800);

    return () => clearTimeout(timer);
  }, [onLoadComplete]);

  if (!isLoading) return null;

  return (
    <div className={`page-loader ${isExiting ? 'is-exiting' : ''}`}>
      <div className="loader-content">
        <div className="loader-bricks">
          <div className="loader-brick lb-1"></div>
          <div className="loader-brick lb-2"></div>
          <div className="loader-brick lb-3"></div>
          <div className="loader-brick lb-4"></div>
          <div className="loader-brick lb-5"></div>
          <div className="loader-brick lb-6"></div>
        </div>
        <div className="loader-text">Building...</div>
      </div>
    </div>
  );
};

export default PageLoader;