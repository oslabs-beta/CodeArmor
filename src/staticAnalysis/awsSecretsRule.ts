/**
 * Checks if a given string value contains a hardcoded AWS Secret Access Key.
 * AWS secrets are typically 40 characters long and base64-like.
 *
 * Example match: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY'
 */

export function applyAwsSecretsRule(value: string): string | null {
    // Regex for a 40-character base64-style string (common pattern for AWS secret keys)
    const awsSecretKeyPattern = /(?<![A-Z0-9])[A-Za-z0-9\/+=]{40}(?![A-Z0-9])/;
    
    // .test() is built-in Regex method to check if string matches pattern
    if (awsSecretKeyPattern.test(value)) {
      return 'Hardcoded AWS secret key detected. Move secrets to environment variables or a secure secrets manager.';
    }
  
    return null; // Safe string
  }
  