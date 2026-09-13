import { beforeEach, describe, expect, it, vi } from "vitest";
import Template from "../src/template";
import View from "../src/view";
import { qs, qsa } from "../src/helpers";
import { renderApp } from "./fixture";

let view;

const showEntries = (todos) => view.render("showEntries", todos);

beforeEach(() => {
    renderApp();
    view = new View(new Template());
});

describe("View#render", () => {
    it("shows the todo entries", () => {
        showEntries([
            { id: 1, title: "one", completed: false },
            { id: 2, title: "two", completed: true },
        ]);

        expect(qsa(".todo-list li")).toHaveLength(2);
        expect(qs('[data-id="2"]').className).toBe("completed");
    });

    it("updates the item counter", () => {
        view.render("updateElementCount", 1);

        expect(qs(".todo-count").textContent).toBe("1 item left");
    });

    it("hides the main and footer blocks when there is nothing to show", () => {
        view.render("contentBlockVisibility", { visible: false });

        expect(qs(".main").style.display).toBe("none");
        expect(qs(".footer").style.display).toBe("none");
    });

    it("shows the main and footer blocks when there are todos", () => {
        view.render("contentBlockVisibility", { visible: true });

        expect(qs(".main").style.display).toBe("block");
    });

    it("toggles the toggle-all checkbox", () => {
        view.render("toggleAll", { checked: true });

        expect(qs(".toggle-all").checked).toBe(true);
    });

    it("clears the new todo input", () => {
        qs(".new-todo").value = "leftover";

        view.render("clearNewTodo");

        expect(qs(".new-todo").value).toBe("");
    });

    it("removes a todo item", () => {
        showEntries([{ id: 1, title: "one", completed: false }]);

        view.render("removeItem", 1);

        expect(qsa(".todo-list li")).toHaveLength(0);
    });

    it("ignores removal of an unknown todo item", () => {
        showEntries([{ id: 1, title: "one", completed: false }]);

        expect(() => view.render("removeItem", 42)).not.toThrow();
        expect(qsa(".todo-list li")).toHaveLength(1);
    });

    it("marks the current filter as selected", () => {
        view.render("setFilter", "active");

        expect(qs('.filters [href="#/active"]').className).toBe("selected");
        expect(qs('.filters [href="#/"]').className).toBe("");
    });

    it("marks an element as complete", () => {
        showEntries([{ id: 1, title: "one", completed: false }]);

        view.render("elementComplete", { id: 1, completed: true });

        expect(qs('[data-id="1"]').className).toBe("completed");
        expect(qs('[data-id="1"] input').checked).toBe(true);
    });

    it("marks an element as active again", () => {
        showEntries([{ id: 1, title: "one", completed: true }]);

        view.render("elementComplete", { id: 1, completed: false });

        expect(qs('[data-id="1"]').className).toBe("");
        expect(qs('[data-id="1"] input').checked).toBe(false);
    });

    it("ignores completion of an unknown element", () => {
        expect(() => view.render("elementComplete", { id: 42, completed: true })).not.toThrow();
    });

    it("puts an item into edit mode with an input holding the title", () => {
        showEntries([{ id: 1, title: "one", completed: false }]);

        view.render("editItem", { id: 1, title: "one" });

        const item = qs('[data-id="1"]');
        expect(item.className).toContain("editing");
        expect(qs("input.edit", item).value).toBe("one");
    });

    it("ignores edit mode for an unknown element", () => {
        expect(() => view.render("editItem", { id: 42, title: "x" })).not.toThrow();
    });

    it("leaves edit mode and updates the label", () => {
        showEntries([{ id: 1, title: "one", completed: false }]);
        view.render("editItem", { id: 1, title: "one" });

        view.render("editItemDone", { id: 1, title: "updated" });

        const item = qs('[data-id="1"]');
        expect(item.className).not.toContain("editing");
        expect(qs("label", item).textContent).toBe("updated");
        expect(qs("input.edit", item)).toBeNull();
    });

    it("ignores leaving edit mode for an unknown element", () => {
        expect(() => view.render("editItemDone", { id: 42, title: "x" })).not.toThrow();
    });

    it("shows the clear completed button only when something is completed", () => {
        view.render("clearCompletedButton", { completed: 2, visible: true });

        expect(qs(".clear-completed").innerHTML).toBe("Clear completed");
        expect(qs(".clear-completed").style.display).toBe("block");

        view.render("clearCompletedButton", { completed: 0, visible: false });

        expect(qs(".clear-completed").innerHTML).toBe("");
        expect(qs(".clear-completed").style.display).toBe("none");
    });

    it("ignores unknown render commands", () => {
        expect(() => view.render("nope")).not.toThrow();
    });
});

