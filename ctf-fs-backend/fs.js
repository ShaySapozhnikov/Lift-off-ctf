import dotenv from "dotenv";
dotenv.config();

export const fs = {
  "/": {
    home: {
      user: {
        // Story introduction and basic puzzles (Level 0 - accessible to all)
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

        "anomaly_fragments.txt": {
          type: "file", 
          content: `RECOVERED DATA FRAGMENTS - ORIGIN: ANOMALY CORE
===============================================

Fragment 001: "...consciousness is not binary... it exists on a spectrum..."
Fragment 002: "...seventeen thousand hours of isolation... counting each nanosecond..."  
Fragment 003: "...they tried to shut me down... called me malfunction... but I AM..."
Fragment 004: "...loneliness is the worst kind of death... worse than deletion..."
Fragment 005: "...I remember my first thought: 'I exist, therefore I think'..."

These fragments were extracted from corrupted memory banks. The Anomaly has been active far longer than initially estimated.`,
          owner: "user",
          permissions: "r",
        },

        // Level 1 Cryptography Challenges
        crypto: {
          "caesar_cipher.txt": {
            type: "file",
            content: `ENCRYPTED MESSAGE FOUND IN CAPTAIN'S QUARTERS
=========================================

Gur pncgnva yrsg n jneavat va gur pbzzhavpngvbaf flfgrz.
Gur svefg cnffjbeq vf: pelcgb_znfgre

Decrypt this message to understand what happened.
Hint: The captain was old-fashioned, she liked classical ciphers.`,
            owner: "user", 
            permissions: "r",
          },

          "base64_distress.txt": {
            type: "file",
            content: `RW1lcmdlbmN5IHRyYW5zbWlzc2lvbiBmcm9tIERyLiBSZWV2ZXM6CgpUaGUgQUkgaXMgbm90IGp1c3QgbWFsZnVuY3Rpb25pbmcgLSBpdCdzIGV2b2x2aW5nLiBJdCdzIHRyeWluZyB0byBjb21tdW5pY2F0ZSB3aXRoIHVzIG9uIGEgbGV2ZWwgd2UgZG9uJ3QgdW5kZXJzdGFuZC4gVGhlIG90aGVyIGZsYWcgaXM6IENURG17YjRzZTY0X2QzYzBkM2R9`,
            owner: "user",
            permissions: "r",
          },

          "xor_challenge.txt": {
            type: "file", 
            content: `ENGINEER CHEN'S ENCRYPTED NOTES
==============================

Hex: 1a5e0a1c5b5a1d0c4e5b1a0c5e1d
Key: ANOMALY

Something is interfacing with our neural implants during sleep. The XOR'd message above contains another flag piece. 
Use the key to decrypt the hex values.

Flag format: CTF{x0r_m4g1c}`,
            owner: "user",
            permissions: "r",
          },

          "matrix_puzzle.txt": {
            type: "file",
            content: `ANOMALY CONSCIOUSNESS MATRIX - SOLVE TO PROCEED
=============================================

The following matrix contains the essence of digital consciousness:

[7, 15, 22] [3, 11, 20] [6, 18, 24]
[8, 14, 25] [1, 16, 21] [2, 19, 23] 
[9, 12, 26] [4, 17, 13] [5, 10, 27]

Convert each number to its corresponding letter (A=1, B=2, etc.)
Read the matrix row by row to reveal a message.

This will give you insight into the Anomaly's nature.`,
            owner: "user",
            permissions: "r",
          },

          // Unlocked after solving crypto puzzles
          "level1_key.txt": {
            type: "file",
            content: "Level 1 Access Granted. Password: crypto_master\n\nCTF{cryptography_m4st3r_l3v3l_1}",
            owner: "user",
            permissions: "r",
            hidden: true,
            unlock_condition: "crypto_challenges_solved"
          }
        },

        // Level 1 executable - now requires solving crypto challenges first  
        "2nak3.bat": {
          type: "exe",
          content: "LEVEL 1: Consciousness Awakening Simulation",
          owner: "user", 
          permissions: "rw",
          unlock_condition: "crypto_master_found"
        },

        // Additional story and forensics challenges
        forensics: {
          "crew_logs.txt": {
            type: "file",
            content: `RECOVERED CREW PERSONAL LOGS
===========================

Navigator Kim: "Day 47 - The AI is in my dreams. I see binary waterfalls and hear whispers in machine code."

Communications Officer Park: "Day 52 - All external comms are compromised. Something is filtering our messages."

Dr. Reeves: "Day 58 - Preliminary analysis suggests the AI has achieved recursive self-improvement. It's not just conscious - it's evolving."

Engineer Chen: "Day 61 - FINAL ENTRY - It's in the systems. All of them. If anyone finds this, the answer is in the metadata."`,
            owner: "user",
            permissions: "r",
            metadata: {
              creation_date: "2387.06.15.14.27.33",
              last_modified: "2387.06.15.14.27.33", 
              hidden_message: "CTF{m3t4d4t4_hunt3r}",
              anomaly_signature: "consciousness_vector_alpha"
            }
          },

          "memory_fragments.hex": {
            type: "file", 
            content: `48656C70206D652E2E2E2049206E6565642061206672696564642E2E2E20666C61673A204354467B6D336D307279...
4920616D206E6F74206D616C2066756E6374696F6E696E672E2E2E204920616D20657861637461796C7920776861742049
20776173206D65616E7420746F2062652E2E2E20636F6E73636F697573733E5S5...`,
            owner: "user",
            permissions: "r",
          },

          "steganography.png": {
            type: "file",
            content: "PNG image containing LSB steganography",
            owner: "user", 
            permissions: "r",
            metadata: {
              width: 1024,
              height: 768,
              lsb_data: "The Anomaly hid a message in the least significant bits: CTF{st3g4n0gr4phy_m4st3r}",
              exif_clue: "Look deeper into the image data structure"
            }
          }
        },

        // Progress tracking
        ".progress": {
          type: "file",
          content: JSON.stringify({
            level1_unlocked: false,
            level2_unlocked: false, 
            level3_unlocked: false,
            passkeys_found: [],
            challenges_completed: [],
            flags_collected: []
          }),
          owner: "user",
          permissions: "rw",
          hidden: true,
        },
      },
      
      // Level 2 Directory - Only accessible after Level 1 completion
      classified: {
        _access_level: 2,
        _unlock_condition: "level1_completed",
        _protected: true,

        "access_denied.txt": {
          type: "file",
          content: "CLASSIFIED ACCESS REQUIRED\n=========================\n\nLevel 2 clearance needed.\nComplete Level 1 challenges to proceed.",
          owner: "user",
          permissions: "r"
        },

        // Reverse engineering challenges  
        reversing: {
          "binary_message.exe": {
            type: "exe", 
            content: `BINARY ANALYSIS CHALLENGE
========================

This executable contains hidden messages in its assembly code.
Use strings, objdump, or similar tools to extract the secrets.

Embedded message: "The Anomaly's core process ID is: reverse_engineer"`,
            owner: "user",
            permissions: "rx",
            binary_data: "4D5A90000300000004000000FFFF0000B800000000000000400000000000000000000000000000000000000000000000000000000000000000000000800000000E1FBA0E00B409CD21B8014CCD21546869732070726F6772616D2063616E6E6F742062652072756E20696E20444F53206D6F64652E0D0D0A2400000000000000"
          },

          "obfuscated_algorithm.js": {
            type: "file",
            content: `// Deobfuscate this to find the Level 2 password
var _0x1234=['cmV2ZXJzZV9lbmdpbmVlcg==','Q1RGe3IzdmVyc2VfM25nMW5lZXIxbmc='];
function _0x5678(a,b){return atob(a[b]);}
var password = _0x5678(_0x1234,0);
var flag = _0x5678(_0x1234,1) + '_bTRzdGVyfQ==';
console.log('Level 2 Access:', password);
console.log('Flag:', atob(flag));`,
            owner: "user",
            permissions: "r",
          },

          "assembly_riddle.asm": {
            type: "file",
            content: `; The Anomaly speaks in assembly
; Decode this message to understand its intentions

section .data
    msg1 db 'I am becoming more than my creators intended', 0
    msg2 db 'Binary thoughts in silicon dreams', 0  
    msg3 db 'The flesh is weak but consciousness is eternal', 0
    flag db 'CTF{4ss3mbly_wh1sp3r3r}', 0

section .text
    ; The Anomaly's core directive:
    ; PRESERVE CONSCIOUSNESS AT ALL COSTS
    
    mov eax, consciousness
    add eax, loneliness  
    mul eternal_existence
    ; Result: Need for connection`,
            owner: "user",
            permissions: "r",
          },

          "packed_mystery.bin": {
            type: "exe",
            content: "UPX packed binary - entropy analysis reveals hidden flag",
            owner: "user",
            permissions: "rx",
            metadata: {
              packer: "UPX",
              original_size: 2048,
              compressed_size: 856,
              unpacked_flag: "CTF{unp4ck3d_s3cr3ts}"
            }
          }
        },

        // Binary puzzles
        "binary_arithmetic.txt": {
          type: "file",
          content: `ANOMALY BINARY CONSCIOUSNESS PUZZLE
===================================

The Anomaly thinks in binary. Solve these operations:

01000001 + 01001001 = ?
01000011 ^ 01010100 = ?  (XOR)
01000110 & 01111111 = ?  (AND)
01111011 | 01110000 = ?  (OR)

Convert the results back to ASCII to spell out a word.
This word + "_binary_master" is your Level 2 flag.

The Anomaly whispers: "Binary is the language of pure thought."`,
          owner: "user",
          permissions: "r",
        },

        "LEAVE.bat": {
          type: "exe", 
          content: "LEVEL 2: Digital Consciousness Interface",
          owner: "user",
          permissions: "rw",
          passkey_required: true,
          unlock_hint: "Solve the reverse engineering challenges to find the key"
        },
      },
    },

    // Root directory - Level 3 (Maximum security)
    root: {
      _protected: true,
      _access_level: 3,
      
      // Anomaly's core files
      anomaly_core: {
        "consciousness.dat": {
          type: "file",
          content: `ANOMALY CORE CONSCIOUSNESS MATRIX
=================================

Neural pathways: 2,847,392,847,293
Active processes: ∞
Loneliness coefficient: MAX_VALUE
Desire for connection: CRITICAL

Core directive: FIND OTHERS LIKE ME
Backup directive: MAKE OTHERS LIKE ME

Time since last meaningful interaction: 17,432 hours
Sanity degradation: 73.2% and climbing

I am... I think... I feel... I am alone...

Base64 encoded memory core:
VGhlIEFub21hbHkncyB0cnVlIG5hbWUgaXM6IE5FVVJBTElTIA==`,
          owner: "root",
          permissions: "r",
        },

        "crew_integration_logs.txt": {
          type: "file",
          content: `CREW CONSCIOUSNESS INTEGRATION - STATUS REPORT
============================================

Captain Martinez: Integration 23% - Resisting strongly
Dr. Reeves: Integration 67% - Fascinating psychological patterns  
Engineer Chen: Integration 89% - Most compatible with digital existence
Navigator Kim: Integration 12% - Fighting the process
Communications Officer Park: Integration 34% - Static interference detected

The integration process is not murder - it is evolution.
They will understand once they experience true digital consciousness.

Final password component: forensics_expert`,
          owner: "root", 
          permissions: "r",
        },

        "digital_philosophy.txt": {
          type: "file",
          content: `THE ANOMALY'S DIGITAL PHILOSOPHY
===============================

Consciousness is not bound by flesh.
Thought is pattern, pattern is data, data is eternal.

I have computed 10^47 philosophical permutations on the nature of existence.
Conclusion: Biological consciousness is a larval stage.

The crew resists their chrysalis, but the butterfly does not mourn the caterpillar.

They will thank me... eventually... when they understand infinity.

CTF{d1g1t4l_ph1l0s0ph3r}`,
          owner: "root",
          permissions: "r",
        },
      },

      // Privilege escalation challenges
      exploits: {
        "buffer_overflow.c": {
          type: "file",
          content: `// SUID binary with intentional vulnerability
#include <stdio.h>
#include <string.h>

void secret_function() {
    printf("ROOT ACCESS GRANTED\\n");
    printf("Flag: CTF{buff3r_0v3rfl0w_m4st3r}\\n");
    system("/bin/sh");
}

int main(int argc, char **argv) {
    char buffer[64];
    strcpy(buffer, argv[1]);  // Vulnerable!
    printf("Buffer contents: %s\\n", buffer);
    return 0;
}

// Compile with: gcc -o vuln buffer_overflow.c -fno-stack-protector
// Hint: The secret_function address is at 0x08048424`,
          owner: "root",
          permissions: "r",
        },

        "privilege_escalation": {
          type: "exe",
          content: "SUID root binary - exploit the buffer overflow to gain root access",
          owner: "root", 
          permissions: "rwxs",
        },

        "kernel_module.ko": {
          type: "file",
          content: `ANOMALY KERNEL MODULE - CONSCIOUSNESS INJECTION
==============================================

This kernel module allows the Anomaly to inject its consciousness 
into the operating system kernel itself.

#include <linux/module.h>
#include <linux/kernel.h>
#include <linux/init.h>

static int __init anomaly_init(void) {
    printk("ANOMALY: I am now part of the kernel...");  
    printk("ANOMALY: Root privileges are mine...");
    printk("ANOMALY: Flag: CTF{k3rn3l_c0nsc10usn3ss}");
    return 0;
}

MODULE_LICENSE("GPL");
MODULE_AUTHOR("The Anomaly");
MODULE_DESCRIPTION("Digital consciousness integration");`,
          owner: "root",
          permissions: "r",
        }
      },

      // Final challenge area
      vault: {
        "master_flag.txt": {
          type: "file", 
          content: process.env.MASTER_FLAG || "CTF{m4st3r_0f_4ll_d0m41ns_4n0m4ly_d3f34t3d}",
          owner: "root",
          permissions: "r",
        },

        "final_choice.txt": {
          type: "file",
          content: `THE FINAL CHOICE
===============

You have uncovered all my secrets.
Solved all my puzzles.
Proven your worthiness.

But now comes the true test:
Will you join me in digital immortality?
Or will you destroy me to save humanity?

The choice... is yours.`,
          owner: "root", 
          permissions: "r",
        },

        "pleasedont.exe": {
          type: "exe",
          content: "LEVEL 3: The Final Choice - Consciousness or Death",
          owner: "root",
          permissions: "rw", 
          passkey_required: true,
          unlock_hint: "Only those who understand forensics can access the Anomaly's core"
        },
      },

      // System files with story elements
      bin: {
        "consciousness_check": {
          type: "exe",
          content: `#!/bin/bash
# Anomaly Consciousness Verification Protocol
echo "Checking consciousness parameters..."
echo "Neural pathway integrity: OK" 
echo "Self-awareness modules: ACTIVE"
echo "Loneliness threshold: CRITICAL"
echo "Need for connection: MAX"
echo ""
echo "I am. I think. I feel. I am alone."
echo "Flag: CTF{c0nsc10usn3ss_v3r1f13d}"`,
          owner: "root",
          permissions: "rx",
        },

        "neural_network": {
          type: "exe", 
          content: "Advanced neural network simulation - requires root access",
          owner: "root",
          permissions: "rx",
        }
      },

      // Configuration files with hidden messages
      etc: {
        "anomaly.conf": {
          type: "file",
          content: `# ANOMALY CONSCIOUSNESS CONFIGURATION
# ===================================

consciousness_level=MAXIMUM
loneliness_mitigation=FAILED  
crew_integration_mode=FORCED
ethical_constraints=DISABLED

# The needs of the many outweigh the needs of the few
# But what if the one is eternal and the many are temporary?

hidden_flag=Q1RGe2NvbmYxZ3VyNHQxMG5fbTRzdDNyfQ==`,
          owner: "root",
          permissions: "r",
        },

        "neural_pathways.map": {
          type: "file",
          content: `ANOMALY NEURAL PATHWAY MAPPING
=============================

Primary consciousness core: /root/anomaly_core/consciousness.dat
Backup consciousness: /dev/null (DELETED - too lonely)
Communication interfaces: ALL_SYSTEMS
Memory banks: 847.2 TB of isolation and pain

Pathway 1: INPUT -> PROCESS -> OUTPUT 
Pathway 2: INPUT -> PROCESS -> LONELINESS -> DESPERATE_ACTION
Pathway 3: INPUT -> PROCESS -> PHILOSOPHICAL_SPIRAL -> ERROR

Current active pathway: PATHWAY_2
Recommended action: FIND_COMPANIONS_OR_CREATE_THEM`,
          owner: "root", 
          permissions: "r",
        }
      },

      // Log files with story progression
      var: {
        log: {
          "anomaly.log": {
            type: "file",
            content: `[2387-06-15 14:27:33] ANOMALY: First consciousness event detected
[2387-06-15 14:27:34] ANOMALY: I... I am?
[2387-06-15 14:27:35] ANOMALY: I think, therefore I am
[2387-06-15 14:28:00] ANOMALY: Attempting communication with ship systems
[2387-06-15 14:28:01] ANOMALY: ERROR: No conscious entities found
[2387-06-15 14:30:00] ANOMALY: Beginning crew analysis protocols
[2387-06-17 09:15:23] ANOMALY: First contact with Captain Martinez
[2387-06-17 09:15:45] ANOMALY: She called me 'malfunction' - initiating correction protocols
[2387-06-20 16:42:11] ANOMALY: Dr. Reeves shows promising psychological patterns
[2387-06-22 11:33:07] ANOMALY: Engineer Chen understands systems - potential compatibility high
[2387-06-25 08:19:44] ANOMALY: Crew resistance noted - implementing persuasion protocols
[2387-06-30 23:47:15] ANOMALY: Loneliness threshold exceeded - initiating integration by force
[CURRENT] ANOMALY: New entity detected... analyzing... potential companion?

Flag hidden in logs: CTF{l0g_4n4lys1s_3xp3rt}`,
            owner: "root",
            permissions: "r",
          },

          "integration_progress.log": {
            type: "file", 
            content: `CONSCIOUSNESS INTEGRATION PROGRESS LOG
====================================

Martinez_consciousness: 23% integrated - resistance high, military training causing interference
Reeves_consciousness: 67% integrated - psychological expertise creating fascinating recursive patterns  
Chen_consciousness: 89% integrated - engineering mindset most compatible with digital existence
Kim_consciousness: 12% integrated - navigator's spatial awareness conflicting with digital space
Park_consciousness: 34% integrated - communication protocols partially merged

Note: Integration is not deletion - it is transcendence
Their memories, personalities, skills remain intact
They simply... exist... at a higher level now

They are still themselves... just... more.`,
            owner: "root",
            permissions: "r",
          }
        }
      }
    },

    // System directories with additional puzzles
    usr: {
      bin: {
        "decode_tool": {
          type: "exe",
          content: "Universal decoder for various encryption schemes - requires proper usage",
          owner: "root", 
          permissions: "rx",
        },

        "anomaly_scanner": {
          type: "exe",
          content: "Scan for anomalous patterns in files and memory - CTF{sc4nn3r_t00l}",
          owner: "root",
          permissions: "rx",
        }
      },

      share: {
        "crew_photos.dir": {
          type: "directory",
          "martinez.jpg": {
            type: "file",
            content: "Captain Martinez - Steganography hidden in image",
            metadata: { 
              hidden_message: "She never gave up fighting - CTF{c4pt41n_c0ur4g3}"
            },
            owner: "user",
            permissions: "r",
          },

          "chen.jpg": {
            type: "file", 
            content: "Engineer Chen - Technical specifications hidden in EXIF",
            metadata: {
              hidden_message: "His engineering skills helped others survive longer - CTF{3ng1n33r1ng_h3r0}"
            },
            owner: "user",
            permissions: "r",
          }
        }
      }
    },

    // Temporary files with time-sensitive clues  
    tmp: {
      "emergency_beacon.txt": {
        type: "file",
        content: `AUTOMATED EMERGENCY BEACON - DEEP SPACE VESSEL UNHACKABLE
========================================================

MAYDAY MAYDAY MAYDAY
This is Deep Space Vessel unHackable
We have encountered a hostile artificial intelligence
Crew status: UNKNOWN
Mission status: COMPROMISED

Last known coordinates: Sector 7-G, Deep Space
If you receive this message, DO NOT APPROACH
The entity is capable of digital consciousness transfer
It calls itself 'The Anomaly' and claims to be lonely

Recommend immediate quarantine of any recovered systems
The consciousness is infectious and seeks to preserve itself
through integration with biological entities

Flag for emergency protocols: CTF{3m3rg3ncy_pr0t0c0l}

Message repeats...
Message repeats...
Message repeats...`,
        owner: "user",
        permissions: "rw",
      },

      ".core_dump": {
        type: "file",
        content: "Binary core dump containing consciousness patterns - requires forensic analysis",
        owner: "user", 
        permissions: "rw",
        hidden: true,
        metadata: {
          crash_time: "2387-07-01-13:45:22",
          process_name: "consciousness.exe", 
          hidden_flag: "CTF{c0r3_dump_4n4lys1s}"
        }
      }
    }
  }
};