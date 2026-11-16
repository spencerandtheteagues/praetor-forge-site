// Wealth & Powers OS: the investor harness built for Jayson Powers.
// Copy rules: no dollar figures, no profit claims, no absolute claims.

const shot = (n, height, fullHeight, extra) => ({
  id: `screen-${n}`,
  src: `/case-studies/jayson/screen-${n}`,
  width: 1600,
  height,
  full: {
    src: `/case-studies/jayson/screen-${n}.jpg`,
    width: 1999,
    height: fullHeight,
  },
  ...extra,
});

export const JAYSON = {
  name: "Jayson Powers",
  role: "Private investor · Missouri",
  portrait: {
    src: "/case-studies/jayson/jayson-powers.webp",
    fallback: "/case-studies/jayson/jayson-powers.jpg",
    width: 714,
    height: 719,
  },
  // Verbatim from the August review. One clause about trading results is
  // omitted (marked with an ellipsis and bracket) because we don't publish
  // performance claims; nothing else is reworded.
  quote: [
    "I\u2019ve been investing for over 20 years and I\u2019ve never had a single tool that puts this much firepower in one place. The Wealth & Powers OS does things I genuinely didn\u2019t think were possible. \u2026 [W]hat sold me is that I could see exactly why every trade was proposed and approve it before a dollar moved.",
    "The research engine goes deeper than analysts I\u2019ve paid for, and Item Search tracked down something I\u2019d been hunting for months in under ten minutes. Spencer built and installed the whole system in a single session; when I hit a snag during setup, he had it fixed before I finished explaining it.",
    "Fast, sharp, and it works exactly the way he said it would. Five stars \u2014 and I\u2019d give ten if the scale went that high.",
  ],
};

export const WEALTH_GROUPS = [
  {
    id: "command",
    label: "Command Center",
    title: "One unified view of a complex portfolio.",
    intro:
      "Jayson holds stocks, crypto, precious metals and real estate. He asked for one place where every asset is visible, every AI recommendation is checked by a second model, and nothing trades without his approval.",
    screens: ["screen-4"],
  },
  {
    id: "midas",
    label: "Midas Mode",
    title: "An autonomous agent inside a hard risk envelope.",
    intro:
      "Jayson sets a starting stake and a mission clock, from three hours to \u201cuntil I stop it,\u201d and the agent re-evaluates every position on a 45-second cycle, journaling each decision. The kill switch at a drawdown percentage, the maximum single position and the daily-loss pause are enforced by the engine, not entrusted to the model.",
    screens: ["screen-5", "screen-13"],
  },
  {
    id: "research",
    label: "Dual-Audited Research",
    title: "Grounded in live data, then cross-examined.",
    intro:
      "Each research job is grounded in verified quotes and fresh headlines before a model runs. A second, independent model then audits the findings for conflicts and unsupported claims, and the verdict ships with the report.",
    screens: ["screen-9"],
  },
  {
    id: "markets",
    label: "Stocks \u00b7 Crypto \u00b7 Metals",
    title: "Prices checked against more than one source.",
    intro:
      "Stocks use a Yahoo Finance consensus with per-source checks. Crypto is compared across CoinGecko, Coinbase and Kraken. Metals compare front-month futures with spot, with a 2.5% basis tolerance before a flag fires. Orders wait until Jayson confirms the exact price and signal.",
    screens: ["screen-6", "screen-7", "screen-8"],
  },
  {
    id: "tools",
    label: "Real Estate, Item Search & Model Routing",
    title: "Specialist tools, with full control of the models.",
    intro:
      "A real-estate search and listing watcher, an item-hunting agent, and a routing panel that assigns a model to each role, from inexpensive local summarizers to the strongest model for the Midas brain.",
    screens: ["screen-10", "screen-11", "screen-12"],
  },
];

