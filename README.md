# CodeArmor 🛡️

**CodeArmor** is a Visual Studio extension that helps developers detect and address security vulnerabilities before they become real threats.  
It parses code for common weaknesses such as **hard-coded secrets**, **insecure patterns**, and **risky configurations**, then provides actionable feedback with direct links to trusted security resources.

By integrating seamlessly into Visual Studio, CodeArmor empowers developers to write more secure code without leaving their IDE.

---

## Features

- 🔍 **Automated Security Parsing**  
  Scans your code for vulnerabilities such as:
  - Hard-coded API keys, passwords, and secrets  
  - Insecure coding practices and patterns  
  - Potential misconfigurations  

- 🖊️ **Inline Code Underlining**  
  Problematic code is automatically underlined for quick visibility.

- 💡 **Smart Hover Popups**  
  Hovering over flagged code shows:
  - The specific issue detected  
  - Helpful remediation advice  
  - A trusted link to learn more (e.g., OWASP, Microsoft Docs)

- ▶️ **Command Bar Integration**  
  A toolbar with controls to:
  - Run scans  
  - Pause parsing  
  - Restart analysis  

- ⚡ **Lightweight & Non-Intrusive**  
  Runs locally, never executes your code, and minimizes workflow impact.

---

## Example Screenshot

![CodeArmor Screenshot](path-to-screenshot.png)

---

## Requirements

- Visual Studio 2022 or later  
- Windows 10 or later  

Install dependencies with:

```bash
npm install
