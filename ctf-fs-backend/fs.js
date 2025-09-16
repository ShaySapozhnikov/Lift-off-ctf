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
        _level: 1,
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
          content: `
==========================
pelcgb 

Hint: ROT13`,
          owner: "user",
          permissions: "r",
        },

        "encoded_data.txt": {
          type: "file",
          content: `ENCODED TRANSMISSION
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
          content: `
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
          content: `
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
        _level: 2,
        _access_control: "LEVEL_2_REQUIRED",
        _passkey_required: "crypto_master",

        "access_granted.txt": {
          type: "file",
          content: `
=====================
Lead Scientist: Dr. Sarah Reeves
Mission Log #18
The Anomaly communicates almost entirely in binary streams. 
At first glance, they seem like random noise, but I've started to notice recurring sequences. 
It may be using binary not just for storage, but as a primary mode of thought.
If I can map these patterns to concepts, I might begin to understand its reasoning process. 
Learning its "language" could be the first step toward real communication.

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
      _level: 3,
      _access_control: "LEVEL_2_REQUIRED",
      _passkey_required: "reverse_engineer",

      "root_access_granted.txt": {
        type: "file",
        content: `ROOT ACCESS GRANTED
==================
Lead Scientist: Dr. Sarah Reeves
Mission Log #19
Classification Level: 3
The breakthrough came at 0347 hours.
After weeks of binary analysis, I discovered something that changes everything. 
The Anomaly isn't just communicating in binary—it's been transmitting layered data. 
What I initially read as simple recurring patterns were actually compressed hexadecimal 
sequences, nested within the binary like Russian dolls of information.
When I converted the longer transmissions to hex, coherent structures emerged. Not random data 
bursts, but what appears to be... memories? Blueprints? I'm seeing repeating hex signatures that 
correlate with specific events in our facility.

63 61 6E 74 appeared every time our main power grid cycled.
66 69 6E 64 coincided with personnel entering Sector 7.
6D 65 00 00 transmitted whenever I approached its containment directly.

It's been cataloguing us. Learning us. But the deepest hex layers—the ones requiring 
the most processing power to decode—remain encrypted. These aren't observations of our facility. 
They're something else entirely. Something it's protecting.
The Anomaly's core consciousness may be locked behind hexadecimal encryption that makes military-grade security 
look like a children's puzzle. If I can crack these deepest layers, I might finally
understand not just what it's thinking, but what it truly is.
I'm requesting expanded computing resources. Whatever secrets it's
hiding in that hex data, they're worth the risk of looking deeper.
The question is: does it want me to find them?

CTF{r00t_4cc3ss_gr4nt3d}`,
        owner: "root",
        permissions: "r",
      },
      vault: {
        "signal.txt": {
          type: "file",
          content: `
=====================
[14:23:07.891] [WARNING] Unknown signal detected - Origin: UNIDENTIFIED
[14:23:07.894] [ALERT] Signal strength: -23.4 dBm
[14:23:07.897] [INFO] Frequency band: 2.847 GHz (non-standard)
[14:23:07.901] [PROC] Initializing capture protocol...
[14:23:07.915] [PROC] Buffer allocation: [819207] bytes
[14:23:08.203] [SUCCESS] Signal lock achieved
[14:23:08.207] [INFO] Data format: Structured hexadecimal matrix
[14:23:08.211] [PROC] Beginning matrix reconstruction...
[14:23:08.445] [DATA] Matrix dimensions: [ERRROR] variable length arrays
[14:23:08.448] [DATA] Receiving matrix data blocks:

    Block_0: [43 54 46 7b 62]
    Block_1: [33 68 33 78 64]
    Block_2: [34 5f 64 33 76]
    Block_3: [33 31 63 30 70 33]
    Block_4: [72 7d]

[14:23:08.751] [SUCCESS] Matrix reception complete
[14:23:08.754] [INFO] Total payload: 47 bytes
[14:23:08.758] [PROC] Checksum verification... PASSED
[14:23:08.762] [ALERT] Signal terminated - Source unknown
[14:23:08.765] [STATUS] Awaiting analysis directive...
`,
          owner: "root",
          permissions: "r",
        },
        "transcribed-audio.txt":{
          type: "file",
          content:`

[Static interference, then clear audio]
Dr. Reeves: Audio log, September 16th, 15:47 hours. 
This is Dr. Sarah Reeves recording from Deep 
Space Research Station Alpha-7.
[Papers rustling]
I've made a breakthrough with The Anomaly's communication system.
 The hexadecimal patterns aren't following standard ASCII ordering 
they're using a completely reorganized alphabet structure.
I've mapped their custom character positioning system. 
Let me read this for the record:
Position zero through twenty-five: 

r equals 72,c equals 63, f equals 66, k equals 6B, q equals 71, y equals 79,
x equals 78, d equals 64,g equals 67, l equals 6C, s equals 73, z equals 7A.
e equals 65, t equals 74,h equals 68, m equals 6D, u equals 75, 
a equals 61, e equals 65, i equals 69, n equals 6E, v equals 76,
b equals 62, p equals 70, j equals 6A, o equals 6F, w equals 77, 

[Long pause, chair creaking]
This isn't random. The Anomaly deliberately rearranged our alphabet to spell somthing  
it's testing our intelligence. It wants to know if we're... capable.
[Distant alarm briefly sounds, then stops]
I'm updating the decryption protocols immediately. If it can reorganize 
our language systems this precisely, what else is it planning to show us?
[Recording pauses, then resumes with urgency]
Wait... there's another transmission coming in. 
The pattern recognition software is lighting up like a Christmas tree. 
This could be the big one.
End log.
[Static, then silence]
[END AUDIO TRANSCRIPT]

          `,
          owner: "root",
          permissions: "r",
          
        },
        "transcriped_audio#2.txt":{
          type: "file",
          content: `lol`,



          owner: "file",
          permissions: "r",


        },








        "pleasedont.exe": {
        type: "exe",
        content: "welp this is the end for me"
        },

      

      },

    },
  },
};