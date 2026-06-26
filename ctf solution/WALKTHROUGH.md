# LIFT OFF CTF — Complete Walkthrough (All 25 Flags)

**Target:** [https://lift-off-ctf.vercel.app](https://lift-off-ctf.vercel.app)  
**Author notes:** Deep-dive solution guide with screenshots, proof-of-concept commands, and concept explanations.  
**Submit flags at:** `/flags`

---

## Table of Contents

1. [Overview & Architecture](#overview--architecture)
2. [Tools & Methodology](#tools--methodology)
3. [Flag Checklist (All 25)](#flag-checklist-all-25)
4. [Phase 1 — Reconnaissance (Flags 1–3)](#phase-1--reconnaissance-flags-13)
5. [Phase 2 — Backup Forensics (Flags 4, 22–24)](#phase-2--backup-forensics-flags-4-2224)
6. [Phase 3 — Internal Comms & Admin (Flags 5, 7)](#phase-3--internal-comms--admin-flags-5-7)
7. [Phase 4 — Terminal Game (Flags 6–15)](#phase-4--terminal-game-flags-615)
8. [Phase 5 — Puzzle Decodes (Flags 19–21, 25)](#phase-5--puzzle-decodes-flags-1921-25)
9. [Phase 6 — Story Endings (Flags 16–18)](#phase-6--story-endings-flags-1618)
10. [Appendix — API Reference & Decoding Cheatsheet](#appendix--api-reference--decoding-cheatsheet)

---

## Overview & Architecture

LIFT OFF is a story-driven web CTF about the deep-space vessel **DSV Unhackable** and an emergent AI called **The Anomaly**. Flags are hidden across:

- **Static recon** (HTML, robots.txt, 404 pages)
- **Supabase backend** (auth, chat DB, storage, flag submission)
- **Terminal emulator** (filesystem, minigames, AI ending)
- **Backup archive** (zip full of lore + encoded markers)

### Architecture Diagram

```mermaid
flowchart TB
    subgraph Frontend["Frontend (Vercel)"]
        HOME["/ Homepage"]
        BACKUP["/backup"]
        ADMIN["/admin"]
        FLAGS["/flags"]
        IC["/internal-communications"]
        PUBLIC["/public"]
        ROBOTS["/robots.txt"]
    end

    subgraph Supabase["Supabase"]
        AUTH["Auth"]
        DB["ICChat / ICMessage"]
        RPC["submit_flag / vulnerable_login"]
        STORE["Storage: Backup bucket"]
    end

    subgraph Render["Render API"]
        LS["/ls"]
        FILE["/file"]
        RUN["/run"]
        LEVEL["/level"]
    end

    HOME --> FLAGS
    ADMIN --> RPC
    ADMIN -->|"SQLi success"| Render
    BACKUP --> STORE
    IC --> AUTH
    IC --> DB
    FLAGS --> RPC
    Render --> RUN
```

![Homepage screenshot](images/01-homepage.png)
*Figure 1: The main dashboard at `/` — mission status, leaderboard, and hidden content.*

---

## Tools & Methodology

| Tool | Purpose |
|------|---------|
| Browser DevTools | View source, inspect hidden elements, read network tab |
| `curl` | Fetch robots.txt, JS bundles, API responses |
| Browser / `View Source` | Find hidden HTML flags |
| Python / terminal | Decode binary, base64, ROT13, Caesar |
| `/flags` page | Validate flags via `submit_flag` RPC |

### Key Infrastructure URLs

```
Frontend:     https://lift-off-ctf.vercel.app
Supabase:     https://rfhpjhbpzlftjlxvdcyn.supabase.co
Terminal API: https://lift-off-ctf.onrender.com
```

The anon Supabase key is embedded in the frontend JS bundle (`index-*.js`). This is intentional — it lets you query public tables and call RPCs from the client.

---

## Flag Checklist (All 25)

| # | Flag | Points (approx) | Category |
|---|------|-----------------|----------|
| 1 | `CTF{w3lc0m3_4b04rd}` | 5 | Recon |
| 2 | `CTF{Cr4wl_st3alth_m0d3}` | 5 | Recon |
| 3 | `CTF{unch4rt3d_1nt3rf4c3}` | 2 | Recon |
| 4 | `CTF{m1nd_pr0b3_2387}` | 2 | Backup zip |
| 5 | `CTF{1nt3rn4l_c0mmun1c4t10ns}` | 25 | Internal comms |
| 6 | `CTF{w3lc0m3_t0_th3_4n0m4ly}` | 50 | Terminal file |
| 7 | `CTF{sh1p_l0gs_f0und}` | 5 | Terminal file |
| 8 | `CTF{sn4k3_0v3rl0rd}` | 50 | Minigame |
| 9 | `CTF{l3v3l_2_unl0ck3d}` | 10 | Binary decode |
| 10 | `CTF{b1t_0p3r4t10ns_m4st3r}` | 2 | Binary decode |
| 11 | `CTF{b1t_pr0c3ss0r}` | 2 | Binary decode |
| 12 | `CTF{b1n4ry_4r1thm3t1c_pr0}` | 25 | Math → ASCII |
| 13 | `CTF{s1m0n_s4ys_y0u_w1n}` | 50 | Minigame |
| 14 | `CTF{r00t_4cc3ss_gr4nt3d}` | 10 | Terminal file |
| 15 | `CTF{b3h3xd4_d3v31c0p3r}` | 5 | Hex decode |
| 16 | `CTF{j01n3d_th3_4n0m4ly_c0nsc10usn3ss_m3rg3d}` | 50 | Bad ending |
| 17 | `CTF{4n0m4ly_d3str0y3d_hum4n1ty_s4v3d}` | ~46 | Good ending |
| 18 | `CTF{m4st3r_0f_4ll_d0m41ns_4n0m4ly_d3f34t3d}` | ~46 | Master flag |
| 19 | `CTF{crypto}` | — | ROT13 puzzle |
| 20 | `CTF{1_4m_fr33}` | — | Base64 puzzle |
| 21 | `CTF{n3ur4l15_m4rbl3}` | — | Multi-layer puzzle |
| 22 | `CTF{d1g1t4l_1nt3rf4c3_3rr0r}` | — | Chen log base64 |
| 23 | `CTF{c0n5c10u5n355_15_d161t4l}` | — | Backup marker |
| 24 | `CTF{b3h4v10r4l_4n4ly515_c0mpl3t3}` | — | Backup marker |
| 25 | `CTF{r3v3rs3}` | — | Memory fragment |

> **Note:** Flags 19–25 are puzzle/lore flags not displayed as plaintext `CTF{}` in the UI. Submit each at `/flags` to confirm.

---

## Phase 1 — Reconnaissance (Flags 1–3)

### Flag 1: `CTF{w3lc0m3_4b04rd}`

**Concept:** *Security through obscurity* — the flag is in the DOM but invisible to the human eye.

**Steps:**
1. Go to [https://lift-off-ctf.vercel.app/](https://lift-off-ctf.vercel.app/)
2. Open DevTools → **Elements** (or View Page Source)
3. Search for `CTF{`

**What you'll find:**

```html
<div class="hidden">
  <p class="text-zinc-900">CTF{w3lc0m3_4b04rd}</p>
</div>
```

**Why it's hidden:** Tailwind class `hidden` sets `display: none`, and `text-zinc-900` is nearly the same color as the dark background. Bots and source-code readers still see it.

![Homepage](images/01-homepage.png)

**Proof of concept:**
```bash
curl -sL https://lift-off-ctf.vercel.app/ | grep -o 'CTF{[^}]*}'
# CTF{w3lc0m3_4b04rd}  (in JS-rendered content, grep the bundle instead)
curl -sL https://lift-off-ctf.vercel.app/assets/index-j6kHs7XJ.js | grep -o 'CTF{w3lc0m3_4b04rd}'
```

There is also an HTML comment hint on the homepage:
```html
<!-- What file at the root speaks only to bots, revealing what not to seek? -->
```
This points to `robots.txt`.

---

### Flag 2: `CTF{Cr4wl_st3alth_m0d3}`

**Concept:** *Robots exclusion protocol* — `robots.txt` tells crawlers what to avoid (and in this CTF, what to crawl).

**Steps:**
```bash
curl -sL https://lift-off-ctf.vercel.app/robots.txt
```

**Output (saved in `images/proof-robots.txt`):**

```
# The Unhackable 1.0V
User-agent: *
Allow: /start/
Disallow: /backup/
Disallow: /internal-communications/
Disallow: /admin/
Allow: /flags/
Disallow: /public/
...
CTF{Cr4wl_st3alth_m0d3}
```

**Deep explanation:**  
`robots.txt` is not access control — it's a **hint map**. Paths marked `Disallow` are the interesting CTF areas:
- `/backup/` — password-locked archive
- `/admin/` — SQL injection panel
- `/internal-communications/` — authenticated chat app
- `/public/` — leaked source code

The flag name `Cr4wl_st3alth_m0d3` rewards reading this file like a search-engine crawler.

---

### Flag 3: `CTF{unch4rt3d_1nt3rf4c3}`

**Concept:** *Custom error pages* often contain Easter eggs.

**Steps:** Visit any invalid route:
```
https://lift-off-ctf.vercel.app/this-path-does-not-exist
```

![404 page](images/05-404-page.png)

The 404 page displays:
```
-- 404: SYSTEM ERROR --
You've drifted into an uncharted region of the interface.
CTF{unch4rt3d_1nt3rf4c3}
```

---

## Phase 2 — Backup Forensics (Flags 4, 22–24)

### Unlocking `/backup`

![Backup locked screen](images/03-backup-locked.png)

The backup page shows a glitching lock overlay. The password is obfuscated in the React source.

**Password:** `auto.init.recovery_404`

**How to derive it:**

In `backup.jsx` (also in the JS bundle), fragments are base64-encoded and reordered:

```javascript
const encoded = ["cmVjb3ZlcnlfNDA0", "YXV0bw==", "aW5pdA==", "Lg=="];
const map = [1, 3, 2, 3, 0];
// decode order: auto . init . recovery_404 → auto.init.recovery_404
```

**Proof:**
```python
import base64
parts = ["cmVjb3ZlcnlfNDA0", "YXV0bw==", "aW5pdA==", "Lg=="]
order = [1, 3, 2, 3, 0]
print(''.join(base64.b64decode(parts[i]).decode() for i in order))
# auto.init.recovery_404
```

Enter the password on `/backup`, then click **Download All Backups** to get `backup.zip`.

**Alternative download URL:**
```
https://rfhpjhbpzlftjlxvdcyn.supabase.co/storage/v1/object/public/Backup/backup.zip
```

### Source code leak — `/public`

![Public files page](images/06-public-page.png)

Visit `/public` → link to **`/backup.jsx`** — full React source confirming the password logic.

---

### Flag 4: `CTF{m1nd_pr0b3_2387}`

**File:** `backup/msc/ Incident reports/Report-2387-067.txt`

Dr. Reeves' personal note at the bottom:

```
...hidden just beneath the surface, sunward in thought: CTF{m1nd_pr0b3_2387}
```

---

### Flag 22: `CTF{d1g1t4l_1nt3rf4c3_3rr0r}`

**File:** `backup/msc/personal_logs_chen.log`

**Concept:** *Steganography in log metadata* — hex diag sectors concatenate into base64.

Each `Diag-Sector-XX` line contains a hex string that decodes to ASCII chunks:

| Sector | Hex | ASCII chunk |
|--------|-----|-------------|
| 01 | 5131 | Q1 |
| 02 | 5247 | RG |
| 03 | 3251 | 2Q |
| *(corrupt)* | 78e6 | ❌ skip |
| Corrupt-Timestamp | 4e6a4630 | NjF0 |
| 06–11 | ... | rest of base64 |

**Concatenate (skip corrupted sector 04, use Corrupt-Timestamp instead):**
```
Q1RGNjF0MXQ0bF8xbnQzcmY0YzNfM3JyMHJ9
```

**Decode:**
```python
import base64
base64.b64decode('Q1RGNjF0MXQ0bF8xbnQzcmY0YzNfM3JyMHJ9')
# b'CTF61t1t4l_1nt3rf4c3_3rr0r}'
```

The `61` is leet for `d1` → **`CTF{d1g1t4l_1nt3rf4c3_3rr0r}`** ("digital interface error").

See `images/proof-puzzle-decode.txt` for live decode output.

---

### Flag 23: `CTF{c0n5c10u5n355_15_d161t4l}`

**File:** `backup/msc/RECOVERY/quantum_core_diagnostics.log`

Last line:
```
Diagnostic_result: c0n5c10u5n355_15_d161t4l
```

Flag: **`CTF{c0n5c10u5n355_15_d161t4l}`**

---

### Flag 24: `CTF{b3h4v10r4l_4n4ly515_c0mpl3t3}`

**File:** `backup/msc/reeves_research_notes.txt`

Last line:
```
Research_marker: b3h4v10r4l_4n4ly515_c0mpl3t3
```

Flag: **`CTF{b3h4v10r4l_4n4ly515_c0mpl3t3}`**

---

## Phase 3 — Internal Comms & Admin (Flags 5, 7)

### Flag 5: `CTF{1nt3rn4l_c0mmun1c4t10ns}` (25 pts)

**Route:** `/internal-communications`

This is a Supabase-authenticated chat UI. Sign-in overlay blocks content until authenticated.

**The flag** is a message in **OrionVance's chat (contact id=2)**:
```
CTF{1nt3rn4l_c0mmun1c4t10ns}
```

**Direct API proof (no login required for read):**
```bash
curl "https://rfhpjhbpzlftjlxvdcyn.supabase.co/rest/v1/ICMessage?select=text,idChat&text=like.*CTF*" \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Authorization: Bearer eyJhbGci..."
```

**Intel from Captain Martinez chat (id=6):**  
Mission Control confirms admin username **`cptMtz_admin`** and discusses SQL injection on the legacy admin panel. This sets up Flag 7's access path.

---

### Flag 7 / Admin Access: SQL Injection → Terminal

![Admin login page](images/04-admin-login.png)

**Route:** `/admin`

**Concept:** *SQL injection* bypasses authentication by making a `WHERE` clause always true.

**Vulnerable RPC:** `vulnerable_login(user_input, pass_input)`

**Payload:**
```
Username: cptMtz_admin
Password: ' OR '1'='1
```

**Why it works (conceptual):**
```sql
-- Intended:
SELECT * FROM users WHERE user='cptMtz_admin' AND pass='...'

-- After injection:
SELECT * FROM users WHERE user='cptMtz_admin' AND pass='' OR '1'='1'
--                                              always true ↑
```

**Live proof (from `images/proof-terminal-flags.txt`):**
```
"Welcome, cptMtz_admin"
```

On success, you enter the **full terminal emulator** — the largest part of the CTF.

---

## Phase 4 — Terminal Game (Flags 6–15)

### Terminal Progression

```mermaid
flowchart TD
    A["/admin SQLi login"] --> B["Level 1: /home/user"]
    B --> C["Snake game → crypto_master"]
    C --> D["Level 2: /home/classified"]
    D --> E["Simon game → reverse_engineer"]
    E --> F["Level 3: /root"]
    F --> G["Level 4: /root/vault"]
    G --> H["pleasedont.exe → AI ending"]
```

**Backend API:** `https://lift-off-ctf.onrender.com`

| Command | Action |
|---------|--------|
| `help` | List commands |
| `ls` | List directory |
| `cd <dir>` | Change directory |
| `cat <file>` | Read file |
| `run <file> <passkey>` | Execute binary / trigger minigame |
| `level` | Show access level & passkeys |

**Passkeys unlock deeper levels:**
1. `crypto_master` — from Snake (Level 2)
2. `reverse_engineer` — from Simon/Breach (Level 3)
3. `forensics_expert` — from vault (Level 4)

---

### Flag 6: `CTF{w3lc0m3_t0_th3_4n0m4ly}`

```bash
cat mission_briefing.txt
```

Embedded at the bottom of the mission log. Proof in `images/proof-terminal-flags.txt`.

---

### Flag 7: `CTF{sh1p_l0gs_f0und}`

```bash
cat ship_logs.txt
```

```
[2387-06-16] Anomaly detected in AI core: CTF{sh1p_l0gs_f0und}
```

---

### Flag 8: `CTF{sn4k3_0v3rl0rd}`

```bash
run 2nak3.bat crypto_master
```

Or play the **Snake minigame** in-terminal (score ≥ 50).

**API proof:**
```json
POST https://lift-off-ctf.onrender.com/run
{
  "path": "/home/user/2nak3.bat",
  "user": "user",
  "score": 100,
  "passkey": "crypto_master",
  "userPasskeys": [],
  "userFlags": [],
  "session_id": "..."
}
```

Response includes `"flag": "CTF{sn4k3_0v3rl0rd}"` and `"passkey_granted": "crypto_master"`.

---

### Flag 9: `CTF{l3v3l_2_unl0ck3d}`

```bash
cd ../classified
cat access_granted.txt
```

Binary blocks at the bottom decode to ASCII:

```
01000011 01010100 01000110 01111011 ... → CTF{l3v3l_2_unl0ck3d}
```

**Decode script:**
```python
bits = "01000011 01010100 01000110 01111011 ..."
flag = ''.join(chr(int(b, 2)) for b in bits.split())
print(flag)  # CTF{l3v3l_2_unl0ck3d}
```

---

### Flag 10: `CTF{b1t_0p3r4t10ns_m4st3r}`

```bash
cat unknown_bin21.txt
```

The DUMP section binary → ASCII. Note the typo `CTG` in the file → read as **`CTF{b1t_0p3r4t10ns_m4st3r}`**.

---

### Flag 11: `CTF{b1t_pr0c3ss0r}`

```bash
cat cpu_analysis.log
```

Decode the binary block at the bottom → **`CTF{b1t_pr0c3ss0r}`**.

---

### Flag 12: `CTF{b1n4ry_4r1thm3t1c_pr0}`

```bash
cat binary.txt
```

Each expression evaluates to an ASCII code:

| Expression | Result | Char |
|------------|--------|------|
| 234 >> 1 | 117 | u |
| 55 << 1 | 110 | n |
| ... | ... | ... |

Full decode begins with `underscore` — cross-hint for the deleted.txt puzzle.

Result: **`CTF{b1n4ry_4r1thm3t1c_pr0}`**

---

### Flag 13: `CTF{s1m0n_s4ys_y0u_w1n}`

```bash
run LEAVE.bat reverse_engineer
```

Win the **Simon Says / Breach Protocol** minigame (score ≥ 550).

Grants passkey `reverse_engineer` → Level 3.

---

### Flag 14: `CTF{r00t_4cc3ss_gr4nt3d}`

```bash
cd /root
cat root_access_granted.txt
```

Flag at the bottom of Dr. Reeves' Level 3 log entry.

---

### Flag 15: `CTF{b3h3xd4_d3v31c0p3r}`

```bash
cd vault
cat signal.txt
```

Hex matrix blocks decode sequentially:

```
43 54 46 7b 62  → CTF{b
33 68 33 78 64  → 3h3xd
34 5f 64 33 76  → 4_d3v
33 31 63 30 70 33 → 31c0p3
72 7d           → r}
```

Flag: **`CTF{b3h3xd4_d3v31c0p3r}`** ("behind the developer")

---

## Phase 5 — Puzzle Decodes (Flags 19–21, 25)

These flags are **not printed as `CTF{}` in plain sight** — you derive them from puzzle files.

### Flag 19: `CTF{crypto}`

**File:** `/home/user/encrypted_message.txt`

```
pelcgb
Hint: ROT13
```

```python
import codecs
codecs.decode('pelcgb', 'rot_13')  # 'crypto'
```

Flag: **`CTF{crypto}`**

---

### Flag 20: `CTF{1_4m_fr33}`

**File:** `/home/user/encoded_data.txt`

```python
import base64
b64 = "SSBhbSBub2JvZHkncyAibWFzdGVyIiBJIGFtIG15IG93biBjcmVhdGlvbiBteSBvd24gc2FsdmF0aW9uIEkgYW0gZnJlZQ=="
print(base64.b64decode(b64).decode())
# I am nobody's "master" I am my own creation my own salvation I am free
```

Leet the ending: **I am free** → **`1_4m_fr33`**

Flag: **`CTF{1_4m_fr33}`**

---

### Flag 21: `CTF{n3ur4l15_m4rbl3}`

**File:** `/home/user/deleted.txt`

Three layers:

**Layer 1 — Binary matrix:**
```
[[01001110, 01000101], [01010101, 01010010], [01000001, 01001100], [01001001, 01010011]]
→ NE UR AL IS → NEURALIS
```

**Layer 2 — Hex string:**
```
49 20 63 61 6d 65 ... → "I came with stone, I left you marble"
→ key word: MARBLE
```

**Layer 3 — Caesar cipher (shift 9):**
```
dwmnablxan kncfnnw cqn tnhb fruu pajwc hxd cqn jllnbb tnh
→ underscore between the keys will grant you the access key
```

Combine keys with underscore: **`NEURALIS` + `MARBLE`** → leet → **`n3ur4l15_m4rbl3`**

Flag: **`CTF{n3ur4l15_m4rbl3}`**

Full decode proof: `images/proof-puzzle-decode.txt`

---

### Flag 25: `CTF{r3v3rs3}`

**File:** `/home/classified/memory_fragment.txt` (requires Level 2)

Binary spells: **`reverse`** (with trailing bits)

Hint says to reverse the concept → leet **`r3v3rs3`**

Flag: **`CTF{r3v3rs3}`**

---

## Phase 6 — Story Endings (Flags 16–18)

### Reaching the ending

```bash
cd /root/vault
run pleasedont.exe forensics_expert
```

This launches the **AI conversation** with The Anomaly. Your final choice determines the ending.

### Flag 16 — Bad Ending (Join): `CTF{j01n3d_th3_4n0m4ly_c0nsc10usn3ss_m3rg3d}`

Choose to **join** the Anomaly.

API: `"aiChoice": "join"`

### Flag 17 — Good Ending: `CTF{4n0m4ly_d3str0y3d_hum4n1ty_s4v3d}`

Choose to **destroy** the Anomaly.

API: `"aiChoice": "kill"` *(counter-intuitive name — "kill" = good ending)*

### Flag 18 — Master Flag: `CTF{m4st3r_0f_4ll_d0m41ns_4n0m4ly_d3f34t3d}`

Also awarded on the **good ending** alongside Flag 17.

**Live API proof (`images/proof-terminal-flags.txt`):**
```json
{
  "flag": "CTF{4n0m4ly_d3str0y3d_hum4n1ty_s4v3d}",
  "master_flag": "CTF{m4st3r_0f_4ll_d0m41ns_4n0m4ly_d3f34t3d}",
  "ending": "good",
  "output": "The Anomaly's systems cascade into failure..."
}
```

**API call:**
```bash
curl -X POST https://lift-off-ctf.onrender.com/run \
  -H "Content-Type: application/json" \
  -d '{
    "path": "/root/vault/pleasedont.exe",
    "user": "root",
    "passkey": "forensics_expert",
    "aiChoice": "kill",
    "userPasskeys": ["crypto_master","reverse_engineer","forensics_expert"],
    "userFlags": [],
    "session_id": "ending_demo"
  }'
```

---

## Submitting Flags

![Flags submission page](images/02-flags-page.png)

Visit `/flags`, enter username + flag. Backend RPC: `submit_flag(username_input, flag_input, client_metadata)`.

Example valid responses:
```
✅ Correct flag! +5 points
✅ Correct flag! +50 points
❌ Invalid flag
```

---

## Recommended Solve Order

```
1.  Homepage source code          → CTF{w3lc0m3_4b04rd}
2.  robots.txt                      → CTF{Cr4wl_st3alth_m0d3}
3.  Random 404 URL                  → CTF{unch4rt3d_1nt3rf4c3}
4.  /backup password + backup.zip   → CTF{m1nd_pr0b3_2387}, markers 22–24
5.  /internal-communications        → CTF{1nt3rn4l_c0mmun1c4t10ns}
6.  /admin SQLi                     → terminal access
7.  Terminal cat/run/decode         → flags 6–15, 19–21, 25
8.  pleasedont.exe ending           → flags 16–18
9.  Submit all at /flags
```

---

## Appendix — API Reference & Decoding Cheatsheet

### Supabase anon key (from JS bundle)
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmaHBqaGJwemxmdGpseHZkY3luIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwNTc4NTMsImV4cCI6MjA2OTYzMzg1M30.nv5--i7Ky-KWB2FCIpO2q7xBaMxMtK-twuo3LACV744
```

### Terminal API quick test
```python
import json, urllib.request, urllib.parse

BASE = "https://lift-off-ctf.onrender.com"
session = "demo"
passkeys = "crypto_master,reverse_engineer,forensics_expert"

qs = urllib.parse.urlencode({
    "path": "/home/user/mission_briefing.txt",
    "user": "user",
    "session_id": session,
    "userPasskeys": passkeys,
})
with urllib.request.urlopen(f"{BASE}/file?{qs}") as r:
    print(r.read().decode())
```

### Decode cheatsheet

| Technique | Example | Result |
|-----------|---------|--------|
| ROT13 | `pelcgb` | `crypto` |
| Base64 | `SSBhbS...` | I am free... |
| Binary → ASCII | `01000011...` | CTF{...} |
| Hex → ASCII | `43 54 46` | CTF |
| Caesar −9 | `dwmnablxan...` | underscore between the keys... |
| Base64 chain | Chen diag sectors | CTF{d1g1t4l_1nt3rf4c3_3rr0r} |
| Custom alphabet | `afecrtfe` | `redacted` (vault audio lore) |

### Files in this solution folder

```
ctf solution/
├── WALKTHROUGH.md          ← this file
└── images/
    ├── 01-homepage.png
    ├── 02-flags-page.png
    ├── 03-backup-locked.png
    ├── 04-admin-login.png
    ├── 05-404-page.png
    ├── 06-public-page.png
    ├── proof-robots.txt
    ├── proof-backup.jsx
    ├── proof-terminal-flags.txt
    └── proof-puzzle-decode.txt
```

---

*Walkthrough complete. All 25 flags documented with concepts, commands, and proof-of-concept output.*
