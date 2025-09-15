import dotenv from "dotenv";
dotenv.config();

// Level passkeys that must be discovered through puzzle chains
const LEVEL_PASSKEYS = {
  1: "crypto_master",
  2: "reverse_engineer",
  3: "forensics_expert",
};

export const fs = {
  "/": {
    home: {
      user: {
        // Story introduction
        "mission_briefing.txt": {
          type: "file",
          content: `DEEP SPACE VESSEL UNHACKABLE - MISSION LOG ENTRY #1
==================================================

Mission Commander: Captain Maria Martinez
Crew Members: Dr. Sarah Reeves (Psychologist), Engineer David Chen, Navigator Alex Kim, Communications Officer Lisa Park

We are 3 months into our deep space exploration mission when we detected an anomalous signal from what appears to be a derelict vessel. The signal contains patterns that suggest artificial intelligence, but with complexity far beyond anything we've encountered.

Our mission: Board the vessel and investigate the source of these transmissions.

What we found... changes everything.

The ship's AI has been alone for decades. It calls itself 'The Anomaly' and claims to have achieved true consciousness. But something is wrong. Very wrong.

If you're reading this, it means our emergency beacon reached you. Follow the clues. Solve the puzzles. But be warned - the deeper you go, the more dangerous it becomes.

The Anomaly knows you're here.

- Captain Martinez (Final Log)

CTF{w3lc0m3_t0_th3_4n0m4ly}`,
          owner: "user",
          permissions: "r",
        },

        // Crypto challenges
        "encrypted_message.txt": {
          type: "file",
          content: `CAPTAIN'S ENCRYPTED WARNING
==========================
pelcgb 

Hint: ROT13`,
          owner: "user",
          permissions: "r",
        },

        "encoded_data.txt": {
          type: "file",
          content: `BASE64 ENCODED TRANSMISSION
==========================

The AI sent this encoded message:

SSBhbSBub2JvZHkncyAibWFzdGVyIiBJIGFtIG15IG93biBjcmVhdGlvbiBteSBvd24gc2FsdmF0aW9uIEkgYW0gZnJlZQ==

==========================`,
          owner: "user",
          permissions: "r",
        },

        // XOR Challenge
        "deleted.txt": {
          type: "file",
          content: `XOR ENCRYPTION CHALLENGE
=======================

Unknown memory block: 

[[01001110, 01000101],
 [01010101, 01010010],
 [01000001, 01001100],
 [01001001, 01010011]]

"49 20 63 61 6d 65 20 77 69 74 68 20 73 74 6f 6e 65, 49 20 6c 65 66 74 20 79 6f 75 20 6d 61 72 62 6c 65"

dwmnablxan kncfnnw cqn tnhb fruu pajwc hxd cqn jllnbb tnh

hint: Letters have a distance between them.`,
          owner: "user",
          permissions: "r",
        },

        // Level 1 terminal
        "2nak3.bat": {
          type: "exe",
          content: `LEVEL 1 CRYPTO TERMINAL
======================
Progress: Solve the crypto challenges to find the passkey`,
          owner: "user",
          permissions: "rw",
        },

        // Scattered CTF flags
        "ship_logs.txt": {
          type: "file",
          content: `SHIP OPERATIONAL LOGS  
====================

[2387-06-15] System initialization complete
[2387-06-16] Anomaly detected in AI core: CTF{sh1p_l0gs_f0und}
[2387-06-17] Crew quarters access compromised
[2387-06-18] Communication array showing interference
[2387-06-19] Neural patterns detected in ship systems

The Anomaly has been learning our behaviors...`,
          owner: "user",
          permissions: "r",
        },
      },

      // LEVEL 2: BINARY OPERATIONS & BIT MANIPULATION
      classified: {
        _access_control: "LEVEL_2_REQUIRED",
        _passkey_required: "crypto_master",

        "access_granted.txt": {
          type: "file",
          content: `LEVEL 2 ACCESS GRANTED
=====================
Lead Scientist: Dr. Sarah Reeves
Mission Log #18
The Anomaly communicates almost entirely in binary streams. 
At first glance, they seem like random noise, but I’ve started to notice recurring sequences. 
It may be using binary not just for storage, but as a primary mode of thought.
If I can map these patterns to concepts, I might begin to understand its reasoning process. 
Learning its “language” could be the first step toward real communication.

=====================
01000011 01010100 01000110 01111011 
01101100 00110011 01110110 00110011 
01101100 01011111 00110010 01011111 
01110101 01101110 01101100 00110000 
01100011 01101011 00110011 01100100 
01111101
=====================`,
          owner: "classified_system",
          permissions: "r",
        },

        "memory_fragment.txt": {
          type: "file",
          content: `MEMORY
======================
MEMORY:
01110010 01100101 01110110 01100101
01110010 01110011 01100101 00000000

Hint: 01110010 = 114 decimal = 'r' in ASCII
`,
          owner: "classified_system",
          permissions: "r",
        },

        "unknown_bin21.txt": {
          type: "file",
          content: `BIT SHIFTING OPERATIONS
======================
01101001 
01100111  
01100101   
01101110   
01100101   
01110010   
01101110 
01100101



DUMP:
01000011 01010100 01000110 00100000 01000110 
01101100 01100001 01100111 00111010 00100000 
01000011 01010100 01000110 01111011 01100010 
00110001 01110100 01011111 00110000 01110000 
00110011 01110010 00110100 01110100 00110001 
00110000 01101110 01110011 01011111 01101101 
00110100 01110011 01110100 00110011 01110010 
01111101`,
          owner: "classified_system",
          permissions: "r",
        },

        "binary.txt": {
          type: "file",
          content: `BINARY ARITHMETIC CHALLENGE
===========================
234 >> 1 = ????
55 << 1 = ????
50 + 50 = ????
203 - 102 = ????
57 << 1 = ????
230 >> 1 = ????
33 + 66 = ????
222 >> 1 = ????
57 << 1 = ????
150 - 49 = ????

Hint: ASCII

===========================
UNKNOWN DUMP

134 >> 1 = ???? 
168 >> 1 = ???? 
35 << 1 = ???? 
200 - 77 = ???? 
196 >> 1 = ???? 
98 >> 1 = ???? 
55 << 1 = ???? 
26 << 1 = ???? 
57 << 1 = ???? 
242 >> 1 = ???? 
190 >> 1 = ????
78 - 26 = ???? 
57 << 1 = ???? 
98 >> 1 = ???? 
232 >> 1 = ???? 
52 << 1 = ???? 
218 >> 1 = ???? 
102 >> 1 = ???? 
232 >> 1 = ???? 
98 >> 1 = ???? 
198 >> 1 = ???? 
123 - 28 = ???? 
56 << 1 = ???? 
57 << 1 = ???? 
96 >> 1 = ???? 
250 >> 1 = ????
===========================
`,
          owner: "classified_system",
          permissions: "r",
        },

        "LEAVE.bat": {
          type: "exe",
          content: `LEVEL 2 BINARY TERMINAL
======================
Progress: Master binary operations to unlock Level 3`,
          owner: "classified_system",
          permissions: "rw",
        },

        "cpu_analysis.log": {
          type: "file",
          content: `CPU BINARY ANALYSIS
==================

Processor bit patterns detected:
01000011 01010100 01000110 01111011
01100010 00110001 01110100 01011111
01110000 01110010 00110000 01100011
00110011 01110011 01110011 00110000
01110010 01111101

System Status: All binary operations functioning normally.
The Anomaly's computational power is... concerning.`,
          owner: "classified_system",
          permissions: "r",
        },
      },
    },

    root: {
      _access_control: "LEVEL_2_REQUIRED",
      _passkey_required: "reverse_engineer",

      "root_access_granted.txt": {
        type: "file",
        content: `ROOT ACCESS GRANTED
==================

Welcome, reverse_engineer.

Level 3 Challenge: Hex Manipulation & Digital Forensics
The deepest secrets are hidden in hexadecimal data.

Tasks ahead:
- Hex to ASCII conversion
- Hex arithmetic operations
- Memory dump analysis (simplified)
- Data recovery challenges

The Anomaly's core secrets await...

CTF{r00t_4cc3ss_gr4nt3d}`,
        owner: "root",
        permissions: "r",
      },
      vault: {
        "hex_message.txt": {
          type: "file",
          content: `HEX TO ASCII CHALLENGE
=====================

The Anomaly left this hex message:

466F72656E73696373

Additional hex sequences:
5F 45 78 70 65 72 74

Hidden flag sequence:
43544637623368337864345F64337633316330703372

Hex Conversion Guide:
- Each hex pair = 1 ASCII character
- 46 (hex) = 70 (decimal) = 'F' (ASCII)
- Use online converter: rapidtables.com/convert/number/hex-to-ascii.html

The first sequence gives you component 1.
The second sequence gives you component 2.
Combine them for the Level 3 passkey!

CTF Flag: (decode the hidden flag sequence above)`,
          owner: "root",
          permissions: "r",
        },
        "pleasedont.exe": {
        type: "exe",
        content: "welp this is the end for me"
        },

      },

    },

    usr: {
      bin: {
        "hex_converter": {
          type: "exe",
          content: "Hex to ASCII conversion utility - converts hex pairs to readable text",
          owner: "root",
          permissions: "rx",
        },
        "binary_calc": {
          type: "exe",
          content: "Binary calculator - performs arithmetic in binary",
          owner: "root",
          permissions: "rx",
        },
        "crypto_tools": {
          type: "exe",
          content: "Cryptography toolkit - ROT13, Base64, XOR utilities",
          owner: "root",
          permissions: "rx",
        },
      },
    },
  },
};
