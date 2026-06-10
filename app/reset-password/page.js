"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import LucideIcon from "@/components/LucideIcon";

export default function ResetPassword() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const { error: resetErr } = await supabase.auth.updateUser({
      password: password,
    });

    setLoading(false);

    if (resetErr) {
      setError(resetErr.message);
    } else {
      setSuccess("Your password has been successfully updated! Redirecting to login...");
      setPassword("");
      setConfirmPassword("");
      setTimeout(() => {
        router.push("/");
        setTimeout(() => {
          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("open-auth-modal", { detail: "login" }));
          }
        }, 800);
      }, 3000);
    }
  };

  return (
    <main style={{ 
      minHeight: "70vh", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center", 
      background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
      padding: "80px 24px" 
    }}>
      <div className="modal-card glass-panel modal-auth-white" style={{ 
        maxWidth: "420px", 
        width: "100%", 
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)"
      }}>
        <form className="modal-form active" onSubmit={handleResetSubmit}>
          <h2 style={{ textAlign: "center", marginBottom: "8px" }}>Set New Password</h2>
          <p style={{ color: "#64748b", fontSize: "13.5px", textAlign: "center", marginBottom: "24px" }}>
            Create a secure password for your Apexvest portfolio account.
          </p>

          {error && (
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
              {error}
            </div>
          )}

          {success && (
            <div className="success-banner" style={{ 
              color: "var(--color-green)", 
              backgroundColor: "var(--color-green-soft)", 
              padding: "10px", 
              borderRadius: "8px", 
              marginBottom: "15px", 
              fontSize: "14px", 
              border: "1px solid rgba(16, 185, 129, 0.2)",
              textAlign: "center"
            }}>
              {success}
            </div>
          )}

          <div className="form-group">
            <label>New Password</label>
            <div className="input-wrapper">
              <LucideIcon name="lock" className="input-icon" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter New Password"
                required 
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <div className="input-wrapper">
              <LucideIcon name="lock" className="input-icon" />
              <input 
                type="password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm New Password"
                required 
                disabled={loading}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-filled w-full btn-large" style={{ marginTop: "12px" }} disabled={loading}>
            {loading ? "Updating Password..." : "Update Password"}
          </button>
        </form>
      </div>
    </main>
  );
}
