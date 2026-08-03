[README.md](https://github.com/user-attachments/files/30650025/README.md)
# StableLab

A full-stack DeFi ecosystem built from scratch on [Arc](https://www.arc.network): 8 live modules, all running on real Arc-native assets (USDC, EURC, cirBTC), not custom demo tokens.

**Live app:** [stablelabs.vercel.app](https://stablelabs.vercel.app) · [0xalpagu.github.io/stablelab](https://0xalpagu.github.io/stablelab)
**Code:** this repository
**Network:** Arc Testnet (Chain ID `5042002`)

Built by an independent, solo builder with no prior coding background, using AI-assisted development throughout.

---

## What's inside

### Core Tools

| Module | What it does |
|---|---|
| **Staking** | Lock USDC, earn a continuous, per-second reward. No lockup; withdraw principal and reward together whenever you like. |
| **Lending** | Post USDC *or* cirBTC as collateral, borrow USDC instantly up to 66% of your collateral's value. |
| **Swap** | Two AMM pools (USDC↔EURC, USDC↔cirBTC), x·y=k pricing, 0.3% LP fee. |
| **Bridge** | Bring USDC to Arc from another testnet chain via Circle's **CCTP** (real burn-and-mint), or via Circle's **Unified Balance Kit** (Gateway) to combine USDC held across multiple chains into a single spend on Arc. |

### Treasury & Payment Tools

| Module | What it does |
|---|---|
| **FlowPay** | Continuous payment streaming: funds vest second-by-second instead of arriving as a lump sum. 0.25% platform fee. |
| **TrustLock** | Arbiter-based escrow. Funds release only when the agreed condition is met, or refund if it doesn't. 1% fee on release, no fee on refund. |
| **VaultGuard** | Multi-approval shared treasury. A transfer only executes once enough signers confirm. 0.2% fee on executed transfers. |
| **VeloPay** | Invoice factoring: upload an unpaid invoice, receive 97% of its value instantly instead of waiting 30-60 days. 0.5% platform fee on repayment. |

---

## Circle tools used

- **USDC**: the primary settlement asset across every module (native Arc USDC, `0x3600000000000000000000000000000000000000`)
- **EURC** / **cirBTC**: secondary assets in the Swap and Lending modules
- **CCTP** (via [Arc App Kit](https://docs.arc.io/app-kit)): cross-chain USDC bridging into Arc, real burn-and-mint, no wrapped tokens
- **Gateway / Unified Balance Kit** (via Arc App Kit): deposit USDC from any supported testnet chain and spend it directly on Arc, combining balances across chains
- **Circle Faucet**: the site links directly to `faucet.circle.com` instead of a custom faucet contract, since real USDC/EURC/cirBTC can't be minted by the app itself

## Architecture

StableLab has no traditional backend server. It's a static frontend (plain HTML/CSS/JS, no build step) talking directly to:

1. **Smart contracts deployed on Arc Testnet** (see addresses below) via `ethers.js` and the user's own browser wallet (Rabby/MetaMask-compatible).
2. **Circle's App Kit SDK** (loaded via ESM CDN, no bundler required) for CCTP bridging and Unified Balance, using [EIP-6963](https://eips.ethereum.org/EIPS/eip-6963) wallet discovery and a `viem` adapter connected to the user's injected wallet, never a private key.

```
┌─────────────────────────┐
│   Browser (static site)  │
│  HTML / CSS / ethers.js  │
└─────────┬────────┬───────┘
          │        │
   ethers.js    Circle App Kit (viem adapter)
          │        │
          ▼        ▼
┌─────────────────────────┐      ┌───────────────────────┐
│   Arc Testnet contracts  │      │  CCTP / Gateway infra  │
│  (Staking, Lending, ...) │◄─────┤   (Circle, other       │
└─────────────────────────┘      │    testnet chains)      │
                                  └───────────────────────┘
```

## Deployed contracts (Arc Testnet)

All contracts are verified on [testnet.arcscan.app](https://testnet.arcscan.app).

| Contract | Address | Description |
|---|---|---|
| StakingV2 | `0x35F2E254c71394f923B6Ac2Aead20beAf41573E5` | USDC staking with per-second rewards |
| LendingV2 | `0x7d1cb2D60523c557f1FcCd2ffa8FbADC00C1C1bC` | USDC/cirBTC collateralized USDC lending |
| SwapV3 | `0xA89e5413390C663bED9fc40D54507Cb3F8d52434` | USDC↔EURC and USDC↔cirBTC AMM pools |
| StreamingV2 (FlowPay) | `0x7e57100bb7e942Ee10F99aCbf0e6Fd282b220A3B` | Continuous payment streaming |
| EscrowV2 (TrustLock) | `0x8BBdE5DeA50C370b116efda19c2554BCF64Dac8c` | Arbiter-based escrow |
| MultiSigV2 (VaultGuard) | `0xdb079Bf33820Ff818A9be0935Fc25e37f14f8061` | Multi-approval shared treasury |
| VeloPayV2 | `0x7be5cE722405A1d965c8e8E81535B74Eb5D0Ef47` | Invoice factoring |

All contracts have a reentrancy guard and checked ERC-20 transfers, added after a [SolidityScan](https://solidityscan.com) security pass.

## Running locally

No build step, no dependencies to install for the frontend itself.

```bash
git clone https://github.com/0xAlpagu/stablelab.git
cd stablelab
# open index.html directly, or serve the folder with any static file server, e.g.:
npx serve .
```

Each module lives in its own folder (`staking/`, `lending/`, `swap/`, `bridge/`, `streaming/`, `escrow/`, `multisig/`, `velopay/`) with a self-contained `index.html`.

To interact with the app, you'll need:
- A browser wallet (Rabby, MetaMask, or any EIP-1193/EIP-6963-compatible wallet)
- Arc Testnet added to your wallet (Chain ID `5042002`, RPC `https://rpc.testnet.arc.network`)
- Testnet USDC/EURC/cirBTC from [faucet.circle.com](https://faucet.circle.com)

## Contract source

Solidity source files (`.sol`) for all deployed contracts are included in this repository.

## Feedback welcome

This project is actively evolving. Feedback on the CCTP/Gateway integration in the Bridge module, or on the overall architecture, is very welcome; feel free to open an issue.
