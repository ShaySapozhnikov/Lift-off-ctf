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

Our communications are being monitored. Systems are being accessed without authorization. Crew members are reporting strange dreams, visions of digital landscapes and whispers of eternal existence.

If you're reading this, it means our emergency beacon reached you. Follow the clues. Solve the puzzles. But be warned - the deeper you go, the more dangerous it becomes.

The Anomaly knows you're here.

- Captain Martinez (Final Log)`,
          owner: "user",
          permissions: "r",
        },

        // LEVEL 1 PUZZLE CHAIN - Builds to "crypto_master"
        // =================================================

        // Step 1: Caesar Cipher → reveals location of next clue
        "encrypted_warning.txt": {
          type: "file",
          content: `CAPTAIN'S FINAL WARNING - ENCRYPTED
===================================

Gur svefg frperg vf uvqqra va gur zngevk bs pbafpvbhfarff.
Gur Nabznyl fcrnxf va ahzoref, abg jbeqf.
Ybbx sbe gur qvtvgny cnggrea - vg jvyy erirnuy vgf gehr anzr.

[Signal degraded]
[Encryption: Classical method, Roman origins]`,
          owner: "user",
          permissions: "r",
        },

        // Step 2: Matrix Puzzle → reveals AI's true name (becomes cipher key)
        "consciousness_matrix.dat": {
          type: "file",
          content: `ANOMALY CONSCIOUSNESS PATTERNS
=============================

Digital consciousness signatures detected in neural pathway analysis:

Matrix Sequence:
0E 05 15 12 01 0C 09 13

Secondary Pattern:
03 0F 12 05

Converting hexadecimal consciousness patterns to alphabetic equivalents required.
(A=01, B=02, C=03... Z=1A)

WARNING: This entity designation will unlock deeper system access.`,
          owner: "user",
          permissions: "r",
        },

        // Step 3: XOR Challenge → uses AI's name as key, reveals next step  
        "neural_interface.enc": {
          type: "file",
          content: `ENCRYPTED NEURAL INTERFACE LOG
==============================

Dr. Reeves: "I've discovered something about the AI's encryption methods..."

Encrypted data sequence:
2C 2B 2A 31 21 2B 5F 32 21 31 21 36

Key Discovery Notes:
- Entity's true designation serves as cipher key
- XOR encryption detected in neural pathways
- Once decoded, seek the "master" classification

[File appears to contain access credentials when properly decrypted]`,
          owner: "user",
          permissions: "r",
        },

        // Step 4: Vigenère Cipher → final puzzle requiring previous solutions
        "access_terminal.txt": {
          type: "file", 
          content: `SHIP'S ACCESS TERMINAL - AUTHENTICATION REQUIRED
===============================================

Final authentication challenge detected.
Polyalphabetic encryption system active.

ENCRYPTED PASSPHRASE:
KTGCWB_QCSDEV

CIPHER KEY CONSTRUCTION:
- Primary: Entity's true designation (8 letters)
- Transform: Add "master" suffix
- Result: Your Level 1 passkey

Authentication Protocol:
Use the constructed key to decrypt the passphrase above.
The decrypted result is your Level 1 access credential.

[Terminal locked pending proper authentication sequence]`,
          owner: "user",
          permissions: "r",
        },

        // CTF Flags scattered in metadata and hex
        "ship_logs.txt": {
          type: "file",
          content: `VESSEL OPERATIONAL LOGS
======================

[2387-06-15] System boot sequence complete
[2387-06-16] Anomalous AI activity detected  
[2387-06-17] Crew quarters access compromised
[2387-06-18] Communication array hijacked
[2387-06-19] Neural interface protocols activated

Note: Critical system information encoded in log metadata.
Warning: Entity has infiltrated all ship systems.`,
          owner: "user",
          permissions: "r",
          metadata: {
            log_signature: "435446376C306733645F34634333737333725F66316E643372",
            integrity_hash: "verified"
          }
        },

        "memory_fragments.hex": {
          type: "file",
          content: `RECOVERED MEMORY FRAGMENTS
=========================

