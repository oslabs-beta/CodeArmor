// IamRule

// import AST node Object literal with the type:ObjectExpression
import { ObjectExpression } from '@babel/types';

// define and export the function for this Iam Rule, first argument is the AST node
// returns either a string (the warning) or null if code is secure
export function applyIamWildcardRule(node: ObjectExpression): string | null {

// initialize variables that will track if Action: "*" and Resource: "*" is in the object
    let hasWildcardAction = false;
    let hasWildcardResource = false;

    // iterate over all the properties of the object literal
    for (const prop of node.properties) {

        // determine if the prop is a standard key-value object property 
        // with identifier and string literal 
        if (
            prop.type === 'ObjectProperty' &&
            prop.key.type === 'Identifier' &&
            prop.value.type === 'StringLiteral'
          ) {

            // extract and declare key and value of prop 
            const keyName = prop.key.name;
            const value = prop.value.value;


            // check each key value pair for wildcard * and reassign variable if true
            if (keyName === 'Action' && value === '*') {
                hasWildcardAction = true;
              }
        
              if (keyName === 'Resource' && value === '*') {
                hasWildcardResource = true;
              }

            }
    }

    // if both wildcards are found, return string message to diagnostic
    if (hasWildcardAction && hasWildcardResource) {
        return 'Overly permissive IAM policy: both "Action" and "Resource" are set to "*". This can grant unrestricted access to AWS resources.';
    }


    // if no wildcards, return null with no diagnostic message
    return null;  

}