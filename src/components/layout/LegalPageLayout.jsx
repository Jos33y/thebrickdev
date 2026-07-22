/**
 * LegalPageLayout - Shared layout for Terms, Refund Policy, Privacy Policy
 *
 * Provides Header, hero block with title + last updated, narrow content
 * container, and Footer. Content is passed as children.
 */

import { useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';

const LegalPageLayout = ({ title, lastUpdated, children }) => {
  // Set document title for SEO / browser tab
  useEffect(() => {
    const previousTitle = document.title;
    document.title = `${title} · The Brick Dev Studios`;
    return () => {
      document.title = previousTitle;
    };
  }, [title]);

  return (
    <>
      <Header />

      <main className="legal-page">
        <div className="container">
          <header className="legal-hero">
            <span className="legal-hero-label">Legal</span>
            <h1 className="legal-hero-title">{title}</h1>
            <p className="legal-hero-meta">Last updated: {lastUpdated}</p>
          </header>

          <article className="legal-content">
            {children}
          </article>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default LegalPageLayout;
