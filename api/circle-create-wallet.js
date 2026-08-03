// Vercel serverless function.
// Creates a "challenge" (PIN + wallet creation flow) for an already-authenticated
// Circle user. The returned challengeId is executed client-side by the Web SDK,
// which shows Circle's own secure PIN modal.

import { initiateUserControlledWalletsClient } from "@circle-fin/user-controlled-wallets";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const client = initiateUserControlledWalletsClient({
    apiKey: process.env.CIRCLE_API_KEY,
  });

  try {
    const { userToken } = req.body || {};
    if (!userToken) {
      res.status(400).json({ error: "userToken is required" });
      return;
    }

    const response = await client.createUserPinWithWallets({
      userToken,
      accountType: "EOA",
      blockchains: ["ARC-TESTNET"],
    });

    res.status(200).json({ challengeId: response.data.challengeId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err?.message || "Unknown error" });
  }
}
