# TodoMVC: React + TypeScript + Vite

## フレームワークの概要

[React](https://react.dev/) は宣言的に UI を構築するための JavaScript ライブラリーです。状態 (state) が変化すると、React が必要な部分だけを再描画します。この実装では React 18 の関数コンポーネントと Hooks (`useState` / `useEffect` / `useReducer` / `useRef`) のみを使用しています。

ビルドには [Vite](https://vitejs.dev/) を利用しています。Vite は開発時にネイティブ ES Modules を使った高速な開発サーバーを提供し、本番ビルドでは Rollup による最適化済みの静的ファイルを生成します。型付けには TypeScript を使用しています。

## 実装の概要

状態管理と表示を分離した構成になっています。

```
index.html
src/
├── main.tsx              エントリーポイント（CSS の読み込みとマウント）
├── App.tsx               アプリ全体のレイアウトと状態の配線
├── types.ts              Todo / Filter 型
├── components/
│   ├── TodoInput.tsx     新規タスク入力欄
│   ├── TodoList.tsx      タスク一覧
│   ├── TodoItem.tsx      1 件のタスク（完了・編集・削除）
│   └── TodoFooter.tsx    残件カウンター・フィルター・完了タスク削除
├── hooks/
│   ├── useTodos.ts       useReducer + localStorage への永続化
│   └── useHashFilter.ts  ハッシュルーティング（#/, #/active, #/completed）
└── lib/
    ├── todoReducer.ts    todos の更新ロジック（純粋関数）
    └── storage.ts        localStorage の読み書き（キー: todos-react）
```

- todos の更新はすべて `todoReducer` に集約した純粋関数として実装し、`useTodos` が `useReducer` と `localStorage` への保存を担当します。
- ルーティングは React Router を使わず、Vanilla JS ES6 版と同様に `hashchange` イベントを購読するハッシュルーティングです。フィルターは URL に含まれるため、リロード後も選択状態が維持されます。
- 編集はラベルのダブルクリックで開始し、Enter または blur で保存、Escape で破棄します。空文字で保存した場合はそのタスクを削除します。
- localStorage のキーは Vanilla JS ES6 版と衝突しないよう `todos-react` を使用します。
- 見た目は `todomvc-app-css` と `todomvc-common` をそのまま利用し、テンプレートと同じマークアップを維持しています。

## 必要環境

```
* Node (min version: 18.13.0)
* NPM (min version: 8.19.3)
```

## ビルドと実行

開発サーバーを起動する場合:

```sh
$ npm install
$ npm run dev
```

ブラウザーで http://localhost:7003 を開きます。

本番ビルドを生成して配信する場合:

```sh
$ npm install
$ npm run build
$ npm run serve
```

ブラウザーで http://localhost:7003 を開きます。

## テスト

Vitest と Testing Library によるユニットテストを用意しています。

```sh
$ npm test
$ npm run coverage
```
