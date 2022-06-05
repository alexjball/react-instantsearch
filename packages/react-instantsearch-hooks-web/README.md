# react-instantsearch-hooks-web

This fork exposes the UI components and state hooks used to implement the top-level library components. By lifting up the state hook, you can re-mount the UI without losing state, which is useful for responsive behaviors.

To build and publish:

```sh
# From root, build all packages for type resolution
yarn lerna run build

# From package
npm publish --access public
```
