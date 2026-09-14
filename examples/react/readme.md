# TodoMVC: React + TypeScript + Vite

## 概要

React でモダンに実装した TodoMVC です。[アプリ仕様書](../../app-spec.md)に準拠し、既存の Vanilla JavaScript ES6 実装（`examples/javascript-es6`）と同じ見た目・挙動になるようにしています。

[React](https://react.dev/) は宣言的に UI を構築するための JavaScript ライブラリーです。ビルドには高速な開発サーバーと本番バンドルを提供する [Vite](https://vitejs.dev/) を、型安全のために [TypeScript](https://www.typescriptlang.org/) を使用しています。

## 実装の詳細

- 状態管理は React の hooks のみで完結しています。todo の一覧は `useReducer`（`src/todoReducer.ts`）、編集中の項目は `useState`、永続化とハッシュ変更の購読は `useEffect` で扱います。
- コンポーネントは `TodoApp`、`Header`、`TodoList`、`TodoItem`、`TodoFooter` に分割しています（`src/components/`）。
- 永続化は localStorage を使用し、キーは `todos-react`、各項目は `id`、`title`、`completed` を持ちます。編集状態は永続化しません。
- ルーティングはハッシュルート `#/`、`#/active`、`#/completed` です（`src/useHashFilter.ts`）。リロード後もフィルターは維持されます。
- キーコードは `src/constants.ts` の `ENTER_KEY`、`ESCAPE_KEY` を使用します。
- スタイルは `todomvc-app-css` と `todomvc-common` をそのまま利用しています。

## 必要環境

```
* Node (min version: 18.13.0)
* NPM (min version: 8.19.3)
```

## ローカルでの実行

開発サーバー（http://localhost:7003）:

```sh
$ npm install
$ npm run dev
```

ビルドして静的配信（http://localhost:7003）:

```sh
$ npm install
$ npm run build
$ npm run serve
```

ポートは Vanilla JS ES6 版（7002）と衝突しないよう 7003 を使用しています。
