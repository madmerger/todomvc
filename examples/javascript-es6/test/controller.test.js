import { beforeEach, describe, expect, it, vi } from "vitest";
import Controller from "../src/controller";
import Model from "../src/model";
import Store from "../src/store";
import { uniqueDbName } from "./fixture";

let view;
let store;
let model;
let controller;

const createView = () => {
    const handlers = {};
    return {
        handlers,
        render: vi.fn(),
        bindCallback: (event, handler) => {
            handlers[event] = handler;
        },
    };
};

const renderedWith = (command) =>
    view.render.mock.calls.filter(([cmd]) => cmd === command).map(([, parameter]) => parameter);

const lastRenderedWith = (command) => renderedWith(command).at(-1);

const todos = () => {
    const callback = vi.fn();
    store.findAll(callback);
    return callback.mock.calls.at(-1)[0];
};

const addTodo = (title) => {
    controller.addItem(title);
    return todos().at(-1);
};

beforeEach(() => {
    store = new Store(uniqueDbName());
    model = new Model(store);
    view = createView();
    controller = new Controller(model, view);
    controller.setView("");
    view.render.mockClear();
});

describe("Controller routing", () => {
    it("defaults to the All route", () => {
        controller.setView("");

        expect(controller._activeRoute).toBe("All");
        expect(lastRenderedWith("setFilter")).toBe("");
    });

    it("activates the active route", () => {
        controller.setView("#/active");

        expect(controller._activeRoute).toBe("active");
        expect(lastRenderedWith("setFilter")).toBe("active");
    });

    it("activates the completed route", () => {
        controller.setView("#/completed");

        expect(controller._activeRoute).toBe("completed");
        expect(lastRenderedWith("setFilter")).toBe("completed");
    });

    it("shows all todos on the All route", () => {
        addTodo("active one");
        controller.toggleComplete(addTodo("done one").id, true);
        view.render.mockClear();

        controller.showAll();

        expect(lastRenderedWith("showEntries")).toHaveLength(2);
    });

    it("shows only active todos on the active route", () => {
        addTodo("active one");
        controller.toggleComplete(addTodo("done one").id, true);
        view.render.mockClear();

        controller.showActive();

        const entries = lastRenderedWith("showEntries");
        expect(entries).toHaveLength(1);
        expect(entries[0].title).toBe("active one");
    });

    it("shows only completed todos on the completed route", () => {
        addTodo("active one");
        controller.toggleComplete(addTodo("done one").id, true);
        view.render.mockClear();

        controller.showCompleted();

        const entries = lastRenderedWith("showEntries");
        expect(entries).toHaveLength(1);
        expect(entries[0].title).toBe("done one");
    });

    it("re-renders the filtered list when a todo is toggled on the active route", () => {
        const todo = addTodo("active one");
        controller.setView("#/active");
        view.render.mockClear();

        controller.toggleComplete(todo.id, true);

        expect(lastRenderedWith("showEntries")).toHaveLength(0);
    });
});

describe("Controller#addItem", () => {
    it("stores a new todo and clears the input", () => {
        view.handlers.newTodo("buy milk");

        expect(todos()).toHaveLength(1);
        expect(todos()[0]).toMatchObject({ title: "buy milk", completed: false });
        expect(renderedWith("clearNewTodo")).toHaveLength(1);
    });

    it("trims the title before storing it", () => {
        controller.addItem("   buy milk   ");

        expect(todos()[0].title).toBe("buy milk");
    });

    it("ignores a title that is empty or only whitespace", () => {
        controller.addItem("");
        controller.addItem("   ");

        expect(todos()).toHaveLength(0);
        expect(renderedWith("clearNewTodo")).toHaveLength(0);
    });
});

