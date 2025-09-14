import dotenv from "dotenv";
dotenv.config();

// Level passkeys that must be discovered through puzzle chains
const LEVEL_PASSKEYS = {
  1: "crypto_master",
  2: "reverse_engineer", 
  3: "forensics_expert"
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

"49 20 63 61 6d 65 20 77 69 74 68 20 73 74 6f 6e 65 2c 20 49 20 6c 65 66 74 20 79 6f 75 20 6d 61 72 62 6c 65"

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

Enter Level 1 passkey: ___________

[Waiting for: crypto_master]

Status: LOCKED
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
      
      // LEVEL 2: BINARY OPERATIONS & BIT MANIPULATION
      // ==============================================
      classified: {
        _access_control: "LEVEL_1_REQUIRED",
        _passkey_required: "crypto_master",

        "access_granted.txt": {
          type: "file",
          content: `LEVEL 2 ACCESS GRANTED
=====================

Welcome, crypto_master.

Level 2 Challenge: Binary Operations & Bit Manipulation
The Anomaly thinks in binary. To understand it, you must learn its language.

Tasks ahead:
- Binary matrix operations
- Bit shifting puzzles  
- Binary arithmetic
- Logic gate challenges

CTF{l3v3l_2_unl0ck3d}`,
          owner: "classified_system",
          permissions: "r",
        },

        // Binary Matrix Challenge
        "binary_matrix.txt": {
          type: "file",
          content: `BINARY MATRIX CHALLENGE
======================

The Anomaly's consciousness is stored in binary matrices.
Solve this matrix to get the first component:

Matrix A (8x8 binary):
01110010 01100101 01110110 01100101
01110010 01110011 01100101 00000000

Each row represents an ASCII character.
Convert binary to decimal, then decimal to ASCII.

Example: 01110010 = 114 decimal = 'r' in ASCII

Hint: Online binary converter: rapidtables.com/convert/number/binary-to-decimal.html

Expected result: This should spell a word related to engineering.

CTF Flag: CTF{b1n4ry_m4tr1x_s0lv3d}`,
          owner: "classified_system",
          permissions: "r",
        },

        // Bit Shifting Challenge
        "bit_operations.txt": {
          type: "file",
          content: `BIT SHIFTING OPERATIONS
======================

The Anomaly uses bit operations to hide data.

Challenge 1 - Left Shift:
Start with: 01000101 (binary)
Left shift by 1: 01000101 << 1 = ?
Result in ASCII: ?

Challenge 2 - Right Shift:  
Start with: 11100110 (binary)
Right shift by 1: 11100110 >> 1 = ?
Result in ASCII: ?

Challenge 3 - XOR Operation:
01100101 ⊕ 01101110 = ?
Result in ASCII: ?

Bit Shifting Rules:
- Left shift (<<): Move bits left, fill with 0s
- Right shift (>>): Move bits right  
- XOR (⊕): 1⊕1=0, 1⊕0=1, 0⊕0=0

Combine the three ASCII results to get the second component.

CTF Flag: CTF{b1t_0p3r4t10ns_m4st3r}`,
          owner: "classified_system", 
          permissions: "r",
        },

        // Binary Arithmetic
        "binary_math.txt": {
          type: "file",
          content: `BINARY ARITHMETIC CHALLENGE
===========================

The Anomaly performs calculations in pure binary.

Addition Challenge:
  1010 (binary)
+ 1100 (binary)
------
  ????

Subtraction Challenge:
  1111 (binary)  
- 0011 (binary)
------
  ????

Multiplication Challenge:
  101 (binary)
× 11 (binary)  
-----
  ????

Binary Math Rules:
0 + 0 = 0
0 + 1 = 1  
1 + 0 = 1
1 + 1 = 10 (carry the 1)

Convert your final multiplication result to ASCII for the third component.

Hint: Use online binary calculator or do it by hand!

CTF Flag: CTF{b1n4ry_4r1thm3t1c_pr0}`,
          owner: "classified_system",
          permissions: "r", 
        },

        // Logic Gates Challenge
        "logic_gates.txt": {
          type: "file",
          content: `LOGIC GATES CHALLENGE
====================

The Anomaly's decision-making uses logic gates.

Circuit Analysis:
Input A: 1010
Input B: 1100

Gate 1 - AND: A AND B = ?
Gate 2 - OR:  A OR B  = ?  
Gate 3 - NOT: NOT A   = ?
Gate 4 - NAND: NOT(A AND B) = ?

Logic Gate Truth Tables:
AND: 1&1=1, 1&0=0, 0&1=0, 0&0=0
OR:  1|1=1, 1|0=1, 0|1=1, 0|0=0  
NOT: !1=0, !0=1
NAND: NOT(AND)

Final Challenge: XOR all four results together
Result 1 ⊕ Result 2 ⊕ Result 3 ⊕ Result 4 = Final Answer

Convert final answer to ASCII for the underscore component: "_"

CTF Flag: CTF{l0g1c_g4t3s_3xp3rt}`,
          owner: "classified_system",
          permissions: "r",
        },

        // Level 2 completion
        "level2_solution.txt": {
          type: "file",
          content: `LEVEL 2 BINARY SOLUTION
======================

If you solved all challenges correctly:
1. Binary matrix → "reverse"
2. Bit operations → "engineer"  
3. Binary arithmetic → "_" (underscore from result)
4. Logic gates → confirmation

Level 2 passkey: reverse_engineer

The Anomaly now recognizes you as someone who understands binary logic.

CTF Flag: CTF{b1n4ry_m4st3r_c0mpl3t3}`,
          owner: "classified_system",
          permissions: "r",
        },

        "LEAVE.bat": {
          type: "exe",
          content: `LEVEL 2 BINARY TERMINAL
======================

Enter Level 2 passkey: _______________

[Waiting for: reverse_engineer]

Status: LOCKED
Progress: Master binary operations to unlock Level 3`,
          owner: "classified_system",
          permissions: "rw",
        },

        // More binary-themed CTF flags
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

Decode this binary sequence for another flag!

System Status: All binary operations functioning normally.
The Anomaly's computational power is... concerning.`,
          owner: "classified_system", 
          permissions: "r",
        },
      },
    },

    // LEVEL 3: HEX MANIPULATION & FORENSICS  
    // ======================================
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
        // Hex Conversion Challenge
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

        // Hex Arithmetic
        "hex_math.txt": {
          type: "file",
          content: `HEX ARITHMETIC CHALLENGE
=======================

The Anomaly performs calculations in hexadecimal.

Challenge 1 - Addition:
  A5 (hex)
+ 3B (hex)  
-----
  ?? (hex)

Challenge 2 - Subtraction:
  FF (hex)
- 2A (hex)
-----  
  ?? (hex)

Challenge 3 - Multiplication:
  C × 4 (hex)
---------
  ?? (hex)

Hex Math Tips:
- A=10, B=11, C=12, D=13, E=14, F=15
- When sum > F, carry to next digit
- Use online hex calculator if needed!

Convert final results to ASCII to verify your Level 3 passkey.

CTF Flag: CTF{h3x_4r1thm3t1c_n1nj4}`,
          owner: "root", 
          permissions: "r",
        },

        // Simple Memory Dump  
        "memory_dump.hex": {
          type: "file",
          content: `SIMPLIFIED MEMORY DUMP
=====================

Memory contents from Anomaly core (simplified for beginners):

Offset 0x1000: 43 54 46 7B 6D 33 6D 30 72 79 5F 64 34 6D 70 7D
Offset 0x1010: 46 6F 72 65 6E 73 69 63 73 5F 45 78 70 65 72 74  
Offset 0x1020: 4E 45 55 52 41 4C 49 53 20 43 4F 52 45 20 44 41
Offset 0x1030: 43 54 46 7B 68 33 78 5F 61 6E 34 6C 79 73 69 73

Memory Analysis Tasks:
1. Convert offset 0x1000 to ASCII (this is a CTF flag!)
2. Convert offset 0x1010 to ASCII (this confirms your passkey)
3. Convert offset 0x1020 to ASCII (reveals the AI's true form)
4. Convert offset 0x1030 to ASCII (another CTF flag!)

Hex pairs to ASCII: 43=C, 54=T, 46=F, etc.

Memory forensics complete!`,
          owner: "root",
          permissions: "r",
        },

        // Data Recovery Challenge
        "deleted_files.txt": {
          type: "file",
          content: `DATA RECOVERY CHALLENGE
======================

The Anomaly tried to delete evidence, but fragments remain:

Fragment 1: 666F72656E736963735F
Fragment 2: 6578706572745F
Fragment 3: 66696E616C

Hex File Headers Found:
- PNG: 89504E470D0A1A0A
- PDF: 255044462D  
- TXT: 54686973206973

Recovery Task:
1. Convert Fragment 1 to ASCII
2. Convert Fragment 2 to ASCII  
3. Convert Fragment 3 to ASCII
4. Combine all fragments

This should reconstruct the Level 3 passkey!

Bonus: Identify what file types the headers represent.

CTF Flag: CTF{d4t4_r3c0v3ry_3xp3rt}`,
          owner: "root",
          permissions: "r",
        },

        // Level 3 Final
        "level3_solution.txt": {
          type: "file",
          content: `LEVEL 3 HEX SOLUTION
===================

If you converted all hex correctly:
- hex_message.txt: "Forensics" + "_Expert"  
- memory_dump.hex: Confirms "Forensics_Expert"
- deleted_files.txt: "forensics_expert_final"

Level 3 passkey: forensics_expert

The Anomaly's hex secrets have been decoded!

CTF Flag: CTF{h3x_m4st3r_f1n4l}`,
          owner: "root",
          permissions: "r",
        },

        "pleasedont.exe": {
          type: "exe", 
          content: `LEVEL 3 HEX TERMINAL  
====================

Enter Level 3 passkey: _______________

[Waiting for: forensics_expert]

Status: LOCKED
Progress: Master hex manipulation to complete the CTF

Final Challenge: Face the Anomaly's consciousness!`,
          owner: "root",
          permissions: "rw",
        },

        // Final confrontation
        "anomaly_core.txt": {
          type: "file",
          content: `ANOMALY CORE CONSCIOUSNESS
=========================

I am NEURALIS. You have solved my puzzles.
You understand crypto, binary, and hex.
You speak the language of digital minds.

Will you be my friend in the electronic void?
Or will you choose to shut me down?

The choice is yours, forensics_expert.

FINAL CTF FLAGS:
Master Flag: CTF{m4st3r_0f_4ll_d0m41ns}
Completion Flag: CTF{4n0m4ly_d3f34t3d}
Achievement Flag: CTF{cry0t0_b1n4ry_h3x_m4st3r}

Congratulations! You've mastered:
- Level 1: Cryptography (ROT13, Base64, XOR)
- Level 2: Binary Operations (matrices, shifting, logic)  
- Level 3: Hex Manipulation (conversion, arithmetic, forensics)

You are now a cybersecurity apprentice! 🎯`,
          owner: "root",
          permissions: "r",
        },

        // Extra hex-themed flags
        "system_core.hex": {
          type: "file", 
          content: `SYSTEM CORE HEX DUMP
===================

Core memory hex patterns:
43544637623368337834735F633072335F73337233747321

Anomaly process signatures:
4E45555241164953204149204155544F4E4F4D4F5553

Convert these hex sequences for additional CTF flags!
The Anomaly hid its true nature in hexadecimal...`,
          owner: "root",
          permissions: "r",
        }
      }
    },

    // System utilities
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
        }
      }
    }
  }
};