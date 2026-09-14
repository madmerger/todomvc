# TodoMVC

このリポジトリには TodoMVC の実装が 2 つ含まれています。いずれも[アプリ仕様書](app-spec.md)に準拠しています。

- [Vanilla JavaScript ES6 版](examples/javascript-es6/)（Webpack、ポート 7002）
- [React 版](examples/react/)（React 18 + TypeScript + Vite、ポート 7003）

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

依存パッケージをインストールし、開発サーバー（http://localhost:7003）を起動します。

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
