import View from "../src/view";
import Template from "../src/template";
import { qs, qsa } from "../src/helpers";
import { setupDom } from "./fixture";

const ENTER_KEY = 13;
const ESCAPE_KEY = 27;

const renderItems = (view, items) => view.render("showEntries", items);

describe("View", () => {
    let view;

    beforeEach(() => {
        setupDom();
        view = new View(new Template());
    });

    describe("render", () => {
        it("showEntries は todo 一覧を描画する", () => {
            renderItems(view, [
                { id: 1, title: "A", completed: false },
                { id: 2, title: "B", completed: true },
            ]);

            expect(qsa(".todo-list li")).toHaveLength(2);
            expect(qs('[data-id="2"]').className).toBe("completed");
        });

        it("updateElementCount は残り件数を描画する", () => {
            view.render("updateElementCount", 2);

            expect(qs(".todo-count").innerHTML).toBe("残り <strong>2</strong> 件");
        });

        it("contentBlockVisibility は main と footer の表示を切り替える", () => {
            view.render("contentBlockVisibility", { visible: true });
            expect(qs(".main").style.display).toBe("block");
            expect(qs(".footer").style.display).toBe("block");

            view.render("contentBlockVisibility", { visible: false });
            expect(qs(".main").style.display).toBe("none");
            expect(qs(".footer").style.display).toBe("none");
        });

        it("toggleAll は全完了チェックボックスの状態を更新する", () => {
            view.render("toggleAll", { checked: true });

            expect(qs(".toggle-all").checked).toBe(true);
        });

        it("clearNewTodo は入力欄を空にする", () => {
            qs(".new-todo").value = "入力中";
            view.render("clearNewTodo");

            expect(qs(".new-todo").value).toBe("");
        });

        it("removeItem は該当の li を削除する", () => {
            renderItems(view, [{ id: 1, title: "A", completed: false }]);
            view.render("removeItem", 1);

            expect(qsa(".todo-list li")).toHaveLength(0);
        });

        it("removeItem は存在しない ID を無視する", () => {
            renderItems(view, [{ id: 1, title: "A", completed: false }]);

            expect(() => view.render("removeItem", 999)).not.toThrow();
            expect(qsa(".todo-list li")).toHaveLength(1);
        });

        it("setFilter は選択中のフィルターを切り替える", () => {
            view.render("setFilter", "active");

            expect(qs('.filters [href="#/active"]').className).toBe("selected");
            expect(qs('.filters [href="#/"]').className).toBe("");
        });

        it("elementComplete は完了状態とチェックボックスを更新する", () => {
            renderItems(view, [{ id: 1, title: "A", completed: false }]);

            view.render("elementComplete", { id: 1, completed: true });
            expect(qs('[data-id="1"]').className).toBe("completed");
            expect(qs('[data-id="1"] .toggle').checked).toBe(true);

            view.render("elementComplete", { id: 1, completed: false });
            expect(qs('[data-id="1"]').className).toBe("");
            expect(qs('[data-id="1"] .toggle').checked).toBe(false);
        });

        it("elementComplete は存在しない ID を無視する", () => {
            expect(() => view.render("elementComplete", { id: 999, completed: true })).not.toThrow();
        });

        it("editItem は編集用の input を追加する", () => {
            renderItems(view, [{ id: 1, title: "A", completed: false }]);
            view.render("editItem", { id: 1, title: "A" });

            expect(qs('[data-id="1"]').className).toContain("editing");
            expect(qs('[data-id="1"] input.edit').value).toBe("A");
        });

        it("editItem は存在しない ID を無視する", () => {
            expect(() => view.render("editItem", { id: 999, title: "A" })).not.toThrow();
        });

        it("editItemDone は編集を終了してラベルを更新する", () => {
            renderItems(view, [{ id: 1, title: "A", completed: false }]);
            view.render("editItem", { id: 1, title: "A" });
            view.render("editItemDone", { id: 1, title: "A+" });

            expect(qs('[data-id="1"]').className).not.toContain("editing");
            expect(qs('[data-id="1"] input.edit')).toBeNull();
            expect(qs('[data-id="1"] label').textContent).toBe("A+");
        });

        it("editItemDone は存在しない ID を無視する", () => {
            expect(() => view.render("editItemDone", { id: 999, title: "A" })).not.toThrow();
        });

        it("clearCompletedButton は表示とラベルを切り替える", () => {
            view.render("clearCompletedButton", { completed: 2, visible: true });
            expect(qs(".clear-completed").innerHTML).toBe("完了したタスクを削除");
            expect(qs(".clear-completed").style.display).toBe("block");

            view.render("clearCompletedButton", { completed: 0, visible: false });
            expect(qs(".clear-completed").innerHTML).toBe("");
            expect(qs(".clear-completed").style.display).toBe("none");
        });

        it("未知のコマンドは無視する", () => {
            expect(() => view.render("unknownCommand", {})).not.toThrow();
        });
    });

    describe("bindCallback", () => {
        const dispatch = (element, type, props = {}) => {
            const event = new window.Event(type, { bubbles: true });
            Object.assign(event, props);
            element.dispatchEvent(event);
        };

        it("newTodo は入力値をハンドラーに渡す", () => {
            const handler = jest.fn();
            view.bindCallback("newTodo", handler);

            qs(".new-todo").value = "新しいタスク";
            dispatch(qs(".new-todo"), "change");

            expect(handler).toHaveBeenCalledWith("新しいタスク");
        });

        it("removeCompleted はクリックでハンドラーを呼ぶ", () => {
            const handler = jest.fn();
            view.bindCallback("removeCompleted", handler);

            qs(".clear-completed").click();

            expect(handler).toHaveBeenCalled();
        });

        it("toggleAll はチェックボックスを切り替えて状態を渡す", () => {
            const handler = jest.fn();
            view.bindCallback("toggleAll", handler);

            qs(".toggle-all-label").click();
            expect(handler).toHaveBeenLastCalledWith({ completed: true });

            qs(".toggle-all-label").click();
            expect(handler).toHaveBeenLastCalledWith({ completed: false });
        });

        it("itemEdit はラベルのダブルクリックで ID を渡す", () => {
            const handler = jest.fn();
            view.bindCallback("itemEdit", handler);
            renderItems(view, [{ id: 7, title: "A", completed: false }]);

            dispatch(qs('[data-id="7"] label'), "dblclick");

            expect(handler).toHaveBeenCalledWith({ id: 7 });
        });

        it("itemRemove は destroy ボタンのクリックで ID を渡す", () => {
            const handler = jest.fn();
            view.bindCallback("itemRemove", handler);
            renderItems(view, [{ id: 7, title: "A", completed: false }]);

            qs('[data-id="7"] .destroy').click();

            expect(handler).toHaveBeenCalledWith({ id: 7 });
        });

        it("itemToggle はチェックボックスのクリックで完了状態を渡す", () => {
            const handler = jest.fn();
            view.bindCallback("itemToggle", handler);
            renderItems(view, [{ id: 7, title: "A", completed: false }]);

            qs('[data-id="7"] .toggle').click();

            expect(handler).toHaveBeenCalledWith({ id: 7, completed: true });
        });

        it("itemEditDone は blur で編集後のタイトルを渡す", () => {
            const handler = jest.fn();
            view.bindCallback("itemEditDone", handler);
            renderItems(view, [{ id: 7, title: "A", completed: false }]);
            view.render("editItem", { id: 7, title: "A" });

            const input = qs('[data-id="7"] input.edit');
            input.value = "A+";
            dispatch(input, "blur");

            expect(handler).toHaveBeenCalledWith({ id: 7, title: "A+" });
        });

        it("itemEditDone は Enter キーで input を blur させる", () => {
            const handler = jest.fn();
            view.bindCallback("itemEditDone", handler);
            renderItems(view, [{ id: 7, title: "A", completed: false }]);
            view.render("editItem", { id: 7, title: "A" });

            const input = qs('[data-id="7"] input.edit');
            input.value = "A+";
            const blur = jest.spyOn(input, "blur");
            dispatch(input, "keypress", { keyCode: ENTER_KEY });

            expect(blur).toHaveBeenCalled();
        });

        it("itemEditDone は Enter 以外のキーでは何もしない", () => {
            view.bindCallback("itemEditDone", jest.fn());
            renderItems(view, [{ id: 7, title: "A", completed: false }]);
            view.render("editItem", { id: 7, title: "A" });

            const input = qs('[data-id="7"] input.edit');
            const blur = jest.spyOn(input, "blur");
            dispatch(input, "keypress", { keyCode: 65 });

            expect(blur).not.toHaveBeenCalled();
        });

        it("itemEditDone はキャンセル済みの blur を無視する", () => {
            const handler = jest.fn();
            view.bindCallback("itemEditDone", handler);
            renderItems(view, [{ id: 7, title: "A", completed: false }]);
            view.render("editItem", { id: 7, title: "A" });

            const input = qs('[data-id="7"] input.edit');
            input.dataset.iscanceled = true;
            dispatch(input, "blur");

            expect(handler).not.toHaveBeenCalled();
        });

        it("itemEditCancel は Escape キーで編集を破棄する", () => {
            const handler = jest.fn();
            view.bindCallback("itemEditCancel", handler);
            renderItems(view, [{ id: 7, title: "A", completed: false }]);
            view.render("editItem", { id: 7, title: "A" });

            const input = qs('[data-id="7"] input.edit');
            input.value = "破棄される";
            dispatch(input, "keyup", { keyCode: ESCAPE_KEY });

            expect(handler).toHaveBeenCalledWith({ id: 7 });
            expect(input.dataset.iscanceled).toBe("true");
        });

        it("itemEditCancel は Escape 以外のキーでは何もしない", () => {
            const handler = jest.fn();
            view.bindCallback("itemEditCancel", handler);
            renderItems(view, [{ id: 7, title: "A", completed: false }]);
            view.render("editItem", { id: 7, title: "A" });

            dispatch(qs('[data-id="7"] input.edit'), "keyup", { keyCode: 65 });

            expect(handler).not.toHaveBeenCalled();
        });

        it("未知のイベント名は無視する", () => {
            expect(() => view.bindCallback("unknownEvent", jest.fn())).not.toThrow();
        });
    });
});
