import { vi } from "vitest";
import Controller from "../src/controller";
import Model from "../src/model";
import Store from "../src/store";

const database = () => `db-${Math.random()}`;

class FakeView {
    constructor() {
        this.handlers = {};
        this.renders = [];
    }

    bindCallback(event, handler) {
        this.handlers[event] = handler;
    }

    render(cmd, param) {
        this.renders.push({ cmd, param });
    }

    takeRenders() {
        const renders = this.renders;
        this.renders = [];
        return renders;
    }
}

const createTodo = (model, title, completed = false) =>
    new Promise((resolve) => model.create(title, (todos) => resolve({ ...todos[0], completed })));

describe("Controller", () => {
    let store;
    let model;
    let view;
    let controller;

    beforeEach(() => {
        store = new Store(database());
        model = new Model(store);
        view = new FakeView();
        controller = new Controller(model, view);
        controller.setView("#/");
        view.takeRenders();
    });

    it("binds all view callbacks and ignores blank titles", async () => {
        expect(Object.keys(view.handlers).sort()).toEqual([
            "itemEdit",
            "itemEditCancel",
            "itemEditDone",
            "itemRemove",
            "itemToggle",
            "newTodo",
            "removeCompleted",
            "toggleAll",
        ]);

        controller.addItem("   ");
        expect(view.takeRenders()).toEqual([]);

        controller.addItem("new task");
        const renders = view.takeRenders();
        expect(renders.some(({ cmd }) => cmd === "clearNewTodo")).toBe(true);
        expect(renders.some(({ cmd }) => cmd === "showEntries")).toBe(true);
        model.read((todos) => expect(todos[0].title).toBe("new task"));

        await Promise.resolve();
    });

    it("toggles individual and all todos in both directions", async () => {
        const first = await createTodo(model, "first");
        const second = await createTodo(model, "second", true);
        model.update(second.id, { completed: true });
        controller.toggleComplete(first.id, true);

        expect(view.takeRenders()).toContainEqual({
            cmd: "elementComplete",
            param: { id: first.id, completed: true },
        });

        controller.toggleAll(true);
        model.read({ completed: false }, (todos) => expect(todos).toEqual([]));
        controller.toggleAll(false);
        model.read({ completed: false }, (todos) => expect(todos).toHaveLength(2));

        await Promise.resolve();
    });

    it("edits, saves, cancels, and removes items", async () => {
        const todo = await createTodo(model, "original");

        controller.editItem(todo.id);
        expect(view.takeRenders()).toContainEqual({
            cmd: "editItem",
            param: { id: todo.id, title: "original" },
        });

        controller.editItemSave(todo.id, "  changed  ");
        expect(view.takeRenders()).toContainEqual({
            cmd: "editItemDone",
            param: { id: todo.id, title: "changed" },
        });
        model.read(todo.id, (todos) => expect(todos[0].title).toBe("changed"));

        controller.editItemCancel(todo.id);
        expect(view.takeRenders()).toContainEqual({
            cmd: "editItemDone",
            param: { id: todo.id, title: "changed" },
        });

        controller.editItemSave(todo.id, " \t ");
        expect(view.takeRenders()).toContainEqual({ cmd: "removeItem", param: todo.id });
        model.read(todo.id, (todos) => expect(todos).toEqual([]));

        await Promise.resolve();
    });

    it("removes one item and all completed items", async () => {
        const first = await createTodo(model, "first");
        const second = await createTodo(model, "second");
        const third = await createTodo(model, "third");
        model.update(second.id, { completed: true });
        model.update(third.id, { completed: true });
        view.takeRenders();

        controller.removeItem(first.id);
        expect(view.takeRenders()).toContainEqual({ cmd: "removeItem", param: first.id });

        controller.removeCompletedItems();
        const renders = view.takeRenders();
        expect(renders.filter(({ cmd }) => cmd === "removeItem")).toHaveLength(2);
        model.read((todos) => expect(todos).toEqual([]));

        await Promise.resolve();
    });

    it("updates counters for empty, active, and all-completed collections", async () => {
        controller.setView("#/");
        const emptyRenders = view.takeRenders();
        expect(emptyRenders).toContainEqual({ cmd: "updateElementCount", param: 0 });
        expect(emptyRenders).toContainEqual({
            cmd: "clearCompletedButton",
            param: { completed: 0, visible: false },
        });
        expect(emptyRenders).toContainEqual({ cmd: "toggleAll", param: { checked: true } });
        expect(emptyRenders).toContainEqual({
            cmd: "contentBlockVisibility",
            param: { visible: false },
        });

        const active = await createTodo(model, "active");
        view.takeRenders();
        const completed = await createTodo(model, "completed", true);
        model.update(completed.id, { completed: true });
        controller.toggleComplete(completed.id, true);

        const renders = view.takeRenders();
        expect(renders).toContainEqual({ cmd: "updateElementCount", param: 1 });
        expect(renders).toContainEqual({
            cmd: "clearCompletedButton",
            param: { completed: 1, visible: true },
        });
        expect(renders).toContainEqual({ cmd: "toggleAll", param: { checked: false } });
        expect(renders).toContainEqual({
            cmd: "contentBlockVisibility",
            param: { visible: true },
        });

        controller.toggleComplete((await createTodo(model, "last")).id, true);
        controller.toggleComplete(active.id, true);
        const allCompleted = view.takeRenders();
        expect(allCompleted).toContainEqual({ cmd: "toggleAll", param: { checked: true } });

        await Promise.resolve();
    });

    it("routes all, active, and completed entries and sets the filter", async () => {
        const active = await createTodo(model, "active");
        const completed = await createTodo(model, "completed", true);
        model.update(completed.id, { completed: true });
        view.takeRenders();

        controller.setView("#/active");
        view.takeRenders();
        controller.setView("#/");
        let renders = view.takeRenders();
        expect(renders.find(({ cmd }) => cmd === "showEntries").param).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ id: active.id }),
                expect.objectContaining({ id: completed.id }),
            ])
        );
        expect(renders).toContainEqual({ cmd: "setFilter", param: "" });

        controller.setView("#/active");
        renders = view.takeRenders();
        expect(renders.find(({ cmd }) => cmd === "showEntries").param).toEqual([
            expect.objectContaining({ id: active.id }),
        ]);
        expect(renders).toContainEqual({ cmd: "setFilter", param: "active" });

        controller.setView("#/completed");
        renders = view.takeRenders();
        expect(renders.find(({ cmd }) => cmd === "showEntries").param).toEqual([
            expect.objectContaining({ id: completed.id }),
        ]);
        expect(renders).toContainEqual({ cmd: "setFilter", param: "completed" });
    });
});
