# React TodoMVC

[アプリ仕様書](../../app-spec.md)に準拠した TodoMVC の React 実装です。

## フレームワーク

- [React 18](https://react.dev/)（関数コンポーネント + Hooks）
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)（開発サーバー / ビルド）
- スタイルは `todomvc-app-css` と `todomvc-common` をそのまま利用

## 実装の概要

```
index.html
src/
├── main.tsx              エントリポイント（CSS の読み込みとマウント）
├── App.tsx               フィルター適用と全体のレイアウト
├── types.ts              Todo 型（id, title, completed）とフィルター型
├── components/
│   ├── Header.tsx        新規追加の入力欄
│   ├── TodoList.tsx      `.todo-list` の描画
│   ├── TodoItem.tsx      1 件の表示・編集・削除
│   └── Footer.tsx        残件数カウンター、フィルター、Clear completed
└── hooks/
    ├── useTodos.ts       Todo の状態管理（追加・更新・削除・一括完了）
    ├── useLocalStorage.ts  localStorage への永続化（キー: `todos-react`）
    └── useHashFilter.ts  `#/`・`#/active`・`#/completed` のハッシュルーティング
```

- Todo は `todos-react` というキーで localStorage に永続化されます（編集中の状態は永続化しません）。
- フィルターはモデルレベルで適用し、選択中のリンクに `selected` クラスが付きます。
- ラベルのダブルクリックで編集モード（`.editing`）になり、Enter / blur で保存、Escape で破棄、空文字なら削除します。

## 実行方法

```sh
$ npm install
$ npm run dev
```

http://localhost:7003 が開発サーバーです。

本番ビルドとプレビューは次のとおりです。

```sh
$ npm install
$ npm run build
$ npm run serve
```
