"use client";

import { use } from "react";
import { subpageContent } from "@/data/subpageContent";
import { notFound } from "next/navigation";

export default function SubPage({ params }) {
  const resolvedParams = use(params);
  const { category, slug } = resolvedParams;
  const categoryData = subpageContent[category];
  const pageData = categoryData ? categoryData[slug] : null;

  if (!pageData) {
    notFound();
  }

  // Trigger modal function
  const openAuthModal = (tab = "signup") => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("open-auth-modal", { detail: tab }));
    }
  };

  return (
    <div className="subpage-main">
      {/* Hero Banner with Dark Theme Grid Overlay */}
      <section className="subpage-hero">
        <div className="subpage-hero-container">
          <h1 className="subpage-title">{pageData.title}</h1>
          <div className="subpage-breadcrumbs">
            <a href="/">Home</a>
            <span className="breadcrumb-separator">/</span>
            <span>{pageData.categoryName}</span>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-active">{pageData.title}</span>
          </div>
        </div>
      </section>

      {/* Body Content section */}
      <section className="subpage-body-section">
        <div className="subpage-body-container">
          <div className="subpage-content-grid">
            <div className="subpage-article">
              {pageData.sections.map((section, sIdx) => (
                <div key={sIdx} className="subpage-section-block">
                  {section.heading && <h2 className="subpage-heading">{section.heading}</h2>}
                  {section.paragraphs.map((p, pIdx) => (
                    <p key={pIdx} className="subpage-paragraph">{p}</p>
                  ))}
                </div>
              ))}
            </div>
            
            {/* Sidebar with CTA */}
            <div className="subpage-sidebar">
              <div className="sidebar-card glass-panel">
                <h3>Start Trading Today</h3>
                <p>Access 100+ instruments with competitive spreads and up to 1:500 leverage.</p>
                <button className="btn btn-filled w-full" onClick={() => openAuthModal("signup")}>
                  Open Free Account
                </button>
                <button className="btn btn-outline w-full" onClick={() => openAuthModal("login")}>
                  Sign In
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
