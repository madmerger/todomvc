# TodoMVC E2E テスト実行レポート

## 実行概要

- 実行日: 2026-09-14 (UTC)
- 対象: `examples/javascript-es6` / `http://localhost:7002`
- ブランチ: `devin/1789360146-e2e-test-cases` / PR #13
- 対象コミット: `b69d9f533fe0051ed234e7ec1c670f482c89eb64`
- 正典: `e2e-test-cases.md` 全文を読み、TC-01〜TC-15の手順を指定順にブラウザーで実行。ケースファイル・アプリ実装は変更していない。
- 起動: アプリディレクトリーで `npm install && npm run build && npm run serve`。ログイン・シークレット不要。最大化したChromeでマウス/キーボード操作を録画した。
- 各ケースはTodo 0件で開始。ケース間だけリロードまたは削除済み状態を使用し、TC-15以外のシナリオ中はリロードしていない。TC-14はアドレスバーでハッシュのみ変更した。
- 正典の共通手順にある「TC-11（永続化）」は番号不整合のため、ユーザーの明示指示とTC-15本文に従い、永続化を最後に実行した。
- 実行中に明示された解釈に従い、日本語の等価表示は機能としてpass、TC-06の「太字」は数値を`<strong>`で囲む要件として判定した。文字列/複数形の違いは後述の独立セクションに集約した。
- 画面の表示/非表示・取り消し線・選択枠はスクリーンショットで確認。前後空白、クラス、`<strong>`、一括チェック状態などは読み取り専用DOM確認を補助に使用した。DOMやストレージを書き換えて操作を代替していない。
- [Devinセッション](https://aiau.devinenterprise.com/sessions/9f71048306c846baabd25dd6c3e0a326)

**手順実行完了: pass 14件、fail 0件、specとの差異 1件（TC-15、合否対象外）。未実行ケースなし。** 永続化のspec準拠を確認できたという意味ではない。対象はこのChrome・ローカルビルドであり、他ブラウザー/他exampleは対象外。

## TCごとの結果と根拠

| TC | 結果 | 期待と実測の照合 |
|---|---|---|
| TC-01 初期表示 | pass | Todoリスト・カウンター・フィルター・完了削除は非表示。ヘッダーと入力欄を確認。入力欄をクリックせず`Focus check`を入力でき、autofocusを確認（その後文字だけ消去）。アプリ外の説明/クレジットは表示される。 |
| TC-02 Todoの追加 | pass | `Buy milk`→`Walk dog`→`Write report`の順で3行追加。各Enter後に入力欄が空になり、リスト/操作フッターが表示。残件数3。 |
| TC-03 空文字・空白のみ | pass | 空欄Enterと半角スペース3文字Enterのどちらも追加なし。0件のままリスト/操作フッター非表示。 |
| TC-04 trim | pass | `  Trim me  `をEnterで追加。画面ラベルは`Trim me`、DOMの`textContent`も厳密に`"Trim me"`で前後空白なし。 |
| TC-05 個別完了トグル | pass | A/B追加後Aをクリック: Aのチェック・取り消し線・`completed`クラス、残件数1、完了削除表示。再クリック: チェック/取り消し線が消え残件数2へ復帰。 |
| TC-06 カウンター | pass | A/B追加→A完了→B完了で残件数2→1→0をそれぞれ目視確認。各段階のDOMは`残り <strong>2</strong> 件`、`残り <strong>1</strong> 件`、`残り <strong>0</strong> 件`。単複表記の扱いは独立差異セクション参照。 |
| TC-07 一括トグル | pass | A/B/C追加後一括クリックで全件チェック/取り消し線、0件、完了削除表示。B解除でBのみ未完了、1件、一括矢印は淡色・checked=false。B再完了で全件完了、一括矢印は濃色・checked=true。最後に一括クリックで全件未完了、3件、完了削除非表示。 |
| TC-08 編集Enter保存 | pass | `Old title`をダブルクリックすると`editing`クラス、タイトル入り編集欄にフォーカス、チェック/×非表示。`New title`に書き換えEnterすると編集欄が消え、更新済みラベルと通常コントロールに戻る。 |
| TC-09 blur/Escape/空文字 | pass | `Item1`を`Item1 edited`へ変更しリスト外クリックで保存/編集終了。`Discard me`へ変更後Escapeで破棄し`Item1 edited`に戻る。再編集で全テキスト削除＋EnterするとTodo消去、リスト/操作フッター非表示。 |
| TC-10 hover削除 | pass | A/B追加後AにhoverするとA右端だけ×が現れ、非hoverのBには×なし。Aの×クリック後Bだけ残り残件数1。 |
| TC-11 Clear completed | pass | A/B/C未完了では完了削除非表示。A/C完了で両ラベルに取り消し線、残件数1、ボタン表示。ボタンクリックでA/Cのみ消えBが残る。ボタン再び非表示、一括矢印未選択・checked=false。 |
| TC-12 フィルタリング | pass | A/B/CのBを完了。Activeクリックで`#/active`、A/Cのみ、Active選択枠。Completedクリックで`#/completed`、チェック/取り消し線のBのみ、Completed選択枠。Allクリックで`#/`、A/B/C全件、All選択枠。 |
| TC-13 フィルター中更新 | pass | A/Bを追加しActiveへ。A完了でAが直ちに消えBのみ・残件数1。Completedへ移動し完了Aを表示後、Aのチェック解除でCompleted一覧が空になる。 |
| TC-14 URL直接指定 | pass | A/B追加しB完了。アドレスバーに`http://localhost:7002/#/completed`を入力してEnter。リロードせずBのみ表示されCompletedに選択枠。 |
| TC-15 永続化 | specとの差異（合否対象外） | 最後にA/Bを追加、B完了、Active選択（Aのみ・残件数1）。リロードでTodoが消失しリスト/操作フッター非表示。URLは`#/active`を維持。DOMのTodo行数0、main/footerはdisplay:none、非表示内のselectedリンクは`#/active`。Todo2件と完了状態は復元されず、既知のmemoryStorage差異を確認。 |

## specとの差異

### 1. 永続化（TC-15）

specではTodoと完了状態がlocalStorageから復元される期待に対し、実測ではリロード後0件。`src/store.js:6–29`のメモリー保存と整合する。URLの`#/active`は維持され、内部selectedもActiveだが、Todoが0件なのでフィルターの選択枠は画面上には出ない。**TC-15をfailedにはせず、TC-01〜TC-14の判定に影響させていない。**

### 2. ローカライズ（全ケース共通の1件）

英語のカウンター/フィルター等は日本語に置き換わっている。対応は`What needs to be done?`→`何をする必要がありますか？`、All/Active/Completed→`すべて/未完了/完了`、Clear completed→`完了したタスクを削除`、`N items left`→`残り N 件`。

TC-06で残り2→1→0件を確認したが、日本語ではすべて`件`を用い、英語specの`1 item`対`0 items`/`2 items`という単数/複数の分岐は表示されない。数値はすべて`<strong>`で囲まれている。実行中の明示指示に基づき意味上等価な日本語で各ケースをpassとし、文言差を個別failとして重複計上していない。

参考情報: `.todo-count strong`のcomputed `font-weight`は親と同じ`300`。明示された判定解釈に従い、視覚的な太字ではなく`<strong>`マークアップを確認対象にした。

## 主要スクリーンショット

### 追加とカウンター

| TC-02 指定順の3件追加 | TC-06 全件完了・残り0件 |
|---|---|
| ![TC-02 Todo追加](https://aiau.devinenterprise.com/attachments/d568a72b-8761-405b-b7c1-7da1f3c0ea63/ss_2fb7b573.png) | ![TC-06 カウンター0](https://aiau.devinenterprise.com/attachments/60cccb8a-701f-4a13-9224-010072fc819b/ss_a9e5f112.png) |

### TC-08 編集保存

| 🔴 保存前: 編集モード・Old title | 🟢 保存後: 通常表示・New title |
|---|---|
| ![TC-08 編集中](https://aiau.devinenterprise.com/attachments/edecade8-03f9-4c81-88a7-300fd51d0aae/ss_6495d6be.png) | ![TC-08 Enter保存後](https://aiau.devinenterprise.com/attachments/a39ae184-3538-4da7-882c-40f466061eee/ss_87787a67.png) |

### TC-11 完了済みのみ削除

| 🔴 削除前: A/C完了、B未完了 | 🟢 削除後: Bのみ |
|---|---|
| ![TC-11 削除前](https://aiau.devinenterprise.com/attachments/1315d4af-87ce-44be-8da4-e3f5965fd088/ss_83af7b79.png) | ![TC-11 削除後](https://aiau.devinenterprise.com/attachments/4e425014-b209-4e41-b52c-ac65cffb9225/ss_9ebf2b54.png) |

### TC-12 フィルター・URL・選択枠

| Active: A/Cのみ | Completed: Bのみ |
|---|---|
| ![TC-12 Active](https://aiau.devinenterprise.com/attachments/3d42913e-8467-4b16-96e0-ffc4c7291bb3/ss_a3b12751.png) | ![TC-12 Completed](https://aiau.devinenterprise.com/attachments/809ef0b5-a9a8-4e74-bf53-6e38b27cd261/ss_8aaa3bfe.png) |

### TC-15 リロード（既知のspec差異、緑アイコンは「後」を示しspec準拠の意味ではない）

| 🔴 リロード前: Active、A表示・B完了 | 🟢 リロード後: Todo消失、URL維持 |
|---|---|
| ![TC-15 リロード前](https://aiau.devinenterprise.com/attachments/01b24c75-eea2-42d5-83fa-030a5a8b4678/ss_76c7d3c2.png) | ![TC-15 リロード後のspec差異](https://aiau.devinenterprise.com/attachments/41a31d83-3969-43d9-9875-8ac3e0881b6f/ss_d2cb92e2.png) |

## ローカル成果物

- レポート: `/home/ubuntu/repos/todomvc/e2e-test-report.md`
- 録画（全TCのtest_start/assertion付き）: `/home/ubuntu/screencasts/todomvc-final-tc01-15/todomvc-final-tc01-15-edited.mp4`
- TC-02: `/home/ubuntu/screenshots/ss_2fb7b573.png`
- TC-06: `/home/ubuntu/screenshots/ss_a9e5f112.png`
- TC-08前/後: `/home/ubuntu/screenshots/ss_6495d6be.png` / `/home/ubuntu/screenshots/ss_87787a67.png`
- TC-11前/後: `/home/ubuntu/screenshots/ss_83af7b79.png` / `/home/ubuntu/screenshots/ss_9ebf2b54.png`
- TC-12 Active/Completed: `/home/ubuntu/screenshots/ss_a3b12751.png` / `/home/ubuntu/screenshots/ss_8aaa3bfe.png`
- TC-15前/後: `/home/ubuntu/screenshots/ss_76c7d3c2.png` / `/home/ubuntu/screenshots/ss_d2cb92e2.png`

## 残事項

- 未実行・ブロックされたケース: なし。
- ユーザーに必要な追加操作/認証情報: なし。
- PR投稿は行っていない。
