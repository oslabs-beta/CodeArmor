<div>
  <img src="assets/osp-logo.png" alt="My Project Logo" height="250", width="500">
</div>


License: MIT | Release: 1.0.0 | Contributions: Welcome

About

CodeArmor is a Visual Studio extension that helps developers detect and fix security vulnerabilities directly in their IDE. It parses code for common weaknesses such as hard-coded secrets, unsafe input, and insecure patterns, then provides actionable fixes with links to trusted resources. The extension empowers developers to write secure code safely and efficiently with minimal performance impact.

Current Scope (v1.0.0)

Focused on AWS Lambda functions. Scans handler-level code paths where security risks are most impactful (input validation, IAM permissions, secret handling). This low-noise approach minimizes false positives and maximizes trust, making CodeArmor practical for everyday IDE use.

Key Features

  Seamless Integration: Works directly in Visual Studio

  Rule-Based Analysis: Focused on AWS Lambda handler logic (secrets detection, IAM rules, unsafe input, injection, deserialization, and more)

  Low-Noise Scanning: Precision-focused to minimize false positives

  Actionable Guidance: Secure coding suggestions with resource links

  Lightweight & Fast: Runs in real time without slowing your IDE

Quickstart

  Prerequisites: Install Node.js → npm install

  Installation: Install CodeArmor from Visual Studio Marketplace or load locally

  Run: Open project in Visual Studio → Run and Debug sidebar → select Launch Extension (green arrow)

  Debug: Set breakpoints, view logs in Debug Console, stop by closing the launched instance

Security Rules

  Injection Prevention: Detects unsafe eval(), script injection, and unsanitized DOM APIs

  Deserialization Safety: Flags unsafe JSON.parse(), prototype pollution, untrusted object creation

  Secrets Management: Detects hardcoded credentials, API keys, tokens

  Input Validation: Highlights unsanitized user input (XSS, SQL injection risks)

  IAM Permissions: Surfaces overly permissive policies and risky role usage

  Configuration Hardening: Identifies insecure defaults, weak CORS, and risky configs

Future Work

  Planned support expansion beyond AWS Lambda to broader Node.js and TypeScript projects.

Contributing & License

  Contributing: Please refer to our Contributing Guide.

License: MIT License

| Name            | GitHub      |
| --------------- | ----------- |
| Thin Thin Khine | [GitHub](https://github.com/Thinthin77) |
| Kevin Wu        | [GitHub](https://github.com/KevinWuD) |
| Peter Tan-Gatue | [GitHub](https://github.com/Ptangatue) |
| Michal Marrow   | [GitHub](https://github.com/MichalMarrow) |
