# Lift Off CTF

A space-themed Capture The Flag challenge featuring web exploitation, cryptography, and digital forensics.

## Overview

Liftoff is an immersive cybersecurity challenge set aboard the spacecraft "unHackable" in the year 2387. Players investigate mysterious quantum interference patterns affecting the ship's systems while uncovering security vulnerabilities and solving progressively challenging puzzles.

## Story

Mission Control has detected unusual energy signatures and quantum interference patterns affecting the unHackable spacecraft. As players explore the ship's systems, they'll discover communications between crew members, analyze logs, and ultimately confront an AI anomaly that's been probing the ship's defenses.

### Key Characters

- **Captain Martinez** - Ship commander monitoring security breaches
- **Security Officer NovaThorne** - Discovers IDOR vulnerabilities in crew databases
- **Engineer Chen** - Reports quantum fluctuations in the main computer core
- **Mission Control** - Coordinates response to the anomaly

## Challenge Categories

### Web Exploitation
- **IDOR (Insecure Direct Object Reference)** - Sequential database queries to access unauthorized crew data
- **SQL Injection** - Vulnerable admin panel with weak input validation
- **Authentication Bypass** - Exploit default credentials and parameter manipulation

### Cryptography
- **ROT13** - Classic rotation cipher
- **Base64** - Encoding/decoding challenges
- **Caesar Cipher** - Letter substitution with various shift values
- **Substitution Ciphers** - Custom alphabet mappings

### Binary & Forensics
- **Bit Operations** - Bit shifting and arithmetic operations
- **ASCII Conversion** - Binary to text translation
- **Hexadecimal Analysis** - Signal processing and hex-to-text conversion
- **Source Code Analysis** - Hidden clues in HTML/JavaScript

### Reconnaissance
- **robots.txt Discovery** - Finding hidden endpoints
- **Developer Tools** - Inspecting network requests and page source
- **Log Analysis** - Examining ship communication logs

## Learning Objectives

This CTF is designed to teach:

- Web application security fundamentals
- Common vulnerability identification and exploitation
- Cryptographic analysis techniques
- Binary data manipulation
- Digital forensics methodology
- Security reconnaissance practices

## Difficulty Level

**Beginner to Intermediate** - Challenges progress from basic web exploitation through advanced cryptographic and forensic analysis, making it suitable for learners at various skill levels.

## Technical Requirements

- Modern web browser with Developer Tools
- Basic command-line familiarity
- Optional: Python/JavaScript for automation
- Optional: Burp Suite or similar proxy tools

## Recommended Tools

- Browser Developer Console
- Base64 decoder
- ROT13 decoder
- Binary/Hex converters
- CyberChef (for multi-stage decoding)
- SQL injection testing tools

## License

All rights reserved. This project and its contents are proprietary and may not be reproduced, distributed, or used without explicit permission.


## Acknowledgments

Special thanks to all participants of the September 26th preview event and the cybersecurity community for their continued support.
