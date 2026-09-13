# TodoMVC Browser Tests

A single Cypress spec runs the official TodoMVC behavioural tests
(add / edit / toggle / route / persist) against the example app in
`examples/`. The spec is parameterised over the example name, so it
can be reused for any implementation that follows the
[app spec](../app-spec.md).

## Running

```sh
$ npm run test:all
```

Run a single example:

```sh
$ npm run server &
$ npx cypress run --env framework=javascript-es6
```

To iterate interactively:

```sh
$ npm run server &
$ npm run cy:open
```

then enter the framework via
`CYPRESS_framework=javascript-es6 npm run cy:open`.

## How it works

- `tests/server.js` serves the repo root on `http://localhost:8000`.
- `cypress.config.js` sets `baseUrl` to `http://localhost:8000/examples/`.
- `cypress/e2e/spec.cy.js` is the spec, parameterised by
  `Cypress.env('framework')`.
- The spec's `frameworkFolders` map points apps that build to `dist/`
  at their built output. Build the app first (`npm run build` inside
  the example) before running — the static server only serves what's
  on disk.
- `tests/cya.js` runs cypress sequentially for every app in
  `examples/` and prints a summary table.
- `tests/knownIssues.js` lists `<framework>, <test name>` patterns
  that are auto-skipped per framework. Useful for "we know this one's
  broken; don't gate CI on it."
