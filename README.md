CodeArmor README

CodeArmor is a Visual Studio extension designed to help developers detect and address security vulnerabilities in their code before they become real threats. It parses code for common weaknesses such as hard-coded secrets, insecure patterns, and risky configurations, then provides actionable feedback with direct links to trusted security resources.

By integrating seamlessly into Visual Studio’s workflow, CodeArmor empowers developers to write more secure code without leaving their IDE.

Features

🔍 Automated Security Parsing
Scans your code for common vulnerabilities, including:

Hard-coded API keys, passwords, and secrets

Insecure coding practices and patterns

Potential misconfigurations that could lead to security risks

🖊️ Inline Code Underlining
Problematic code is automatically underlined for quick visibility.

💡 Smart Hover Popups
Hovering over flagged code shows a tooltip with:

The specific issue detected

Helpful remediation advice

A trusted link to learn more (e.g., OWASP, Microsoft docs)

▶️ Command Bar Integration
Once launched from the Run/Debug tab, a command bar appears at the top-center of Visual Studio with controls to:

Run scans

Pause parsing

Restart analysis

⚡ Lightweight and Non-Intrusive
Runs locally, does not execute your code, and is designed to have minimal impact on your workflow.

Example Screenshot:


Requirements

Visual Studio 2022 or later

Windows 10 or later

Install dependencies by running:

npm install


This will download and configure all necessary packages for the extension.

Extension Settings

CodeArmor contributes the following settings:

codearmor.enable: Enable/disable CodeArmor scanning.

codearmor.severityLevel: Configure the minimum severity of issues to display (low, medium, high).

codearmor.autoScan: Enable or disable automatic scanning when files are saved.

Known Issues

Initial parsing may take slightly longer on very large codebases.

Currently supports TypeScript and JavaScript; more languages will be added in future releases.

Release Notes
1.0.0

Initial release of CodeArmor.

Supports scanning TypeScript and JavaScript projects.

Highlights vulnerabilities such as hard-coded secrets with inline underlining.

Provides hover popups with remediation guidance and links to trusted sources.

Includes run/pause/restart controls in the command bar.

Following Extension Guidelines

This extension follows the official Visual Studio extension best practices:

Extension Guidelines

For More Information

Visual Studio Code’s Markdown Support

Markdown Syntax Reference

Stay secure with CodeArmor! 🛡️