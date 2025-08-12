import * as vscode from 'vscode';

export function noCodeInjectionRule(
    code: string,
    document: vscode.TextDocument
): vscode.Diagnostic[] {
    const diagnostics: vscode.Diagnostic[] = [];
    
    // Dangerous patterns to detect
    const injectionPatterns = [
        {
            pattern: /(setTimeout|setInterval)\([^)]*[^'"]\s*[),]/g,
            message: "Dynamic code execution in timer functions"
        },
        {
            pattern: /\.(innerHTML|outerHTML)\s*=\s*[^'"]/g,
            message: "Unsanitized HTML assignment"
        },
        {
            pattern: /new\s+(ActiveXObject|Script|WScript|Shell)/gi,
            message: "Dangerous COM/ActiveX object creation"
        },
        {
            pattern: /Function\.constructor\(/g,
            message: "Function constructor usage (similar to new Function)"
        },
        {
            pattern: /\.(execScript|evalScript)\s*\(/gi,
            message: "Legacy script execution method"
        }
    ];

    injectionPatterns.forEach(({ pattern, message }) => {
        let match: RegExpExecArray | null;
        while ((match = pattern.exec(code)) !== null) {
            const startPos = document.positionAt(match.index);
            const endPos = document.positionAt(match.index + match[0].length);
            
            diagnostics.push(new vscode.Diagnostic(
                new vscode.Range(startPos, endPos),
                `Code Injection Risk: ${message}`,
                vscode.DiagnosticSeverity.Warning
            ));

            // Avoid infinite loops for zero-length matches
            if (match.index === pattern.lastIndex) {
                pattern.lastIndex++;
            }
        }
    });

    return diagnostics;
}