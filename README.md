<div>
  <img src="assets/osp-logo.png" alt="My Project Logo" height="250", width="500">
</div>


Secure your code, prevent vulnerabilities, and write with confidence

License: MIT | Release: 1.0.0 | Contributions: Welcome

About

CodeArmor is a Visual Studio extension that helps developers detect and fix security vulnerabilities directly in their IDE. It parses code for weaknesses like hard-coded secrets, unsafe input, and insecure patterns. The extension provides actionable fixes and links to trusted resources, empowering developers to write secure code safely and efficiently with minimal performance impact.

Current Scope (v1.0.0)

CodeArmor is currently focused on AWS Lambda functions. Scanning is limited to handler-level code paths where security risks are most impactful (e.g., input validation, IAM permissions, and secret handling). This low-noise approach minimizes false positives and maximizes trust, making the tool practical for everyday use in the IDE while supporting high developer adoption.

Key Features

CodeArmor offers several key advantages for secure development:

Seamless Integration – Works directly within Visual Studio

Rule-Based Analysis – Focused on AWS Lambda handler logic: secrets detection, IAM rules, unsafe input, injection, deserialization, and more

Low-Noise Scanning – Prioritizes precision over breadth to prevent alert fatigue and ensure developer trust

Actionable Guidance – Provides explanations and secure coding suggestions with resource links

Lightweight & Fast – Runs in real time as you code, without slowing down your IDE

Quickstart
Prerequisites

Ensure you have Node.js installed, then install dependencies:

npm install

Installation

Install CodeArmor from the Visual Studio Marketplace, or load it locally for development.

Running the Extension

Open the project in Visual Studio

Navigate to the Run and Debug sidebar

Select Launch Extension (green arrow at the top)

A new instance of Visual Studio will open with CodeArmor loaded for testing

Debugging Notes

Set breakpoints in your extension code; they will trigger in the launched instance

View logs in the Debug Console

Stop debugging by closing the launched instance and stopping the debug session

Security Rules

CodeArmor analyzes code across key categories:

Injection Prevention – Detects unsafe eval(), dynamic script injection, unsanitized DOM APIs, and related injection vectors

Deserialization Safety – Catches unsafe JSON.parse(), prototype pollution, object merging, and untrusted object creation

Secrets Management – Flags hardcoded credentials, API keys, tokens, and other sensitive values

Input Validation – Highlights unvalidated or unsanitized user input that could lead to XSS or SQL injection

IAM Permissions – Surfaces overly permissive policy strings and dangerous role usage

Configuration Hardening – Identifies insecure defaults, weak CORS settings, and risky deployment configurations

Future Work

Future iterations may broaden support beyond Lambda-specific contexts to cover general Node.js and TypeScript projects, further extending CodeArmor’s security coverage.

Contributing

We welcome contributions to CodeArmor! Please see our Contributing Guide
 for details on how to get started.

License

MIT License