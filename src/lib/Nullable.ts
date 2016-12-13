/**
 *  # Nullable mod.
 *
 *  This module defines some type alias for "nullable" types, `T | undefined`,
 *  `T | null`, and `T | undefined | null`.
 *
 *
 *  ## `undefined`
 *
 *
 *  ### In ECMA262
 *
 *  [By ECMA 262 spec (7th/2016 edit.)](ecma262), `undefined` value means the following:
 *
 *  > __4.3.10 undefined value__
 *  > primitive value used when a variable has not been assigned a value
 *  >
 *  > __4.3.11 Undefined type__
 *  > type whose sole value is the __undefined__ value
 *
 *
 *  ### In WebIDL (DOM)
 *
 *  [By Web IDL spec (W3C Editor’s Draft 23 June 2016)][webidl],
 *  `undefined` is treated as the following or others (there are many descrptions in the spec):
 *
 *
 *  > __4.2.2. void__
 *  >
 *  > The only place that the void type may appear in IDL is as the return type of an operation.
 *  > Functions on platform objects that implement an operation
 *  > whose IDL specifies a void return type MUST return the __undefined__ value.
 *  >
 *  > ECMAScript functions that implement an operation
 *  > whose IDL specifies a void return type MAY return any value, which will be discarded.
 *  >
 *  > https://heycam.github.io/webidl/#es-void
 *
 *
 *  > __4.2.24. Nullable types — T?__
 *  >
 *  > 2\. Otherwise, if V is __null__ or __undefined__, then return the IDL nullable type T? value __null__.
 *  >
 *  > https://heycam.github.io/webidl/#es-nullable-type
 *
 *
 *
 *  ### For optional arguments
 *
 *  If you don't pass the 2nd argument when you calling the following `a()`,
 *  then `y` should be `undefined`.
 *
 *  ```
 *  function a(x, y) {
 *      // ...
 *  }
 *
 *  a(x); // `y` is `undefined`.
 *  ```
 *
 *
 *  ## `null`
 *
 *  ### In ECMA262.
 *
 *  [By ECMA 262 spec (7th/2016 edit.)](ecma262), `null` value means the following.
 *
 *  > __4.3.12 null value__
 *  > primitive value that represents the intentional absence of any object value
 *  >
 *  > __4.3.13 Null type__
 *  > type whose sole value is the __null_ value
 *
 *
 *  ### In WebIDL (DOM)
 *
 *  And [by Web IDL spec (W3C Editor’s Draft 23 June 2016)][webidl],
 *  there is a 'nullable type' it is mapped to `null` value in ECMAScript.
 *
 *  > __3.10.23. Nullable types — T?__
 *  > A *__nullable type__* is an IDL type constructed from an existing type (called the inner type),
 *  > which just allows the additional value null to be a member of its set of values.
 *  >
 *  > https://heycam.github.io/webidl/#idl-nullable-type
 *
 *
 *  > __4.2.24. Nullable types — T?__
 *  > IDL nullable type values are represented by values of either the ECMAScript type
 *  > corresponding to the inner IDL type, or the ECMAScript __null__ value.
 *  >
 *  > https://heycam.github.io/webidl/#es-nullable-type
 *
 *
 *
 *  ## Nullability in some static typing extensions for JavaScript
 *
 *  In this section, we see these static typing extensions:
 *
 *  - [TypeScript][typescript]
 *  - [Flowtype][flowtype]
 *  - [JSDoc based type annotations for Google Closure Compiler][closure-compiler]
 *
 *
 *  ### TypeScript
 *
 *  - TypeScript represents an "optional" arguments and member of an interface with using `x?: number` syntax.
 *    This is evaluated as `x has type (number | undefined)` in their type system.
 *  - After TypeScript 2.0 with `--strictNullCheck` option,
 *    typescript compiler (tsc) detects the difference between `undefined` and `null`.
 *
 *
 *  ### Flowtype
 *
 *  - Flowtype also represents an "optional" arguments `x?: number` syntax.
 *    - This is evaluated as `x has type (number | undefined)` in their type system.
 *  - By their document "[Maybe types and syntax for it like `?T`](https://flowtype.org/docs/nullable-types.html)",
 *    they also treats it as `T | null` but they recommends to use `x == null` instead of `x === null`
 *    because the later one requires `x === undefined` to avoid a crash.
 *
 *
 *  ### Google Closure Compiler
 *
 *  - Google Closure Compiler can express `undefined` or `null` separetely.
 *  - They have "Nullable type `{?T}`".
 *    - This means the value type is "T or `null`".
 *  - They also have "Non-nullable type `{!T}`".
 *    - This means `T, but never the `null` value`.
 *    - By their document: "Functions and all value types (`boolean`, `number`, and `string`)
 *      are non-nullable by default
 *      whether or not they are declared with the Non-nullable operator.
 *      To make a value or function type nullable, use the Nullable operator".
 *  - They have "Optional argument in a function type `{function(T=)}`".
 *    - By the document, there is not more details, but this means "T or `undefined`".
 *
 *
 *
 *  [ecma262]: http://www.ecma-international.org/ecma-262/7.0/
 *  [webidl]: https://heycam.github.io/webidl/
 *  [typescript]: https://github.com/Microsoft/TypeScript
 *  [flowtype]: https://github.com/facebook/flow
 *  [closure-compiler]: https://developers.google.com/closure/compiler/docs/js-for-compiler
 */
/**
 *  This type represents the type which is `undefined` or not.
 *
 *  usecases:
 *
 *  - To intent the value which might be "optional" or "undefined".
 */
export type Optional<T> = T | undefined;

/**
 *  This type represents the type which is `null` or not.
 *
 *  usecases:
 *
 *  - To intent the value which might be absence of the result.
 *      - For this purpose, you can use [`option-t`][option-t]
 *        to treat a value with some monadic convinient way.
 *  - The wrapper of calling a DOM operations.
 *
 *  [option-t]: https://github.com/saneyuki/option-t.js
 */
export type Nullable<T> = T | null;

/**
 *  This type represents the type which is widely 'nullable' in JavaScript worlds.
 *
 *  usecases:
 *
 *  - To represent a type mapped to JSON APIs
 *      - Some JSON encoder in other languages don't treat `undefined` / `null` seperately.
 *        Thus you should use this if you don't have any concrete protocols
 *        for JSON APIs.
 *      - But `JSON.stringify()` sperates `undefined` / `null`.
 *        If you pass `{ a: null, }` to it, the result is `{ "a": null }`.
 *        But if you pass `{ a: undefined }` to it, the result is `{}`.
 */
export type Maybe<T> = T | undefined | null;

export function isUndefined<T>(v: Optional<T>): v is undefined {
    return v === undefined;
}
export function isNotUndefined<T>(v: Optional<T>): v is T {
    return v !== undefined;
}

export function isNotNull<T>(v: Nullable<T>): v is null {
    return v !== null;
}
export function isNull<T>(v: Nullable<T>): v is null {
    return v === null;
}

export function isSomeValue<T>(v: Maybe<T>): v is T {
    return isNotUndefined(v) && isNotNull(v);
}
export function isNoneValue<T>(v: Maybe<T>): v is (undefined | null) {
    return isUndefined(v) || isNull(v);
}
