# LIFT OFF CTF Solution

Pentester-style field notes for [lift-off-ctf.vercel.app](https://lift-off-ctf.vercel.app) — **all 25 flags**, in discovery order, with live PoCs.

## Start here

**[WALKTHROUGH.md](./WALKTHROUGH.md)** — chronological engagement narrative (how each flag was found, commands run, output captured)

**[PASSKEYS_DEEP_DIVE.md](./PASSKEYS_DEEP_DIVE.md)** — terminal passkeys (`crypto_master`, `reverse_engineer`, `forensics_expert`) with source-level proof

## Screenshots & proof

| File | What it shows |
|------|----------------|
| `images/01-homepage.png` | Main dashboard |
| `images/02-flags-page.png` | Flag submission |
| `images/03-backup-locked.png` | Backup lock screen |
| `images/04-admin-login.png` | Admin SQLi panel |
| `images/05-404-page.png` | 404 Easter egg |
| `images/06-public-page.png` | Leaked source link |
| `images/proof-robots.txt` | Live robots.txt capture |
| `images/proof-terminal-flags.txt` | Terminal file reads + good ending API |
| `images/proof-puzzle-decode.txt` | Binary/ROT13/base64 decode output |
| `images/proof-backup.jsx` | Backup password source |

## Local source repo

This folder sits inside the full CTF repo (`ctf-client/`, `ctf-fs-backend/`) for fact-checking against deployed behavior.
