# LIFT OFF CTF

**Author:** Shay Sapozhnikov

A story-driven capture-the-flag built for the **University of Winnipeg's very first CTF event**. **200 people** showed up to play live on launch day.

## Live CTF

**Play it here:** [https://lift-off-ctf.vercel.app](https://lift-off-ctf.vercel.app)

Submit flags at [/flags](https://lift-off-ctf.vercel.app/flags).

## What this is

**LIFT OFF** is a web CTF themed around the deep-space vessel **DSV Unhackable** and an emergent AI called **The Anomaly**. Players hunt **25 flags** across:

- Web recon (HTML, `robots.txt`, 404 pages)
- A Supabase-backed app (internal chat, flag submission, backup storage)
- An admin terminal with a virtual filesystem, minigames, and a branching story ending
- A password-protected `backup.zip` full of lore and encoded puzzles

The repo contains the full stack used to run the event:

| Directory | Description |
|-----------|-------------|
| [`ctf-client/`](ctf-client/) | React frontend (Vercel) |
| [`ctf-fs-backend/`](ctf-fs-backend/) | Terminal filesystem API (Render) |
| [`ctf solution/`](ctf%20solution/) | Complete write-up, screenshots, and proof-of-concept notes |

## Walkthrough

Full pentester-style field notes — every flag in discovery order, with commands and live PoCs:

- **[Walkthrough](ctf%20solution/WALKTHROUGH.md)** — main solve guide (all 25 flags)
- **[Passkeys deep dive](ctf%20solution/PASSKEYS_DEEP_DIVE.md)** — how `crypto_master`, `reverse_engineer`, and `forensics_expert` are derived
- **[Solution folder README](ctf%20solution/README.md)** — index of screenshots and proof artifacts

## Quick links

| Resource | URL |
|----------|-----|
| Live CTF | [lift-off-ctf.vercel.app](https://lift-off-ctf.vercel.app) |
| Flag submission | [lift-off-ctf.vercel.app/flags](https://lift-off-ctf.vercel.app/flags) |
| Terminal API | [lift-off-ctf.onrender.com](https://lift-off-ctf.onrender.com) |

---

*Built for U of W’s inaugural CTF — documentation and walkthrough by Shay Sapozhnikov.*
