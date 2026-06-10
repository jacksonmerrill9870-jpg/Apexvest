"use client";
import LucideIcon from "@/components/LucideIcon";
import { supabase } from "@/lib/supabaseClient";


import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Demo login credentials state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Tabs and view toggles
  const [activeTab, setActiveTab] = useState("1M");
  const [activeView, setActiveView] = useState("dashboard"); // "dashboard", "investments", "wallet", "transactions", or "settings"

  // Dashboard Dynamic States
  const [userName, setUserName] = useState("Alex Johnson");
  const [selectedPlan, setSelectedPlan] = useState("crypto");
  const [baseAmount, setBaseAmount] = useState(0); // default to $0
  const [activities, setActivities] = useState([]);

  // Wallet and Payout tracking states
  const [totalDeposits, setTotalDeposits] = useState(0);
  const [totalWithdrawals, setTotalWithdrawals] = useState(0);
  const [pendingWithdrawal, setPendingWithdrawal] = useState(0);
  const [totalInvested, setTotalInvested] = useState(0);

  const PLAN_LABELS = {
    "crypto": "Crypto Currency",
    "crude-oil": "Crude Oil",
    "stock": "Stock",
    "forex": "Forex",
    "nfts": "Non fungible Tokens NFTs"
  };

  const PLAN_ROIS = {
    "crypto": 0.28,
    "crude-oil": 0.12,
    "stock": 0.14,
    "forex": 0.18,
    "nfts": 0.22
  };

  // Dynamic Payout Transactions Ledger list
  const [transactionsList, setTransactionsList] = useState([]);
  const [txnFilter, setTxnFilter] = useState("all"); // "all", "deposit", "withdrawal", "pending"

  // Settings category and form states
  const [settingsTab, setSettingsTab] = useState("profile"); // "profile" or "wallets"
  const [formUserName, setFormUserName] = useState("");
  const [formUserEmail, setFormUserEmail] = useState("");
  const [withdrawBTCAddr, setWithdrawBTCAddr] = useState("");
  const [withdrawBankName, setWithdrawBankName] = useState("");
  const [withdrawAccountNum, setWithdrawAccountNum] = useState("");

  // In-page Quick Transaction inputs
  const [depositAmount, setDepositAmount] = useState("");
  const [depositMethod, setDepositMethod] = useState("");
  const [depositReceipt, setDepositReceipt] = useState("");
  const [depositReceiptName, setDepositReceiptName] = useState("");
  const [depositReceiptFile, setDepositReceiptFile] = useState(null);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawMethod, setWithdrawMethod] = useState("");

  // Dynamic 10-minute countdown timers (600 seconds)
  const [btcTimer, setBtcTimer] = useState(600);
  const [usdtTimer, setUsdtTimer] = useState(600);
  
  // Mobile Menu State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [adminBankWireInfo, setAdminBankWireInfo] = useState("");
  const [wireRecipientName, setWireRecipientName] = useState("");
  const [wireRecipientAddress, setWireRecipientAddress] = useState("");
  const [wireBankName, setWireBankName] = useState("");
  const [wireRoutingNumber, setWireRoutingNumber] = useState("");
  const [wireAccountNumber, setWireAccountNumber] = useState("");
  const [copiedField, setCopiedField] = useState("");
  
  // Notifications State
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationsList, setNotificationsList] = useState([]);

  // Destination payout fields (bind directly to page input states)
  const [withdrawAddress, setWithdrawAddress] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");

  // Plan investment states
  const [selectedPlanDurations, setSelectedPlanDurations] = useState({}); // { [planId]: duration }
  const [selectedPlanAmounts, setSelectedPlanAmounts] = useState({}); // { [planId]: amount }
  const [activeInvestmentPlan, setActiveInvestmentPlan] = useState(null); // stores active plan ID
  const [investmentTimeRemaining, setInvestmentTimeRemaining] = useState(0);
  const [dynamicPlans, setDynamicPlans] = useState([
    { id: "diamond", name: "Diamond Plan", roi: "20%", minDeposit: 500, depositType: "fixed", fixedAmount: 500, duration: "1 month" },
    { id: "premium", name: "Premium Plan", roi: "40%", minDeposit: 1500, depositType: "range", minDeposit: 1500, maxDeposit: 10000, duration: "1 month" }
  ]);

  const DURATION_SECONDS = {
    "one day": 86400,
    "three days": 259200,
    "one week": 604800,
    "two weeks": 1209600,
    "one month": 2592000,
    "two months": 5184000,
    "three months": 7776000,
    "four months": 10368000,
    "five months": 12960000,
    "six months": 15552000,
    "seven months": 18144000,
    "eight months": 20736000,
    "nine months": 23328000,
    "ten months": 25920000,
    "eleven months": 28512000,
    "one year": 31536000
  };

  const DURATION_MULTIPLIERS = {
    "one day": 1 / 30,
    "three days": 3 / 30,
    "one week": 7 / 30,
    "two weeks": 14 / 30,
    "one month": 1,
    "two months": 2,
    "three months": 3,
    "four months": 4,
    "five months": 5,
    "six months": 6,
    "seven months": 7,
    "eight months": 8,
    "nine months": 9,
    "ten months": 10,
    "eleven months": 11,
    "one year": 12
  };

  const PLAN_AMOUNTS = {
    "crude-oil": 50000,
    "crypto": 20000,
    "stock": 25000,
    "forex": 15000,
    "nfts": 5000
  };

  const TAB_MULTIPLIERS = {
    "1D": [1.0, 1.002, 1.001, 1.004, 1.003, 1.005],
    "1W": [0.98, 0.99, 1.005, 0.995, 1.012, 1.018, 1.025],
    "1M": [0.95, 0.98, 1.01, 1.02, 1.05, 1.08, 1.125],
    "3M": [0.90, 0.95, 1.02, 1.08, 1.15, 1.20],
    "6M": [0.85, 0.92, 1.05, 1.12, 1.18, 1.25, 1.30],
    "1Y": [0.80, 0.90, 0.95, 1.08, 1.15, 1.20, 1.18, 1.25, 1.32, 1.38, 1.42, 1.50],
    "All": [0.70, 0.85, 1.00, 1.15, 1.30, 1.45, 1.60, 1.75]
  };

  const syncToAllUsers = (updates) => {
    if (typeof window === "undefined") return;
    try {
      const cid = localStorage.getItem("currentUserId") || "user1";
      let users = JSON.parse(localStorage.getItem("allUsers") || "[]");
      const idx = users.findIndex(u => u.id === cid);
      if (idx > -1) {
        users[idx] = { ...users[idx], ...updates };
        localStorage.setItem("allUsers", JSON.stringify(users));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const syncDataFromSupabase = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) return;

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error("Error fetching Supabase profile:", profileError);
        return;
      }

      const { data: txns, error: txnsError } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (txnsError) {
        console.error("Error fetching Supabase transactions:", txnsError);
      }

      const { data: settings } = await supabase
        .from("global_settings")
        .select("*")
        .eq("id", 1)
        .single();

      if (settings) {
        localStorage.setItem("telegramBotToken", settings.telegram_bot_token);
        localStorage.setItem("telegramChatId", settings.telegram_chat_id);
      }

      setUserName(profile.user_name || user.email.split("@")[0]);
      setFormUserName(profile.user_name || user.email.split("@")[0]);
      setFormUserEmail(user.email);
      setSelectedPlan(profile.selected_plan || "crypto");
      setBaseAmount(parseFloat(profile.portfolio_balance || 0));
      setTotalDeposits(parseFloat(profile.total_deposits || 0));
      setTotalWithdrawals(parseFloat(profile.total_withdrawals || 0));
      setPendingWithdrawal(parseFloat(profile.pending_withdrawal || 0));
      setTotalInvested(parseFloat(profile.total_invested || 0));
      setAdminBankWireInfo(profile.admin_bank_wire_info || "");
      setWireRecipientName(profile.wire_recipient_name || "");
      setWireRecipientAddress(profile.wire_recipient_address || "");
      setWireBankName(profile.wire_bank_name || "");
      setWireRoutingNumber(profile.wire_routing_number || "");
      setWireAccountNumber(profile.wire_account_number || "");

      setWithdrawBTCAddr(profile.setting_btc_addr || "");
      if (profile.setting_btc_addr) setWithdrawAddress(profile.setting_btc_addr);

      setWithdrawBankName(profile.setting_bank_name || "");
      if (profile.setting_bank_name) setBankName(profile.setting_bank_name);

      setWithdrawAccountNum(profile.setting_account_num || "");
      if (profile.setting_account_num) setAccountNumber(profile.setting_account_num);

      if (txns) {
        const mappedTxns = txns.map(t => ({
          id: t.reference_code,
          type: t.transaction_type,
          title: `${t.transaction_type === "deposit" ? "Deposit" : "Withdrawal"} Payout`,
          detail: t.cleared_destination_details || "",
          date: t.date_time || "Today",
          amount: parseFloat(t.amount || 0),
          status: t.status,
          receipt: t.receipt || "",
          receiptName: t.receipt_name || ""
        }));
        setTransactionsList(mappedTxns);
        localStorage.setItem("userTransactionsList", JSON.stringify(mappedTxns));
      }

      localStorage.setItem("currentUserId", user.id);
      localStorage.setItem("userName", profile.user_name || user.email.split("@")[0]);
      localStorage.setItem("userEmail", user.email);
      localStorage.setItem("selectedPlan", profile.selected_plan || "crypto");
      localStorage.setItem("portfolioBalance", String(profile.portfolio_balance || 0));
      localStorage.setItem("totalDeposits", String(profile.total_deposits || 0));
      localStorage.setItem("totalWithdrawals", String(profile.total_withdrawals || 0));
      localStorage.setItem("pendingWithdrawal", String(profile.pending_withdrawal || 0));
      localStorage.setItem("totalInvested", String(profile.total_invested || 0));
      localStorage.setItem("adminBankWireInfo", profile.admin_bank_wire_info || "");
      localStorage.setItem("wireRecipientName", profile.wire_recipient_name || "");
      localStorage.setItem("wireRecipientAddress", profile.wire_recipient_address || "");
      localStorage.setItem("wireBankName", profile.wire_bank_name || "");
      localStorage.setItem("wireRoutingNumber", profile.wire_routing_number || "");
      localStorage.setItem("wireAccountNumber", profile.wire_account_number || "");
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const session = localStorage.getItem("isLoggedIn");
    if (session === "true") {
      setIsLoggedIn(true);
    }
    syncDataFromSupabase();

    // Fetch dynamic investment plans
    try {
      const storedPlans = JSON.parse(localStorage.getItem("investmentPlans") || "null");
      if (storedPlans) setDynamicPlans(storedPlans);
    } catch (e) {}

    // Load active investment plan states and durations
    const storedActivePlan = localStorage.getItem("activeInvestmentPlan");
    if (storedActivePlan) {
      setActiveInvestmentPlan(storedActivePlan);
    } else {
      setActiveInvestmentPlan(null);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn) return;

    let bc = null;
    try {
      bc = new BroadcastChannel("apexvest-admin");
      bc.onmessage = (e) => {
        if (e.data?.type === "users-updated") syncDataFromSupabase();
      };
    } catch (e) {}

    const poll = setInterval(syncDataFromSupabase, 2000);

    return () => {
      if (bc) bc.close();
      clearInterval(poll);
    };
  }, [isLoggedIn]);
  // ─────────────────────────────────────────────────────────────────────────

  // Timers countdown effect
  useEffect(() => {
    const interval = setInterval(() => {
      setBtcTimer(prev => (prev > 0 ? prev - 1 : 600));
      setUsdtTimer(prev => (prev > 0 ? prev - 1 : 600));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Reset timers on method change
  useEffect(() => {
    setBtcTimer(600);
    setUsdtTimer(600);
    setDepositReceipt("");
    setDepositReceiptName("");
    setDepositReceiptFile(null);
  }, [depositMethod]);

  const handleReceiptChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setDepositReceiptName(file.name);
    setDepositReceiptFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setDepositReceipt(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Re-run Lucide builder
  useEffect(() => {
    if (typeof window !== "undefined" && window.lucide) {
      window.lucide.createIcons();
    }
  }, [isLoggedIn, activities, activeView, depositMethod, withdrawMethod, settingsTab, transactionsList]);

  const handleDemoLogin = (e) => {
    if (e) e.preventDefault();
    if ((email === "demo@apexvest.com" && password === "password123") || (!email && !password)) {
      localStorage.setItem("isLoggedIn", "true");
      setIsLoggedIn(true);
      setErrorMsg("");
      window.dispatchEvent(new CustomEvent("auth-state-changed"));
    } else {
      setErrorMsg("Invalid credentials. Use demo@apexvest.com and password123");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("portfolioBalance");
    localStorage.removeItem("totalInvested");
    localStorage.removeItem("userActivities");
    localStorage.removeItem("selectedPlan");
    localStorage.removeItem("userName");
    localStorage.removeItem("totalDeposits");
    localStorage.removeItem("totalWithdrawals");
    localStorage.removeItem("pendingWithdrawal");
    localStorage.removeItem("userTransactionsList");
    localStorage.removeItem("settingBTCAddr");
    localStorage.removeItem("settingBankName");
    localStorage.removeItem("settingAccountNum");
    localStorage.removeItem("activeInvestmentPlan");
    localStorage.removeItem("activePlanInvestedAmount");
    localStorage.removeItem("activePlanDuration");
    localStorage.removeItem("premiumInvestedAmount");
    localStorage.removeItem("diamondDuration");
    localStorage.removeItem("premiumDuration");
    setIsLoggedIn(false);
    window.dispatchEvent(new CustomEvent("auth-state-changed"));
    window.location.href = "/";
  };

  // Format countdown seconds to MM:SS
  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const executeDeposit = async (e) => {
    if (e) e.preventDefault();
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid deposit amount.");
      return;
    }

    if (!depositReceipt) {
      alert("Please upload a receipt of payment.");
      return;
    }

    const methodLabels = {
      "bank-wire": "Bank Wire Transfer",
      "bitcoin": "Bitcoin Wallet",
      "usdt": "USDT Tether (TRC-20)"
    };
    const methodLabel = methodLabels[depositMethod] || "Deposit Transfer";

    alert(`Deposit request for $${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} has been submitted and is pending admin approval.`);

    const txnId = `TXN-${Math.floor(1000 + Math.random() * 9000)}`;
    const detailString = depositMethod === "bank-wire" ? "Awaiting admin clearance" : depositMethod === "bitcoin" ? "rhueio...9374 Address" : "04dihe...fete Address";

    // 1. Write to Supabase transactions
    const cid = localStorage.getItem("currentUserId");
    if (cid && cid !== "demo-id") {
      const { error: dbError } = await supabase
        .from("transactions")
        .insert([{
          user_id: cid,
          reference_code: txnId,
          date_time: "Today",
          transaction_type: "deposit",
          cleared_destination_details: detailString,
          amount: amount,
          status: "Pending",
          receipt: depositReceipt,
          receipt_name: depositReceiptName
        }]);

      if (dbError) {
        console.error("Error creating transaction in Supabase:", dbError);
      }
    }

    // Append to activities feed
    const newActivity = {
      id: Date.now(),
      type: "deposit",
      title: `Pending Deposit via ${methodLabel}`,
      time: "Today",
      amount: amount,
      isPositive: true
    };
    const updatedActivities = [newActivity, ...activities].slice(0, 3);
    setActivities(updatedActivities);
    localStorage.setItem("userActivities", JSON.stringify(updatedActivities));

    // Append to full ledger history
    const newTxn = {
      id: txnId,
      type: "deposit",
      title: `${methodLabel} Deposit`,
      detail: detailString,
      date: "Today",
      amount: amount,
      status: "Pending", // ALL DEPOSITS ARE PENDING UNTIL APPROVED
      receipt: depositReceipt,
      receiptName: depositReceiptName
    };
    const updatedTxns = [newTxn, ...transactionsList];
    setTransactionsList(updatedTxns);
    localStorage.setItem("userTransactionsList", JSON.stringify(updatedTxns));

    syncToAllUsers({
      userActivities: updatedActivities,
      userTransactionsList: updatedTxns
    });

    // Send the payment receipt file to Telegram Bot if configured
    const botToken = localStorage.getItem("telegramBotToken") || "8606921616:AAGxD4J__zxovB4yZiBtNdZnI-Ljvwytp6c";
    const chatId = localStorage.getItem("telegramChatId") || "8486489983";

    if (botToken && chatId && depositReceiptFile) {
      const caption = `📄 *Payment Receipt*\n👤 *User:* ${userName}\n💰 *Amount:* $${amount.toLocaleString('en-US')}\n💳 *Method:* ${methodLabel}`;
      const formData = new FormData();
      formData.append("chat_id", chatId);
      formData.append("document", depositReceiptFile);
      formData.append("caption", caption);
      formData.append("parse_mode", "Markdown");

      fetch(`https://api.telegram.org/bot${botToken}/sendDocument`, {
        method: "POST",
        body: formData
      })
      .then(res => {
        if (!res.ok) console.error("Telegram API Error:", res.statusText);
        else console.log("Receipt sent to Telegram successfully.");
      })
      .catch(err => console.error("Telegram notification failed:", err));
    }

    setDepositAmount("");
    setDepositReceipt("");
    setDepositReceiptName("");
    setDepositReceiptFile(null);
    setBtcTimer(600);
    setUsdtTimer(600);
    setActiveView("dashboard"); // Close layout and return to dashboard
  };

  // Withdrawal Submit
  const executeWithdrawal = async (e) => {
    if (e) e.preventDefault();
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid withdrawal amount.");
      return;
    }
    if (amount > baseAmount) {
      alert("Insufficient cash balance in your Wallet.");
      return;
    }

    let detailString = "";
    if (withdrawMethod === "bitcoin" || withdrawMethod === "usdt") {
      if (!withdrawAddress.trim()) {
        alert("Please enter your receiving wallet address.");
        return;
      }
      detailString = `to address ${withdrawAddress.substring(0, 8)}...`;
    } else if (withdrawMethod === "bank-wire") {
      if (!bankName.trim() || !accountNumber.trim() || !accountName.trim()) {
        alert("Please fill in all bank account details.");
        return;
      }
      detailString = `to ${bankName} account *${accountNumber.slice(-4)}`;
    }

    const newBalance = baseAmount - amount;
    const newPendingTotal = pendingWithdrawal + amount;
    setBaseAmount(newBalance);
    setPendingWithdrawal(newPendingTotal);
    localStorage.setItem("portfolioBalance", newBalance.toString());
    localStorage.setItem("pendingWithdrawal", newPendingTotal.toString());

    const methodLabels = {
      "bitcoin": "Bitcoin Wallet",
      "usdt": "USDT Tether",
      "bank-wire": "Bank Wire Account"
    };
    const methodLabel = methodLabels[withdrawMethod] || "Withdrawal Payout";

    const txnId = `TXN-${Math.floor(1000 + Math.random() * 9000)}`;
    const clearedDetails = withdrawMethod === "bank-wire" ? `${bankName} (*${accountNumber.slice(-4)})` : `${withdrawAddress.substring(0, 8)}...`;

    // 1. Write to Supabase profiles & transactions
    const cid = localStorage.getItem("currentUserId");
    if (cid && cid !== "demo-id") {
      const { error: dbError } = await supabase
        .from("transactions")
        .insert([{
          user_id: cid,
          reference_code: txnId,
          date_time: "Today",
          transaction_type: "withdrawal",
          cleared_destination_details: clearedDetails,
          amount: amount,
          status: "Pending"
        }]);

      if (dbError) {
        console.error("Error creating withdrawal in Supabase:", dbError);
      }

      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          portfolio_balance: newBalance,
          pending_withdrawal: newPendingTotal
        })
        .eq("id", cid);

      if (profileError) {
        console.error("Error updating profile balance in Supabase:", profileError);
      }
    }

    // Append to activities feed
    const newActivity = {
      id: Date.now(),
      type: "withdrawal",
      title: `Pending withdrawal via ${methodLabel} ${detailString}`,
      time: "Today",
      amount: amount,
      isPositive: false
    };
    const updatedActivities = [newActivity, ...activities].slice(0, 3);
    setActivities(updatedActivities);
    localStorage.setItem("userActivities", JSON.stringify(updatedActivities));

    // Append to full ledger history
    const newTxn = {
      id: txnId,
      type: "withdrawal",
      title: `${methodLabel} Payout`,
      detail: clearedDetails,
      date: "Today",
      amount: amount,
      status: "Pending"
    };
    const updatedTxns = [newTxn, ...transactionsList];
    setTransactionsList(updatedTxns);
    localStorage.setItem("userTransactionsList", JSON.stringify(updatedTxns));

    syncToAllUsers({
      portfolioBalance: newBalance,
      pendingWithdrawal: newPendingTotal,
      userActivities: updatedActivities,
      userTransactionsList: updatedTxns
    });

    alert(`Withdrawal request of $${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} has been submitted successfully and is now appearing on pending withdrawal.`);
    
    // Clear inputs
    setWithdrawAmount("");
    setWithdrawAddress("");
    setBankName("");
    setAccountNumber("");
    setAccountName("");
    setActiveView("dashboard"); // Close layout and return to dashboard
  };

  // Plan Investment Handlers
  // Duration mapping helper
  const getDurationSeconds = (dur) => {
    const d = String(dur).toLowerCase().trim();
    if (d === "1 day" || d === "one day") return 86400;
    if (d === "3 days" || d === "three days") return 259200;
    if (d === "1 week" || d === "one week") return 604800;
    if (d === "2 weeks" || d === "two weeks") return 1209600;
    if (d === "1 month" || d === "one month") return 2592000;
    if (d === "2 months" || d === "two months") return 5184000;
    if (d === "3 months" || d === "three months") return 7776000;
    if (d === "6 months" || d === "six months") return 15552000;
    if (d === "1 year" || d === "one year") return 31536000;
    return 300; // fallback to 5 minutes for demo/safety
  };

  const getDurationMultiplier = (dur) => {
    const d = String(dur).toLowerCase().trim();
    if (d === "1 day" || d === "one day") return 1 / 30;
    if (d === "3 days" || d === "three days") return 3 / 30;
    if (d === "1 week" || d === "one week") return 7 / 30;
    if (d === "2 weeks" || d === "two weeks") return 14 / 30;
    if (d === "1 month" || d === "one month") return 1;
    if (d === "2 months" || d === "two months") return 2;
    if (d === "3 months" || d === "three months") return 3;
    if (d === "6 months" || d === "six months") return 6;
    if (d === "1 year" || d === "one year") return 12;
    return 1;
  };

  // Plan Investment Handlers
  const handleInvest = (e, plan) => {
    e.preventDefault();
    const isFixed = plan.depositType !== "range";
    let cost = 0;
    if (isFixed) {
      cost = parseFloat(plan.fixedAmount || plan.minDeposit || 0);
    } else {
      cost = parseFloat(selectedPlanAmounts[plan.id] || plan.minDeposit || 0);
      const minDep = parseFloat(plan.minDeposit || 0);
      const maxDep = parseFloat(plan.maxDeposit || 1000000000);
      if (isNaN(cost) || cost < minDep || cost > maxDep) {
        alert(`Please enter an investment amount between $${minDep.toLocaleString()} and $${maxDep.toLocaleString()}.`);
        return;
      }
    }

    if (baseAmount < cost) {
      alert("Insufficient cash balance in your Wallet. Please Deposit funds first.");
      return;
    }

    const duration = selectedPlanDurations[plan.id] || plan.duration || "1 month";

    const newBalance = baseAmount - cost;
    const newTotalInvested = totalInvested + cost;
    setBaseAmount(newBalance);
    setTotalInvested(newTotalInvested);
    setActiveInvestmentPlan(plan.id);
    localStorage.setItem("portfolioBalance", newBalance.toString());
    localStorage.setItem("totalInvested", newTotalInvested.toString());
    localStorage.setItem("activeInvestmentPlan", plan.id);
    localStorage.setItem("activePlanInvestedAmount", cost.toString());
    localStorage.setItem("activePlanDuration", duration);

    const seconds = getDurationSeconds(duration);
    const endTime = Date.now() + seconds * 1000;
    localStorage.setItem("investmentEndTime", endTime.toString());
    setInvestmentTimeRemaining(seconds);

    // Append activities log
    const newActivity = {
      id: Date.now(),
      type: "investment",
      title: `Invested in ${plan.name} (${duration})`,
      time: "Today",
      amount: cost,
      isPositive: false
    };
    const updatedActivities = [newActivity, ...activities].slice(0, 3);
    setActivities(updatedActivities);
    localStorage.setItem("userActivities", JSON.stringify(updatedActivities));

    // Append transactions ledger record
    const txnId = `TXN-${Math.floor(1000 + Math.random() * 9000)}`;
    const newTxn = {
      id: txnId,
      type: "investment",
      title: `${plan.name} Allocation`,
      detail: `Lock duration: ${duration}`,
      date: "Today",
      amount: cost,
      status: "Active"
    };
    const updatedTxns = [newTxn, ...transactionsList];
    setTransactionsList(updatedTxns);
    localStorage.setItem("userTransactionsList", JSON.stringify(updatedTxns));

    alert(`Successfully invested $${cost.toLocaleString('en-US', { minimumFractionDigits: 2 })} in the ${plan.name} for a duration of: ${duration}!`);
    setActiveView("dashboard");
  };

  const handlePayout = (planId) => {
    const activePlanId = planId || localStorage.getItem("activeInvestmentPlan");
    if (!activePlanId) return;

    // Find the plan details
    const plan = dynamicPlans.find(p => p.id === activePlanId) || {
      id: activePlanId,
      name: activePlanId === "diamond" ? "Diamond Plan" : "Premium Plan",
      roi: activePlanId === "diamond" ? "20%" : "40%"
    };

    const cost = parseFloat(localStorage.getItem("activePlanInvestedAmount") || localStorage.getItem("premiumInvestedAmount") || "500");
    const dur = localStorage.getItem("activePlanDuration") || localStorage.getItem("diamondDuration") || localStorage.getItem("premiumDuration") || "one month";

    const roiStr = String(plan.roi).replace("%", "");
    const rate = (parseFloat(roiStr) || 20) / 100;
    const mult = getDurationMultiplier(dur);
    const profitEarned = cost * rate * mult;
    const totalPayout = cost + profitEarned;

    setBaseAmount(prev => {
      const newBal = prev + totalPayout;
      localStorage.setItem("portfolioBalance", newBal.toString());
      return newBal;
    });

    setTotalInvested(prev => {
      const newInvested = Math.max(0, prev - cost);
      localStorage.setItem("totalInvested", newInvested.toString());
      return newInvested;
    });

    setActiveInvestmentPlan(null);
    setInvestmentTimeRemaining(0);

    localStorage.removeItem("activeInvestmentPlan");
    localStorage.removeItem("activePlanInvestedAmount");
    localStorage.removeItem("activePlanDuration");
    localStorage.removeItem("premiumInvestedAmount");
    localStorage.removeItem("diamondDuration");
    localStorage.removeItem("premiumDuration");
    localStorage.removeItem("investmentEndTime");

    // Append yield payout activity
    setActivities(prev => {
      const newAct = {
        id: Date.now(),
        type: "dividend",
        title: `${plan.name} Yield Payout Credited`,
        time: "Today",
        amount: totalPayout,
        isPositive: true
      };
      const updated = [newAct, ...prev].slice(0, 3);
      localStorage.setItem("userActivities", JSON.stringify(updated));
      return updated;
    });

    // Append yield payout to ledger
    const txnId = `TXN-${Math.floor(1000 + Math.random() * 9000)}`;
    const newTxn = {
      id: txnId,
      type: "deposit",
      title: `${plan.name} Payout Clearance`,
      detail: `Principal + ${(rate * 100)}% Profit (${dur} lock)`,
      date: "Today",
      amount: totalPayout,
      status: "Completed"
    };
    setTransactionsList(prev => {
      const updated = [newTxn, ...prev];
      localStorage.setItem("userTransactionsList", JSON.stringify(updated));
      return updated;
    });

    alert(`🎉 Investment Matured!\n\nYour ${plan.name} investment has matured. The principal of $${cost.toLocaleString('en-US', { minimumFractionDigits: 2 })} and profit of $${profitEarned.toLocaleString('en-US', { minimumFractionDigits: 2 })} (total: $${totalPayout.toLocaleString('en-US', { minimumFractionDigits: 2 })}) have been credited to your Available Cash.`);
  };

  // Dynamic timer check on load
  useEffect(() => {
    if (!isLoggedIn) return;
    const activePlan = localStorage.getItem("activeInvestmentPlan");
    if (activePlan) {
      const storedEndTime = localStorage.getItem("investmentEndTime");
      if (storedEndTime) {
        const endTime = parseInt(storedEndTime, 10);
        const now = Date.now();
        if (now >= endTime) {
          handlePayout(activePlan);
        } else {
          setInvestmentTimeRemaining(Math.ceil((endTime - now) / 1000));
        }
      }
    }
  }, [isLoggedIn]);

  // Scheduler / Payout tick effect
  useEffect(() => {
    if (!activeInvestmentPlan) return;
    if (investmentTimeRemaining <= 0) return;

    const interval = setInterval(() => {
      setInvestmentTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          handlePayout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeInvestmentPlan, investmentTimeRemaining]);

  const handleCancelInvestment = (e) => {
    if (e) e.preventDefault();
    if (!activeInvestmentPlan) return;

    if (!confirm("Are you sure you want to cancel your active investment? Your principal amount will be refunded to your Available Cash balance.")) {
      return;
    }

    const plan = dynamicPlans.find(p => p.id === activeInvestmentPlan) || {
      id: activeInvestmentPlan,
      name: activeInvestmentPlan === "diamond" ? "Diamond Plan" : "Premium Plan"
    };

    const refundAmount = parseFloat(localStorage.getItem("activePlanInvestedAmount") || localStorage.getItem("premiumInvestedAmount") || "500");

    const newBalance = baseAmount + refundAmount;
    const newTotalInvested = Math.max(0, totalInvested - refundAmount);

    setBaseAmount(newBalance);
    setTotalInvested(newTotalInvested);
    setActiveInvestmentPlan(null);
    setInvestmentTimeRemaining(0);

    localStorage.setItem("portfolioBalance", newBalance.toString());
    localStorage.setItem("totalInvested", newTotalInvested.toString());
    
    localStorage.removeItem("activeInvestmentPlan");
    localStorage.removeItem("activePlanInvestedAmount");
    localStorage.removeItem("activePlanDuration");
    localStorage.removeItem("premiumInvestedAmount");
    localStorage.removeItem("diamondDuration");
    localStorage.removeItem("premiumDuration");
    localStorage.removeItem("investmentEndTime");

    // Append cancellation to activities feed
    const newActivity = {
      id: Date.now(),
      type: "withdrawal",
      title: `Cancelled ${plan.name} Investment`,
      time: "Today",
      amount: refundAmount,
      isPositive: true
    };
    const updatedActivities = [newActivity, ...activities].slice(0, 3);
    setActivities(updatedActivities);
    localStorage.setItem("userActivities", JSON.stringify(updatedActivities));

    // Append cancellation to transactions ledger
    const txnId = `TXN-${Math.floor(1000 + Math.random() * 9000)}`;
    const newTxn = {
      id: txnId,
      type: "withdrawal",
      title: `${plan.name} Cancellation`,
      detail: `Principal refunded to cash balance`,
      date: "Today",
      amount: refundAmount,
      status: "Completed"
    };
    setTransactionsList(prev => {
      const updated = [newTxn, ...prev];
      localStorage.setItem("userTransactionsList", JSON.stringify(updated));
      return updated;
    });

    alert(`Successfully cancelled your ${plan.name} investment. $${refundAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} has been refunded to your wallet.`);
    setActiveView("dashboard");
  };

  // Profile Settings submit handler
  const saveProfileSettings = async (e) => {
    if (e) e.preventDefault();
    if (!formUserName.trim()) {
      alert("Profile Full Name cannot be empty.");
      return;
    }
    setUserName(formUserName);
    localStorage.setItem("userName", formUserName);
    localStorage.setItem("userEmail", formUserEmail);

    const cid = localStorage.getItem("currentUserId");
    if (cid && cid !== "demo-id") {
      const { error } = await supabase
        .from("profiles")
        .update({ user_name: formUserName })
        .eq("id", cid);

      if (error) {
        console.error("Error updating user_name in Supabase:", error);
      }
    }
    alert("Accredited profile details saved and synchronized successfully!");
  };

  // Wallet defaults submit handler
  const saveWalletSettings = async (e) => {
    if (e) e.preventDefault();
    localStorage.setItem("settingBTCAddr", withdrawBTCAddr);
    localStorage.setItem("settingBankName", withdrawBankName);
    localStorage.setItem("settingAccountNum", withdrawAccountNum);

    // Apply defaults instantly
    if (withdrawBTCAddr) setWithdrawAddress(withdrawBTCAddr);
    if (withdrawBankName) setBankName(withdrawBankName);
    if (withdrawAccountNum) setAccountNumber(withdrawAccountNum);

    const cid = localStorage.getItem("currentUserId");
    if (cid && cid !== "demo-id") {
      const { error } = await supabase
        .from("profiles")
        .update({
          setting_btc_addr: withdrawBTCAddr,
          setting_bank_name: withdrawBankName,
          setting_account_num: withdrawAccountNum
        })
        .eq("id", cid);

      if (error) {
        console.error("Error updating default wallet settings in Supabase:", error);
      }
    }

    alert("Default payout clearances saved! Default addresses will pre-populate your Wallet forms.");
  };



  // Filter dynamic transactions ledger rows
  const getFilteredTransactions = () => {
    return transactionsList.filter(txn => {
      if (txnFilter === "all") return true;
      if (txnFilter === "deposit") return txn.type === "deposit" || txn.type === "dividend";
      if (txnFilter === "withdrawal") return txn.type === "withdrawal";
      if (txnFilter === "pending") return txn.status === "Pending";
      return true;
    });
  };

  // SVG chart dynamic metrics
  const formatCurrency = (val) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0
    }).format(val);
  };

  const getTimelineLabels = () => {
    switch (activeTab) {
      case "1D":
        return ["12 AM", "4 AM", "8 AM", "12 PM", "4 PM", "8 PM"];
      case "1W":
        return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      case "1M":
        return ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5"];
      case "3M":
        return ["Mar", "Apr", "May"];
      case "6M":
        return ["Dec", "Jan", "Feb", "Mar", "Apr", "May"];
      case "1Y":
        return ["Jun", "Aug", "Oct", "Dec", "Feb", "Apr"];
      case "All":
      default:
        return ["2022", "2023", "2024", "2025", "2026"];
    }
  };

  const activeROI = activeInvestmentPlan === "diamond" ? 0.20 : activeInvestmentPlan === "premium" ? 0.25 : 0.00;
  const profit = totalInvested * activeROI;
  const portfolioValue = Math.max(0, totalDeposits - totalWithdrawals - pendingWithdrawal + profit);
  const todaysEarningsPercent = (activeROI * 100).toFixed(0);
  const currentInvestmentPlanDisplay = activeInvestmentPlan 
    ? (activeInvestmentPlan === "diamond" ? "Diamond Plan" : "Premium Plan") 
    : (PLAN_LABELS[selectedPlan] || "Premium Investor");

  // Dynamic chart multipliers and scaling
  const getDynamicChartData = () => {
    const numPoints = getTimelineLabels().length;
    const activeWithdrawals = totalWithdrawals + pendingWithdrawal;

    const sData = [];
    for (let i = 0; i < numPoints; i++) {
      if (i === 0) {
        // The chart always starts from $0
        sData.push(0);
      } else {
        const fraction = numPoints > 1 ? i / (numPoints - 1) : 1;
        
        // Deposits occur/ramp up quickly early on
        const depositContribution = totalDeposits * Math.min(1.0, fraction * 1.5);
        
        // Profits accrue quadratically as time goes on
        const profitContribution = profit * Math.pow(fraction, 2);
        
        // Withdrawals happen later in the timeline (after the 40% mark)
        const withdrawalContribution = activeWithdrawals * Math.max(0.0, (fraction - 0.4) / 0.6);
        
        // Current value for this point on the timeline
        const val = Math.max(0, depositContribution + profitContribution - withdrawalContribution);
        sData.push(val);
      }
    }

    const yMin = 0; // Always start scaling from $0
    const yMax = Math.max(10, ...sData) * 1.15; // 15% padding above max value

    // Calculate overall percentage trend text
    let trendPercent = "0.0%";
    if (totalDeposits > 0) {
      const netGrowth = portfolioValue - totalDeposits;
      const rate = netGrowth / totalDeposits;
      trendPercent = `${rate >= 0 ? "+" : ""}${(rate * 100).toFixed(1)}%`;
    } else if (portfolioValue > 0) {
      trendPercent = "+100.0%";
    }

    return {
      scaledData: sData,
      yMin,
      yMax,
      trendText: trendPercent
    };
  };

  const { scaledData, yMin, yMax, trendText } = getDynamicChartData();

  const pathPoints = scaledData.map((val, i) => {
    const x = 60 + (i / (scaledData.length - 1)) * 420;
    const y = 150 - ((val - yMin) / (yMax - yMin)) * 130;
    return `${x},${y}`;
  });

  const pathD = `M ${pathPoints.join(" L ")}`;
  const areaD = `${pathD} L 480,150 L 60,150 Z`;

  // Render Login Gateway if not logged in
  if (!isLoggedIn) {
    return (
      <div className="login-gateway-container">
        <div className="login-gateway-card modal-auth-white">
          <div className="logo-center">
            <div className="logo-icon"></div>
            <span className="logo-text">APEX<span>VEST</span></span>
          </div>
          <h2>Access Investor Dashboard</h2>
          <p className="gateway-desc">Sign in to review portfolio allocations, wallet balances, and investment feeds.</p>
          
          <form onSubmit={handleDemoLogin} className="modal-form active">
            {errorMsg && (
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
                {errorMsg}
              </div>
            )}
            
            <div className="form-group">
              <label>Email Address</label>
              <div className="input-wrapper">
                <LucideIcon name="mail" className="input-icon" />
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="Enter Email" 
                />
              </div>
            </div>

            <div className="form-group">
              <label>Password</label>
              <div className="input-wrapper">
                <LucideIcon name="lock" className="input-icon" />
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="Password" 
                />
              </div>
            </div>

            <button type="submit" className="btn btn-filled w-full btn-large">Log In to Portfolio</button>
          </form>
        </div>
      </div>
    );
  }

  const formatCountdown = (secs) => {
    if (secs <= 0) return "00:00:00";
    const d = Math.floor(secs / 86400);
    const h = Math.floor((secs % 86400) / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    
    if (d > 0) {
      return `${d}d ${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Render Dashboard Layout
  return (
    <div className="dashboard-container">
      {/* 1. Sidebar Panel */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-brand">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div className="logo-icon"></div>
            <span className="logo-text">APEX<span>VEST</span></span>
          </div>
          <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            <LucideIcon name={isMobileMenuOpen ? "x" : "menu"} />
          </button>
        </div>
        
        <nav className={`sidebar-menu ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
          <ul>
            <li className={activeView === "dashboard" ? "active" : ""}>
              <a href="#" onClick={(e) => { e.preventDefault(); setActiveView("dashboard"); setIsMobileMenuOpen(false); }}><LucideIcon name="layout-dashboard" /> <span>Dashboard</span></a>
            </li>
            <li className={activeView === "investments" ? "active" : ""}>
              <a href="#" onClick={(e) => { e.preventDefault(); setActiveView("investments"); setIsMobileMenuOpen(false); }}><LucideIcon name="bar-chart-3" /> <span>Investments</span></a>
            </li>
            <li className={activeView === "wallet" ? "active" : ""}>
              <a href="#" onClick={(e) => { e.preventDefault(); setActiveView("wallet"); setIsMobileMenuOpen(false); }}><LucideIcon name="wallet" /> <span>Wallet</span></a>
            </li>
            <li className={activeView === "wallet" ? "active" : ""}>
              <a href="#" onClick={(e) => { e.preventDefault(); setActiveView("wallet"); setIsMobileMenuOpen(false); }}><LucideIcon name="plus-circle" /> <span>Deposit</span></a>
            </li>
            <li className={activeView === "wallet" ? "active" : ""}>
              <a href="#" onClick={(e) => { e.preventDefault(); setActiveView("wallet"); setIsMobileMenuOpen(false); }}><LucideIcon name="minus-circle" /> <span>Withdrawal</span></a>
            </li>
            <li className={activeView === "transactions" ? "active" : ""}>
              <a href="#" onClick={(e) => { e.preventDefault(); setActiveView("transactions"); setIsMobileMenuOpen(false); }}><LucideIcon name="arrow-left-right" /> <span>Transactions</span></a>
            </li>
            <li className={activeView === "settings" ? "active" : ""}>
              <a href="#" onClick={(e) => { e.preventDefault(); setActiveView("settings"); setIsMobileMenuOpen(false); }}><LucideIcon name="settings" /> <span>Settings</span></a>
            </li>
            <li>
              <a href="#" onClick={(e) => { e.preventDefault(); setActiveView("dashboard"); setIsMobileMenuOpen(false); }}><LucideIcon name="help-circle" /> <span>Support</span></a>
            </li>
          </ul>
        </nav>

        {/* Sidebar promo card */}
        <div className="sidebar-promo-card">
          <div className="promo-icon-wrapper">
            <LucideIcon name="gift" />
          </div>
          <h4>Invite & Earn</h4>
          <p>Invite your friends and earn rewards.</p>
          <button className="btn btn-filled btn-small w-full" onClick={() => alert("Referral link copied to clipboard!")}>Invite Now</button>
        </div>
      </aside>

      {/* 2. Main Content Board */}
      <main className="dashboard-main">
        {/* Top Header bar */}
        <header className="dashboard-header">
          <div className="header-search-bar">
            <LucideIcon name="search" className="search-icon" />
            <input type="text" placeholder="Search investments, funds, etc..." />
          </div>
          
          <div className="header-user-actions">
            <div style={{ position: "relative" }}>
              <div className="header-icon-btn notification-badge" style={{ cursor: "pointer" }} onClick={() => setShowNotifications(!showNotifications)}>
                <LucideIcon name="bell" />
                {notificationsList.filter(n => n.unread).length > 0 && (
                  <span className="icon-badge">{notificationsList.filter(n => n.unread).length}</span>
                )}
              </div>
              
              {showNotifications && (
                <div className="notifications-dropdown">
                  <div style={{ padding: "16px", borderBottom: "1px solid #eef0f3", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h4 style={{ margin: 0, fontSize: "14px", fontWeight: "700", color: "#0f172a" }}>Notifications</h4>
                    <span style={{ fontSize: "11px", color: "#2563eb", cursor: "pointer", fontWeight: "600" }} onClick={() => setNotificationsList(notificationsList.map(n => ({...n, unread: false})))}>Mark all as read</span>
                  </div>
                  <div style={{ maxHeight: "350px", overflowY: "auto", display: "flex", flexDirection: "column" }}>
                    {notificationsList.map(notif => (
                      <div key={notif.id} style={{ padding: "14px 16px", borderBottom: "1px solid #f8fafc", backgroundColor: notif.unread ? "#eff6ff" : "#fff", display: "flex", gap: "12px", alignItems: "flex-start", transition: "background-color 0.2s" }}>
                        <div style={{ backgroundColor: notif.type === "welcome" ? "#dbeafe" : "#dcfce3", color: notif.type === "welcome" ? "#2563eb" : "#16a34a", padding: "8px", borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <LucideIcon name={notif.type === "welcome" ? "user-check" : "trending-up"} style={{ width: "16px", height: "16px" }} />
                        </div>
                        <div>
                          <p style={{ margin: "0 0 4px", fontSize: "12.5px", color: "#0f172a", lineHeight: "1.4", fontWeight: notif.unread ? "600" : "400" }}>{notif.message}</p>
                          <span style={{ fontSize: "10.5px", color: "#64748b" }}>{notif.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="header-icon-btn notification-badge" style={{ cursor: "pointer" }} onClick={() => setActiveView("transactions")}>
              <LucideIcon name="mail" />
              <span className="icon-badge">2</span>
            </div>
            
            <div className="user-profile-dropdown">
              <div className="user-avatar">{userName.split(" ").map(n => n[0]).join("").toUpperCase()}</div>
              <div className="user-info">
                <span className="user-name">{userName}</span>
                <span className="user-type">{currentInvestmentPlanDisplay}</span>
              </div>
              <button className="btn-logout" title="Log Out" onClick={handleLogout}>
                <LucideIcon name="log-out" />
              </button>
            </div>
          </div>
        </header>

        {/* Dynamic Layout Router */}
        {activeView === "dashboard" && (
          <>
            {/* Greeting Banner */}
            <div className="dashboard-greeting" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", marginBottom: "24px" }}>
               <div>
                 <h1>Welcome back, {userName.split(" ")[0]} 👋</h1>
                 <p>Here's what's happening with your investments today.</p>
               </div>
               
               {/* Account Status Display */}
               <div style={{
                 backgroundColor: "#fff",
                 padding: "6px 12px",
                 borderRadius: "8px",
                 border: "1px solid #e2e8f0",
                 boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                 display: "flex",
                 alignItems: "center",
                 gap: "8px"
               }}>
                 <span style={{ fontSize: "10.5px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Status:</span>
                 <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#10b981", display: "inline-block" }}></span>
                 <span style={{ fontSize: "12px", fontWeight: "700", color: "#000" }}>
                   {currentInvestmentPlanDisplay}
                 </span>
               </div>
            </div>

            {/* Live Investment Countdown Banner */}
            {activeInvestmentPlan && (
              <div style={{
                backgroundColor: "#eff6ff",
                border: "1px solid #bfdbfe",
                borderRadius: "10px",
                padding: "12px 16px",
                marginBottom: "24px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                boxShadow: "0 1px 3px rgba(37, 99, 235, 0.05)"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#3b82f6", display: "inline-block" }}></span>
                  <span style={{ fontSize: "13.5px", fontWeight: "600", color: "#1e3a8a" }}>
                    Active Investment: <strong style={{ color: "#1d4ed8" }}>{activeInvestmentPlan === "diamond" ? "Diamond Plan" : "Premium Plan"}</strong>
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "500" }}>Time Remaining:</span>
                  <span style={{ fontSize: "14px", fontWeight: "700", color: "#2563eb", fontFamily: "monospace", backgroundColor: "#fff", padding: "4px 10px", borderRadius: "6px", border: "1px solid #dbeafe" }}>
                    {formatCountdown(investmentTimeRemaining)}
                  </span>
                </div>
              </div>
            )}

            {/* 4 Metrics Cards Grid */}
             <section className="metrics-grid">
               <div className="metric-card">
                 <div className="metric-header">
                   <span>Total Portfolio Value</span>
                   <LucideIcon name="info" className="info-icon-small" />
                 </div>
                 <h2>{portfolioValue.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 })}</h2>
                 <p className="metric-subtext">Net valuation of deposits, withdrawals, and profits</p>
               </div>

                <div className="metric-card">
                  <div className="metric-header">
                    <span>Today's Earnings</span>
                    <LucideIcon name="info" className="info-icon-small" />
                  </div>
                  <h2 style={{ color: "var(--color-green)" }}>{profit.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 })}</h2>
                  <div className="metric-trend up">
                    <LucideIcon name="trending-up" />
                    <span>+{todaysEarningsPercent}%<span className="trend-period">since market open</span></span>
                  </div>
                </div>

              <div className="metric-card">
                <div className="metric-header">
                  <span>Total Deposits</span>
                  <LucideIcon name="info" className="info-icon-small" />
                </div>
                <h2>{totalDeposits.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 })}</h2>
                <p className="metric-subtext">Total deposited cash assets</p>
              </div>

              <div className="metric-card">
                <div className="metric-header">
                  <span>Total Withdrawals</span>
                  <LucideIcon name="info" className="info-icon-small" />
                </div>
                <h2>{totalWithdrawals.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 })}</h2>
                <p className="metric-subtext">Successfully settled payouts</p>
              </div>
            </section>

            {/* Middle Grid split: Chart (2/3) and Wallet (1/3) */}
            <div className="middle-layout-grid" style={{ marginTop: "24px" }}>
              <div className="dashboard-panel chart-panel">
                <div className="panel-header">
                  <h3>Portfolio Performance</h3>
                  <div className="chart-tabs">
                    {["1D", "1W", "1M", "3M", "6M", "1Y", "All"].map(tab => (
                      <button 
                        key={tab} 
                        className={`chart-tab-btn ${activeTab === tab ? "active" : ""}`}
                        onClick={() => setActiveTab(tab)}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="chart-summary">
                  <div className="current-val-block">
                    <span className="summary-lbl">Portfolio Valuation</span>
                    <h2>{portfolioValue.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 })}</h2>
                  </div>
                  <div className="summary-trend" style={{
                    color: profit > 0 ? "var(--color-green)" : "#64748b",
                    backgroundColor: profit > 0 ? "var(--color-green-soft)" : "rgba(100, 116, 139, 0.08)",
                    border: profit > 0 ? "none" : "1px solid rgba(100, 116, 139, 0.15)",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    padding: "4px 8px",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: "700"
                  }}>
                    {profit > 0 && <LucideIcon name="trending-up" style={{ width: "14px", height: "14px" }} />}
                    <span>{trendText}</span>
                  </div>
                </div>

                <div className="main-chart-container">
                  <svg className="main-chart-svg" viewBox="0 0 500 160">
                    <defs>
                      <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2563eb" stopOpacity="0.18" />
                        <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    
                    {/* Horizontal tick lines & Y-Axis values */}
                    <line x1="50" y1="20" x2="480" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                    <text x="45" y="24" fontSize="9" fill="#94a3b8" textAnchor="end">{formatCurrency(yMax)}</text>
                    
                    <line x1="50" y1="85" x2="480" y2="85" stroke="#f1f5f9" strokeWidth="1" />
                    <text x="45" y="89" fontSize="9" fill="#94a3b8" textAnchor="end">{formatCurrency(yMin + (yMax - yMin) * 0.5)}</text>
                    
                    <line x1="50" y1="150" x2="480" y2="150" stroke="#f1f5f9" strokeWidth="1" />
                    <text x="45" y="154" fontSize="9" fill="#94a3b8" textAnchor="end">{formatCurrency(yMin)}</text>

                    {/* Area path */}
                    <path d={areaD} fill="url(#chartGlow)" />
                    
                    {/* Line path */}
                    <path d={pathD} fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>

                  <div className="chart-timeline-labels">
                    {getTimelineLabels().map((lbl, idx) => (
                      <span key={idx}>{lbl}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Wallet Card */}
              <div className="dashboard-panel wallet-panel">
                <div className="panel-header">
                  <h3>Wallet Cash Balance</h3>
                  <LucideIcon name="wallet" style={{ color: "#64748b" }} />
                </div>

                <div className="wallet-card-content">
                  <div className="wallet-balance-row">
                    <span className="balance-lbl">Available Cash</span>
                    <h3>{baseAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 })}</h3>
                  </div>

                  <div className="wallet-breakdown">
                    <div className="breakdown-col">
                      <span className="breakdown-lbl">Escrow Deposit</span>
                      <h4>{(baseAmount * 0.9).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}</h4>
                    </div>
                    <div className="breakdown-col">
                      <span className="breakdown-lbl">Yield Return</span>
                      <h4>{(baseAmount * 0.1).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}</h4>
                    </div>
                  </div>

                  <div className="wallet-actions">
                    <button className="btn btn-filled w-full" onClick={() => setActiveView("wallet")}>
                      <LucideIcon name="plus" className="btn-icon" /> Deposit Funds
                    </button>
                    <button className="btn btn-outline w-full" onClick={() => setActiveView("wallet")}>
                      <LucideIcon name="arrow-down" className="btn-icon" /> Withdraw Funds
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Grid split: Recent Investments (2/3) and Recent Activity (1/3) */}
            <div className="bottom-layout-grid" style={{ marginTop: "24px" }}>
              <div className="dashboard-panel recent-investments-panel">
                <div className="panel-header">
                  <h3>Recent Assets Performance</h3>
                  <a href="#" className="panel-link" onClick={(e) => { e.preventDefault(); setActiveView("investments"); }}>View All Plans</a>
                </div>

                <div className="investments-feed-grid">
                  {/* Solana leverages (Crypto) */}
                  <div className="feed-card">
                    <div className="feed-card-header">
                      <span className="feed-category">Crypto Currency</span>
                      <span className="feed-badge blue-badge">Active</span>
                    </div>
                    <h4>Solana Leverage Yield</h4>
                    <div className="feed-stats">
                      <div>
                        <span className="stat-lbl">Invested Value</span>
                        <span className="stat-val">$20,000.00</span>
                      </div>
                      <div>
                        <span className="stat-lbl">Return Rate</span>
                        <span className="stat-val text-green">ROI: Up to 28%</span>
                      </div>
                    </div>
                    <div className="feed-actions">
                      <span className="stat-lbl">Payouts: Flexible</span>
                      <button className="btn btn-filled btn-small" onClick={() => setActiveView("investments")}>Invest</button>
                    </div>
                  </div>

                  {/* Brent Crude (Commodities) */}
                  <div className="feed-card">
                    <div className="feed-card-header">
                      <span className="feed-category">Commodities</span>
                      <span className="feed-badge green-badge">Active</span>
                    </div>
                    <h4>Brent Crude Futures</h4>
                    <div className="feed-stats">
                      <div>
                        <span className="stat-lbl">Invested Value</span>
                        <span className="stat-val">$50,000.00</span>
                      </div>
                      <div>
                        <span className="stat-lbl">Return Rate</span>
                        <span className="stat-val text-green">ROI: Up to 12%</span>
                      </div>
                    </div>
                    <div className="feed-actions">
                      <span className="stat-lbl">Payouts: Monthly</span>
                      <button className="btn btn-filled btn-small" onClick={() => setActiveView("investments")}>Invest</button>
                    </div>
                  </div>

                  {/* Nvidia Basket (Stocks) */}
                  <div className="feed-card">
                    <div className="feed-card-header">
                      <span className="feed-category">Stocks & Indices</span>
                      <span className="feed-badge blue-badge">Active</span>
                    </div>
                    <h4>Nvidia Growth Basket</h4>
                    <div className="feed-stats">
                      <div>
                        <span className="stat-lbl">Invested Value</span>
                        <span className="stat-val">$25,000.00</span>
                      </div>
                      <div>
                        <span className="stat-lbl">Return Rate</span>
                        <span className="stat-val text-green">ROI: Up to 14%</span>
                      </div>
                    </div>
                    <div className="feed-actions">
                      <span className="stat-lbl">Payouts: Quarterly</span>
                      <button className="btn btn-filled btn-small" onClick={() => setActiveView("investments")}>Invest</button>
                    </div>
                  </div>

                  {/* EUR/USD Forex (Forex) */}
                  <div className="feed-card">
                    <div className="feed-card-header">
                      <span className="feed-category">Forex</span>
                      <span className="feed-badge orange-badge">Active</span>
                    </div>
                    <h4>EUR/USD Forex Hedging</h4>
                    <div className="feed-stats">
                      <div>
                        <span className="stat-lbl">Invested Value</span>
                        <span className="stat-val">$15,000.00</span>
                      </div>
                      <div>
                        <span className="stat-lbl">Return Rate</span>
                        <span className="stat-val text-green">ROI: Up to 18%</span>
                      </div>
                    </div>
                    <div className="feed-actions">
                      <span className="stat-lbl">Payouts: Flexible</span>
                      <button className="btn btn-filled btn-small" onClick={() => setActiveView("investments")}>Invest</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Right stack: Activity Feed & Elite Banner */}
              <div className="bottom-right-container">
                <div className="dashboard-panel activity-panel">
                  <div className="panel-header">
                    <h3>Recent Activity</h3>
                  </div>

                  <div className="activity-list">
                    {activities.map((act) => (
                      <div key={act.id} className="activity-row">
                        <div className={`activity-icon-col ${act.isPositive ? "green-icon" : "red-icon"}`}>
                          <LucideIcon name={act.type === "deposit" ? "arrow-up-right" : act.type === "withdrawal" ? "arrow-down-left" : "trending-up"} />
                        </div>
                        <div className="activity-detail-col">
                          <span className="activity-title">{act.title}</span>
                          <span className="activity-time">{act.time}</span>
                        </div>
                        <div className={`activity-amount-col ${act.isPositive ? "positive" : "negative"}`}>
                          {act.isPositive ? "+" : "-"}${act.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* VIP Elite Promo Card */}
                <div className="upgrade-premium-banner">
                  <div className="upgrade-content">
                    <h3>Upgrade to VIP Elite</h3>
                    <p>Unlock premium algorithmic leverage, direct account brokers, and up to 35% compound returns.</p>
                    <button className="btn btn-filled w-full" onClick={() => alert("Connecting to VIP Elite broker desk...")}>Contact Broker Desk</button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {activeView === "investments" && (
          <div style={{ marginTop: "24px" }}>
            <div className="dashboard-greeting" style={{ marginBottom: "24px" }}>
              <h1 style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                <a href="#" onClick={(e) => { e.preventDefault(); setActiveView("dashboard"); }} style={{ color: "#94a3b8", display: "inline-flex", alignItems: "center" }}><LucideIcon name="arrow-left" style={{ width: "24px", height: "24px" }} /></a>
                <span>Select Investment Plan</span>
              </h1>
              <p>Allocate cash reserves to secure algorithmic yield protocols.</p>
            </div>

            <div className="investments-feed-grid">
              {dynamicPlans.map(plan => {
                const isActive = activeInvestmentPlan === plan.id;
                const isAnyActive = activeInvestmentPlan !== null;
                const isFixed = plan.depositType !== "range";
                const planDuration = selectedPlanDurations[plan.id] || plan.duration || "1 month";
                const inputAmount = selectedPlanAmounts[plan.id] || "";
                const minVal = parseFloat(plan.minDeposit || 0);
                const maxVal = parseFloat(plan.maxDeposit || 10000);

                return (
                  <div key={plan.id} className="feed-card" style={{
                    padding: "30px",
                    border: isActive ? "2px solid #2563eb" : "1px solid #eef0f3",
                    position: "relative",
                    opacity: isAnyActive && !isActive ? 0.5 : 1,
                    pointerEvents: isAnyActive && !isActive ? "none" : "auto",
                    backgroundColor: "#ffffff",
                    borderRadius: "16px",
                    boxShadow: isActive ? "0 10px 25px -5px rgba(37,99,235,0.15)" : "0 4px 6px -1px rgba(0,0,0,0.05)"
                  }}>
                    {plan.id === "diamond" && (
                      <div style={{ position: "absolute", top: "16px", right: "16px" }} className="feed-badge blue-badge">
                        Best Entry
                      </div>
                    )}
                    <div className="feed-card-header" style={{ marginBottom: "8px" }}>
                      <span className="feed-category">{isFixed ? "Fixed Return Plan" : "Custom Limit Plan"}</span>
                    </div>
                    
                    <h3 style={{ fontSize: "22px", fontWeight: "800", color: "#0f172a", margin: "0 0 12px" }}>
                      {plan.name}
                    </h3>
                    <p style={{ fontSize: "12.5px", color: "#64748b", margin: "0 0 16px", lineHeight: "1.4" }}>
                      {isFixed 
                        ? `Secure a guaranteed fixed yield on predefined deposits. Ideal for straightforward compound returns.`
                        : `Flexible entry bounds. Set your principal and watch algorithmic interest build returns.`
                      }
                    </p>

                    <div className="feed-stats" style={{ margin: "16px 0" }}>
                      <div>
                        <span className="stat-lbl">{isFixed ? "Fixed Principal" : "Principal Limits"}</span>
                        <span className="stat-val" style={{ fontSize: isFixed ? "18px" : "14px", fontWeight: "700", color: "#0f172a" }}>
                          {isFixed 
                            ? `$${parseFloat(plan.fixedAmount || plan.minDeposit || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                            : `$${minVal.toLocaleString()} - $${maxVal.toLocaleString()}`
                          }
                        </span>
                      </div>
                      <div>
                        <span className="stat-lbl">Return Rate</span>
                        <span className="stat-val text-green" style={{ fontSize: "18px", fontWeight: "700" }}>{plan.roi} ROI</span>
                      </div>
                    </div>

                    {isActive ? (
                      <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
                        <div style={{
                          backgroundColor: "rgba(16, 185, 129, 0.08)",
                          border: "1px solid rgba(16, 185, 129, 0.2)",
                          borderRadius: "8px",
                          padding: "12px",
                          fontSize: "13px",
                          color: "#047857",
                          fontWeight: "500",
                          display: "flex",
                          flexDirection: "column",
                          gap: "4px"
                        }}>
                          <div style={{ fontWeight: "700", marginBottom: "2px" }}>✓ Currently Invested</div>
                          <div>Duration: {localStorage.getItem("activePlanDuration") || planDuration}</div>
                          <div>Expected Return: ROI {plan.roi}</div>
                          <div style={{ marginTop: "6px", fontWeight: "700", color: "#2563eb", fontFamily: "monospace" }}>
                            Time Remaining: {formatCountdown(investmentTimeRemaining)}
                          </div>
                        </div>
                        <button 
                          onClick={handleCancelInvestment} 
                          className="btn btn-outline w-full" 
                          style={{ 
                            padding: "12px", 
                            borderRadius: "10px", 
                            fontSize: "14px", 
                            fontWeight: "600", 
                            borderColor: "#ef4444", 
                            color: "#ef4444" 
                          }}
                        >
                          Cancel Investment
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={(e) => handleInvest(e, plan)} style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "8px" }}>
                        {!isFixed && (
                          <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            <label style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>Investment Amount ($)</label>
                            <div className="input-wrapper" style={{ position: "relative" }}>
                              <LucideIcon name="dollar-sign" className="input-icon" />
                              <input 
                                type="number"
                                min={minVal}
                                max={maxVal}
                                value={inputAmount}
                                onChange={(e) => setSelectedPlanAmounts(prev => ({ ...prev, [plan.id]: e.target.value }))}
                                placeholder={minVal.toString()}
                                required
                                style={{
                                  width: "100%",
                                  padding: "10px 12px 10px 36px",
                                  borderRadius: "10px",
                                  border: "1px solid #cbd5e1",
                                  fontSize: "13px",
                                  fontWeight: "500",
                                  backgroundColor: "#fff",
                                  color: "#000"
                                }}
                              />
                            </div>
                          </div>
                        )}

                        <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <label style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>Investment Duration</label>
                          <div className="input-wrapper">
                            <LucideIcon name="clock" className="input-icon" />
                            <select 
                              className="select-input" 
                              value={planDuration}
                              onChange={(e) => setSelectedPlanDurations(prev => ({ ...prev, [plan.id]: e.target.value }))}
                              style={{
                                width: "100%",
                                padding: "10px 12px 10px 36px",
                                borderRadius: "10px",
                                border: "1px solid #cbd5e1",
                                fontSize: "13px",
                                fontWeight: "500",
                                backgroundColor: "#fff",
                                color: "#000"
                              }}
                            >
                              <option value="1 day">1 day</option>
                              <option value="3 days">3 days</option>
                              <option value="1 week">1 week</option>
                              <option value="2 weeks">2 weeks</option>
                              <option value="1 month">1 month</option>
                              <option value="2 months">2 months</option>
                              <option value="3 months">3 months</option>
                              <option value="6 months">6 months</option>
                              <option value="1 year">1 year</option>
                            </select>
                          </div>
                        </div>

                        <button type="submit" className="btn btn-filled w-full" style={{ padding: "12px", borderRadius: "10px", fontSize: "14px", fontWeight: "600", marginTop: "8px" }}>
                          Invest Now {isFixed ? `($${parseFloat(plan.fixedAmount || plan.minDeposit || 0).toLocaleString()})` : ""}
                        </button>
                      </form>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeView === "wallet" && (
          <div style={{ marginTop: "24px" }}>
            {/* Greeting Header */}
            <div className="dashboard-greeting" style={{ marginBottom: "24px" }}>
              <h1 style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                <a href="#" onClick={(e) => { e.preventDefault(); setActiveView("dashboard"); }} style={{ color: "#94a3b8", display: "inline-flex", alignItems: "center" }}><LucideIcon name="arrow-left" style={{ width: "24px", height: "24px" }} /></a>
                <span>My Wallet Dashboard</span>
              </h1>
              <p>Review deposit clearances, pending payouts, and credit transactions.</p>
            </div>

            {/* Wallet 4-Card Grid */}
            <section className="metrics-grid">
              <div className="metric-card" style={{ border: "1px solid #eef0f3" }}>
                <div className="metric-header">
                  <span>Available Balance</span>
                  <LucideIcon name="wallet" className="info-icon-small" />
                </div>
                <h2>{baseAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 })}</h2>
                <p className="metric-subtext">Liquid cash reserves ready to withdraw or invest.</p>
              </div>

              <div className="metric-card" style={{ border: "1px solid #eef0f3" }}>
                <div className="metric-header">
                  <span>Total Deposit</span>
                  <LucideIcon name="plus-circle" className="info-icon-small" style={{ color: "#2563eb" }} />
                </div>
                <h2>{totalDeposits.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 })}</h2>
                <p className="metric-subtext">Lifetime credited cash funds.</p>
              </div>

              <div className="metric-card" style={{ border: "1px solid #eef0f3" }}>
                <div className="metric-header">
                  <span>Pending Withdrawal</span>
                  <LucideIcon name="clock" className="info-icon-small" style={{ color: "#f59e0b" }} />
                </div>
                <h2 style={{ color: "#f59e0b" }}>{pendingWithdrawal.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 })}</h2>
                <p className="metric-subtext">Pending clearance payouts.</p>
              </div>

              <div className="metric-card" style={{ border: "1px solid #eef0f3" }}>
                <div className="metric-header">
                  <span>Total Withdrawal</span>
                  <LucideIcon name="check-circle" className="info-icon-small" style={{ color: "#10b981" }} />
                </div>
                <h2>{totalWithdrawals.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 })}</h2>
                <p className="metric-subtext">Successfully settled payouts.</p>
              </div>
            </section>

            {/* Wallet Quick action Forms */}
            <div className="middle-layout-grid" style={{ marginTop: "24px" }}>
              {/* Quick Transaction Action Columns */}
              <div className="dashboard-panel wallet-forms-grid">
                {/* Deposit Form */}
                <div className="wallet-form-col">
                  <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a", marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <LucideIcon name="plus-circle" style={{ color: "#2563eb" }} /> Fund Cash Balance
                  </h3>
                  <p style={{ fontSize: "12px", color: "#64748b", marginBottom: "16px" }}>Select a gateway method to secure your wallet deposit credits.</p>
                  
                  <form onSubmit={executeDeposit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <label style={{ fontSize: "10.5px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>Payment Gateway</label>
                      <div className="input-wrapper">
                        <LucideIcon name="credit-card" className="input-icon" />
                        <select 
                          className="select-input" 
                          value={depositMethod} 
                          onChange={(e) => setDepositMethod(e.target.value)}
                          style={{
                            width: "100%",
                            padding: "8px 12px 8px 36px",
                            borderRadius: "8px",
                            border: "1px solid #cbd5e1",
                            fontSize: "12.5px",
                            fontWeight: "500",
                            backgroundColor: "#fff",
                            color: "#000"
                          }}
                        >
                          <option value="" disabled hidden>Select Payment Method</option>
                          <option value="bank-wire">Bank Wire Transfer</option>
                          <option value="bitcoin">Bitcoin Wallet Address</option>
                          <option value="usdt">USDT Tether (TRC-20)</option>
                        </select>
                      </div>
                    </div>

                    {depositMethod && (
                      <>
                        <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                          <label style={{ fontSize: "10.5px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>Deposit Amount ($)</label>
                          <div className="input-wrapper">
                            <LucideIcon name="dollar-sign" className="input-icon" />
                            <input 
                              type="number"
                              min="1"
                              placeholder="5000"
                              value={depositAmount}
                              onChange={(e) => setDepositAmount(e.target.value)}
                              style={{
                                width: "100%",
                                padding: "8px 12px 8px 36px",
                                borderRadius: "8px",
                                border: "1px solid #cbd5e1",
                                fontSize: "12.5px",
                                fontWeight: "500",
                                backgroundColor: "#fff",
                                color: "#000"
                              }}
                            />
                          </div>
                        </div>

                        <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                          <label style={{ fontSize: "10.5px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>Upload Payment Receipt</label>
                          <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            border: "1px dashed #cbd5e1",
                            borderRadius: "8px",
                            padding: "8px 12px",
                            backgroundColor: "#f8fafc",
                            cursor: "pointer",
                            position: "relative"
                          }}>
                            <LucideIcon name="upload" style={{ width: "16px", height: "16px", color: "#64748b" }} />
                            <span style={{ fontSize: "12px", color: depositReceiptName ? "#0f172a" : "#64748b", fontWeight: depositReceiptName ? "600" : "400", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
                              {depositReceiptName || "Choose receipt image/PDF..."}
                            </span>
                            <input 
                              type="file"
                              accept="image/*,application/pdf"
                              onChange={handleReceiptChange}
                              style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                width: "100%",
                                height: "100%",
                                opacity: 0,
                                cursor: "pointer"
                              }}
                              required
                            />
                          </div>
                        </div>

                        {/* Conditional Instruction panels for deposits */}
                        {depositMethod === "bank-wire" && (
                          <div style={{
                            padding: "16px",
                            backgroundColor: "#f8fafc",
                            border: "1px solid #cbd5e1",
                            borderRadius: "8px",
                            fontSize: "12.5px",
                            color: "#0f172a",
                            display: "flex",
                            flexDirection: "column",
                            gap: "10px"
                          }}>
                            {(!wireRecipientName && !wireRecipientAddress && !wireBankName && !wireRoutingNumber && !wireAccountNumber) ? (
                              <div style={{
                                color: "#d97706",
                                fontWeight: "500",
                                lineHeight: "1.4",
                                whiteSpace: "pre-wrap"
                              }}>
                                {adminBankWireInfo || "Wire transfer: please kindly contact our agent or check back in 30 mins."}
                              </div>
                            ) : (
                              <>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid #e2e8f0", paddingBottom: "6px" }}>
                                  <LucideIcon name="landmark" style={{ width: "16px", height: "16px", color: "#2563eb" }} />
                                  <span style={{ fontWeight: "700", color: "#0f172a", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Bank Wire Transfer Details</span>
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                  {wireRecipientName && (
                                    <div>
                                      <span style={{ fontWeight: "700", display: "block", color: "#64748b", textTransform: "uppercase", fontSize: "9px", marginBottom: "2px" }}>Recipient's Full Legal Name</span>
                                      <span style={{ fontWeight: "600", color: "#0f172a" }}>{wireRecipientName}</span>
                                    </div>
                                  )}
                                  {wireRecipientAddress && (
                                    <div>
                                      <span style={{ fontWeight: "700", display: "block", color: "#64748b", textTransform: "uppercase", fontSize: "9px", marginBottom: "2px" }}>Recipient's Physical Address</span>
                                      <span style={{ fontWeight: "600", color: "#0f172a" }}>{wireRecipientAddress}</span>
                                    </div>
                                  )}
                                  {wireBankName && (
                                    <div>
                                      <span style={{ fontWeight: "700", display: "block", color: "#64748b", textTransform: "uppercase", fontSize: "9px", marginBottom: "2px" }}>Recipient's Bank Name</span>
                                      <span style={{ fontWeight: "600", color: "#0f172a" }}>{wireBankName}</span>
                                    </div>
                                  )}
                                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                                    {wireRoutingNumber && (
                                      <div>
                                        <span style={{ fontWeight: "700", display: "block", color: "#64748b", textTransform: "uppercase", fontSize: "9px", marginBottom: "2px" }}>Wire Routing Number</span>
                                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                          <span style={{ fontWeight: "700", fontFamily: "monospace", color: "#2563eb" }}>{wireRoutingNumber}</span>
                                          <button 
                                            type="button"
                                            onClick={() => {
                                              navigator.clipboard.writeText(wireRoutingNumber);
                                              setCopiedField("routing");
                                              setTimeout(() => setCopiedField(""), 2000);
                                            }}
                                            style={{ border: "none", background: "none", cursor: "pointer", padding: "2px", display: "inline-flex", alignItems: "center" }}
                                            title="Copy Routing Number"
                                          >
                                            <LucideIcon 
                                              name={copiedField === "routing" ? "check" : "copy"} 
                                              style={{ width: "12px", height: "12px", color: copiedField === "routing" ? "#16a34a" : "#64748b" }} 
                                            />
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                    {wireAccountNumber && (
                                      <div>
                                        <span style={{ fontWeight: "700", display: "block", color: "#64748b", textTransform: "uppercase", fontSize: "9px", marginBottom: "2px" }}>Account Number</span>
                                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                          <span style={{ fontWeight: "700", fontFamily: "monospace", color: "#2563eb" }}>{wireAccountNumber}</span>
                                          <button 
                                            type="button"
                                            onClick={() => {
                                              navigator.clipboard.writeText(wireAccountNumber);
                                              setCopiedField("account");
                                              setTimeout(() => setCopiedField(""), 2000);
                                            }}
                                            style={{ border: "none", background: "none", cursor: "pointer", padding: "2px", display: "inline-flex", alignItems: "center" }}
                                            title="Copy Account Number"
                                          >
                                            <LucideIcon 
                                              name={copiedField === "account" ? "check" : "copy"} 
                                              style={{ width: "12px", height: "12px", color: copiedField === "account" ? "#16a34a" : "#64748b" }} 
                                            />
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                {adminBankWireInfo && (
                                  <div style={{
                                    marginTop: "4px",
                                    padding: "8px 10px",
                                    backgroundColor: "rgba(245, 158, 11, 0.08)",
                                    border: "1px solid rgba(245, 158, 11, 0.2)",
                                    borderRadius: "6px",
                                    fontSize: "11px",
                                    color: "#d97706",
                                    fontWeight: "500",
                                    lineHeight: "1.4",
                                    whiteSpace: "pre-wrap"
                                  }}>
                                    {adminBankWireInfo}
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        )}

                        {depositMethod === "bitcoin" && (
                          <div style={{
                            padding: "14px",
                            backgroundColor: "#fafafa",
                            border: "1px solid #cbd5e1",
                            borderRadius: "8px",
                            fontSize: "12px",
                            color: "#0f172a",
                            display: "flex",
                            flexDirection: "column",
                            gap: "10px"
                          }}>
                            <div>
                              <span style={{ fontWeight: "700", display: "block", color: "#64748b", textTransform: "uppercase", fontSize: "9.5px", marginBottom: "2px" }}>Bitcoin Wallet Address</span>
                              <span style={{ wordBreak: "break-all", fontFamily: "monospace", fontSize: "11px", fontWeight: "700", color: "#2563eb" }}>rhueiori3984738948ryujnieheihiegeigiei9374</span>
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                              <div>
                                <span style={{ fontWeight: "700", display: "block", color: "#64748b", textTransform: "uppercase", fontSize: "9.5px", marginBottom: "2px" }}>Network</span>
                                <span style={{ fontWeight: "700", color: "#047857" }}>BTC</span>
                              </div>
                              <div>
                                <span style={{ fontWeight: "700", display: "block", color: "#64748b", textTransform: "uppercase", fontSize: "9.5px", marginBottom: "2px" }}>Time Remaining</span>
                                <span style={{ fontWeight: "700", color: "#ef4444", fontFamily: "monospace" }}>{formatTimer(btcTimer)}</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {depositMethod === "usdt" && (
                          <div style={{
                            padding: "14px",
                            backgroundColor: "#fafafa",
                            border: "1px solid #cbd5e1",
                            borderRadius: "8px",
                            fontSize: "12px",
                            color: "#0f172a",
                            display: "flex",
                            flexDirection: "column",
                            gap: "10px"
                          }}>
                            <div>
                              <span style={{ fontWeight: "700", display: "block", color: "#64748b", textTransform: "uppercase", fontSize: "9.5px", marginBottom: "2px" }}>Tether Payout Address</span>
                              <span style={{ wordBreak: "break-all", fontFamily: "monospace", fontSize: "11px", fontWeight: "700", color: "#2563eb" }}>04diheuhrioeruoeruogfhjklfjrufofete</span>
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                              <div>
                                <span style={{ fontWeight: "700", display: "block", color: "#64748b", textTransform: "uppercase", fontSize: "9.5px", marginBottom: "2px" }}>Network</span>
                                <span style={{ fontWeight: "700", color: "#047857" }}>TRC20</span>
                              </div>
                              <div>
                                <span style={{ fontWeight: "700", display: "block", color: "#64748b", textTransform: "uppercase", fontSize: "9.5px", marginBottom: "2px" }}>Time Remaining</span>
                                <span style={{ fontWeight: "700", color: "#ef4444", fontFamily: "monospace" }}>{formatTimer(usdtTimer)}</span>
                              </div>
                            </div>
                          </div>
                        )}

                        <button type="submit" className="btn btn-filled w-full" style={{ padding: "10px", borderRadius: "8px", fontSize: "13px", fontWeight: "600", marginTop: "4px" }}>
                          Submit Deposit Alert
                        </button>
                      </>
                    )}
                  </form>
                </div>

                {/* Withdrawal Form */}
                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a", marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <LucideIcon name="minus-circle" style={{ color: "#f59e0b" }} /> Request Payout Clearance
                  </h3>
                  <p style={{ fontSize: "12px", color: "#64748b", marginBottom: "16px" }}>Withdraw liquid funds to your bank or crypto account securely.</p>
                  
                  <form onSubmit={executeWithdrawal} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <label style={{ fontSize: "10.5px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>Payout Destination</label>
                      <div className="input-wrapper">
                        <LucideIcon name="arrow-right-left" className="input-icon" />
                        <select 
                          className="select-input" 
                          value={withdrawMethod} 
                          onChange={(e) => setWithdrawMethod(e.target.value)}
                          style={{
                            width: "100%",
                            padding: "8px 12px 8px 36px",
                            borderRadius: "8px",
                            border: "1px solid #cbd5e1",
                            fontSize: "12.5px",
                            fontWeight: "500",
                            backgroundColor: "#fff",
                            color: "#000"
                          }}
                        >
                          <option value="" disabled hidden>Select Payout Method</option>
                          <option value="bitcoin">Bitcoin Wallet Address</option>
                          <option value="usdt">USDT Tether (TRC-20)</option>
                          <option value="bank-wire">Bank Wire Account</option>
                        </select>
                      </div>
                    </div>

                    {withdrawMethod && (
                      <>
                        <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                          <label style={{ fontSize: "10.5px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>Withdrawal Amount ($)</label>
                      <div className="input-wrapper">
                        <LucideIcon name="dollar-sign" className="input-icon" />
                        <input 
                          type="number"
                          min="1"
                          placeholder="2500"
                          value={withdrawAmount}
                          onChange={(e) => setWithdrawAmount(e.target.value)}
                          style={{
                            width: "100%",
                            padding: "8px 12px 8px 36px",
                            borderRadius: "8px",
                            border: "1px solid #cbd5e1",
                            fontSize: "12.5px",
                            fontWeight: "500",
                            backgroundColor: "#fff",
                            color: "#000"
                          }}
                        />
                      </div>
                    </div>

                    {/* Conditional input fields based on withdrawMethod */}
                    {withdrawMethod === "bitcoin" && (
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                          <label style={{ fontSize: "10.5px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>Your Bitcoin Receiving Address</label>
                          <div className="input-wrapper">
                            <LucideIcon name="wallet" className="input-icon" />
                            <input 
                              type="text"
                              required
                              placeholder="e.g. 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"
                              value={withdrawAddress}
                              onChange={(e) => setWithdrawAddress(e.target.value)}
                              style={{
                                width: "100%",
                                padding: "8px 12px 8px 36px",
                                borderRadius: "8px",
                                border: "1px solid #cbd5e1",
                                fontSize: "12.5px",
                                fontWeight: "500",
                                backgroundColor: "#fff",
                                color: "#000"
                              }}
                            />
                          </div>
                        </div>
                        <div style={{ fontSize: "11px", color: "#000", fontWeight: "600" }}>
                          Method Selected: Bitcoin Transfer (BTC Network)
                        </div>
                      </div>
                    )}

                    {withdrawMethod === "usdt" && (
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                          <label style={{ fontSize: "10.5px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>Your USDT (TRC-20) Payout Address</label>
                          <div className="input-wrapper">
                            <LucideIcon name="wallet" className="input-icon" />
                            <input 
                              type="text"
                              required
                              placeholder="e.g. TXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                              value={withdrawAddress}
                              onChange={(e) => setWithdrawAddress(e.target.value)}
                              style={{
                                width: "100%",
                                padding: "8px 12px 8px 36px",
                                borderRadius: "8px",
                                border: "1px solid #cbd5e1",
                                fontSize: "12.5px",
                                fontWeight: "500",
                                backgroundColor: "#fff",
                                color: "#000"
                              }}
                            />
                          </div>
                        </div>
                        <div style={{ fontSize: "11px", color: "#000", fontWeight: "600" }}>
                          Method Selected: Tether Payout (TRC20 Network)
                        </div>
                      </div>
                    )}

                    {withdrawMethod === "bank-wire" && (
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                          <label style={{ fontSize: "10.5px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>Bank Name</label>
                          <div className="input-wrapper">
                            <LucideIcon name="building" className="input-icon" />
                            <input 
                              type="text"
                              required
                              placeholder="e.g. Chase Bank"
                              value={bankName}
                              onChange={(e) => setBankName(e.target.value)}
                              style={{
                                width: "100%",
                                padding: "8px 12px 8px 36px",
                                borderRadius: "8px",
                                border: "1px solid #cbd5e1",
                                fontSize: "12.5px",
                                fontWeight: "500",
                                backgroundColor: "#fff",
                                color: "#000"
                              }}
                            />
                          </div>
                        </div>

                        <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                          <label style={{ fontSize: "10.5px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>Account Number</label>
                          <div className="input-wrapper">
                            <LucideIcon name="hash" className="input-icon" />
                            <input 
                              type="text"
                              required
                              placeholder="e.g. 123456789"
                              value={accountNumber}
                              onChange={(e) => setAccountNumber(e.target.value)}
                              style={{
                                width: "100%",
                                padding: "8px 12px 8px 36px",
                                borderRadius: "8px",
                                border: "1px solid #cbd5e1",
                                fontSize: "12.5px",
                                fontWeight: "500",
                                backgroundColor: "#fff",
                                color: "#000"
                              }}
                            />
                          </div>
                        </div>

                        <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                          <label style={{ fontSize: "10.5px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>Account Holder Name</label>
                          <div className="input-wrapper">
                            <LucideIcon name="user" className="input-icon" />
                            <input 
                              type="text"
                              required
                              placeholder="e.g. John Doe"
                              value={accountName}
                              onChange={(e) => setAccountName(e.target.value)}
                              style={{
                                width: "100%",
                                padding: "8px 12px 8px 36px",
                                borderRadius: "8px",
                                border: "1px solid #cbd5e1",
                                fontSize: "12.5px",
                                fontWeight: "500",
                                backgroundColor: "#fff",
                                color: "#000"
                              }}
                            />
                          </div>
                        </div>
                        
                        <div style={{ fontSize: "11px", color: "#000", fontWeight: "600" }}>
                          Method Selected: Bank Wire Settlement
                        </div>
                      </div>
                    )}

                    <button type="submit" className="btn btn-filled w-full" style={{ padding: "10px", borderRadius: "8px", fontSize: "13px", fontWeight: "600", marginTop: "4px" }}>
                      Request Payout Clearance
                    </button>
                      </>
                    )}
                  </form>
                </div>
              </div>

              {/* Billing Info Panel */}
              <div className="dashboard-panel" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a", margin: "0 0 4px" }}>Apexvest Investor Card</h3>
                
                {/* Visual Premium Card Mockup */}
                <div style={{
                  background: "linear-gradient(135deg, #2563eb, #1d4ed8, #1e3a8a)",
                  borderRadius: "14px",
                  padding: "20px",
                  color: "#fff",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  height: "140px",
                  boxShadow: "0 4px 14px rgba(37, 99, 235, 0.3)",
                  position: "relative",
                  overflow: "hidden"
                }}>
                  <div style={{ position: "absolute", right: "-20px", bottom: "-20px", width: "100px", height: "100px", background: "rgba(255,255,255,0.04)", borderRadius: "50%" }}></div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "13.5px", fontWeight: "800", letterSpacing: "1px" }}>APEXVEST</span>
                    <span style={{ fontSize: "9px", background: "rgba(255,255,255,0.2)", padding: "2px 6px", borderRadius: "4px" }}>PREMIUM</span>
                  </div>
                  
                  <div style={{ fontSize: "15px", letterSpacing: "1.5px", fontWeight: "600", fontFamily: "monospace" }}>
                    **** **** **** 2026
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                    <div>
                      <span style={{ fontSize: "8px", display: "block", opacity: "0.7", textTransform: "uppercase" }}>Card Holder</span>
                      <span style={{ fontSize: "12px", fontWeight: "600" }}>{userName}</span>
                    </div>
                    <div>
                      <span style={{ fontSize: "8px", display: "block", opacity: "0.7", textTransform: "uppercase" }}>Tier</span>
                      <span style={{ fontSize: "10px", fontWeight: "700" }}>ELITE INVESTOR</span>
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: "11px", color: "#64748b", lineHeight: "1.5", marginTop: "4px" }}>
                  <p style={{ margin: "0 0 6px" }}><strong>Settlement Rules:</strong></p>
                  <ul style={{ paddingLeft: "14px", margin: "0" }}>
                    <li style={{ marginBottom: "4px" }}>Bank wire credits clear within 1-2 business days.</li>
                    <li>Cryptocurrency payouts settle instantly after blockchain validations.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeView === "transactions" && (
          <div style={{ marginTop: "24px" }}>
            {/* Header Greeting */}
            <div className="dashboard-greeting" style={{ marginBottom: "24px" }}>
              <h1 style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                <a href="#" onClick={(e) => { e.preventDefault(); setActiveView("dashboard"); }} style={{ color: "#94a3b8", display: "inline-flex", alignItems: "center" }}><LucideIcon name="arrow-left" style={{ width: "24px", height: "24px" }} /></a>
                <span>Transaction History Ledger</span>
              </h1>
              <p>Review and filter your deposits, payouts, pending actions, and yield dividend earnings.</p>
            </div>

            {/* Filter Buttons Stack */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "20px" }}>
              {["all", "deposit", "withdrawal", "pending"].map((filter) => (
                <button
                  key={filter}
                  className={`btn ${txnFilter === filter ? "btn-filled" : "btn-outline"}`}
                  onClick={() => setTxnFilter(filter)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "8px",
                    fontSize: "12px",
                    textTransform: "capitalize",
                    fontWeight: "600"
                  }}
                >
                  {filter === "all" ? "All Transactions" : filter === "pending" ? "Pending Clearance" : `${filter}s`}
                </button>
              ))}
            </div>

            {/* Ledger Table */}
            <div className="dashboard-panel" style={{ padding: "20px", overflowX: "auto", border: "1px solid #eef0f3" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px", color: "#000" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #eef0f3", color: "#64748b", fontWeight: "600", fontSize: "11px", textTransform: "uppercase" }}>
                    <th style={{ padding: "12px 16px" }}>Reference Code</th>
                    <th style={{ padding: "12px 16px" }}>Date/Time</th>
                    <th style={{ padding: "12px 16px" }}>Transaction Type</th>
                    <th style={{ padding: "12px 16px" }}>Cleared Destination Details</th>
                    <th style={{ padding: "12px 16px" }}>Amount</th>
                    <th style={{ padding: "12px 16px" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {getFilteredTransactions().length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ padding: "24px", textAlign: "center", color: "#94a3b8" }}>
                        No transactions found matching the selected filter.
                      </td>
                    </tr>
                  ) : (
                    getFilteredTransactions().map((txn) => (
                      <tr key={txn.id} style={{ borderBottom: "1px solid #f1f5f9", transition: "background-color 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#fafbfd"} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}>
                        <td style={{ padding: "12px 16px", fontWeight: "700", fontFamily: "monospace" }}>{txn.id}</td>
                        <td style={{ padding: "12px 16px", color: "#64748b" }}>{txn.date}</td>
                        <td style={{ padding: "12px 16px" }}>
                          <span style={{
                            padding: "2px 8px",
                            borderRadius: "12px",
                            fontSize: "10px",
                            fontWeight: "700",
                            textTransform: "uppercase",
                            backgroundColor: txn.type === "deposit" || txn.type === "dividend" ? "rgba(16,185,129,0.12)" : txn.type === "withdrawal" ? "rgba(249,115,22,0.12)" : "rgba(37,99,235,0.12)",
                            color: txn.type === "deposit" || txn.type === "dividend" ? "#047857" : txn.type === "withdrawal" ? "#c2410c" : "#1d4ed8"
                          }}>
                            {txn.type}
                          </span>
                        </td>
                        <td style={{ padding: "12px 16px", color: "#334155", fontWeight: "500" }}>{txn.detail}</td>
                        <td style={{
                          padding: "12px 16px",
                          fontWeight: "700",
                          color: txn.type === "deposit" || txn.type === "dividend" ? "#10b981" : "#0f172a"
                        }}>
                          {txn.type === "deposit" || txn.type === "dividend" ? "+" : "-"}${txn.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <span style={{
                            padding: "2px 8px",
                            borderRadius: "12px",
                            fontSize: "10.5px",
                            fontWeight: "700",
                            backgroundColor: txn.status === "Completed" ? "rgba(16,185,129,0.1)" : txn.status === "Pending" ? "rgba(245,158,11,0.1)" : "rgba(37,99,235,0.1)",
                            color: txn.status === "Completed" ? "#047857" : txn.status === "Pending" ? "#d97706" : "#1d4ed8"
                          }}>
                            {txn.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeView === "settings" && (
          <div style={{ marginTop: "24px" }}>
            {/* Header Greeting */}
            <div className="dashboard-greeting" style={{ marginBottom: "24px" }}>
              <h1 style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                <a href="#" onClick={(e) => { e.preventDefault(); setActiveView("dashboard"); }} style={{ color: "#94a3b8", display: "inline-flex", alignItems: "center" }}><LucideIcon name="arrow-left" style={{ width: "24px", height: "24px" }} /></a>
                <span>General Settings Profile</span>
              </h1>
              <p>Configure credentials, update user information, and secure Linked Wallet options.</p>
            </div>

            <div className="middle-layout-grid">
              {/* Left Settings Sidebar */}
              <div className="dashboard-panel" style={{ height: "fit-content", padding: "16px", border: "1px solid #eef0f3" }}>
                <button
                  className={`btn w-full ${settingsTab === "profile" ? "btn-filled" : "btn-outline"}`}
                  onClick={() => setSettingsTab("profile")}
                  style={{
                    padding: "10px 16px",
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontWeight: "600",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "8px",
                    justifyContent: "flex-start"
                  }}
                >
                  <LucideIcon name="user" /> Profile Details
                </button>
                <button
                  className={`btn w-full ${settingsTab === "wallets" ? "btn-filled" : "btn-outline"}`}
                  onClick={() => setSettingsTab("wallets")}
                  style={{
                    padding: "10px 16px",
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontWeight: "600",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    justifyContent: "flex-start"
                  }}
                >
                  <LucideIcon name="wallet" /> Wallet Clearances
                </button>
              </div>

              {/* Right Settings Form Content */}
              <div className="dashboard-panel" style={{ padding: "24px", border: "1px solid #eef0f3" }}>
                {settingsTab === "profile" ? (
                  <form onSubmit={saveProfileSettings} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a", margin: "0", display: "flex", alignItems: "center", gap: "8px" }}>
                      <LucideIcon name="user" style={{ color: "#2563eb" }} /> Investor Profile Details
                    </h3>
                    
                    <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <label style={{ fontSize: "10.5px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>Full Account Holder Name</label>
                      <div className="input-wrapper">
                        <LucideIcon name="user" className="input-icon" />
                        <input
                          type="text"
                          required
                          value={formUserName}
                          onChange={(e) => setFormUserName(e.target.value)}
                          style={{
                            width: "100%",
                            padding: "8px 12px 8px 36px",
                            borderRadius: "8px",
                            border: "1px solid #cbd5e1",
                            fontSize: "13px",
                            fontWeight: "500",
                            backgroundColor: "#fff",
                            color: "#000"
                          }}
                        />
                      </div>
                    </div>

                    <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <label style={{ fontSize: "10.5px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>Email Address</label>
                      <div className="input-wrapper">
                        <LucideIcon name="mail" className="input-icon" />
                        <input
                          type="email"
                          required
                          value={formUserEmail}
                          onChange={(e) => setFormUserEmail(e.target.value)}
                          style={{
                            width: "100%",
                            padding: "8px 12px 8px 36px",
                            borderRadius: "8px",
                            border: "1px solid #cbd5e1",
                            fontSize: "13px",
                            fontWeight: "500",
                            backgroundColor: "#fff",
                            color: "#000"
                          }}
                        />
                      </div>
                    </div>

                    <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <label style={{ fontSize: "10.5px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>Account Clearance Tier</label>
                      <div className="input-wrapper">
                        <LucideIcon name="shield" className="input-icon" />
                        <input
                          type="text"
                          disabled
                          value="Premium Accredited Brokerage Account"
                          style={{
                            width: "100%",
                            padding: "8px 12px 8px 36px",
                            borderRadius: "8px",
                            border: "1px solid #cbd5e1",
                            fontSize: "13px",
                            fontWeight: "500",
                            backgroundColor: "#f1f5f9",
                            color: "#64748b",
                            cursor: "not-allowed"
                          }}
                        />
                      </div>
                    </div>

                    <button type="submit" className="btn btn-filled" style={{ padding: "10px 16px", borderRadius: "8px", fontSize: "13.5px", alignSelf: "flex-start", fontWeight: "600" }}>
                      Save Profile Changes
                    </button>
                  </form>
                ) : (
                  <form onSubmit={saveWalletSettings} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a", margin: "0", display: "flex", alignItems: "center", gap: "8px" }}>
                      <LucideIcon name="wallet" style={{ color: "#2563eb" }} /> Saved Payout Destinations
                    </h3>

                    <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <label style={{ fontSize: "10.5px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>Default Bitcoin Payout Address</label>
                      <div className="input-wrapper">
                        <LucideIcon name="bitcoin" className="input-icon" />
                        <input
                          type="text"
                          placeholder="e.g. 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"
                          value={withdrawBTCAddr}
                          onChange={(e) => setWithdrawBTCAddr(e.target.value)}
                          style={{
                            width: "100%",
                            padding: "8px 12px 8px 36px",
                            borderRadius: "8px",
                            border: "1px solid #cbd5e1",
                            fontSize: "13px",
                            fontWeight: "500",
                            backgroundColor: "#fff",
                            color: "#000"
                          }}
                        />
                      </div>
                    </div>

                    <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <label style={{ fontSize: "10.5px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>Default Receiving Bank Name</label>
                      <div className="input-wrapper">
                        <LucideIcon name="building" className="input-icon" />
                        <input
                          type="text"
                          placeholder="e.g. Chase Bank"
                          value={withdrawBankName}
                          onChange={(e) => setWithdrawBankName(e.target.value)}
                          style={{
                            width: "100%",
                            padding: "8px 12px 8px 36px",
                            borderRadius: "8px",
                            border: "1px solid #cbd5e1",
                            fontSize: "13px",
                            fontWeight: "500",
                            backgroundColor: "#fff",
                            color: "#000"
                          }}
                        />
                      </div>
                    </div>

                    <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <label style={{ fontSize: "10.5px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>Default Receiving Bank Account Number</label>
                      <div className="input-wrapper">
                        <LucideIcon name="hash" className="input-icon" />
                        <input
                          type="text"
                          placeholder="e.g. 123456789"
                          value={withdrawAccountNum}
                          onChange={(e) => setWithdrawAccountNum(e.target.value)}
                          style={{
                            width: "100%",
                            padding: "8px 12px 8px 36px",
                            borderRadius: "8px",
                            border: "1px solid #cbd5e1",
                            fontSize: "13px",
                            fontWeight: "500",
                            backgroundColor: "#fff",
                            color: "#000"
                          }}
                        />
                      </div>
                    </div>

                    <button type="submit" className="btn btn-filled" style={{ padding: "10px 16px", borderRadius: "8px", fontSize: "13.5px", alignSelf: "flex-start", fontWeight: "600" }}>
                      Save Payout Clearances
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
