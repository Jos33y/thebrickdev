/**
 * LegalPageLayout - Shared layout for Terms, Refund Policy, Privacy Policy, About Us
 *
 * Provides Header, hero block with title + optional last updated, narrow content
 * container, and Footer. Content is passed as children.
 *
 * Props:
 *   title       - required, main page title
 *   label       - optional, defaults to "Legal" (also accepts "Company" etc.)
 *   lastUpdated - optional, hides the meta line if omitted
 *   children    - page body content
 */

import { useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';

const LegalPageLayout = ({ title, lastUpdated, label = 'Legal', children }) => {
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
            <span className="legal-hero-label">{label}</span>
            <h1 className="legal-hero-title">{title}</h1>
            {lastUpdated && (
              <p className="legal-hero-meta">Last updated: {lastUpdated}</p>
            )}
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
