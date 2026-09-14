import { vi } from "vitest";
import View from "../src/view";
import Template from "../src/template";
import { qs, qsa } from "../src/helpers";
import { setupDom } from "./fixture";

const todoItem = (id, title, completed = false) => ({ id, title, completed });

describe("View", () => {
    let view;

    beforeEach(() => {
        setupDom();
        view = new View(new Template());
    });

    const renderItems = (items) => view.render("showEntries", items);

    describe("render", () => {
        it("showEntries はリストを描画する", () => {
            renderItems([todoItem(1, "買い物"), todoItem(2, "掃除", true)]);

            expect(qsa(".todo-list li").length).toBe(2);
            expect(qs('[data-id="2"]').className).toBe("completed");
        });

        it("updateElementCount は残件数を表示する", () => {
            view.render("updateElementCount", 4);

            expect(qs(".todo-count").textContent).toBe("残り 4 件");
        });

        it("contentBlockVisibility は main と footer の表示を切り替える", () => {
            view.render("contentBlockVisibility", { visible: false });
            expect(qs(".main").style.display).toBe("none");
            expect(qs(".footer").style.display).toBe("none");

            view.render("contentBlockVisibility", { visible: true });
            expect(qs(".main").style.display).toBe("block");
        });

        it("toggleAll は一括チェックの状態を反映する", () => {
            view.render("toggleAll", { checked: true });

            expect(qs(".toggle-all").checked).toBe(true);
        });

        it("clearNewTodo は入力欄を空にする", () => {
            qs(".new-todo").value = "書きかけ";

            view.render("clearNewTodo");

            expect(qs(".new-todo").value).toBe("");
        });

        it("removeItem はリストから要素を取り除く", () => {
            renderItems([todoItem(1, "消す"), todoItem(2, "残す")]);

            view.render("removeItem", 1);

            expect(qs('[data-id="1"]')).toBeNull();
            expect(qs('[data-id="2"]')).not.toBeNull();
        });

        it("removeItem は存在しない ID を無視する", () => {
            renderItems([todoItem(1, "残す")]);

            expect(() => view.render("removeItem", 99)).not.toThrow();
            expect(qsa(".todo-list li").length).toBe(1);
        });

        it("setFilter は選択中のフィルターを付け替える", () => {
            view.render("setFilter", "active");

            expect(qs('.filters [href="#/active"]').className).toBe("selected");
            expect(qs('.filters [href="#/"]').className).toBe("");
        });

        it("elementComplete は完了状態とチェックボックスを更新する", () => {
            renderItems([todoItem(1, "買い物")]);

            view.render("elementComplete", { id: 1, completed: true });
            expect(qs('[data-id="1"]').className).toBe("completed");
            expect(qs('[data-id="1"] input').checked).toBe(true);

            view.render("elementComplete", { id: 1, completed: false });
            expect(qs('[data-id="1"]').className).toBe("");
            expect(qs('[data-id="1"] input').checked).toBe(false);
        });

        it("elementComplete は存在しないアイテムを無視する", () => {
            expect(() => view.render("elementComplete", { id: 99, completed: true })).not.toThrow();
        });

        it("editItem は編集用の入力欄を追加する", () => {
            renderItems([todoItem(1, "買い物")]);

            view.render("editItem", { id: 1, title: "買い物" });

            const input = qs('[data-id="1"] input.edit');
            expect(input.value).toBe("買い物");
            expect(qs('[data-id="1"]').className).toContain("editing");
        });

        it("editItem は存在しないアイテムを無視する", () => {
            expect(() => view.render("editItem", { id: 99, title: "x" })).not.toThrow();
        });

        it("editItemDone は入力欄を外してラベルを更新する", () => {
            renderItems([todoItem(1, "買い物")]);
            view.render("editItem", { id: 1, title: "買い物" });

            view.render("editItemDone", { id: 1, title: "買い出し" });

            expect(qs('[data-id="1"] input.edit')).toBeNull();
            expect(qs('[data-id="1"] label').textContent).toBe("買い出し");
            expect(qs('[data-id="1"]').className).not.toContain("editing");
        });

        it("editItemDone は存在しないアイテムを無視する", () => {
            expect(() => view.render("editItemDone", { id: 99, title: "x" })).not.toThrow();
        });

        it("clearCompletedButton は文言と表示状態を更新する", () => {
            view.render("clearCompletedButton", { completed: 2, visible: true });
            expect(qs(".clear-completed").innerHTML).toBe("完了したタスクを削除");
            expect(qs(".clear-completed").style.display).toBe("block");

            view.render("clearCompletedButton", { completed: 0, visible: false });
            expect(qs(".clear-completed").innerHTML).toBe("");
            expect(qs(".clear-completed").style.display).toBe("none");
        });

        it("未知のコマンドは何もしない", () => {
            expect(() => view.render("unknownCommand", {})).not.toThrow();
        });
    });

    describe("bindCallback", () => {
        it("newTodo は入力値を渡す", () => {
            const handler = vi.fn();
            view.bindCallback("newTodo", handler);

            qs(".new-todo").value = "新しいタスク";
            qs(".new-todo").dispatchEvent(new Event("change"));

            expect(handler).toHaveBeenCalledWith("新しいタスク");
        });

        it("removeCompleted はクリックで発火する", () => {
            const handler = vi.fn();
            view.bindCallback("removeCompleted", handler);

            qs(".clear-completed").click();

            expect(handler).toHaveBeenCalled();
        });

        it("toggleAll はチェック状態を渡す", () => {
            const handler = vi.fn();
            view.bindCallback("toggleAll", handler);

            qs(".toggle-all-label").click();

            expect(handler).toHaveBeenCalledWith({ completed: true });
            expect(qs(".toggle-all").checked).toBe(true);
        });

        it("itemEdit はダブルクリックで ID を渡す", () => {
            const handler = vi.fn();
            view.bindCallback("itemEdit", handler);
            renderItems([todoItem(1, "買い物")]);

            qs('[data-id="1"] label').dispatchEvent(new Event("dblclick", { bubbles: true }));

            expect(handler).toHaveBeenCalledWith({ id: 1 });
        });

        it("itemRemove は削除ボタンのクリックで ID を渡す", () => {
            const handler = vi.fn();
            view.bindCallback("itemRemove", handler);
            renderItems([todoItem(3, "買い物")]);

            qs('[data-id="3"] .destroy').click();

            expect(handler).toHaveBeenCalledWith({ id: 3 });
        });

        it("itemToggle はチェックボックスの状態を渡す", () => {
            const handler = vi.fn();
            view.bindCallback("itemToggle", handler);
            renderItems([todoItem(4, "買い物")]);

            qs('[data-id="4"] .toggle').click();

            expect(handler).toHaveBeenCalledWith({ id: 4, completed: true });
        });

        it("itemEditDone は blur で編集内容を渡す", () => {
            const handler = vi.fn();
            view.bindCallback("itemEditDone", handler);
            renderItems([todoItem(5, "買い物")]);
            view.render("editItem", { id: 5, title: "買い物" });

            const input = qs('[data-id="5"] input.edit');
            input.value = "買い出し";
            input.dispatchEvent(new Event("blur", { bubbles: true }));

            expect(handler).toHaveBeenCalledWith({ id: 5, title: "買い出し" });
        });

        it("itemEditDone は Enter キーで blur を起こす", () => {
            const handler = vi.fn();
            view.bindCallback("itemEditDone", handler);
            renderItems([todoItem(6, "買い物")]);
            view.render("editItem", { id: 6, title: "買い物" });

            const input = qs('[data-id="6"] input.edit');
            const blur = vi.spyOn(input, "blur");
            input.dispatchEvent(new KeyboardEvent("keypress", { keyCode: 13, bubbles: true }));

            expect(blur).toHaveBeenCalled();
        });

        it("itemEditDone は Enter 以外のキーを無視する", () => {
            view.bindCallback("itemEditDone", vi.fn());
            renderItems([todoItem(7, "買い物")]);
            view.render("editItem", { id: 7, title: "買い物" });

            const input = qs('[data-id="7"] input.edit');
            const blur = vi.spyOn(input, "blur");
            input.dispatchEvent(new KeyboardEvent("keypress", { keyCode: 65, bubbles: true }));

            expect(blur).not.toHaveBeenCalled();
        });

        it("itemEditDone はキャンセル済みの編集では発火しない", () => {
            const handler = vi.fn();
            view.bindCallback("itemEditDone", handler);
            renderItems([todoItem(8, "買い物")]);
            view.render("editItem", { id: 8, title: "買い物" });

            const input = qs('[data-id="8"] input.edit');
            input.dataset.iscanceled = true;
            input.dispatchEvent(new Event("blur", { bubbles: true }));

            expect(handler).not.toHaveBeenCalled();
        });

        it("itemEditCancel は Escape キーで発火する", () => {
            const handler = vi.fn();
            view.bindCallback("itemEditCancel", handler);
            renderItems([todoItem(9, "買い物")]);
            view.render("editItem", { id: 9, title: "買い物" });

            const input = qs('[data-id="9"] input.edit');
            input.dispatchEvent(new KeyboardEvent("keyup", { keyCode: 27, bubbles: true }));

            expect(handler).toHaveBeenCalledWith({ id: 9 });
            expect(input.dataset.iscanceled).toBe("true");
        });

        it("itemEditCancel は Escape 以外のキーを無視する", () => {
            const handler = vi.fn();
            view.bindCallback("itemEditCancel", handler);
            renderItems([todoItem(10, "買い物")]);
            view.render("editItem", { id: 10, title: "買い物" });

            qs('[data-id="10"] input.edit').dispatchEvent(
                new KeyboardEvent("keyup", { keyCode: 65, bubbles: true })
            );

            expect(handler).not.toHaveBeenCalled();
        });

        it("未知のイベント名は何もしない", () => {
            expect(() => view.bindCallback("unknownEvent", vi.fn())).not.toThrow();
        });
    });
});
