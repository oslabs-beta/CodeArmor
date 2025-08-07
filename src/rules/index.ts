//Exports all your rules in one object/array
// so runRules.ts can easily apply them.

import { noSecretsRule } from './nonHardCodedSecrets';

export const allRules = [noSecretsRule];
