<div align="center">
  <img src="https://assets.filmseats.com/osp-logo.png" alt="CodeArmor Logo" width="766" height="196">

  <p>
    <a href="https://www.codearmor.io"><b>Check out our website</b></a> • 
    <a href="https://marketplace.visualstudio.com/items?itemName=CodeArmor.codearmor"><b>Download on VSCode Marketplace</b></a>
  </p>
</div>

---

<p align="center">
  <b>Release:</b> 1.0.0 • 
  <b>Contributions:</b> Welcome
</p>

---

# CodeArmor

**CodeArmor** is a **Visual Studio extension** that helps developers detect and fix security vulnerabilities directly in their IDE.

It parses code for common weaknesses such as **hard-coded secrets, unsafe input, insecure patterns**, and provides **actionable fixes with links to trusted resources**.  
The extension empowers developers to write secure code safely and efficiently with minimal performance impact.

---

## Current Scope (v1.0.0)

- **AWS Lambda focus**: Scans handler-level code paths where security risks are most impactful (input validation, IAM permissions, secret handling).
- **Low-noise approach**: Minimized false positives, maximizing developer trust and everyday usability.
- **Security Rules**:
  - Injection Prevention: Detects unsafe eval(), script injection, and unsanitized DOM APIs
  - Deserialization Safety: Flags unsafe JSON.parse(), prototype pollution, untrusted object creation
  - Secrets Management: Detects hardcoded credentials, API keys, tokens
  - Input Validation: Highlights unsanitized user input (XSS, SQL injection risks)
  - IAM Permissions: Surfaces overly permissive policies and risky role usage

---

## Key Features

- **Seamless Integration** — Works directly in Visual Studio
- **Rule-Based Analysis** — Focused on AWS Lambda handler logic (secrets detection, IAM rules, unsafe input, injection, deserialization, etc.)
- **Low-Noise Scanning** — Precision-focused to reduce false positives
- **Actionable Guidance** — Secure coding suggestions with resource links
- **Lightweight & Fast** — Runs in real-time without slowing your IDE

---

## Quickstart

### Prerequisites

- Install [Node.js](https://nodejs.org/)

### Installation

- Install CodeArmor from [Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=CodeArmor.codearmor) or load locally

- Run: Open project in Visual Studio → Run and Debug sidebar → select Launch Extension (green arrow)

- Debug: Set breakpoints, view logs in Debug Console, stop by closing the launched instance

---

## Future Work

- Planned support expansion beyond AWS Lambda to broader Node.js and TypeScript projects.

- Contributing: Please refer to our Contributing Guide.

| Name            | GitHub                                    |
| --------------- | ----------------------------------------- |
| Thin Thin Khine | [GitHub](https://github.com/Thinthin77)   |
| Kevin Wu        | [GitHub](https://github.com/KevinWuD)     |
| Peter Tan-Gatue | [GitHub](https://github.com/Ptangatue)    |
| Michal Marrow   | [GitHub](https://github.com/MichalMarrow) |
