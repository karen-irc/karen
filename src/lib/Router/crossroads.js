// XXX: hack TypeScript module resolution to load d.ts which has legacy default export
// To avoid it, we can also use `allowSyntheticDefaultImports` compiler option,
// But we would not like to use at this moment. So we do this hack.
// See also `./crossroads.js` in the same directory.
import crossroads from 'crossroads';
export default crossroads;
