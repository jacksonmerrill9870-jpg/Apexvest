"use client";
import LucideIcon from "@/components/LucideIcon";


import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function ClientShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  
  // Mobile Drawer State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeDrawerSubmenu, setActiveDrawerSubmenu] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState("login");

  // Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // Sync authentication state from localStorage
  useEffect(() => {
    const checkAuth = () => {
      const session = localStorage.getItem("isLoggedIn");
      setIsLoggedIn(session === "true");
    };
    checkAuth();
    window.addEventListener("auth-state-changed", checkAuth);
    return () => {
      window.removeEventListener("auth-state-changed", checkAuth);
    };
  }, []);

  // Handlers
  const openModal = (tab) => {
    setModalTab(tab);
    setIsModalOpen(true);
    setIsDrawerOpen(false);
    setLoginError("");
    if (typeof document !== "undefined") {
      document.body.style.overflow = "hidden";
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    if (typeof document !== "undefined") {
      document.body.style.overflow = "";
    }
  };

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
    if (typeof document !== "undefined") {
      document.body.style.overflow = !isDrawerOpen ? "hidden" : "";
    }
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();

    // First try to match against registered users in allUsers
    let allUsers = [];
    try { allUsers = JSON.parse(localStorage.getItem("allUsers") || "[]"); } catch (err) { allUsers = []; }

    const matchedUser = allUsers.find(
      u => u.userEmail.toLowerCase() === loginEmail.toLowerCase() && u.password === loginPassword
    );

    // Fall back to demo account
    const isDemoLogin =
      loginEmail.toLowerCase() === "demo@apexvest.com" && loginPassword === "password123";

    if (matchedUser) {
      // Point session at this user
      localStorage.setItem("currentUserId", matchedUser.id);
      localStorage.setItem("userName", matchedUser.userName);
      localStorage.setItem("userEmail", matchedUser.userEmail);
      localStorage.setItem("selectedPlan", matchedUser.selectedPlan || "crypto");
      localStorage.setItem("portfolioBalance", String(matchedUser.portfolioBalance || 0));
      localStorage.setItem("totalDeposits", String(matchedUser.totalDeposits || 0));
      localStorage.setItem("totalWithdrawals", String(matchedUser.totalWithdrawals || 0));
      localStorage.setItem("pendingWithdrawal", String(matchedUser.pendingWithdrawal || 0));
      localStorage.setItem("totalInvested", String(matchedUser.totalInvested || 0));
      localStorage.setItem("userTransactionsList", JSON.stringify(matchedUser.userTransactionsList || []));
      localStorage.setItem("adminBankWireInfo", matchedUser.adminBankWireInfo || "");
      localStorage.setItem("isLoggedIn", "true");
      setIsLoggedIn(true);
      setLoginError("");
      closeModal();
      window.dispatchEvent(new CustomEvent("auth-state-changed"));
      window.location.href = "/dashboard";
    } else if (isDemoLogin) {
      localStorage.setItem("isLoggedIn", "true");
      setIsLoggedIn(true);
      setLoginError("");
      closeModal();
      window.dispatchEvent(new CustomEvent("auth-state-changed"));
      window.location.href = "/dashboard";
    } else {
      setLoginError("Invalid email or password. Please try again.");
    }
  };

  const handleSignupSubmit = (e) => {
    e.preventDefault();
    const passwords = e.target.querySelectorAll('input[type="password"]');
    if (passwords.length === 2 && passwords[0].value !== passwords[1].value) {
      alert("Passwords do not match. Please verify your password confirmation.");
      return;
    }

    const nameInput = e.target.querySelector('input[placeholder="Enter Name"]');
    const emailInput = e.target.querySelector('input[placeholder="Enter Email"]');
    const passwordInput = passwords[0];
    const selectPlan = e.target.querySelector('select');

    const username = nameInput ? nameInput.value.trim() : "New User";
    const useremail = emailInput ? emailInput.value.trim() : "";
    const password = passwordInput ? passwordInput.value : "password123";
    const plan = selectPlan ? selectPlan.value : "crypto";

    // Check for duplicate email
    let allUsers = [];
    try { allUsers = JSON.parse(localStorage.getItem("allUsers") || "[]"); } catch (e) { allUsers = []; }
    if (allUsers.find(u => u.userEmail.toLowerCase() === useremail.toLowerCase())) {
      alert("An account with this email already exists. Please log in instead.");
      return;
    }

    // Create a new unique user record
    const newUserId = `user-${Date.now()}`;
    const newUser = {
      id: newUserId,
      userName: username,
      userEmail: useremail,
      password: password,
      selectedPlan: plan,
      portfolioBalance: 0,
      totalDeposits: 0,
      totalWithdrawals: 0,
      pendingWithdrawal: 0,
      totalInvested: 0,
      userTransactionsList: [],
      adminBankWireInfo: ""
    };

    allUsers.push(newUser);
    localStorage.setItem("allUsers", JSON.stringify(allUsers));

    // Point the session at the new user
    localStorage.setItem("currentUserId", newUserId);
    localStorage.setItem("userName", username);
    localStorage.setItem("userEmail", useremail);
    localStorage.setItem("selectedPlan", plan);
    localStorage.setItem("portfolioBalance", "0");
    localStorage.setItem("portfolioValue", "0");
    localStorage.setItem("totalDeposits", "0");
    localStorage.setItem("totalWithdrawals", "0");
    localStorage.setItem("pendingWithdrawal", "0");
    localStorage.setItem("totalInvested", "0");
    localStorage.removeItem("userTransactionsList");
    localStorage.removeItem("userActivities");
    localStorage.removeItem("activeInvestmentPlan");
    localStorage.removeItem("premiumInvestedAmount");
    localStorage.removeItem("diamondDuration");
    localStorage.removeItem("premiumDuration");
    localStorage.removeItem("investmentEndTime");

    localStorage.setItem("isLoggedIn", "true");
    setIsLoggedIn(true);
    closeModal();
    window.dispatchEvent(new CustomEvent("auth-state-changed"));
    window.location.href = "/dashboard";
  };

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    setIsLoggedIn(false);
    window.dispatchEvent(new CustomEvent("auth-state-changed"));
    window.location.href = "/";
  };

  // Re-run Lucide icon builder on route changes
  useEffect(() => {
    if (typeof window !== "undefined" && window.lucide) {
      window.lucide.createIcons();
    }
  }, [pathname]);

  // Global Auth Modal event listener
  useEffect(() => {
    const handleOpenModal = (e) => {
      const tab = e.detail || "login";
      openModal(tab);
    };
    if (typeof window !== "undefined") {
      window.addEventListener("open-auth-modal", handleOpenModal);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("open-auth-modal", handleOpenModal);
      }
    };
  }, []);

  const isDashboard = pathname && (pathname.startsWith("/dashboard") || pathname.startsWith("/admin"));

  if (isDashboard) {
    return <>{children}</>;
  }

  return (
    <>
      {/* Header Navigation */}
      <header className="main-header">
        <div className="header-container">
          <a href="/" className="logo">
            <div className="logo-icon"></div>
            <span className="logo-text">
              APEX<span>VEST</span>
            </span>
          </a>

          {/* Navigation Links with Dropdowns */}
          <nav className="nav-menu">
            <ul>
              <li className="nav-item has-dropdown">
                <a href="#" className="nav-link">
                  Forex/CFD <LucideIcon name="chevron-down" className="nav-arrow" />
                </a>
                <div className="dropdown-menu">
                  <div className="dropdown-grid">
                    <div className="dropdown-col">
                      <ul>
                        <li><a href="/forex-cfd/cfd-trading"><LucideIcon name="trending-up" /> CFD Trading</a></li>
                        <li><a href="/forex-cfd/how-is-it-done"><LucideIcon name="help-circle" /> How is it Done?</a></li>
                        <li><a href="/forex-cfd/cfd-strategies"><LucideIcon name="bar-chart-2" /> CFD strategies</a></li>
                        <li><a href="/forex-cfd/forex-trading"><LucideIcon name="coins" /> Forex Trading</a></li>
                        <li><a href="/forex-cfd/strategies-for-forex"><LucideIcon name="sliders" /> Strategies for Forex</a></li>
                        <li><a href="/forex-cfd/cfd-glossary"><LucideIcon name="book-open" /> CFD Glossary</a></li>
                      </ul>
                    </div>
                  </div>
                </div>
              </li>

              <li className="nav-item has-dropdown">
                <a href="#" className="nav-link">
                  Market <LucideIcon name="chevron-down" className="nav-arrow" />
                </a>
                <div className="dropdown-menu">
                  <div className="dropdown-grid">
                    <div className="dropdown-col">
                      <ul>
                        <li><a href="/market/forex"><LucideIcon name="globe" /> Forex</a></li>
                        <li><a href="/market/crude-oil"><LucideIcon name="droplet" /> Crude Oil</a></li>
                        <li><a href="/market/bitcoin"><LucideIcon name="bitcoin" /> Bitcoin</a></li>
                        <li><a href="/market/commodities"><LucideIcon name="shopping-bag" /> Commodities</a></li>
                        <li><a href="/market/stock-indices"><LucideIcon name="activity" /> Stock Indices</a></li>
                      </ul>
                    </div>
                  </div>
                </div>
              </li>

              <li className="nav-item has-dropdown">
                <a href="#" className="nav-link">
                  Premium Platforms <LucideIcon name="chevron-down" className="nav-arrow" />
                </a>
                <div className="dropdown-menu">
                  <div className="dropdown-grid">
                    <div className="dropdown-col">
                      <ul>
                        <li><a href="/premium-platforms/premium-trader"><LucideIcon name="monitor" /> Premium Trader</a></li>
                        <li><a href="/premium-platforms/metatrader-4"><LucideIcon name="cpu" /> MetaTrader 4</a></li>
                        <li><a href="/premium-platforms/metatrader-5"><LucideIcon name="terminal" /> MetaTrader 5</a></li>
                      </ul>
                    </div>
                  </div>
                </div>
              </li>

              <li className="nav-item has-dropdown">
                <a href="#" className="nav-link">
                  Education <LucideIcon name="chevron-down" className="nav-arrow" />
                </a>
                <div className="dropdown-menu">
                  <div className="dropdown-grid">
                    <div className="dropdown-col">
                      <ul>
                        <li><a href="/education/trader-course"><LucideIcon name="graduation-cap" /> Trader Course</a></li>
                        <li><a href="/education/trading-strategies"><LucideIcon name="compass" /> Trading Strategies</a></li>
                      </ul>
                    </div>
                  </div>
                </div>
              </li>

              <li className="nav-item has-dropdown">
                <a href="#" className="nav-link">
                  Why Us <LucideIcon name="chevron-down" className="nav-arrow" />
                </a>
                <div className="dropdown-menu">
                  <div className="dropdown-grid">
                    <div className="dropdown-col">
                      <ul>
                        <li><a href="/why-us/about-us"><LucideIcon name="info" /> About Us</a></li>
                        <li><a href="/why-us/wide-range-of-markets"><LucideIcon name="layers" /> Wide Range of Markets</a></li>
                        <li><a href="/why-us/low-trading-costs"><LucideIcon name="percent" /> Low Trading Costs</a></li>
                        <li><a href="/why-us/contact-us"><LucideIcon name="phone" /> Contact Us</a></li>
                      </ul>
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </nav>

          <div className="cta-buttons">
            {isLoggedIn ? (
              <>
                <a href="/dashboard" className="btn btn-outline" style={{ display: "inline-flex" }}>Dashboard</a>
                <button className="btn btn-filled" onClick={handleLogout}>Log Out</button>
              </>
            ) : (
              <>
                <button className="btn btn-outline" onClick={() => openModal("login")}>Log In</button>
                <button className="btn btn-filled" onClick={() => openModal("signup")}>Sign up</button>
              </>
            )}
            <button className="mobile-menu-toggle" onClick={toggleDrawer} aria-label="Toggle Navigation Menu">
              <LucideIcon name="menu" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Navigation */}
      <div className={`mobile-drawer ${isDrawerOpen ? "active" : ""}`}>
        <div className="drawer-header">
          <a href="/" className="logo">
            <div className="logo-icon"></div>
            <span className="logo-text">APEX<span>VEST</span></span>
          </a>
          <button className="mobile-menu-close" onClick={toggleDrawer}>
            <LucideIcon name="x" />
          </button>
        </div>
        <nav className="drawer-nav">
          <ul>
            <li className="drawer-item">
              <button className={`drawer-trigger ${activeDrawerSubmenu === "forex" ? "active" : ""}`} onClick={() => setActiveDrawerSubmenu(activeDrawerSubmenu === "forex" ? null : "forex")}>
                Forex/CFD <LucideIcon name="chevron-down" />
              </button>
              <ul className={`drawer-submenu ${activeDrawerSubmenu === "forex" ? "active" : ""}`}>
                <li><a href="/forex-cfd/cfd-trading" onClick={toggleDrawer}>CFD Trading</a></li>
                <li><a href="/forex-cfd/how-is-it-done" onClick={toggleDrawer}>How is it Done?</a></li>
                <li><a href="/forex-cfd/cfd-strategies" onClick={toggleDrawer}>CFD strategies</a></li>
                <li><a href="/forex-cfd/forex-trading" onClick={toggleDrawer}>Forex Trading</a></li>
                <li><a href="/forex-cfd/strategies-for-forex" onClick={toggleDrawer}>Strategies for Forex</a></li>
                <li><a href="/forex-cfd/cfd-glossary" onClick={toggleDrawer}>CFD Glossary</a></li>
              </ul>
            </li>
            <li className="drawer-item">
              <button className={`drawer-trigger ${activeDrawerSubmenu === "market" ? "active" : ""}`} onClick={() => setActiveDrawerSubmenu(activeDrawerSubmenu === "market" ? null : "market")}>
                Market <LucideIcon name="chevron-down" />
              </button>
              <ul className={`drawer-submenu ${activeDrawerSubmenu === "market" ? "active" : ""}`}>
                <li><a href="/market/forex" onClick={toggleDrawer}>Forex</a></li>
                <li><a href="/market/crude-oil" onClick={toggleDrawer}>Crude Oil</a></li>
                <li><a href="/market/bitcoin" onClick={toggleDrawer}>Bitcoin</a></li>
                <li><a href="/market/commodities" onClick={toggleDrawer}>Commodities</a></li>
                <li><a href="/market/stock-indices" onClick={toggleDrawer}>Stock Indices</a></li>
              </ul>
            </li>
            <li className="drawer-item">
              <button className={`drawer-trigger ${activeDrawerSubmenu === "platforms" ? "active" : ""}`} onClick={() => setActiveDrawerSubmenu(activeDrawerSubmenu === "platforms" ? null : "platforms")}>
                Premium Platforms <LucideIcon name="chevron-down" />
              </button>
              <ul className={`drawer-submenu ${activeDrawerSubmenu === "platforms" ? "active" : ""}`}>
                <li><a href="/premium-platforms/premium-trader" onClick={toggleDrawer}>Premium Trader</a></li>
                <li><a href="/premium-platforms/metatrader-4" onClick={toggleDrawer}>MetaTrader 4</a></li>
                <li><a href="/premium-platforms/metatrader-5" onClick={toggleDrawer}>MetaTrader 5</a></li>
              </ul>
            </li>
            <li className="drawer-item">
              <button className={`drawer-trigger ${activeDrawerSubmenu === "education" ? "active" : ""}`} onClick={() => setActiveDrawerSubmenu(activeDrawerSubmenu === "education" ? null : "education")}>
                Education <LucideIcon name="chevron-down" />
              </button>
              <ul className={`drawer-submenu ${activeDrawerSubmenu === "education" ? "active" : ""}`}>
                <li><a href="/education/trader-course" onClick={toggleDrawer}>Trader Course</a></li>
                <li><a href="/education/trading-strategies" onClick={toggleDrawer}>Trading Strategies</a></li>
              </ul>
            </li>
            <li className="drawer-item">
              <button className={`drawer-trigger ${activeDrawerSubmenu === "whyus" ? "active" : ""}`} onClick={() => setActiveDrawerSubmenu(activeDrawerSubmenu === "whyus" ? null : "whyus")}>
                Why Us <LucideIcon name="chevron-down" />
              </button>
              <ul className={`drawer-submenu ${activeDrawerSubmenu === "whyus" ? "active" : ""}`}>
                <li><a href="/why-us/about-us" onClick={toggleDrawer}>About Us</a></li>
                <li><a href="/why-us/wide-range-of-markets" onClick={toggleDrawer}>Wide Range of Markets</a></li>
                <li><a href="/why-us/low-trading-costs" onClick={toggleDrawer}>Low Trading Costs</a></li>
                <li><a href="/why-us/contact-us" onClick={toggleDrawer}>Contact Us</a></li>
              </ul>
            </li>
          </ul>
        </nav>
        <div className="drawer-ctas">
          {isLoggedIn ? (
            <>
              <a href="/dashboard" className="btn btn-outline w-full" onClick={toggleDrawer}>Dashboard</a>
              <button className="btn btn-filled w-full" onClick={() => { handleLogout(); toggleDrawer(); }}>Log Out</button>
            </>
          ) : (
            <>
              <button className="btn btn-outline w-full" onClick={() => openModal("login")}>Log In</button>
              <button className="btn btn-filled w-full" onClick={() => openModal("signup")}>Sign up</button>
            </>
          )}
        </div>
      </div>
      <div className={`drawer-overlay ${isDrawerOpen ? "active" : ""}`} onClick={toggleDrawer}></div>

      {/* Main Content Render */}
      {children}

      {/* Footer */}
      <footer className="main-footer">
        <div className="footer-container">
          <div className="footer-col branding-col">
            <a href="/" className="logo">
              <div className="logo-icon"></div>
              <span className="logo-text">APEX<span>VEST</span></span>
            </a>
            <p className="footer-risk">
              Trading in Forex/CFD carry a high level of risk to your capital due to the volatility of the underlying market. These products may not be suitable for all investors. Therefore, you should ensure that you understand the risk involved.
            </p>
          </div>
          
          <div className="footer-col contact-col">
            <h4>Contact Apexvest Online</h4>
            <ul className="footer-links">
              <li>
                <LucideIcon name="phone" className="footer-icon" />
                <span>Phone: +1 (803) 398-3209</span>
              </li>
              <li>
                <LucideIcon name="mail" className="footer-icon" />
                <span>Mail: support@example.com</span>
              </li>
            </ul>
          </div>
          
          <div className="footer-col menu-col">
            <h4>Menu</h4>
            <ul className="footer-links">
              <li><a href="/why-us/about-us">About Us</a></li>
              <li><a href="/forex-cfd/forex-trading">Forex</a></li>
              <li><a href="/market/crude-oil">Crude Oil</a></li>
            </ul>
          </div>
          
          <div className="footer-col overview-col">
            <h4>Company & Group Overview</h4>
            <p className="footer-overview-text">
              Apexvest is a Switzerland-based innovative company, headquartered in Geneva, founded in 2004 by Andre and Veronika Duka. It offers internet and mobile trading services.
            </p>
          </div>
        </div>
        
        <div className="footer-bottom">
          <div className="footer-bottom-container">
            <p>&copy; 2026 Apexvest Group. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <div className={`modal-overlay ${isModalOpen ? "active" : ""}`} onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
        <div className="modal-card glass-panel modal-auth-white">
          <button className="modal-close" onClick={closeModal}><LucideIcon name="x" /></button>
          
          <div className="modal-tabs">
            <button className={`modal-tab ${modalTab === "login" ? "active" : ""}`} onClick={() => setModalTab("login")}>Log In</button>
            <button className={`modal-tab ${modalTab === "signup" ? "active" : ""}`} onClick={() => setModalTab("signup")}>Sign Up</button>
          </div>

          <form className={`modal-form ${modalTab === "login" ? "active" : ""}`} onSubmit={handleLoginSubmit}>
            <h2>Welcome Back</h2>
            {loginError && (
              <div className="error-banner" style={{ 
                color: "var(--color-red)", 
                backgroundColor: "var(--color-red-soft)", 
                padding: "10px", 
                borderRadius: "8px", 
                marginBottom: "15px", 
                fontSize: "14px", 
                border: "1px solid rgba(255, 23, 68, 0.2)",
                textAlign: "center"
              }}>
                {loginError}
              </div>
            )}
            <div className="form-group">
              <label>Email Address</label>
              <div className="input-wrapper">
                <LucideIcon name="mail" className="input-icon" />
                <input 
                  type="email" 
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="Enter Email"
                  required 
                />
              </div>
            </div>
            <div className="form-group">
              <label>Password</label>
              <div className="input-wrapper">
                <LucideIcon name="lock" className="input-icon" />
                <input 
                  type="password" 
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Password"
                  required 
                />
              </div>
            </div>
            <button type="submit" className="btn btn-filled w-full btn-large">Log In to Portfolio</button>
          </form>

          <form className={`modal-form ${modalTab === "signup" ? "active" : ""}`} onSubmit={handleSignupSubmit}>
            <h2>Create Free Account</h2>
            
            <div className="form-group">
              <label>Enter Name</label>
              <div className="input-wrapper">
                <LucideIcon name="user" className="input-icon" />
                <input type="text" placeholder="Enter Name" required />
              </div>
            </div>
            
            <div className="form-group">
              <label>Enter Email</label>
              <div className="input-wrapper">
                <LucideIcon name="mail" className="input-icon" />
                <input type="email" placeholder="Enter Email" required />
              </div>
            </div>

            <div className="form-group">
              <label>Select Investment</label>
              <div className="input-wrapper">
                <LucideIcon name="trending-up" className="input-icon" />
                <select required className="select-input" defaultValue="">
                  <option value="" disabled hidden>Select Investment</option>
                  <option value="crude-oil">Crude Oil</option>
                  <option value="crypto">Crypto Currency</option>
                  <option value="stock">Stock</option>
                  <option value="forex">Forex</option>
                  <option value="nfts">Non fungible Tokens NFTs</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Enter Password</label>
              <div className="input-wrapper">
                <LucideIcon name="lock" className="input-icon" />
                <input type="password" placeholder="Enter Password" required />
              </div>
            </div>

            <div className="form-group">
              <label>Confirm Password</label>
              <div className="input-wrapper">
                <LucideIcon name="lock" className="input-icon" />
                <input type="password" placeholder="Confirm Password" required />
              </div>
            </div>

            <button type="submit" className="btn btn-filled w-full btn-large">Create Account</button>
            
            <div className="modal-footer-text">
              Already a member ? <button type="button" className="btn-link" onClick={() => setModalTab("login")}>login</button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
