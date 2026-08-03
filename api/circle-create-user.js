// Vercel serverless function.
// Creates a new Circle user (if not already existing) and returns a fresh
// session token + encryption key for the frontend Web SDK.
// The CIRCLE_API_KEY is only ever used here, on the server — never sent to the browser.

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
    const { userId } = req.body || {};
    if (!userId) {
      res.status(400).json({ error: "userId is required" });
      return;
    }

    // Create the user. If they already exist, Circle returns an error we can ignore.
    try {
      await client.createUser({ userId });
    } catch (createErr) {
      const alreadyExists =
        createErr?.response?.data?.code === 155101 ||
        String(createErr?.message || "").toLowerCase().includes("already");
      if (!alreadyExists) throw createErr;
    }

    const tokenResponse = await client.createUserToken({ userId });

    res.status(200).json({
      userId,
      userToken: tokenResponse.data.userToken,
      encryptionKey: tokenResponse.data.encryptionKey,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err?.message || "Unknown error" });
  }
}
