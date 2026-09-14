# TodoMVC

このリポジトリには TodoMVC の Vanilla JavaScript ES6 実装（`examples/javascript-es6`）と React 実装（`examples/react`）が含まれています。いずれも[アプリ仕様書](app-spec.md)に準拠しています。

## Vanilla JavaScript ES6 版の実行方法

依存パッケージをインストールし、開発サーバーを起動します。

```sh
$ cd examples/javascript-es6
$ npm install
$ npm run dev
```

または、アプリをビルドして http://localhost:7002 で配信します。

```sh
$ cd examples/javascript-es6
$ npm install
$ npm run build
$ npm run serve
```

## React 版の実行方法

Vite + React + TypeScript の実装です。詳細は [examples/react/readme.md](examples/react/readme.md) を参照してください。

```sh
$ cd examples/react
$ npm install
$ npm run dev
```

または、アプリをビルドして http://localhost:7003 で配信します。

```sh
$ cd examples/react
$ npm install
$ npm run build
$ npm run serve
```