describe("View#bindCallback", () => {
    it("emits newTodo with the input value on change", () => {
        const handler = vi.fn();
        view.bindCallback("newTodo", handler);

        qs(".new-todo").value = "  buy milk  ";
        qs(".new-todo").dispatchEvent(new Event("change"));

        expect(handler).toHaveBeenCalledWith("  buy milk  ");
    });

    it("emits removeCompleted when the clear button is clicked", () => {
        const handler = vi.fn();
        view.bindCallback("removeCompleted", handler);

        qs(".clear-completed").click();

        expect(handler).toHaveBeenCalledTimes(1);
    });

    it("emits toggleAll with the resulting checkbox state", () => {
        const handler = vi.fn();
        view.bindCallback("toggleAll", handler);

        qs(".toggle-all-label").click();

        expect(handler).toHaveBeenCalledWith({ completed: true });
    });

    it("emits itemEdit on double click of the label", () => {
        const handler = vi.fn();
        showEntries([{ id: 3, title: "one", completed: false }]);
        view.bindCallback("itemEdit", handler);

        qs('[data-id="3"] label').dispatchEvent(new Event("dblclick", { bubbles: true }));

        expect(handler).toHaveBeenCalledWith({ id: 3 });
    });

    it("emits itemRemove when the destroy button is clicked", () => {
        const handler = vi.fn();
        showEntries([{ id: 3, title: "one", completed: false }]);
        view.bindCallback("itemRemove", handler);

        qs('[data-id="3"] .destroy').click();

        expect(handler).toHaveBeenCalledWith({ id: 3 });
    });

    it("emits itemToggle with the checkbox state", () => {
        const handler = vi.fn();
        showEntries([{ id: 3, title: "one", completed: false }]);
        view.bindCallback("itemToggle", handler);

        qs('[data-id="3"] .toggle').click();

        expect(handler).toHaveBeenCalledWith({ id: 3, completed: true });
    });

    it("emits itemEditDone on blur of the edit input", () => {
        const handler = vi.fn();
        showEntries([{ id: 3, title: "one", completed: false }]);
        view.bindCallback("itemEditDone", handler);
        view.render("editItem", { id: 3, title: "one" });

        const input = qs('[data-id="3"] input.edit');
        input.value = "updated";
        input.dispatchEvent(new Event("blur"));

        expect(handler).toHaveBeenCalledWith({ id: 3, title: "updated" });
    });

    it("emits itemEditDone when enter is pressed", () => {
        const handler = vi.fn();
        showEntries([{ id: 3, title: "one", completed: false }]);
        view.bindCallback("itemEditDone", handler);
        view.render("editItem", { id: 3, title: "one" });

        const input = qs('[data-id="3"] input.edit');
        input.value = "via enter";
        input.dispatchEvent(new KeyboardEvent("keypress", { keyCode: 13, bubbles: true }));

        expect(handler).toHaveBeenCalledWith({ id: 3, title: "via enter" });
    });

    it("ignores other keys while editing", () => {
        const handler = vi.fn();
        showEntries([{ id: 3, title: "one", completed: false }]);
        view.bindCallback("itemEditDone", handler);
        view.render("editItem", { id: 3, title: "one" });

        qs('[data-id="3"] input.edit').dispatchEvent(
            new KeyboardEvent("keypress", { keyCode: 65, bubbles: true })
        );

        expect(handler).not.toHaveBeenCalled();
    });

    it("emits itemEditCancel on escape and skips itemEditDone", () => {
        const cancel = vi.fn();
        const done = vi.fn();
        showEntries([{ id: 3, title: "one", completed: false }]);
        view.bindCallback("itemEditDone", done);
        view.bindCallback("itemEditCancel", cancel);
        view.render("editItem", { id: 3, title: "one" });

        const input = qs('[data-id="3"] input.edit');
        input.value = "discarded";
        input.dispatchEvent(new KeyboardEvent("keyup", { keyCode: 27, bubbles: true }));

        expect(cancel).toHaveBeenCalledWith({ id: 3 });
        expect(done).not.toHaveBeenCalled();
    });

    it("ignores other keys on keyup while editing", () => {
        const cancel = vi.fn();
        showEntries([{ id: 3, title: "one", completed: false }]);
        view.bindCallback("itemEditCancel", cancel);
        view.render("editItem", { id: 3, title: "one" });

        qs('[data-id="3"] input.edit').dispatchEvent(
            new KeyboardEvent("keyup", { keyCode: 65, bubbles: true })
        );

        expect(cancel).not.toHaveBeenCalled();
    });

    it("ignores unknown events", () => {
        expect(() => view.bindCallback("nope", vi.fn())).not.toThrow();
    });
});
