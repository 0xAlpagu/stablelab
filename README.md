[README.md](https://github.com/user-attachments/files/31027012/README.md)
# StableLab

A suite of stablecoin-native DeFi and payment tools deployed on Arc Testnet, built entirely on real Arc-issued assets: USDC, EURC, and cirBTC.

**Live app:** https://stablelabs.vercel.app
**GitHub Pages mirror:** https://0xalpagu.github.io/stablelab/

## Overview

StableLab is a suite of eight interoperable modules spanning core DeFi primitives, treasury/payment tools, and a confidential payments layer. Each module is an independent, standalone smart contract; they are not wired together through a shared settlement or accounting layer. They are best thought of as a coordinated set of tools built on the same asset base (USDC, EURC, cirBTC) rather than a single unified system.

The project demonstrates what Arc's stablecoin-optimized infrastructure can support when you build across the full stack Circle provides: USDC as the settlement asset, CCTP for cross-chain liquidity, Gateway for unified balances, and Circle Wallets for onboarding.

## Modules

### DeFi

**Staking**
USDC deposits accrue a continuous, per-second reward with no lockup period. Principal and reward are withdrawn together at any time.

**Lending**
Borrowers post USDC or cirBTC as collateral and draw USDC instantly up to 66% of collateral value. cirBTC is used here as a testnet representation of wrapped Bitcoin. Its exchange rate against USDC is set via a fixed demo parameter (1 cirBTC = 100,000 USDC) rather than a live price oracle.

**Swap**
Two independent constant-product AMM pools (USDC/EURC and USDC/cirBTC), each with a 0.3% liquidity provider fee, slippage protection, a live price-impact indicator, and LP share tracking.

**Bridge**
Real CCTP v2 burn-and-mint bridging into Arc from any supported testnet chain. A second mode is built on Circle's Unified Balance (Gateway), for spending USDC held across multiple chains directly to an Arc wallet.

### Treasury & Payments (confidential)

FlowPay, TrustLock, VaultGuard, and BulkPay now support encrypted transaction amounts. The design mirrors the interface described in Circle's Arc Privacy Sector (APS) whitepaper: amounts are encrypted client-side with AES-256-GCM, and only authorized parties can decrypt them. The real APS precompile is not live on testnet yet, so a placeholder contract (`MockAPS`) stands in for it today; when the real precompile ships, only the underlying address needs to change, not the module logic.

**FlowPay**
Continuous payment streaming. Funds vest to the recipient second-by-second over a sender-defined duration. The total amount and the currently withdrawable balance are visible only to the sender, the recipient, or someone they explicitly authorize. A 0.25% platform fee is taken at stream creation.

**TrustLock**
Arbiter-based escrow. The deal amount is encrypted: the depositor and beneficiary always see it, but the arbiter only sees it if explicitly granted access, so they stay neutral until a dispute actually arises. Release requires depositor or arbiter action. Refund requires beneficiary or arbiter action. A 1% fee applies on release only, none on refund.

**VaultGuard**
Multi-signer shared treasury with configurable approval thresholds. A proposal's amount is encrypted; any current signer of the vault can decrypt it, since they need to know what they're approving, but outside observers cannot. Signer membership and confirmation threshold can be updated after deployment. A 0.2% fee applies on executed transfers.

**BulkPay**
Pay many recipients in a single transaction instead of one by one. Each amount is encrypted separately, so every recipient can only decrypt their own payment, never anyone else's on the same list. A 0.1% fee is taken per recipient. Capped at 50 recipients per transaction for gas safety.

Each treasury module surfaces its fee breakdown live in the interface before a transaction is submitted.

### Dashboard

A single page aggregating wallet balances (USDC/EURC/cirBTC), DeFi positions (staking balance and reward, lending collateral and debt, swap LP shares), and recent activity across the confidential modules (who transacted and when, never the amount) in one place.

## Circle Stack Integration

**USDC** as the settlement asset across all modules, alongside EURC and cirBTC where relevant.

**CCTP**, via Circle App Kit, for genuine cross-chain USDC transfer into Arc.

**Circle Gateway**, via App Kit's Unified Balance, for combining USDC held across chains into a single spendable balance on Arc.

**Circle Wallets** (User-Controlled), giving users a working Arc wallet from an email address and PIN, with no browser extension or seed phrase.

## Setup

StableLab is a static site (plain HTML, CSS, and JavaScript, with ethers.js loaded from a CDN). There is no build step and no npm install required for the core DeFi modules.

**Running the core modules locally or on GitHub Pages**
Clone the repo and serve the files with any static file server. Connect an EVM wallet (Rabby or MetaMask) to Arc Network Testnet (chain ID 5042002) and the Staking, Lending, Swap, Bridge, FlowPay, TrustLock, VaultGuard, and BulkPay modules work directly against the deployed contracts.

**Running Circle Wallets locally**
The `/wallet/` module needs a server-held API credential, so it only works when deployed with serverless functions (this repo is deployed on Vercel for that reason). To run it yourself:
1. Deploy the repo to Vercel.
2. Set the environment variable `CIRCLE_API_KEY` to a Circle test API key, keeping the `TEST_API_KEY:` prefix included.
3. The `/wallet/` page will call the serverless function, which brokers Circle Wallets authentication server-side.

The GitHub Pages mirror does not include the serverless backend, so `/wallet/` will not work there. It works only on the Vercel deployment.

## Circle Integration Details

**CCTP (Bridge)**
Uses Circle's App Kit SDK, loaded via jsdelivr as an ES module. The bridge calls `kit.getSupportedChains("bridge")` to pull the live list of supported source chains and their USDC contract addresses at runtime, rather than hardcoding a chain list. Roughly 22 EVM testnets are covered.

**Circle Gateway (Unified Balance)**
Same App Kit SDK, using `kit.getSupportedChains("unifiedBalance")` to combine USDC held across multiple chains into a single spendable balance on Arc.

**Circle Wallets (User-Controlled)**
Uses `@circle-fin/w3s-pw-web-sdk`, loaded via jsdelivr as an ES module, with App ID `bbd478e6-cd6c-5d48-924b-b5f29af26638` and `blockchains: ["ARC-TESTNET"]`. Because wallet creation requires a server-held API credential, a thin Vercel serverless function holds the `CIRCLE_API_KEY` and brokers the authentication step. The client never sees the API key directly. The current flow uses a username/email field plus a PIN set inside Circle's own secure interface; there is no social login (Google, etc.) option at this time.

## Contracts (Arc Testnet)

**Chain ID:** 5042002

| Contract | Address |
|---|---|
| USDC | `0x3600000000000000000000000000000000000000` |
| EURC | `0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a` |
| cirBTC | `0xf0C4a4CE82A5746AbAAd9425360Ab04fbBA432BF` |
| Staking | `0x35F2E254c71394f923B6Ac2Aead20beAf41573E5` |
| Lending | `0x7d1cb2D60523c557f1FcCd2ffa8FbADC00C1C1bC` |
| Swap | `0x2b91E208152c372e7F2F51e69CE9738DD0Cca784` |
| MockAPS (privacy layer) | `0x9C2DC9230d1A2E8b345cbeEB84c90F625A4A598B` |
| FlowPay (streaming) | `0x8e74FfdB734a3AfA50dB75d54762B89db1DcADcA` |
| TrustLock (escrow) | `0x8f82FEff8621A20cBcE474fBe0c74b3335e5BC69` |
| VaultGuard (multi-sig) | `0x992369C19ff315f87c47Cc0512a215F2BdBAA1A1` |
| BulkPay | `0xecEdCeA9f40f07311FC4482C7743D7df6F1eB817` |

All contracts above are verified on the [Arc Testnet explorer](https://testnet.arcscan.app).

## Site Structure

```
/staking/   /lending/   /swap/      /streaming/
/escrow/    /multisig/  /bulk/      /bridge/
/dashboard/ /wallet/    /core/      /treasury/
/about/     /pricing/   /contact/
```

Deployed on both GitHub Pages (static) and Vercel (adds serverless functions for Circle Wallets authentication).

## Known Limitations

**The privacy layer is not the real Arc Privacy Sector precompile.** `MockAPS` mirrors the interface described in Circle's whitepaper but does not provide real TEE/enclave-level security. Encryption protects amounts up until the point of withdrawal or release; at that moment, the underlying transaction becomes a standard, publicly visible ERC-20 transfer, same as on any EVM chain.

## Status

All contracts are deployed and verified on Arc Testnet. Every module has been tested end-to-end, deposit through withdrawal, including the CCTP bridge flow, Circle Wallets onboarding, and the confidential payment flows (encryption, selective access, decryption). Open source, under active development.

## Feedback

Open to feedback from anyone in the community. This project continues to be improved and updated based on it.
