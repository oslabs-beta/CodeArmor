// src/rules/noSqlInjection.ts
import * as vscode from 'vscode';

export function sqlInjectionRule(
    code: string,
    document: vscode.TextDocument
): vscode.Diagnostic[] {
    const diagnostics: vscode.Diagnostic[] = [];
    
    const sqlInjectionPatterns = [
        // String concatenation with variables immediately after SQL keywords
        {
            pattern: /(SELECT|INSERT|UPDATE|DELETE|FROM|WHERE|VALUES|SET)\s+[^;]{0,100}?\+\s*[a-zA-Z_$][\w$]*/gi,
            message: "String concatenation in SQL query can lead to SQL injection",
            severity: vscode.DiagnosticSeverity.Error
        },
        // Template literal with variable interpolation near SQL keywords
        {
            pattern: /(SELECT|INSERT|UPDATE|DELETE|FROM|WHERE|VALUES|SET)\s+[^`]{0,50}?\$\{[^}]+\}[^`]{0,50}?/gi,
            message: "Variable interpolation in SQL template literal can lead to SQL injection",
            severity: vscode.DiagnosticSeverity.Error
        },
        // Variable inside single quotes (SQL string context)
        {
            pattern: /['"]\s*\+\s*[a-zA-Z_$][\w$]*\s*\+\s*['"]/g,
            message: "Variable concatenation inside SQL quotes can lead to SQL injection",
            severity: vscode.DiagnosticSeverity.Error
        },
        // Query methods with concatenated strings (more specific)
        {
            pattern: /\.(query|execute|run)\(\s*[^?][^,]{0,50}?\+\s*[a-zA-Z_$][\w$]*[^)]*\)/gi,
            message: "Query method with string concatenation can lead to SQL injection",
            severity: vscode.DiagnosticSeverity.Error
        }
    ];

    // Safe patterns to exclude (parameterized queries) shouldn't flag false positive
    const safePatterns = [
        /\?/, // question mark placeholders
        /\$[0-9]/, // $1, $2 placeholders
        /:[a-zA-Z_][a-zA-Z0-9_]*/, // named parameters
        /knex\(|sequelize\(|\.where\(|\.find\(/ // ORM safe methods
    ];

    for (const { pattern, message, severity } of sqlInjectionPatterns) {
        let match: RegExpExecArray | null;
        pattern.lastIndex = 0;
        
        while ((match = pattern.exec(code)) !== null) {
            const matchText = match[0];
            
            // Skip if this is a safe pattern (parameterized query)
            const isSafe = safePatterns.some(safePattern => 
                safePattern.test(matchText) || 
                safePattern.test(code.substring(match!.index - 20, match!.index + 50))
            );

            if (!isSafe) {
                try {
                    const start = match.index;
                    const end = start + match[0].length;
                    const range = new vscode.Range(
                        document.positionAt(start),
                        document.positionAt(end)
                    );

                    const diagnostic = new vscode.Diagnostic(
                        range,
                        `[SECURITY] ${message} - Found: "${matchText.substring(0, 40)}${matchText.length > 40 ? '...' : ''}"`,
                        severity
                    );
                    diagnostic.source = 'CodeArmor';
                    diagnostics.push(diagnostic);
                } catch (err) {
                    console.error(`Error processing SQL injection match: ${err}`);
                }
            }

            if (match.index === pattern.lastIndex) {
                pattern.lastIndex++;
            }
        }
    }

    return diagnostics;
}