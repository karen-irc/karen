// XXX: hack TypeScript module resolution to load d.ts which has legacy default export
// To avoid it, we can also use `allowSyntheticDefaultImports` compiler option,
// But we would not like to use at this moment. So we do this hack.
// See also `./crossroads.d.ts` in the same directory.
import CrossroadsJs = require('crossroads'); // tslint:disable-line:no-require-imports
declare const crossroads: typeof CrossroadsJs;
export default crossroads; // tslint:disable-line:no-default-export
