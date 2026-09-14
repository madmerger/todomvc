import Controller from "../src/controller";
import Model from "../src/model";

const createViewMock = () => {
    const callbacks = {};
    return {
        callbacks,
        render: jest.fn(),
        bindCallback: jest.fn((event, handler) => {
            callbacks[event] = handler;
        }),
        trigger(event, arg) {
            callbacks[event](arg);
        },
        renderedWith(cmd) {
            return this.render.mock.calls.filter(([name]) => name === cmd).map(([, parameter]) => parameter);
        },
        lastRenderOf(cmd) {
            const calls = this.renderedWith(cmd);
            return calls[calls.length - 1];
        },
    };
};

describe("Controller", () => {
    let Store;
    let model;
    let view;
    let controller;

    beforeEach(() => {
        jest.resetModules();
        Store = require("../src/store").default;
        model = new Model(new Store(`todos-test-${Math.random()}`));
        view = createViewMock();
        controller = new Controller(model, view);
        controller.setView("");
    });

    const allTodos = () => {
        let todos;
        model.read((data) => (todos = data));
        return todos;
    };

    const addTodos = (...titles) => titles.forEach((title) => view.trigger("newTodo", title));

    describe("adding todos", () => {
        it("adds a todo and clears the input", () => {
            addTodos("買い物");

            expect(allTodos()).toHaveLength(1);
            expect(allTodos()[0]).toMatchObject({ title: "買い物", completed: false });
            expect(view.renderedWith("clearNewTodo")).toHaveLength(1);
        });

        it("trims the title", () => {
            addTodos("   前後に空白   ");
            expect(allTodos()[0].title).toBe("前後に空白");
        });

        it("ignores empty and whitespace-only titles", () => {
            addTodos("", "    ");
            expect(allTodos()).toHaveLength(0);
        });
    });

    describe("toggling todos", () => {
        it("toggles a single todo complete and back", () => {
            addTodos("a");
            const { id } = allTodos()[0];

            view.trigger("itemToggle", { id, completed: true });
            expect(allTodos()[0].completed).toBe(true);
            expect(view.lastRenderOf("elementComplete")).toEqual({ id, completed: true });

            view.trigger("itemToggle", { id, completed: false });
            expect(allTodos()[0].completed).toBe(false);
        });

        it("marks all as complete and back to active", () => {
            addTodos("a", "b", "c");

            view.trigger("toggleAll", { completed: true });
            expect(allTodos().every((todo) => todo.completed)).toBe(true);

            view.trigger("toggleAll", { completed: false });
            expect(allTodos().every((todo) => !todo.completed)).toBe(true);
        });
    });

    describe("editing todos", () => {
        it("renders the current title when editing starts", () => {
            addTodos("編集対象");
            const { id } = allTodos()[0];

            view.trigger("itemEdit", { id });
            expect(view.lastRenderOf("editItem")).toEqual({ id, title: "編集対象" });
        });

        it("saves a trimmed new title", () => {
            addTodos("元");
            const { id } = allTodos()[0];

            view.trigger("itemEditDone", { id, title: "  新  " });

            expect(allTodos()[0].title).toBe("新");
            expect(view.lastRenderOf("editItemDone")).toEqual({ id, title: "新" });
        });

        it("removes the todo when the new title is empty", () => {
            addTodos("消える");
            const { id } = allTodos()[0];

            view.trigger("itemEditDone", { id, title: "   " });

            expect(allTodos()).toHaveLength(0);
            expect(view.lastRenderOf("removeItem")).toBe(id);
        });

        it("restores the old title when editing is cancelled", () => {
            addTodos("元のまま");
            const { id } = allTodos()[0];

            view.trigger("itemEditCancel", { id });

            expect(allTodos()[0].title).toBe("元のまま");
            expect(view.lastRenderOf("editItemDone")).toEqual({ id, title: "元のまま" });
        });
    });

    describe("removing todos", () => {
        it("removes a single todo", () => {
            addTodos("a", "b");
            const { id } = allTodos()[0];

            view.trigger("itemRemove", { id });

            expect(allTodos().map((todo) => todo.title)).toEqual(["b"]);
        });

        it("clears only completed todos", () => {
            addTodos("残る", "消える");
            const completedId = allTodos()[1].id;
            view.trigger("itemToggle", { id: completedId, completed: true });

            view.trigger("removeCompleted");

            expect(allTodos().map((todo) => todo.title)).toEqual(["残る"]);
        });
    });

    describe("counter", () => {
        it("counts the remaining active todos", () => {
            addTodos("a", "b");
            expect(view.lastRenderOf("updateElementCount")).toBe(2);

            view.trigger("itemToggle", { id: allTodos()[0].id, completed: true });
            expect(view.lastRenderOf("updateElementCount")).toBe(1);

            view.trigger("itemToggle", { id: allTodos()[1].id, completed: true });
            expect(view.lastRenderOf("updateElementCount")).toBe(0);
        });

        it("shows the clear completed button and the toggle-all state", () => {
            addTodos("a");
            expect(view.lastRenderOf("clearCompletedButton")).toEqual({ completed: 0, visible: false });
            expect(view.lastRenderOf("toggleAll")).toEqual({ checked: false });

            view.trigger("itemToggle", { id: allTodos()[0].id, completed: true });
            expect(view.lastRenderOf("clearCompletedButton")).toEqual({ completed: 1, visible: true });
            expect(view.lastRenderOf("toggleAll")).toEqual({ checked: true });
        });

        it("hides the content block when there are no todos", () => {
            expect(view.lastRenderOf("contentBlockVisibility")).toEqual({ visible: false });

            addTodos("a");
            expect(view.lastRenderOf("contentBlockVisibility")).toEqual({ visible: true });
        });
    });

    describe("routing", () => {
        beforeEach(() => {
            addTodos("未完了のまま", "完了する");
            view.trigger("itemToggle", { id: allTodos()[1].id, completed: true });
        });

        const shownTitles = () => view.lastRenderOf("showEntries").map((todo) => todo.title);

        it("shows all todos on #/", () => {
            controller.setView("#/");
            expect(view.lastRenderOf("setFilter")).toBe("");
            expect(shownTitles()).toEqual(["未完了のまま", "完了する"]);
        });

        it("shows only active todos on #/active", () => {
            controller.setView("#/active");
            expect(view.lastRenderOf("setFilter")).toBe("active");
            expect(shownTitles()).toEqual(["未完了のまま"]);
        });

        it("shows only completed todos on #/completed", () => {
            controller.setView("#/completed");
            expect(view.lastRenderOf("setFilter")).toBe("completed");
            expect(shownTitles()).toEqual(["完了する"]);
        });

        it("treats an empty hash as the all route", () => {
            controller.setView("");
            expect(view.lastRenderOf("setFilter")).toBe("");
            expect(shownTitles()).toHaveLength(2);
        });

        it("keeps the active filter when a todo is completed", () => {
            controller.setView("#/active");
            view.trigger("itemToggle", { id: allTodos()[0].id, completed: true });

            expect(shownTitles()).toEqual([]);
        });
    });
});
