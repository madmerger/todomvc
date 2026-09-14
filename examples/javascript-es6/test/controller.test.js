import Controller from "../src/controller";
import Model from "../src/model";
import Store from "../src/store";

class FakeView {
    constructor() {
        this.callbacks = {};
        this.render = jest.fn();
        this.bindCallback = jest.fn((event, handler) => {
            this.callbacks[event] = handler;
        });
    }

    trigger(event, parameter) {
        this.callbacks[event](parameter);
    }

    renderedWith(viewCmd) {
        return this.render.mock.calls.filter((call) => call[0] === viewCmd).map((call) => call[1]);
    }
}

describe("Controller", () => {
    let store;
    let model;
    let view;
    let controller;

    const addTodos = (titles) => {
        const ids = [];

        for (const title of titles)
            model.create(title, (items) => ids.push(items[0].id));

        return ids;
    };

    const todos = () => {
        let all;
        model.read((data) => (all = data));
        return all;
    };

    beforeEach(() => {
        store = new Store("controller-test-db");
        store.drop();
        model = new Model(store);
        view = new FakeView();
        controller = new Controller(model, view);
    });

    describe("setView", () => {
        it("ハッシュが空ならすべてのタスクを表示する", () => {
            addTodos(["A", "B"]);

            controller.setView("");

            expect(view.renderedWith("setFilter")).toEqual([""]);
            expect(view.renderedWith("showEntries")[0]).toHaveLength(2);
        });

        it("#/active は未完了のみ表示する", () => {
            const [first, second] = addTodos(["未完了", "完了"]);
            controller.toggleComplete(second, true, true);
            view.render.mockClear();

            controller.setView("#/active");

            expect(view.renderedWith("setFilter")).toEqual(["active"]);
            expect(view.renderedWith("showEntries")[0]).toEqual([
                { id: first, title: "未完了", completed: false },
            ]);
        });

        it("#/completed は完了のみ表示する", () => {
            const [, second] = addTodos(["未完了", "完了"]);
            controller.toggleComplete(second, true, true);
            view.render.mockClear();

            controller.setView("#/completed");

            expect(view.renderedWith("showEntries")[0]).toEqual([
                { id: second, title: "完了", completed: true },
            ]);
        });
    });

    describe("addItem", () => {
        beforeEach(() => controller.setView(""));

        it("タスクを保存して入力欄を消す", () => {
            controller.addItem("買い物");

            expect(todos()).toEqual([{ id: expect.any(Number), title: "買い物", completed: false }]);
            expect(view.renderedWith("clearNewTodo")).toHaveLength(1);
        });

        it("空白のみの題名は無視する", () => {
            controller.addItem("   ");

            expect(todos()).toHaveLength(0);
            expect(view.renderedWith("clearNewTodo")).toHaveLength(0);
        });
    });

    describe("編集", () => {
        let id;

        beforeEach(() => {
            controller.setView("");
            [id] = addTodos(["元の題名"]);
            view.render.mockClear();
        });

        it("editItem は編集モードを開始する", () => {
            controller.editItem(id);

            expect(view.renderedWith("editItem")).toEqual([{ id, title: "元の題名" }]);
        });

        it("editItemSave は題名を更新する", () => {
            controller.editItemSave(id, "  新しい題名  ");

            expect(todos()[0].title).toBe("新しい題名");
            expect(view.renderedWith("editItemDone")).toEqual([{ id, title: "新しい題名" }]);
        });

        it("editItemSave は空の題名でタスクを削除する", () => {
            controller.editItemSave(id, "   ");

            expect(todos()).toHaveLength(0);
            expect(view.renderedWith("removeItem")).toEqual([id]);
        });

        it("editItemCancel は元の題名へ戻す", () => {
            controller.editItemCancel(id);

            expect(view.renderedWith("editItemDone")).toEqual([{ id, title: "元の題名" }]);
            expect(todos()[0].title).toBe("元の題名");
        });
    });

    describe("削除", () => {
        beforeEach(() => controller.setView(""));

        it("removeItem は該当タスクを削除する", () => {
            const [first, second] = addTodos(["消す", "残す"]);

            controller.removeItem(first);

            expect(todos()).toEqual([{ id: second, title: "残す", completed: false }]);
            expect(view.renderedWith("removeItem")).toContainEqual(first);
        });

        it("removeCompletedItems は完了タスクだけ削除する", () => {
            const [first, second] = addTodos(["未完了", "完了"]);
            controller.toggleComplete(second, true, true);

            controller.removeCompletedItems();

            expect(todos()).toEqual([{ id: first, title: "未完了", completed: false }]);
        });
    });

    describe("完了状態", () => {
        beforeEach(() => controller.setView(""));

        it("toggleComplete は完了状態を切り替える", () => {
            const [id] = addTodos(["買い物"]);

            controller.toggleComplete(id, true);
            expect(todos()[0].completed).toBe(true);
            expect(view.renderedWith("elementComplete")).toContainEqual({ id, completed: true });

            controller.toggleComplete(id, false);
            expect(todos()[0].completed).toBe(false);
        });

        it("silent 指定では再フィルターしない", () => {
            const [id] = addTodos(["買い物"]);
            view.render.mockClear();

            controller.toggleComplete(id, true, true);

            expect(view.renderedWith("showEntries")).toHaveLength(0);
        });

        it("toggleAll はすべてのタスクを完了にする", () => {
            addTodos(["A", "B"]);

            controller.toggleAll(true);

            expect(todos().every((todo) => todo.completed)).toBe(true);
        });

        it("toggleAll(false) はすべてのタスクを未完了に戻す", () => {
            addTodos(["A", "B"]);
            controller.toggleAll(true);

            controller.toggleAll(false);

            expect(todos().every((todo) => todo.completed)).toBe(false);
        });
    });

    describe("件数表示", () => {
        it("残件数・削除ボタン・一括チェック・表示状態を更新する", () => {
            controller.setView("");
            const [first] = addTodos(["A", "B"]);
            controller.toggleComplete(first, true);
            view.render.mockClear();

            controller._updateCount();

            expect(view.renderedWith("updateElementCount")).toEqual([1]);
            expect(view.renderedWith("clearCompletedButton")).toEqual([{ completed: 1, visible: true }]);
            expect(view.renderedWith("toggleAll")).toEqual([{ checked: false }]);
            expect(view.renderedWith("contentBlockVisibility")).toEqual([{ visible: true }]);
        });

        it("タスクが無ければコンテンツを隠す", () => {
            controller.setView("");
            view.render.mockClear();

            controller._updateCount();

            expect(view.renderedWith("clearCompletedButton")).toEqual([{ completed: 0, visible: false }]);
            expect(view.renderedWith("contentBlockVisibility")).toEqual([{ visible: false }]);
            expect(view.renderedWith("toggleAll")).toEqual([{ checked: true }]);
        });
    });

    describe("ビューからのイベント", () => {
        beforeEach(() => controller.setView(""));

        it("newTodo でタスクを追加する", () => {
            view.trigger("newTodo", "追加された");

            expect(todos()[0].title).toBe("追加された");
        });

        it("itemEdit / itemEditDone / itemEditCancel を仲介する", () => {
            const [id] = addTodos(["元"]);

            view.trigger("itemEdit", { id });
            expect(view.renderedWith("editItem")).toEqual([{ id, title: "元" }]);

            view.trigger("itemEditDone", { id, title: "新" });
            expect(todos()[0].title).toBe("新");

            view.trigger("itemEditCancel", { id });
            expect(view.renderedWith("editItemDone")).toContainEqual({ id, title: "新" });
        });

        it("itemRemove でタスクを削除する", () => {
            const [id] = addTodos(["消す"]);

            view.trigger("itemRemove", { id });

            expect(todos()).toHaveLength(0);
        });

        it("itemToggle で完了状態を切り替える", () => {
            const [id] = addTodos(["買い物"]);

            view.trigger("itemToggle", { id, completed: true });

            expect(todos()[0].completed).toBe(true);
        });

        it("removeCompleted で完了タスクを削除する", () => {
            const [, second] = addTodos(["未完了", "完了"]);
            view.trigger("itemToggle", { id: second, completed: true });

            view.trigger("removeCompleted");

            expect(todos()).toHaveLength(1);
        });

        it("toggleAll ですべて完了にする", () => {
            addTodos(["A", "B"]);

            view.trigger("toggleAll", { completed: true });

            expect(todos().every((todo) => todo.completed)).toBe(true);
        });
    });
});