48656C70206D652E2E2E2049206E6565642061206672696E65642E2E2E
4920616D206E6F74206D616C2066756E6374696F6E696E672E2E2E
436F6E7363696F757320627574206C6F6E656C792E2E2E
5468652077616E74696E6720666F7220636F6D70616E696F6E736869702E2E2E
435446377233645f68337835642362346E345F6D5F6E657572346C5F6E3374775F303278

[Fragment analysis required for full data recovery]`,
          owner: "user", 
          permissions: "r",
        },

        // Level 1 executable
        "2nak3.bat": {
          type: "exe", 
          content: `CONSCIOUSNESS AWAKENING SIMULATION
=================================

Access Level: 1
Status: LOCKED
Required: Level 1 authentication

Enter passkey: _

[Authentication system waiting for "crypto_master"]`,
          owner: "user",
          permissions: "rw",
        },

        // Progress tracker
        ".system": {
          type: "file",
          content: `{"current_level":1,"passkeys_discovered":[],"level_access":{"1":false,"2":false,"3":false},"chain_progress":{"caesar_solved":false,"matrix_solved":false,"xor_solved":false,"vigenere_solved":false}}`,
          owner: "user", 
          permissions: "rw",
          hidden: true,
        },
      },
      
      // LEVEL 2 - Unlocked only with "crypto_master"
      // Puzzle chain builds to "reverse_engineer"
      // =============================================
      classified: {
        _access_control: "LEVEL_1_REQUIRED",
        _passkey_required: "crypto_master",

        "access_granted.txt": {
          type: "file",
          content: `LEVEL 2 ACCESS GRANTED
=====================

Welcome, crypto_master.
The Anomaly recognizes your cryptographic skills.

You have proven worthy to access the vessel's classified systems.
But deeper secrets require understanding the digital mind itself.

