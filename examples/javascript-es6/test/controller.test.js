import Controller from "../src/controller";
import Model from "../src/model";
import Template from "../src/template";
import View from "../src/view";
import { qs, qsa } from "../src/helpers";
import { setupDom } from "./fixture";

const titles = () => Array.prototype.map.call(qsa(".todo-list li label"), (label) => label.textContent);

describe("Controller", () => {
    let Store;
    let controller;
    let view;
    let model;

    beforeEach(() => {
        jest.resetModules();
        Store = require("../src/store").default;
        setupDom();

        model = new Model(new Store("todos-javascript-es6"));
        view = new View(new Template());
        controller = new Controller(model, view);
        controller.setView("");
    });

    const addItems = (...items) => items.forEach((title) => controller.addItem(title));

    it("setView は hash に応じてフィルターを切り替える", () => {
        addItems("A", "B");
        controller.toggleComplete(1, true);

        controller.setView("#/active");
        expect(titles()).toEqual(["B"]);
        expect(qs('.filters [href="#/active"]').className).toBe("selected");

        controller.setView("#/completed");
        expect(titles()).toEqual(["A"]);

        controller.setView("#/");
        expect(titles()).toEqual(["A", "B"]);
        expect(qs('.filters [href="#/"]').className).toBe("selected");
    });

    it("addItem は todo を追加して入力欄をクリアする", () => {
        qs(".new-todo").value = "A";
        addItems("A");

        expect(titles()).toEqual(["A"]);
        expect(qs(".new-todo").value).toBe("");
    });

    it("addItem は空白のみのタイトルを追加しない", () => {
        addItems("   ", "");

        expect(titles()).toEqual([]);
    });

    it("新規 todo の入力イベントから追加できる", () => {
        qs(".new-todo").value = "  入力から追加  ";
        qs(".new-todo").dispatchEvent(new window.Event("change", { bubbles: true }));

        expect(titles()).toEqual(["入力から追加"]);
    });

    it("残り件数と完了ボタンの表示を更新する", () => {
        addItems("A", "B");
        expect(qs(".todo-count").innerHTML).toBe("残り <strong>2</strong> 件");
        expect(qs(".clear-completed").style.display).toBe("none");

        controller.toggleComplete(1, true);
        expect(qs(".todo-count").innerHTML).toBe("残り <strong>1</strong> 件");
        expect(qs(".clear-completed").style.display).toBe("block");
    });

    it("todo が 0 件のときは main と footer を隠す", () => {
        expect(qs(".main").style.display).toBe("none");

        addItems("A");
        expect(qs(".main").style.display).toBe("block");

        controller.removeItem(1);
        expect(qs(".main").style.display).toBe("none");
    });

    it("editItem は編集モードにして現在のタイトルを入力欄に入れる", () => {
        addItems("A");
        controller.editItem(1);

        expect(qs('[data-id="1"]').className).toContain("editing");
        expect(qs('[data-id="1"] input.edit').value).toBe("A");
    });

    it("editItemSave はタイトルを trim して保存する", () => {
        addItems("A");
        controller.editItem(1);
        controller.editItemSave(1, "  A+  ");

        expect(titles()).toEqual(["A+"]);

        const read = jest.fn();
        model.read(1, read);
        expect(read.mock.calls[0][0][0].title).toBe("A+");
    });

    it("editItemSave は空文字なら todo を削除する", () => {
        addItems("A");
        controller.editItem(1);
        controller.editItemSave(1, "   ");

        expect(titles()).toEqual([]);
    });

    it("editItemCancel は編集内容を破棄して元のタイトルに戻す", () => {
        addItems("A");
        controller.editItem(1);
        qs('[data-id="1"] input.edit').value = "破棄される";
        controller.editItemCancel(1);

        expect(titles()).toEqual(["A"]);
        expect(qs('[data-id="1"] input.edit')).toBeNull();
    });

    it("ダブルクリックから編集、Enter で保存できる", () => {
        addItems("A");

        qs('[data-id="1"] label').dispatchEvent(new window.Event("dblclick", { bubbles: true }));
        const input = qs('[data-id="1"] input.edit');
        input.value = "A+";

        const keypress = new window.Event("keypress", { bubbles: true });
        keypress.keyCode = 13;
        input.dispatchEvent(keypress);

        expect(titles()).toEqual(["A+"]);
    });

    it("Escape キーで編集をキャンセルできる", () => {
        addItems("A");

        qs('[data-id="1"] label').dispatchEvent(new window.Event("dblclick", { bubbles: true }));
        const input = qs('[data-id="1"] input.edit');
        input.value = "破棄される";

        const keyup = new window.Event("keyup", { bubbles: true });
        keyup.keyCode = 27;
        input.dispatchEvent(keyup);

        expect(titles()).toEqual(["A"]);
    });

    it("destroy ボタンのクリックで todo を削除する", () => {
        addItems("A", "B");
        qs('[data-id="1"] .destroy').click();

        expect(titles()).toEqual(["B"]);
    });

    it("チェックボックスのクリックで完了状態を切り替える", () => {
        addItems("A");
        qs('[data-id="1"] .toggle').click();

        expect(qs('[data-id="1"]').className).toBe("completed");

        const read = jest.fn();
        model.read(1, read);
        expect(read.mock.calls[0][0][0].completed).toBe(true);
    });

    it("toggleAll はすべての todo の完了状態をまとめて切り替える", () => {
        addItems("A", "B");
        controller.toggleAll(true);

        expect(qs(".todo-count").innerHTML).toBe("残り <strong>0</strong> 件");
        expect(qs(".toggle-all").checked).toBe(true);

        controller.toggleAll(false);
        expect(qs(".todo-count").innerHTML).toBe("残り <strong>2</strong> 件");
        expect(qs(".toggle-all").checked).toBe(false);
    });

    it("すべて完了ラベルのクリックで全件をトグルする", () => {
        addItems("A", "B");
        qs(".toggle-all-label").click();

        expect(qs(".todo-count").innerHTML).toBe("残り <strong>0</strong> 件");
    });

    it("removeCompletedItems は完了済みの todo だけを削除する", () => {
        addItems("A", "B");
        controller.toggleComplete(1, true);
        controller.removeCompletedItems();

        expect(titles()).toEqual(["B"]);
    });

    it("完了したタスクを削除ボタンのクリックで完了済みを削除する", () => {
        addItems("A", "B");
        controller.toggleComplete(2, true);
        qs(".clear-completed").click();

        expect(titles()).toEqual(["A"]);
    });

    it("completed フィルター表示中に完了を解除すると一覧から消える", () => {
        addItems("A");
        controller.toggleComplete(1, true);
        controller.setView("#/completed");
        expect(titles()).toEqual(["A"]);

        controller.toggleComplete(1, false);
        expect(titles()).toEqual([]);
    });
});
