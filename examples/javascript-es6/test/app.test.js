// End to end wiring of Model, View, Controller, Template and Store in jsdom:
// the same composition src/app.js performs, without the webpack specific parts.
import { beforeEach, describe, expect, it } from "vitest";
import Controller from "../src/controller";
import Model from "../src/model";
import Store from "../src/store";
import Template from "../src/template";
import View from "../src/view";
import { qs, qsa } from "../src/helpers";
import { renderApp, uniqueDbName } from "./fixture";

let store;
let controller;

const addTodo = (title) => {
    qs(".new-todo").value = title;
    qs(".new-todo").dispatchEvent(new Event("change"));
};

const items = () => qsa(".todo-list li");

const titles = () => [...qsa(".todo-list li label")].map((label) => label.textContent);

const storedTodos = () => {
    let stored = [];
    store.findAll((todos) => {
        stored = todos;
    });
    return stored;
};

const startEditing = (index) =>
    qs("label", items()[index]).dispatchEvent(new Event("dblclick", { bubbles: true }));

beforeEach(() => {
    renderApp();
    store = new Store(uniqueDbName());
    controller = new Controller(new Model(store), new View(new Template()));
    controller.setView("");
});

describe("TodoMVC app", () => {
    it("adds a todo, clears the input and shows the counter", () => {
        addTodo("buy milk");

        expect(titles()).toEqual(["buy milk"]);
        expect(qs(".new-todo").value).toBe("");
        expect(qs(".todo-count").textContent).toBe("1 item left");
    });

    it("pluralizes the counter for several todos", () => {
        addTodo("one");
        addTodo("two");

        expect(qs(".todo-count").textContent).toBe("2 items left");
    });

    it("ignores empty and whitespace only titles", () => {
        addTodo("   ");

        expect(items()).toHaveLength(0);
    });

    it("toggles a todo as completed and updates the counter", () => {
        addTodo("buy milk");

        qs(".todo-list .toggle").click();

        expect(qs(".todo-list li").className).toBe("completed");
        expect(qs(".todo-count").textContent).toBe("0 items left");
        expect(storedTodos()[0].completed).toBe(true);
    });

    it("marks all todos as complete and back to active", () => {
        addTodo("one");
        addTodo("two");

        qs(".toggle-all-label").click();
        expect(storedTodos().every((todo) => todo.completed)).toBe(true);
        expect(qs(".todo-count").textContent).toBe("0 items left");

        qs(".toggle-all-label").click();
        expect(storedTodos().every((todo) => !todo.completed)).toBe(true);
        expect(qs(".todo-count").textContent).toBe("2 items left");
    });

    it("saves an edit on blur", () => {
        addTodo("buy milk");
        startEditing(0);

        const input = qs(".todo-list input.edit");
        input.value = "buy bread";
        input.dispatchEvent(new Event("blur"));

        expect(titles()).toEqual(["buy bread"]);
        expect(storedTodos()[0].title).toBe("buy bread");
    });

    it("saves an edit when enter is pressed", () => {
        addTodo("buy milk");
        startEditing(0);

        const input = qs(".todo-list input.edit");
        input.value = "buy bread";
        input.dispatchEvent(new KeyboardEvent("keypress", { keyCode: 13, bubbles: true }));

        expect(titles()).toEqual(["buy bread"]);
    });

    it("discards an edit when escape is pressed", () => {
        addTodo("buy milk");
        startEditing(0);

        const input = qs(".todo-list input.edit");
        input.value = "discarded";
        input.dispatchEvent(new KeyboardEvent("keyup", { keyCode: 27, bubbles: true }));

        expect(titles()).toEqual(["buy milk"]);
        expect(storedTodos()[0].title).toBe("buy milk");
    });

    it("removes a todo when the edited title is empty", () => {
        addTodo("buy milk");
        startEditing(0);

        const input = qs(".todo-list input.edit");
        input.value = "   ";
        input.dispatchEvent(new Event("blur"));

        expect(items()).toHaveLength(0);
        expect(storedTodos()).toHaveLength(0);
    });

    it("removes a todo with the destroy button", () => {
        addTodo("buy milk");

        qs(".todo-list .destroy").click();

        expect(items()).toHaveLength(0);
        expect(qs(".main").style.display).toBe("none");
    });

    it("clears the completed todos", () => {
        addTodo("active one");
        addTodo("done one");
        qsa(".todo-list .toggle")[1].click();

        qs(".clear-completed").click();

        expect(titles()).toEqual(["active one"]);
    });

    it("filters todos by route", () => {
        addTodo("active one");
        addTodo("done one");
        qsa(".todo-list .toggle")[1].click();

        controller.setView("#/active");
        expect(titles()).toEqual(["active one"]);
        expect(qs('.filters [href="#/active"]').className).toBe("selected");

        controller.setView("#/completed");
        expect(titles()).toEqual(["done one"]);

        controller.setView("#/");
        expect(titles()).toEqual(["active one", "done one"]);
    });

    it("keeps the todos in storage across app instances", () => {
        addTodo("persisted");

        renderApp();
        const restored = new Controller(new Model(store), new View(new Template()));
        restored.setView("");

        expect(titles()).toEqual(["persisted"]);
    });
});
