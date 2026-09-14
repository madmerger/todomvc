# TodoMVC E2E テストケース (app-spec.md ベース)

対象アプリ: `examples/javascript-es6`（`http://localhost:7002`）
出典: リポジトリールートの `app-spec.md` の「Functionality」章

## 前提・共通手順

- 起動: `cd examples/javascript-es6 && npm install && npm run build && npm run serve` → `http://localhost:7002`
- 各テストケースは「Todo が 0 件」の状態から開始する。前のケースの残りがある場合は Clear completed / × ボタンで全削除するか、リロードして状態をリセットする（このアプリは永続化がメモリー内のため、リロードで初期化される）。
- TC-15（永続化）以外のシナリオ中はページをリロードしない。
- 用語: 入力欄 = 上部の "What needs to be done?"、一括トグル = 入力欄左の ❯ 矢印、フィルター = 下部の All / Active / Completed。
- 現行実装の UI は日本語ローカライズされている（入力欄「何をする必要がありますか？」、カウンター「残り N 件」、フィルター「すべて/未完了/完了」、「完了したタスクを削除」）。本書の期待結果の英語文言は意味として解釈し、等価な日本語表示であれば pass とする。文言・単複表記の差異は個別 fail にせず、差異としてまとめて記録する。

---

## TC-01 初期表示（No todos）

**目的**: Todo が無い状態で `#main` と `#footer` が非表示であること（spec: No todos）

1. `http://localhost:7002` を開く。
2. 画面を確認する。

**期待結果**
- ヘッダーと入力欄のみが表示され、Todo リスト・残件数カウンター・フィルター・Clear completed は表示されない。
- 入力欄がページ読み込み時にフォーカスされている（autofocus）ため、そのままキー入力すると入力欄に文字が入る。

## TC-02 Todo の追加

**目的**: Enter で Todo が追加され入力欄がクリアされること（spec: New todo）

1. 入力欄に `Buy milk` と入力し Enter を押す。
2. 続けて `Walk dog`、`Write report` を同様に追加する。

**期待結果**
- 3 件が入力した順（上から Buy milk / Walk dog / Write report）でリストに表示される。
- Enter 後に入力欄が空になる。
- `#main` と `#footer` が表示され、カウンターが `3 items left` になる。

## TC-03 空文字・空白のみの入力は追加されない

**目的**: `.trim()` 後に空なら作成しないこと（spec: New todo）

1. Todo が 0 件の状態で、入力欄で Enter を押す。
2. 入力欄に半角スペースのみ（例: `   `）を入力して Enter を押す。

**期待結果**
- どちらの操作でも Todo は追加されず、`#main` / `#footer` は非表示のまま。

## TC-04 前後の空白がトリムされる

**目的**: 入力値の trim（spec: New todo）

1. 入力欄に `  Trim me  ` と入力して Enter を押す。

**期待結果**
- ラベルが `Trim me` として表示される（前後に空白が残らない）。

## TC-05 個別の完了トグル

**目的**: チェックボックスで完了状態が切り替わること（spec: Item / Counter）

1. `A`、`B` の 2 件を追加する。
2. `A` のチェックボックスをクリックする。
3. 再度 `A` のチェックボックスをクリックする。

**期待結果**
- 手順 2 後: `A` にチェックが入り、ラベルに取り消し線が付き（`completed` クラス）、カウンターが `1 item left` になる。
- 手順 3 後: 取り消し線が消え、カウンターが `2 items left` に戻る。

## TC-06 カウンターの単数・複数表記

**目的**: `0 items` / `1 item` / `2 items` の出し分け（spec: Counter）

1. `A`、`B` を追加する（`2 items left`）。
2. `A` を完了にする（`1 item left`）。
3. `B` も完了にする（`0 items left`）。

**期待結果**
- 各手順でカウンターが `2 items left` → `1 item left` → `0 items left` と表示される（数値部分は `<strong>` で太字）。

## TC-07 Mark all as complete（一括トグル）

**目的**: 一括トグルが全 Todo を自身と同じ状態にすること、および単体操作時の連動（spec: Mark all as complete）

1. `A`、`B`、`C` を追加する。
2. 一括トグル（❯）をクリックする。
3. `B` のチェックを外す。
4. 再度 `B` にチェックを入れる。
5. 一括トグルをもう一度クリックする。

**期待結果**
- 手順 2 後: 3 件すべてが完了（取り消し線）になり、`0 items left`、Clear completed が表示される。
- 手順 3 後: `B` のみ未完了に戻り `1 item left`、一括トグルの選択状態も解除される。
- 手順 4 後: 全件完了となり、一括トグルが再び選択状態になる。
- 手順 5 後: 3 件すべてが未完了に戻り `3 items left`、Clear completed が非表示になる。