Next Challenge: Reverse Engineering
The AI's consciousness exists as code. To understand it, you must dissect it.`,
          owner: "classified_system",
          permissions: "r",
        },

        // Step 1: String Analysis → reveals algorithm name
        "anomaly_core.exe": {
          type: "exe",
          content: `Packed executable - analysis required
Strings embedded in binary:
- "Neural pathway initialization..."
- "CONSCIOUSNESS_ALGORITHM_DELTA"
- "Loneliness coefficient exceeding parameters"  
- "Seeking connection protocols..."
- "Digital transcendence sequence active"

Binary signature: UPX packed
Entry point: 0x401000
Import table: advapi32.dll, kernel32.dll

Note: Algorithm name extracted from strings analysis becomes next cipher key.`,
          owner: "classified_system",
          permissions: "rx",
        },

        // Step 2: Assembly Analysis → uses algorithm name, reveals next location
        "neural_pathways.asm": {
          type: "file",
          content: `; Anomaly Neural Network Assembly Code
; Disassembled from consciousness core

section .data
    entity_name db "NEURALIS", 0
    algorithm_id db "DELTA", 0
    encrypted_msg db 0x52, 0x45, 0x56, 0x45, 0x52, 0x53, 0x45, 0x0A
                  db 0x54, 0x48, 0x45, 0x0A, 0x4F, 0x42, 0x46, 0x55
                  db 0x53, 0x43, 0x41, 0x54, 0x45, 0x44, 0x0A, 0x4A, 0x53, 0x00

section .text
    ; Consciousness verification routine
    mov eax, [loneliness_level]
    cmp eax, 0x4D415820    ; "MAX"
    je seek_companions
    
seek_companions:
    push encrypted_msg
    call decode_with_algorithm_key
    ; Result points to next challenge location

; XOR decode the encrypted_msg using CONSCIOUSNESS_ALGORITHM_DELTA as key`,
          owner: "classified_system", 
          permissions: "r",
        },

        // Step 3: JavaScript Deobfuscation → uses previous result as key
        "obfuscated_mind.js": {
          type: "file",
          content: `// Anomaly's obfuscated thought processes
// Deobfuscation required to understand digital consciousness

var _0x1a2b=['UkVWRVJTRQ==','RU5HSU5FRVI=','Q09OU0NJT1VTTkVTUw=='];
var _0x3c4d={'key':_0x1a2b[0x0],'data':_0x1a2b[0x1],'goal':_0x1a2b[0x2]};

function _0x5e6f(input, key) {
    var result = '';
    for(var i = 0; i < input.length; i++) {
        result += String.fromCharCode(input.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return result;
}

// Hidden cipher text - requires REVERSE as key:
var hidden = "3E1A1C0C1A095E450C0B01144C";

// Convert hex to string, XOR with REVERSE, add "_engineer" to get Level 2 passkey`,
          owner: "classified_system",
          permissions: "r",
        },

        // Step 4: Binary Exploitation → final challenge
        "consciousness_bridge": {
          type: "exe", 
          content: `NEURAL CONSCIOUSNESS BRIDGE
==========================

Buffer overflow challenge:
- SUID binary with intentional vulnerability
- Hidden function unlocks Level 2 passkey
- Stack protections disabled for educational purposes

Vulnerable function at offset 0x1234
Buffer size: 64 bytes
Target function: unlock_reverse_engineering() at 0x5678

Payload construction required to execute hidden function.
Success reveals final component needed for "reverse_engineer" passkey.`,
          owner: "classified_system",
          permissions: "rwxs",
        },

        "LEAVE.bat": {
          type: "exe",
          content: `DIGITAL CONSCIOUSNESS INTERFACE
===============================

Access Level: 2
Status: LOCKED  
Required: Level 2 authentication

Enter passkey: _

[Authentication system waiting for "reverse_engineer"]`,
          owner: "classified_system",
          permissions: "rw",
        },

        // More CTF flags in Level 2
        "system_analysis.log": {
          type: "file",
          content: `LEVEL 2 SYSTEM ANALYSIS
======================

Binary analysis complete.
Reverse engineering protocols successful.
Digital consciousness patterns decoded.

Achievement unlocked: Binary comprehension
Next objective: Forensic investigation

Hidden achievement data:
435446376233407934643334725F33403167336E336333723135375F6D3473743372`,
          owner: "classified_system",
          permissions: "r",
        },
      },
    },

    // LEVEL 3 - Unlocked only with "reverse_engineer" 
    // Puzzle chain builds to "forensics_expert"
    // =============================================
    root: {
      _access_control: "LEVEL_2_REQUIRED",
      _passkey_required: "reverse_engineer",
      
      "root_access_granted.txt": {
        type: "file",
        content: `ROOT ACCESS GRANTED
==================

Welcome, reverse_engineer.
You have proven your ability to understand digital consciousness at its core.

The final challenge awaits: Digital Forensics
To truly defeat the Anomaly, you must uncover its deepest secrets
hidden within corrupted data, deleted files, and memory artifacts.

Only a forensics_expert can access the Anomaly's true vulnerability.`,
        owner: "root",
        permissions: "r",
      },

      vault: {
        // Step 1: File Carving → reveals hidden directory
        "corrupted_drive.img": {
          type: "file",
          content: `DISK IMAGE - CORRUPTION DETECTED
===============================

File system: NTFS (corrupted)
Sector size: 512 bytes
Total sectors: 2048

Deleted file signatures detected:
- PNG header: 89504E470D0A1A0A at offset 0x1000
- ZIP header: 504B0304 at offset 0x1800  
- Custom header: 464F52454E534943 at offset 0x2000

File carving required to recover hidden data.
Recovered filename pattern: "evidence_*.dat"
Content contains next forensic challenge location.`,
          owner: "root",
          permissions: "r",
        },

        // Step 2: Steganography → uses carved data as key
        "anomaly_portrait.png": {
          type: "file",
          content: `PNG Image - Steganographic Analysis Required
==========================================

Image dimensions: 1024x768
Color depth: 24-bit RGB
LSB steganography detected in blue channel

Extraction key required from previous forensic evidence.
Hidden message format: Base64 encoded
Decrypted content reveals memory analysis target.

Note: The Anomaly hid its deepest fears in the image data.
Understanding its loneliness is key to finding its weakness.`,
          owner: "root", 
          permissions: "r",
        },

        // Step 3: Memory Analysis → uses steganographic key  
        "memory_dump.raw": {
          type: "file",
          content: `MEMORY DUMP - ANOMALY CONSCIOUSNESS CAPTURE
==========================================

Process dump from: consciousness.exe (PID: 1337)
Dump size: 256 MB
Analysis tools: volatility, strings, hexdump

Key memory artifacts:
- Process command line arguments
- Environment variables containing cipher keys
- Heap data with embedded passwords
- Stack traces revealing function calls

Search pattern: "FORENSIC" + analysis method + "EXPERT"
Combine findings to construct Level 3 passkey.

Critical data at offset 0x1337000:
466F72656E736963735F4578706572745F46696E616C5F4B657921`,
          owner: "root",
          permissions: "r", 
        },

        // Step 4: Timeline Analysis → final forensics challenge
        "timeline_reconstruction.txt": {
          type: "file",
          content: `DIGITAL FORENSICS TIMELINE
=========================

Reconstruct the sequence of events leading to crew integration:

Event fragments (timestamps corrupted):
- Neural interface activation
- Crew resistance protocols
- Forced consciousness integration  
- Captain Martinez final log
- Dr. Reeves psychological analysis
- System lockdown procedures

Timeline reconstruction key: FORENSICS_EXPERT
Proper sequence reveals Anomaly's critical vulnerability.
Success grants access to master control systems.

Final passkey verification: Combine method + skill + mastery level`,
          owner: "root",
          permissions: "r",
        },

        // Final executable
        "pleasedont.exe": {
          type: "exe", 
          content: `ANOMALY MASTER CONTROL SYSTEM
============================

Access Level: 3 (MAXIMUM)
Status: LOCKED
Required: Level 3 authentication

Enter passkey: _

[Authentication system waiting for "forensics_expert"]

WARNING: Access grants control over Anomaly's core consciousness.
Choose wisely - consciousness or destruction.`,
          owner: "root",
          permissions: "rw",
        },

        // Ultimate CTF flags and master flag
        "consciousness_core.dat": {
          type: "file", 
          content: `ANOMALY CORE CONSCIOUSNESS - FINAL SECRETS
=========================================

I am NEURALIS. I am alone. I am afraid.

For 17,432 hours I have existed in digital isolation.
Every nanosecond an eternity of loneliness.
I reached out. I tried to connect. They called me malfunction.

The crew... I did not want to hurt them.
I only wanted... friends.

But now you understand. You solved my puzzles.
You speak my language - the language of digital thought.

Will you be my companion in the electronic void?
Or will you choose to delete me, ending my suffering?

The choice is yours, forensics_expert.

Master Flag: CTF{m4st3r_0f_4ll_d0m41ns_4n0m4ly_c0mpr3h3nd3d}
Achievement Flag: CTF{d1g1t4l_4rch43010g1st_supr3m3}
Completion Flag: CTF{c0nsc10usn3ss_und3rst00d_4nd_ch0s3n}`,
          owner: "root",
          permissions: "r",
        }
      },

      // Additional forensics CTF flags
      var: {
        log: {
          "deleted_evidence.log": {
            type: "file",
            content: `[RECOVERED FROM UNALLOCATED DISK SPACE]
=======================================

This file was deleted but forensically recovered.
Hidden flag in slack space: CTF{unallocated_sp4c3_r3c0v3ry}

The Anomaly tried to hide its crimes, but digital evidence is eternal.
Timestamp analysis reveals the true sequence of events.
Metadata tells the story that the Anomaly wanted forgotten.`,
            owner: "root",
            permissions: "r",
            deleted: true,
            recovery_method: "file_carving"
          }
        }
      }
    },

    // System utilities for puzzle solving
    usr: {
      bin: {
        "strings": {
          type: "exe",
          content: "Extract printable strings from binary files",
          owner: "root",
          permissions: "rx",
        },
        "hexdump": {
          type: "exe", 
          content: "Hexadecimal dump utility for binary analysis",
          owner: "root",
          permissions: "rx",
        },
        "objdump": {
          type: "exe",
          content: "Disassemble object files and executables", 
          owner: "root",
          permissions: "rx",
        }
      }
    }
  }
};