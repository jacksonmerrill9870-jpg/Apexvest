"use client";
import LucideIcon from "@/components/LucideIcon";


import { useEffect, useState } from "react";

export default function Home() {
  // Hero Carousel State
  const [currentSlide, setCurrentSlide] = useState(0);

  const heroSlides = [
    {
      title: <>Invest in Forex &amp; CFDs.<br />Earn Up to 18% Returns.</>,
      subtitle: "Across the globe, 17,000+ investors have found a smarter way to earn—investing in secure financial markets that offer both safety and steady passive income opportunities."
    },
    {
      title: <>Advanced Instruments.<br />Industry-Leading Execution.</>,
      subtitle: "Trade on currency pairs, digital assets, commodities, and stock indices with competitive spreads, leverage up to 1:500, and institutional-grade technology."
    },
    {
      title: <>Segregated Vault Accounts.<br />24/7 Priority Support.</>,
      subtitle: "Your capital is guarded in tier-1 segregated banking vaults. Feel supported at every step with our round-the-clock priority customer success team."
    }
  ];

  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(slideInterval);
  }, []);

  // Market Ticker Setup
  const tickerItems = [
    { sym: "EURUSD", name: "EUR/USD", val: 1.0845, change: 0.12, up: true },
    { sym: "GBPUSD", name: "GBP/USD", val: 1.2721, change: 0.08, up: true },
    { sym: "USDJPY", name: "USD/JPY", val: 156.42, change: -0.15, up: false },
    { sym: "BTCUSD", name: "BTC/USD", val: 68450.0, change: 2.34, up: true },
    { sym: "ETHUSD", name: "ETH/USD", val: 3820.5, change: 1.85, up: true },
    { sym: "XAUUSD", name: "Gold", val: 2325.8, change: -0.45, up: false },
    { sym: "USOIL", name: "Crude Oil", val: 78.34, change: -0.22, up: false },
  ];

  const [prices, setPrices] = useState(tickerItems);

  useEffect(() => {
    // Live Ticker Fluctuation Simulation
    const interval = setInterval(() => {
      setPrices((prev) => {
        const next = [...prev];
        const idx = Math.floor(Math.random() * next.length);
        const item = { ...next[idx] };

        const isBtc = item.sym === "BTCUSD";
        const percentChange = Math.random() * 0.15 - 0.075;
        const delta = item.val * (percentChange / 100);
        item.val += delta;
        item.change += percentChange;
        item.up = item.change >= 0;

        next[idx] = item;
        return next;
      });
    }, 800);

    return () => clearInterval(interval);
  }, []);

  const openAuthModal = (tab = "signup") => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("open-auth-modal", { detail: tab }));
    }
  };

  return (
    <main>
      {/* Hero Section */}
      <section
        className="hero-section"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 30%, rgba(226, 255, 59, 0.06) 0%, transparent 50%), linear-gradient(to right, rgba(11, 13, 16, 0.96) 30%, rgba(11, 13, 16, 0.4) 100%), url('/hero-bg.png')`,
        }}
      >
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-carousel-wrapper">
              {heroSlides.map((slide, idx) => (
                <div
                  key={idx}
                  className={`hero-slide ${currentSlide === idx ? "active" : ""}`}
                >
                  <h1 className="hero-title">{slide.title}</h1>
                  <p className="hero-subtitle">{slide.subtitle}</p>
                </div>
              ))}
            </div>

            <div className="carousel-indicators">
              {heroSlides.map((_, idx) => (
                <button
                  key={idx}
                  className={`indicator-dot ${currentSlide === idx ? "active" : ""}`}
                  onClick={() => setCurrentSlide(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                ></button>
              ))}
            </div>

            <div className="hero-actions">
              <button className="btn btn-filled btn-large" onClick={() => openAuthModal("signup")}>
                Start Investing Now
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Live Market Ticker */}
      <section className="ticker-section">
        <div className="ticker-container">
          <div className="ticker-title">
            <span className="live-pulse"></span>
            <span>Live Market Feed</span>
          </div>
          <div className="ticker-wrapper">
            <div className="ticker-track">
              {/* Duplicate lists to ensure continuous seamless scroll */}
              {[...prices, ...prices, ...prices].map((item, idx) => (
                <div className="ticker-item" key={idx}>
                  <span className="ticker-name">{item.name}</span>
                  <span
                    className="ticker-val"
                    style={{ color: item.up ? "var(--color-green)" : "var(--color-red)", transition: "color 1s ease" }}
                  >
                    {item.val > 100 ? item.val.toFixed(2) : item.val.toFixed(4)}
                  </span>
                  <span className={`ticker-change ${item.up ? "up" : "down"}`}>
                    {item.up ? "+" : ""}
                    {item.change.toFixed(2)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why Traders Choose Section */}
      <section className="why-choose-section">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">Why Traders Choose Apexvest</h2>
          </div>
          <div className="why-choose-grid">
            <div className="why-choose-col">
              <h3 className="why-choose-h3">Clear & competitive pricing</h3>
              <p className="why-choose-p">Maximize your potential with straightforward pricing and exceptional trade executions.</p>
            </div>
            <div className="why-choose-col">
              <h3 className="why-choose-h3">Real time market analysis</h3>
              <p className="why-choose-p">Stay ahead of price action with access to actionable market insights, real time trade signals and more.</p>
            </div>
            <div className="why-choose-col">
              <h3 className="why-choose-h3">Professional trading platforms</h3>
              <p className="why-choose-p">Trade with maximum control on our advanced forex trading platforms optimized for currency traders.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Markets Section */}
      <section className="markets-section">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">Markets</h2>
          </div>
          <div className="markets-grid">
            {/* Bitcoin Card */}
            <div className="market-card glass-panel">
              <div className="market-icon-wrapper">
                <LucideIcon name="bitcoin" className="market-icon" />
              </div>
              <h3 className="market-card-title">Bitcoin</h3>
              <p className="market-card-text">
                Our Bitcoin Spreads let you trade the price of Bitcoin (based on the trusted TeraBit Index<sup>SM</sup>) without having to own bitcoins. There's no need for wallets or conversion, since the contracts are settled in US dollars.
              </p>
            </div>
            {/* Commodities Card */}
            <div className="market-card glass-panel">
              <div className="market-icon-wrapper">
                <LucideIcon name="coins" className="market-icon" />
              </div>
              <h3 className="market-card-title">Commodities</h3>
              <p className="market-card-text">
                Commodities are basic to our daily life, which makes the commodity futures markets among the largest, with huge trading volumes. Binary options and spreads give you a different way to trade commodities—with limited risk and a lower cost of entry. You can never be stopped out or get a margin call.
              </p>
            </div>
            {/* Stock Indices Card */}
            <div className="market-card glass-panel">
              <div className="market-icon-wrapper">
                <LucideIcon name="trending-up" className="market-icon" />
              </div>
              <h3 className="market-card-title">Stock Indices</h3>
              <p className="market-card-text">
                With the security of limited risk and a regulated exchange, trading the short-term movements of the stock market can be a source of pleasure as well as profit. Binary options and spreads open the stock index futures markets to individual traders with low costs and competitive trading conditions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trading Platforms Section */}
      <section className="platforms-section">
        <div className="section-container">
          <div className="platforms-grid">
            <div className="platforms-left">
              <h2 className="platforms-title">Access The Financial Market All In One Place!</h2>
              <p className="platforms-desc">
                Trade Forex/CFDs all on our advanced, web-based trading platform designed with you, the user in mind. With our platform, you can trade on the largest lists of assets in the industry. From Currency pairs, and Commodities to stocks and indices, we have it all. Keep your trading costs down with competitive spreads, commissions and low margins. View spreads on our most popular cash instruments.
              </p>
            </div>
            <div className="platforms-right">
              <div className="platform-info-card glass-panel">
                <h3 className="platform-card-title">MetaTrader 4 and MetaTrader 5</h3>
                <p className="platform-card-desc">
                  The MetaTrader platform is one of the most popular charting and analysis softwares used by traders of all levels. The MetaTrader comes with all of the most popular charting tools and offers immediate order execution and real-time results. With MetaTrader, you can now monitor the market closely and have a better decision of when to open positions with CFD and FOREX.
                </p>
                <ul className="platform-points">
                  <li>
                    <LucideIcon name="check-circle" className="point-icon" />
                    <span>Advanced trading tools and powerful, multi-platform technology.</span>
                  </li>
                  <li>
                    <LucideIcon name="check-circle" className="point-icon" />
                    <span>Low margins and competitive charges.</span>
                  </li>
                </ul>
              </div>
              <div className="mockup-container">
                <img src="/mobile-mockup.png" alt="Mobile Trading Mockup" className="mockup-img" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">Testimonials</h2>
          </div>
          <div className="testimonials-grid">
            {/* Card 1 */}
            <div className="testimonial-card glass-panel">
              <div className="testimonial-header">
                <div className="flag-circle">🇨🇭</div>
                <h4 className="testimonial-name">Lucas</h4>
              </div>
              <p className="testimonial-text">
                "Thanks for making good use of my money guys. Thumbs up."
              </p>
            </div>
            {/* Card 2 */}
            <div className="testimonial-card glass-panel">
              <div className="testimonial-header">
                <div className="flag-circle">🇬🇧</div>
                <h4 className="testimonial-name">Griffin</h4>
              </div>
              <p className="testimonial-text">
                "I am forever grateful to you all for this opportunity.."
              </p>
            </div>
            {/* Card 3 */}
            <div className="testimonial-card glass-panel">
              <div className="testimonial-header">
                <div className="flag-circle">🇨🇭</div>
                <h4 className="testimonial-name">Marcel</h4>
              </div>
              <p className="testimonial-text">
                "My weekly returns here is more than what I earn monthly at my work place. (^_^)"
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="section-container">
          <div className="cta-content glass-panel">
            <h2 className="cta-heading">Smooth. Adaptable. Reliable.</h2>
            <p className="cta-subheading">
              Trade forex, synthetics, stocks &amp; indices, cryptocurrencies, basket indices, and commodities. 100+ tradeable assets
            </p>
            <button className="btn btn-filled btn-large" onClick={() => openAuthModal("signup")}>
              Open A Free Account
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