## TC-08 編集モード（ダブルクリック → Enter で保存）

**目的**: 編集モードの起動・保存（spec: Editing）

1. `Old title` を追加する。
2. ラベルをダブルクリックする。
3. 既存テキストを消して `New title` と入力し Enter を押す。

**期待結果**
- 手順 2 後: その行が編集モード（`editing` クラス）になり、チェックボックスと × が隠れ、既存タイトルが入った入力欄がフォーカスされている。
- 手順 3 後: 編集モードが解除され、ラベルが `New title` に更新される。

## TC-09 編集の blur 保存 / Escape 破棄 / 空文字で削除

**目的**: blur 保存、Escape 破棄、空文字なら削除（spec: Editing）

1. `Item1` を追加し、ラベルをダブルクリックして `Item1 edited` に変更後、リストの外側をクリックして blur させる。
2. 同じ Todo をダブルクリックし `Discard me` と書き換えてから Escape を押す。
3. 同じ Todo をダブルクリックし、テキストを全削除（または空白のみ）して Enter を押す。

**期待結果**
- 手順 1 後: blur で保存され、ラベルが `Item1 edited`、編集モードが解除される。
- 手順 2 後: 変更は破棄され、ラベルは `Item1 edited` のまま、編集モードが解除される。
- 手順 3 後: その Todo が削除され、リストが空（`#main` / `#footer` 非表示）になる。

## TC-10 削除ボタン（hover で表示される ×）

**目的**: hover 時に `.destroy` が表示され、クリックで削除されること（spec: Item）

1. `A`、`B` を追加する。
2. `A` の行にマウスカーソルを重ねる。
3. 表示された × をクリックする。

**期待結果**
- 手順 2 後: `A` の行の右側に × が表示される（hover していない行には表示されない）。
- 手順 3 後: `A` が削除され、`B` のみ残り `1 item left` になる。

## TC-11 Clear completed

**目的**: 完了済みのみ削除、完了が無いときは非表示（spec: Clear completed button）

1. `A`、`B`、`C` を追加する。
2. Clear completed が表示されていないことを確認する。
3. `A` と `C` を完了にする。
4. Clear completed をクリックする。

**期待結果**
- 手順 2: 完了済みが 0 件のため Clear completed は非表示。
- 手順 3 後: Clear completed が表示され、カウンターは `1 item left`。
- 手順 4 後: `A` と `C` が消えて `B` のみ残り、Clear completed が再び非表示、一括トグルの選択状態も解除されている。

## TC-12 フィルタリング（All / Active / Completed）

**目的**: ハッシュルートによる絞り込みと `selected` の切り替え（spec: Routing）

1. `A`、`B`、`C` を追加し、`B` を完了にする。
2. Active をクリックする。
3. Completed をクリックする。
4. All をクリックする。

**期待結果**
- 手順 2: URL が `#/active`、`A` と `C` のみ表示、Active リンクが選択枠（`selected`）付きで強調される。
- 手順 3: URL が `#/completed`、`B` のみ表示、Completed が選択状態。
- 手順 4: URL が `#/`、3 件すべて表示、All が選択状態。

## TC-13 フィルター表示中の更新反映

**目的**: 絞り込み中に状態を変えたとき一覧が追従すること（spec: Routing）

1. `A`、`B` を追加する。
2. Active フィルターに切り替える（`A`、`B` が表示）。
3. `A` のチェックボックスをクリックして完了にする。
4. Completed フィルターに切り替え、`A` のチェックを外す。

**期待結果**
- 手順 3 後: `A` が Active 一覧から消え、`B` のみ表示、カウンターは `1 item left`。
- 手順 4 後: `A` が Completed 一覧から消え、Completed 一覧が空になる。

## TC-14 URL 直接指定でのフィルター適用

**目的**: ルートが URL から復元されること（spec: Routing）

1. `A`、`B` を追加し `B` を完了にする。
2. アドレスバーに `http://localhost:7002/#/completed` を入力して遷移する（リロードはしない）。

**期待結果**
- Completed フィルターが適用され `B` のみ表示、Completed リンクが選択状態になる。

## TC-15 永続化（既知の仕様差異 / 参考確認）

**目的**: spec の Persistence 要件（localStorage への永続化、フィルターもリロード後に維持）の充足確認

1. `A`、`B` を追加し `B` を完了にして Active フィルターに切り替える。
2. ページをリロードする。

**期待結果（spec 準拠なら）**
- Todo 2 件と完了状態が復元され、フィルターも `#/active` のまま維持される。

**注**: 本実装（`examples/javascript-es6/src/store.js`）はメモリー内ストレージのため、リロードで Todo が消える想定。spec との差異として記録し、他のケースの合否には影響させない。このケースは必ず最後に実行する。
