import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { email, username } = await request.json();

    const brevoApiKey = process.env.BREVO_API_KEY;
    const senderEmail = process.env.BREVO_SENDER_EMAIL || "jacksonmerrill9870@gmail.com";

    if (!brevoApiKey) {
      console.error("Missing BREVO_API_KEY environment variable");
      return NextResponse.json({ error: "SMTP service is not configured" }, { status: 500 });
    }

    // Determine base URL dynamically
    const host = request.headers.get("host") || "apexvest-nine.vercel.app";
    const protocol = host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : "https";
    const redirectUrl = `${protocol}://${host}/dashboard`;

    // Premium designed HTML welcome email
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome to Apexvest</title>
        <style>
          body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            background-color: #0b0d10;
            color: #f8fafc;
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
          }
          .email-container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #111316;
            border-radius: 12px;
            overflow: hidden;
            border: 1px solid rgba(226, 255, 59, 0.1);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
          }
          .header {
            background-color: #0b0d10;
            padding: 40px 20px;
            text-align: center;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          }
          .logo-text {
            font-size: 26px;
            font-weight: 800;
            color: #ffffff;
            letter-spacing: 2px;
            margin: 0;
          }
          .logo-text span {
            color: #e2ff3b;
          }
          .body-content {
            padding: 40px 30px;
            line-height: 1.6;
          }
          h1 {
            font-size: 22px;
            color: #ffffff;
            margin-top: 0;
            margin-bottom: 20px;
          }
          p {
            color: #94a3b8;
            font-size: 15px;
            margin-bottom: 30px;
          }
          .cta-button-container {
            text-align: center;
            margin: 40px 0;
          }
          .cta-button {
            background-color: #e2ff3b;
            color: #0b0d10;
            padding: 16px 36px;
            font-weight: 700;
            font-size: 15px;
            text-decoration: none;
            border-radius: 8px;
            display: inline-block;
            box-shadow: 0 4px 15px rgba(226, 255, 59, 0.3);
            transition: all 0.2s ease;
          }
          .footer {
            background-color: #0b0d10;
            padding: 30px 20px;
            text-align: center;
            font-size: 12px;
            color: #64748b;
            border-top: 1px solid rgba(255, 255, 255, 0.05);
          }
          .footer-risk {
            font-size: 11px;
            line-height: 1.5;
            margin-top: 15px;
            color: #475569;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <div class="logo-text">APEX<span>VEST</span></div>
          </div>
          <div class="body-content">
            <h1>Welcome to the Future of Trading, ${username}!</h1>
            <p>
              Your account has been successfully created. We are excited to guide you on your financial investment journey. You now have complete access to Forex, Crude Oil, Crypto, Stocks, and NFTs.
            </p>
            <p>
              Please click the button below to confirm your email registration and directly enter your active trading dashboard.
            </p>
            
            <div class="cta-button-container">
              <a href="${redirectUrl}" class="cta-button">Go to Dashboard</a>
            </div>
            
            <p>
              If you have any questions or require support, please contact our round-the-clock priority customer success team at <strong>apexvest.inc@gmail.com</strong>.
            </p>
          </div>
          <div class="footer">
            <p>&copy; 2026 Apexvest Group. All rights reserved.</p>
            <p class="footer-risk">
              Risk Warning: Trading Forex/CFDs involves substantial risk of loss and is not suitable for every investor. Please ensure you understand all risks before trading.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const brevoResponse = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": brevoApiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: {
          name: "Apexvest Support",
          email: senderEmail,
        },
        to: [
          {
            email: email,
            name: username,
          },
        ],
        subject: "Welcome to Apexvest - Confirm Your Account",
        htmlContent: htmlContent,
      }),
    });

    const brevoResult = await brevoResponse.json();

    if (!brevoResponse.ok) {
      console.error("Brevo API error:", brevoResult);
      return NextResponse.json({ error: brevoResult.message || "Failed to send email" }, { status: 500 });
    }

    return NextResponse.json({ success: true, messageId: brevoResult.messageId });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