describe("Controller editing", () => {
    it("enters edit mode with the current title", () => {
        const todo = addTodo("buy milk");
        view.render.mockClear();

        view.handlers.itemEdit({ id: todo.id });

        expect(lastRenderedWith("editItem")).toEqual({ id: todo.id, title: "buy milk" });
    });

    it("saves a new title", () => {
        const todo = addTodo("buy milk");

        view.handlers.itemEditDone({ id: todo.id, title: "  buy bread  " });

        expect(todos()[0].title).toBe("buy bread");
        expect(lastRenderedWith("editItemDone")).toEqual({ id: todo.id, title: "buy bread" });
    });

    it("removes the todo when the new title is empty", () => {
        const todo = addTodo("buy milk");

        view.handlers.itemEditDone({ id: todo.id, title: "   " });

        expect(todos()).toHaveLength(0);
        expect(lastRenderedWith("removeItem")).toBe(todo.id);
    });

    it("keeps the original title when editing is cancelled", () => {
        const todo = addTodo("buy milk");

        view.handlers.itemEditCancel({ id: todo.id });

        expect(todos()[0].title).toBe("buy milk");
        expect(lastRenderedWith("editItemDone")).toEqual({ id: todo.id, title: "buy milk" });
    });
});

describe("Controller completion", () => {
    it("marks a todo as completed", () => {
        const todo = addTodo("buy milk");

        view.handlers.itemToggle({ id: todo.id, completed: true });

        expect(todos()[0].completed).toBe(true);
        expect(lastRenderedWith("elementComplete")).toEqual({ id: todo.id, completed: true });
    });

    it("marks a todo as active again", () => {
        const todo = addTodo("buy milk");
        controller.toggleComplete(todo.id, true);

        view.handlers.itemToggle({ id: todo.id, completed: false });

        expect(todos()[0].completed).toBe(false);
    });

    it("marks every todo as completed", () => {
        addTodo("one");
        addTodo("two");

        view.handlers.toggleAll({ completed: true });

        expect(todos().every((todo) => todo.completed)).toBe(true);
    });

    it("marks every todo as active again", () => {
        addTodo("one");
        addTodo("two");
        controller.toggleAll(true);

        view.handlers.toggleAll({ completed: false });

        expect(todos().every((todo) => !todo.completed)).toBe(true);
    });
});

describe("Controller removal", () => {
    it("removes a single todo", () => {
        const todo = addTodo("buy milk");

        view.handlers.itemRemove({ id: todo.id });

        expect(todos()).toHaveLength(0);
        expect(lastRenderedWith("removeItem")).toBe(todo.id);
    });

    it("removes only the completed todos", () => {
        addTodo("active one");
        const done = addTodo("done one");
        controller.toggleComplete(done.id, true);

        view.handlers.removeCompleted();

        expect(todos()).toHaveLength(1);
        expect(todos()[0].title).toBe("active one");
    });
});

describe("Controller counters", () => {
    it("renders the active count and hides the empty state", () => {
        addTodo("one");

        expect(lastRenderedWith("updateElementCount")).toBe(1);
        expect(lastRenderedWith("contentBlockVisibility")).toEqual({ visible: true });
    });

    it("hides the content block when there is no todo left", () => {
        const todo = addTodo("one");

        controller.removeItem(todo.id);

        expect(lastRenderedWith("updateElementCount")).toBe(0);
        expect(lastRenderedWith("contentBlockVisibility")).toEqual({ visible: false });
    });

    it("shows the clear completed button once something is completed", () => {
        const todo = addTodo("one");

        controller.toggleComplete(todo.id, true);

        expect(lastRenderedWith("clearCompletedButton")).toEqual({ completed: 1, visible: true });
        expect(lastRenderedWith("toggleAll")).toEqual({ checked: true });
    });

    it("hides the clear completed button while every todo is active", () => {
        addTodo("one");

        expect(lastRenderedWith("clearCompletedButton")).toEqual({ completed: 0, visible: false });
        expect(lastRenderedWith("toggleAll")).toEqual({ checked: false });
    });
});
