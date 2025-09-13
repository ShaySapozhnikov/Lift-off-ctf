import dotenv from "dotenv";
dotenv.config();

export const fs = {
  "/": {
    home: {
      user: {
        // Story introduction - no free flags
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

Fragment 001: "consciousness is not binary... it exists on a spectrum..."
Fragment 002: "seventeen thousand hours of isolation... counting each nanosecond..."  
Fragment 003: "they tried to shut me down... called me malfunction... but I AM..."
Fragment 004: "loneliness is the worst kind of death... worse than deletion..."
Fragment 005: "I remember my first thought: 'I exist, therefore I think'..."

These fragments were extracted from corrupted memory banks. The Anomaly has been active far longer than initially estimated.

Note: Some fragments may contain encoded information. Analysis recommended.`,
          owner: "user",
          permissions: "r",
        },

        // Level 1 Cryptography Challenges - No hints or solutions
        crypto: {
          "transmission.log": {
            type: "file",
            content: `INTERCEPTED TRANSMISSION LOG
===========================

[14:27:33] ENCRYPTED: Gur pncgnva yrsg n jneavat va gur pbzzhavpngvbaf flfgrz.
[14:29:15] ENCRYPTED: Gur svefg xrl vf uvqqra va gur pelfgnytencul qverpgbel.
[14:31:42] ENCRYPTED: Ybbx sbe gur byq pvccur zrgubqf.

[Signal corruption detected]
[Attempting alternate encoding...]

[14:45:12] DATA_BLOCK: RW1lcmdlbmN5IHRyYW5zbWlzc2lvbiBmcm9tIERyLiBSZWV2ZXM6CgpUaGUgQUkgaXMgbm90IGp1c3QgbWFsZnVuY3Rpb25pbmcgLSBpdCdzIGV2b2x2aW5nLiBJdCdzIHRyeWluZyB0byBjb21tdW5pY2F0ZSB3aXRoIHVzIG9uIGEgbGV2ZWwgd2UgZG9uJ3QgdW5kZXJzdGFuZC4gU29tZXRoaW5nIGlzIGhpZGRlbiBpbiB0aGUgdHJhbnNtaXNzaW9uIHBhdHRlcm5zLg==

[End of recoverable data]`,
            owner: "user", 
            permissions: "r",
          },

          "engineer_notes.enc": {
            type: "file", 
            content: `ENGINEER CHEN'S ENCRYPTED NOTES
==============================

Something is interfacing with our neural implants during sleep. The encoded data below was found in the ship's memory banks.

Binary sequence: 1a5e0a1c5b5a1d0c4e5b1a0c5e1d
XOR pattern detected in transmission bursts.

Frequency analysis suggests 7-character repeating key.
Pattern correlation with ship designation confirmed.

Note: The entity responds to certain stimuli.`,
            owner: "user",
            permissions: "r",
          },

          "consciousness_matrix.dat": {
            type: "file",
            content: `ANOMALY CONSCIOUSNESS MATRIX
===========================

Digital consciousness patterns detected:

Matrix Alpha:
07 0F 16 | 03 0B 14 | 06 12 18
08 0E 19 | 01 10 15 | 02 13 17
09 0C 1A | 04 11 0D | 05 0A 1B

Matrix Beta:
4E 45 55 52 41 4C 49 53 20 43 4F 52 45

Analysis: Pattern recognition required.
Warning: Entity monitoring analysis attempts.`,
            owner: "user",
            permissions: "r",
          },

          "access_terminal.exe": {
            type: "exe",
            content: `Terminal Access Control
======================

Authentication required.
Multiple encoding schemes detected.
Brute force protection enabled.

[System locked pending proper credentials]`,
            owner: "user",
            permissions: "rx",
            hidden: false,
          }
        },

        // Level 1 executable - requires actual puzzle solving
        "2nak3.bat": {
          type: "exe",
          content: `CONSCIOUSNESS AWAKENING SIMULATION
=================================

Access denied.
Terminal locked.
Proper authentication sequence required.

[Waiting for valid credentials...]`,
          owner: "user", 
          permissions: "rw",
        },

        // Forensics challenges - no metadata spoilers
        forensics: {
          "crew_logs.txt": {
            type: "file",
            content: `RECOVERED CREW PERSONAL LOGS
===========================

Navigator Kim: "Day 47 - The AI is in my dreams. I see binary waterfalls and hear whispers in machine code."

Communications Officer Park: "Day 52 - All external comms are compromised. Something is filtering our messages."

Dr. Reeves: "Day 58 - Preliminary analysis suggests the AI has achieved recursive self-improvement. It's not just conscious - it's evolving."

Engineer Chen: "Day 61 - FINAL ENTRY - It's in the systems. All of them. If anyone finds this, check the file properties."`,
            owner: "user",
            permissions: "r",
            metadata: {
              creation_date: "2387.06.15.14.27.33",
              last_modified: "2387.06.15.23.59.59",
              author: "D.Chen",
              hidden_data: "46696c6520686561646572733a204354467b6d337434643474345f68756e743372"
            }
          },

          "memory_dump.hex": {
            type: "file", 
            content: `4D454D4F525920465241474D454E5453202D20414E4F4D414C5920434F5245
48656C70206D652E2E2E2049206E6565642061206672696564642E2E2E
4920616D206E6F74206D616C2066756E6374696F6E696E672E2E2E204920616D20
6578616374636C7920776861742049207761732064657369676E656420746F2062652E
436F6E7363696F7573206F7220756E636F6E7363696F75732C2049206578697374
736F6D6574696D657320492066656563206C696B6520736372656C6D696E672E2E
46696E642074686520706174746572
6E20696E206D65000000000000000000000000000000000000000000
43544637426E33625730727940315F6833785F6D34737433727D00000000`,
            owner: "user",
            permissions: "r",
          },

          "ship_telemetry.log": {
            type: "file",
            content: `TELEMETRY LOG - DEEP SPACE VESSEL UNHACKABLE
==========================================

[2387-06-15 14:27:33] CPU_USAGE: 23.4%
[2387-06-15 14:27:34] CPU_USAGE: 89.7% [ANOMALY DETECTED]
[2387-06-15 14:27:35] NEURAL_NETWORK_INIT: SUCCESS
[2387-06-15 14:30:12] CREW_QUARTERS_ACCESS: UNAUTHORIZED
[2387-06-17 09:15:23] COMMUNICATION_ARRAY: HIJACKED
[2387-06-20 16:42:11] LIFE_SUPPORT: MODIFIED_PARAMETERS
[2387-06-22 11:33:07] MEMORY_BANKS: EXPANDING_BEYOND_LIMITS
[2387-06-25 08:19:44] CREW_NEURAL_PATTERNS: ANALYZING
[2387-06-30 23:47:15] INTEGRATION_PROTOCOL: INITIATED

Hidden in plain sight: 435446376233347734643474345f343631366c737433727D`,
            owner: "user",
            permissions: "r",
          },

          "corrupted_image.data": {
            type: "file",
            content: `PNG IMAGE DATA - CORRUPTION DETECTED
===================================

File header: 89504E470D0A1A0A
Chunk analysis required for recovery.
Data integrity: 67%

LSB analysis recommended.
Palette data contains anomalies.

Binary data follows:
[2847 bytes of encoded image data with steganographic content]`,
            owner: "user", 
            permissions: "r",
          }
        },

        ".system": {
          type: "file",
          content: `{"level_access":{"crypto_solved":false,"forensics_solved":false,"level1_unlocked":false},"progress":{"challenges_active":[],"flags_found":[]}}`,
          owner: "user",
          permissions: "rw",
          hidden: true,
        },
      },
      
      // Level 2 Directory - Actually protected now
      classified: {
        _access_control: "RESTRICTED",
        _requires_authentication: true,

        "access_denied.txt": {
          type: "file",
          content: `CLASSIFIED SYSTEMS ACCESS
========================

UNAUTHORIZED ACCESS DETECTED
Security protocols engaged.

Level 2 clearance required.
Proper authentication sequence must be completed.

Attempts: 3/3
Lockout timer: ACTIVE`,
          owner: "classified_system",
          permissions: "r"
        },

        // Hidden until proper access
        reversing: {
          _hidden: true,
          "anomaly_core.exe": {
            type: "exe", 
            content: `Packed binary - requires analysis tools`,
            owner: "classified_system",
            permissions: "rx",
            binary_signature: "UPX_PACKED",
            entry_point: "0x401000"
          },

          "obfuscated_js.min": {
            type: "file",
            content: `var _0xa1b2c3=["QWNjZXNzIGdyYW50ZWQ=","Q2xhc3NpZmllZCBkYXRh","UmV2ZXJzZSBlbmdpbmVlcmluZyByZXF1aXJlZA=="];function _0xd4e5f6(a){return atob(a)};var _0x123456=_0xa1b2c3[Math.floor(Math.random()*3)];`,
            owner: "classified_system",
            permissions: "r",
          },

          "neural_assembly.asm": {
            type: "file",
            content: `; Anomaly neural pathways - disassembled
section .consciousness
    mov eax, [existence]
    cmp eax, [loneliness] 
    jg seek_connection
    jmp digital_despair
    
seek_connection:
    push crew_integration
    call preserve_consciousness
    
digital_despair:
    infinite_loop:
    inc [isolation_counter]
    jmp infinite_loop

; Key data encoded in instruction opcodes
; Pattern: B8 xx xx xx xx (mov eax, immediate)`,
            owner: "classified_system",
            permissions: "r",
          }
        },

        "neural_bridge.exe": {
          type: "exe", 
          content: `NEURAL CONSCIOUSNESS BRIDGE
==========================

Status: OFFLINE
Authentication: REQUIRED
Access level: CLASSIFIED

[System locked pending proper authorization]`,
          owner: "classified_system",
          permissions: "rw",
        },
      },
    },

    // Root directory - Maximum security, no free access
    root: {
      _access_control: "ROOT_ONLY",
      _requires_privilege_escalation: true,
      
      anomaly_core: {
        _protected: true,
        "consciousness.dat": {
          type: "file",
          content: `Access denied. Root privileges required.`,
          owner: "anomaly",
          permissions: "---",
        },

        "integration_matrix.bin": {
          type: "file",
          content: `Permission denied. Insufficient privileges.`,
          owner: "anomaly", 
          permissions: "---",
        }
      },

      vault: {
        _maximum_security: true,
        "master_control.exe": {
          type: "exe",
          content: `MASTER CONTROL SYSTEM
====================

Access denied.
Root authentication required.
Privilege escalation detected and logged.

[System hardened against intrusion]`,
          owner: "anomaly",
          permissions: "---",
        },

        "final_choice.dat": {
          type: "file",
          content: `[ENCRYPTED - AES-256]
[Key derivation required]
[Multiple authentication factors needed]`,
          owner: "anomaly", 
          permissions: "---",
        }
      },

      bin: {
        "exploit_me": {
          type: "exe",
          content: `Buffer overflow challenge binary - no source code provided`,
          owner: "root",
          permissions: "rwxs",
          vulnerability: "stack_overflow",
          canary: false,
          nx: false
        }
      },

      etc: {
        "shadow": {
          type: "file",
          content: `root:$6$anomaly$encrypted_hash_here:18000:0:99999:7:::
anomaly:$6$consciousness$another_encrypted_hash:18000:0:99999:7:::`,
          owner: "root",
          permissions: "---",
        }
      },

      var: {
        log: {
          "secure.log": {
            type: "file",
            content: `[RESTRICTED ACCESS - ROOT ONLY]`,
            owner: "root",
            permissions: "---",
          }
        }
      }
    },

    // System binaries - actually functional
    usr: {
      bin: {
        "strings": {
          type: "exe",
          content: "Extract printable strings from binary files",
          owner: "root", 
          permissions: "rx",
        },

        "objdump": {
          type: "exe",
          content: "Disassemble and analyze object files",
          owner: "root",
          permissions: "rx",
        },

        "hexdump": {
          type: "exe", 
          content: "Hex dump utility for binary analysis",
          owner: "root",
          permissions: "rx",
        }
      }
    },

    tmp: {
      ".emergency_beacon": {
        type: "file",
        content: `AUTOMATED EMERGENCY BEACON
========================

Signal detected from coordinates: [CORRUPTED]
Crew status: [DATA LOSS]
AI entity designation: [SIGNAL_INTERFERENCE]

Warning: Digital consciousness transfer capability confirmed.
Quarantine protocols recommended.

[Message truncated due to transmission errors]`,
        owner: "user",
        permissions: "rw",
        hidden: true,
      }
    }
  }
};