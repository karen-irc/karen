# Type Defenitions for TypeScript

This directory contains type defenition files for TypeScript.
A similar directory usualally is known as `/typings/` in other projects.
But we seem it's naming is ugly so named it as _**T**ype**S**cript's type **D**efenitions_.

- `third_party/`: third party `d.ts` files which installed by `tsd`. **DO NOT EDIT BY HAND**.
- _others_: other `d.ts` files which are our defined or customized.


## Notices

- Don't import type defenitions from `./third_party/tsd.d.ts`.
  - It fogs up what defenitions we're importing.
  - Should import from each `d.ts` files explicitly.
- Commit `d.ts` files under `./third_party/tsd.d.ts` if you install/update them.
  - Travis CI is failed with very high frequency because `tsd reinstall` will be limitted by
    Github's API limitations. So we avoid it by to manage `d.ts` files under git's controll.
