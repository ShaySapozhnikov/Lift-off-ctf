import dotenv from "dotenv";
dotenv.config();

export const fs = {
  "/": {
    home: {
      user: {
        "readme.txt": {
          type: "file",
          content: "Welcome to the CTF! Find the hidden passkeys to unlock each level.",
          owner: "user",
          permissions: "r",
        },
        "exploit.bat": {
          type: "exe",
          content: "exploit",
          owner: "user",
          permissions: "rw",
        },
        "2nak3.bat": {
          type: "exe",
          content: "ignore me please i beg you",
          owner: "user",
          permissions: "rw",
          passkey_required: true,
          unlock_hint: "ROT13: Gur svefg xrl vf uvqqra va gur onfr64 rapbqrq zrffntr",
        },
        "LEAVE.bat": {
          type: "exe",
          content: "why do you have the urge to keep looking?",
          owner: "user",
          permissions: "rw",
          passkey_required: true,
          unlock_hint: "Reverse the binary to find the second key",
        },
        "pleasedont.exe": {
          type: "exe",
          content: "this is it?",
          owner: "user",
          permissions: "rw",
          passkey_required: true,
          unlock_hint: "Final forensics challenge - examine the metadata",
        },
        
        // Cryptography challenges
        crypto: {
          "cipher.txt": {
            type: "file",
            content: "Guvf vf n EBG13 rapelcgrq zrffntr. Qrpelcg vg gb svaq gur svefg cnffxrl!",
            owner: "user",
            permissions: "r",
          },
          "base64_secret.txt": {
            type: "file",
            content: "VGhpcyBpcyBhIGJhc2U2NCBlbmNvZGVkIG1lc3NhZ2U=",
            owner: "user",
            permissions: "r",
          },
          "rsa_public.pem": {
            type: "file",
            content: "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...\n-----END PUBLIC KEY-----",
            owner: "user",
            permissions: "r",
          },
          "encrypted_flag.txt": {
            type: "file",
            content: "U2FsdGVkX1+vupppZksvRf5pq5g5XjFRIipRkwB0K1Y=",
            owner: "user",
            permissions: "r",
          },
        },

        // Reverse engineering materials
        reversing: {
          "mystery_binary": {
            type: "exe",
            content: "ELF binary - use strings, objdump, or ghidra to analyze",
            owner: "user",
            permissions: "rx",
          },
          "packed_exe.exe": {
            type: "exe",
            content: "Packed Windows executable - try UPX unpacking",
            owner: "user",
            permissions: "rx",
          },
          "obfuscated.js": {
            type: "file",
            content: "eval(atob('dmFyIGZsYWcgPSAiQ1RGe3IzdmVyc2VfM25nMW5lZXIxbmdfbTRzdGVyfSI7'))",
            owner: "user",
            permissions: "r",
          },
        },

        // Web exploitation materials
        web: {
          "index.html": {
            type: "file",
            content: "<!DOCTYPE html><html><body><h1>CTF Web Challenge</h1><form action='/login' method='post'><input name='username'><input name='password' type='password'><button type='submit'>Login</button></form></body></html>",
            owner: "user",
            permissions: "r",
          },
          "app.js": {
            type: "file",
            content: "// Vulnerable web app with SQL injection in login form\napp.post('/login', (req, res) => { const query = `SELECT * FROM users WHERE username = '${req.body.username}' AND password = '${req.body.password}'`; });",
            owner: "user",
            permissions: "r",
          },
          "robots.txt": {
            type: "file",
            content: "User-agent: *\nDisallow: /admin\nDisallow: /secret_backup\nDisallow: /flag.txt",
            owner: "user",
            permissions: "r",
          },
          ".htaccess": {
            type: "file",
            content: "# Hidden flag: CTF{w3b_3xpl01t_m4st3r}\nRewriteEngine On",
            owner: "user",
            permissions: "r",
          },
        },

        // Forensics materials
        forensics: {
          "image.png": {
            type: "file",
            content: "PNG image with steganographically hidden data",
            owner: "user",
            permissions: "r",
            metadata: {
              exif: "Hidden message in EXIF data",
              lsb: "LSB steganography present",
            },
          },
          "memory_dump.raw": {
            type: "file",
            content: "Memory dump file - use Volatility for analysis",
            owner: "user",
            permissions: "r",
          },
          "network_capture.pcap": {
            type: "file",
            content: "Network packet capture - analyze with Wireshark",
            owner: "user",
            permissions: "r",
          },
          "deleted_file.txt": {
            type: "file",
            content: "This file was 'deleted' but contains the forensics passkey",
            owner: "user",
            permissions: "---",
            hidden: true,
          },
        },

        // Progress tracking
        ".progress": {
          type: "file",
          content: JSON.stringify({
            level1_unlocked: false,
            level2_unlocked: false,
            level3_unlocked: false,
            passkeys_found: [],
            challenges_completed: []
          }),
          owner: "user",
          permissions: "rw",
          hidden: true,
        },
      },
      
      // Additional user directories for different skill levels
      beginner: {
        "tutorial.txt": {
          type: "file",
          content: "Start here if you're new to CTFs! Look for hidden files and use basic tools.",
          owner: "user",
          permissions: "r",
        },
        "easy_cipher.txt": {
          type: "file",
          content: "URYYB JBEYQ - decode this simple cipher!",
          owner: "user",
          permissions: "r",
        },
      },
      
      advanced: {
        "kernel_exploit.c": {
          type: "file",
          content: "// Advanced kernel exploitation challenge\n#include <linux/module.h>",
          owner: "user",
          permissions: "r",
        },
        "custom_protocol.bin": {
          type: "file",
          content: "Binary file implementing custom network protocol",
          owner: "user",
          permissions: "r",
        },
      },
    },

    root: {
      secrets: {
        "key.txt": {
          type: "file",
          content: process.env.TOP_SECRET_KEY,
          owner: "root",
          permissions: "r",
        },
        "master_flag.txt": {
          type: "file",
          content: process.env.MASTER_FLAG || "CTF{m4st3r_0f_4ll_d0m41ns}",
          owner: "root",
          permissions: "r",
        },
        "root_exploit.sh": {
          type: "exe",
          content: "echo Root command executed",
          owner: "root",
          permissions: "rx",
        },
        "passkey_vault.json": {
          type: "file",
          content: JSON.stringify({
            level1: process.env.LEVEL1_PASSKEY || "crypto_master",
            level2: process.env.LEVEL2_PASSKEY || "reverse_engineer", 
            level3: process.env.LEVEL3_PASSKEY || "forensics_expert"
          }),
          owner: "root",
          permissions: "r",
        },
      },
      
      bin: {
        "safe_exec": {
          type: "exe",
          content: "echo Safe binary",
          owner: "root",
          permissions: "rx",
        },
        "privilege_escalation": {
          type: "exe",
          content: "// SUID binary with buffer overflow vulnerability",
          owner: "root",
          permissions: "rwxs",
        },
      },
      
      var: {
        log: {
          "access.log": {
            type: "file",
            content: "Web server access logs with hidden clues",
            owner: "root",
            permissions: "r",
          },
          "auth.log": {
            type: "file", 
            content: "Authentication attempts - look for failed logins",
            owner: "root",
            permissions: "r",
          },
        },
        www: {
          "hidden_admin.php": {
            type: "file",
            content: "<?php if($_GET['debug']) { system($_GET['cmd']); } ?>",
            owner: "root",
            permissions: "r",
          },
        },
      },
      
      _protected: true,
    },

    bin: {
      "ls": {
        type: "exe",
        content: "List directory contents",
        owner: "root", 
        permissions: "rx",
      },
      "cat": {
        type: "exe",
        content: "Display file contents",
        owner: "root",
        permissions: "rx", 
      },
      "strings": {
        type: "exe",
        content: "Extract strings from binary files",
        owner: "root",
        permissions: "rx",
      },
      "hexdump": {
        type: "exe",
        content: "Hexadecimal dump of files",
        owner: "root",
        permissions: "rx",
      },
    },

    etc: {
      "passwd": {
        type: "file",
        content: "root:x:0:0:root:/root:/bin/bash\nuser:x:1000:1000:CTF User:/home/user:/bin/bash",
        owner: "root",
        permissions: "r",
      },
      "shadow": {
        type: "file", 
        content: "root:$6$encrypted_hash:19000:0:99999:7:::\nuser:$6$another_hash:19000:0:99999:7:::",
        owner: "root",
        permissions: "---",
      },
      "hosts": {
        type: "file",
        content: "127.0.0.1 localhost\n127.0.0.1 ctf.local admin.ctf.local",
        owner: "root", 
        permissions: "r",
      },
    },

    tmp: {
      ".hidden_clue": {
        type: "file",
        content: "Temporary files sometimes contain valuable information!",
        owner: "user",
        permissions: "rw",
        hidden: true,
      },
    },

    proc: {
      "version": {
        type: "file",
        content: "Linux version 5.4.0-ctf (gcc version 9.4.0)",
        owner: "root",
        permissions: "r",
      },
      "cmdline": {
        type: "file", 
        content: "BOOT_IMAGE=/vmlinuz root=/dev/sda1 ctf_mode=enabled",
        owner: "root",
        permissions: "r",
      },
    },
  },
};