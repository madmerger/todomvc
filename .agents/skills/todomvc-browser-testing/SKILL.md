---
name: todomvc-browser-testing
description: JavaScript ES6 TodoMVCアプリをローカルブラウザーで確認する手順。
---

# TodoMVCブラウザーテスト

## 起動
- `cd examples/javascript-es6`でアプリディレクトリーへ移動し、`npm install`で依存パッケージをインストールする。
- `npm run build && npm run serve`でビルドして`http://localhost:7002`を開く。または`npm run dev`で開発サーバーを起動する。
- ソース変更後は既存の`dist`が古い可能性があるため、必要なら再構築する。

## UIでの確認
- アプリで3件を異なる名前で追加して上から追加順であることを確認する。
- 編集はラベルをダブルクリックし、入力後Enter。削除は行にマウスを重ねて表示される×。
- 完了操作は各行の見えるチェックボックス、一括操作は入力欄左の矢印を使う。
- 完了判定はチェックだけでなく、取り消し線、残件数、Active/Completedの表示、Clear completedの結果を組み合わせる。
- フィルターはハッシュルート`#/`、`#/active`、`#/completed`。URLと選択枠も確認する。
- 保存がメモリー内の実装では再読み込みでデータが消えるため、一連のシナリオ中にページを再読み込みしない。
- 自動テストで報告された不具合がGUI操作で再現しなくても、操作経路の差を明記し、自動テストの問題が解消したとは主張しない。

## Devin Secrets Needed
なし。ローカル静的サイトにはログイン不要。