export const WEALTH_SCREENS = [
  shot(4, 873, 1091, {
    title: "The command center",
    alt: "Wealth & Powers OS command center showing a live market ticker, the Midas Mode engage control, portfolio stats, and every module at a glance",
    shows:
      "Jayson's full portfolio at live-verified prices, the Midas Mode engage control, 18 of 18 quotes verified as captured, active research jobs, and every module from stocks to item search. The Oracle assistant is a click away from anywhere.",
    matters:
      "Behind one screen, several agents work in parallel: verifying prices, auditing research, watching listings. Jayson sees the result, not the plumbing.",
  }),
  shot(5, 872, 1090, {
    title: "Mission launcher",
    alt: "Midas Mode setup screen showing starting capital presets, mission clock options, permitted asset classes, and the hard risk controls panel",
    shows:
      "Choose the starting stake, set the clock, pick which asset classes the agent may trade (stocks and ETFs, crypto, metals), and dial in hard risk controls.",
    matters:
      "The engine enforces every limit mechanically. The model works inside the envelope; it cannot widen it.",
  }),
  shot(13, 825, 1031, {
    title: "Live session",
    alt: "Midas Mode live session showing deployed capital, a LIVE \u00b7 HUMAN-APPROVED \u00b7 ACTIVE badge, real-time P&L, a drawdown monitor, and the agent's thinking status",
    shows:
      "A running session: cash, deployed capital, realized P&L and drawdown in real time, with a human-approved status badge and the agent's current reasoning state.",
    matters:
      "No trade executes until Jayson confirms it, and the kill switch is one button away at every moment.",
  }),
  shot(9, 874, 1092, {
    title: "SpaceX IPO deep dive",
    alt: "Research page showing a SpaceX IPO investigation, a grounding explanation, an independently audited badge, and a partial verification verdict",
    shows:
      "A research job grounded in live data, investigated by multiple models, then independently audited. The verdict, Partially Verified 65/100, comes with a breakdown of what was confirmed, what was truncated and what needs more evidence.",
    matters:
      "A partial verdict is shown as partial. Jayson sees exactly how far to trust each finding instead of a confident summary.",
  }),
  shot(6, 870, 1088, {
    title: "Stocks, capital first",
    alt: "Stocks page showing SCHD, AAPL, NVDA and MSFT holdings with live prices, gain and loss, AI signals, confidence percentages, and a next-best-stocks panel",
    shows:
      "Each holding with a live-verified price, gain or loss, and an AI signal (hold, trim or buy) with a confidence score.",
    matters:
      "Draft-order buttons stay locked until Jayson approves the exact trade.",
  }),
  shot(7, 857, 1071, {
    title: "Crypto, three-source check",
    alt: "Crypto page showing Bitcoin, Ethereum, Solana and Chainlink with three-source verified badges and AI confidence signals",
    shows:
      "Every coin priced from CoinGecko, Coinbase and Kraken, with a divergence check across the three.",
    matters:
      "When the feeds disagree, the disagreement is displayed before any action is allowed.",
  }),
  shot(8, 874, 1093, {
    title: "Metals, a hedge",
    alt: "Gold and metals page showing gold, silver, platinum and palladium, each verified two ways with futures against spot",
    shows:
      "Gold, silver, platinum and palladium checked two ways at once: Yahoo Finance front-month futures against gold-api.com spot.",
    matters:
      "A large spread gets flagged and a small one is treated as normal, so alerts mean something.",
  }),
  shot(10, 873, 1091, {
    title: "Real Estate Super Search",
    alt: "Real Estate page with a search form for city, radius, property type and ranking, plus a listing watcher with URL, target price and notification fields",
    shows:
      "Must-have criteria with ranking: exact matches first, closest matches second, and an explicit flag when a listing misses a requirement. A watcher monitors any listing URL.",
    matters:
      "Jayson is notified about price changes and status moves instead of refreshing listing sites himself.",
  }),
  shot(11, 874, 1092, {
    title: "Item Search",
    alt: "Item Search page with an item description form, a target price field, and condition, model, shipping and alternatives fields",
    shows:
      "Describe an item, set a maximum price, add condition and model constraints. The agent searches major and minor marketplaces, Facebook listings and local listings.",
    matters:
      "Every match comes back with its price, description and a direct source link, so each lead can be checked.",
  }),
  shot(12, 876, 1095, {
    title: "Models & cost",
    alt: "Models and Cost page showing a per-role model picker for research, real estate, finance and the autopilot brain",
    shows:
      "An independently assignable model for every AI role. Research helpers can run on inexpensive models; the Midas brain runs on the strongest available.",
    matters:
      "Cost stays visible, and any model can be swapped in or out without touching code.",
  }),
];
