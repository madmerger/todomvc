import View from "../src/view";
import Template from "../src/template";
import { qs, qsa } from "../src/helpers";
import { setupDom } from "./fixture";

const ENTER_KEY = 13;
const ESCAPE_KEY = 27;

describe("View", () => {
    let view;

    beforeEach(() => {
        setupDom();
        view = new View(new Template());
    });

    const renderTodos = (todos) => view.render("showEntries", todos);

    it("renders todo entries", () => {
        renderTodos([{ id: 1, title: "買い物", completed: false }]);
        expect(qsa(".todo-list li")).toHaveLength(1);
        expect(qs(".todo-list label").textContent).toBe("買い物");
    });

    it("updates the active item counter", () => {
        view.render("updateElementCount", 2);
        expect(qs(".todo-count").innerHTML).toBe("残り <strong>2</strong> 件");
    });

    it("toggles the visibility of the content block", () => {
        view.render("contentBlockVisibility", { visible: false });
        expect(qs(".main").style.display).toBe("none");
        expect(qs(".footer").style.display).toBe("none");

        view.render("contentBlockVisibility", { visible: true });
        expect(qs(".main").style.display).toBe("block");
    });

    it("toggles the toggle-all checkbox", () => {
        view.render("toggleAll", { checked: true });
        expect(qs(".toggle-all").checked).toBe(true);
    });

    it("clears the new todo input", () => {
        qs(".new-todo").value = "何か";
        view.render("clearNewTodo");
        expect(qs(".new-todo").value).toBe("");
    });

    it("removes an item and ignores unknown ids", () => {
        renderTodos([{ id: 1, title: "a", completed: false }]);

        view.render("removeItem", 99);
        expect(qsa(".todo-list li")).toHaveLength(1);

        view.render("removeItem", 1);
        expect(qsa(".todo-list li")).toHaveLength(0);
    });

    it("sets the selected filter", () => {
        view.render("setFilter", "active");
        expect(qs('.filters [href="#/active"]').className).toBe("selected");
        expect(qs('.filters [href="#/"]').className).toBe("");

        view.render("setFilter", "completed");
        expect(qs('.filters [href="#/completed"]').className).toBe("selected");
    });

    it("marks an element complete and back to active", () => {
        renderTodos([{ id: 1, title: "a", completed: false }]);

        view.render("elementComplete", { id: 1, completed: true });
        expect(qs('[data-id="1"]').className).toBe("completed");
        expect(qs('[data-id="1"] input').checked).toBe(true);

        view.render("elementComplete", { id: 1, completed: false });
        expect(qs('[data-id="1"]').className).toBe("");

        expect(() => view.render("elementComplete", { id: 404, completed: true })).not.toThrow();
    });

    it("enters and leaves editing mode", () => {
        renderTodos([{ id: 1, title: "元のタイトル", completed: false }]);

        view.render("editItem", { id: 1, title: "元のタイトル" });
        const input = qs('[data-id="1"] input.edit');
        expect(input.value).toBe("元のタイトル");
        expect(qs('[data-id="1"]').className).toContain("editing");

        view.render("editItemDone", { id: 1, title: "新しいタイトル" });
        expect(qs('[data-id="1"] input.edit')).toBeNull();
        expect(qs('[data-id="1"]').className).not.toContain("editing");
        expect(qs('[data-id="1"] label').textContent).toBe("新しいタイトル");
    });

    it("ignores editing commands for unknown ids", () => {
        expect(() => view.render("editItem", { id: 404, title: "x" })).not.toThrow();
        expect(() => view.render("editItemDone", { id: 404, title: "x" })).not.toThrow();
    });

    it("renders the clear completed button", () => {
        view.render("clearCompletedButton", { completed: 2, visible: true });
        expect(qs(".clear-completed").innerHTML).toBe("完了したタスクを削除");
        expect(qs(".clear-completed").style.display).toBe("block");

        view.render("clearCompletedButton", { completed: 0, visible: false });
        expect(qs(".clear-completed").innerHTML).toBe("");
        expect(qs(".clear-completed").style.display).toBe("none");
    });

    it("ignores unknown render commands", () => {
        expect(() => view.render("nope", {})).not.toThrow();
    });

    it("binds newTodo", () => {
        const handler = jest.fn();
        view.bindCallback("newTodo", handler);

        qs(".new-todo").value = "  新しいタスク  ";
        qs(".new-todo").dispatchEvent(new Event("change"));

        expect(handler).toHaveBeenCalledWith("  新しいタスク  ");
    });

    it("binds removeCompleted", () => {
        const handler = jest.fn();
        view.bindCallback("removeCompleted", handler);

        qs(".clear-completed").click();
        expect(handler).toHaveBeenCalled();
    });

    it("binds toggleAll", () => {
        const handler = jest.fn();
        view.bindCallback("toggleAll", handler);

        qs(".toggle-all-label").click();
        expect(handler).toHaveBeenCalledWith({ completed: true });
    });

    it("binds itemEdit on double click", () => {
        const handler = jest.fn();
        view.bindCallback("itemEdit", handler);
        renderTodos([{ id: 5, title: "a", completed: false }]);

        qs('[data-id="5"] label').dispatchEvent(new Event("dblclick", { bubbles: true }));
        expect(handler).toHaveBeenCalledWith({ id: 5 });
    });

    it("binds itemRemove", () => {
        const handler = jest.fn();
        view.bindCallback("itemRemove", handler);
        renderTodos([{ id: 6, title: "a", completed: false }]);

        qs('[data-id="6"] .destroy').click();
        expect(handler).toHaveBeenCalledWith({ id: 6 });
    });

    it("binds itemToggle", () => {
        const handler = jest.fn();
        view.bindCallback("itemToggle", handler);
        renderTodos([{ id: 7, title: "a", completed: false }]);

        qs('[data-id="7"] .toggle').click();
        expect(handler).toHaveBeenCalledWith({ id: 7, completed: true });
    });

    it("binds itemEditDone on blur and enter", () => {
        const handler = jest.fn();
        view.bindCallback("itemEditDone", handler);
        renderTodos([{ id: 8, title: "a", completed: false }]);
        view.render("editItem", { id: 8, title: "a" });

        const input = qs('[data-id="8"] input.edit');
        input.value = "編集後";

        const keypress = new Event("keypress", { bubbles: true });
        keypress.keyCode = ENTER_KEY;
        input.dispatchEvent(keypress);
        input.dispatchEvent(new Event("blur"));

        expect(handler).toHaveBeenCalledWith({ id: 8, title: "編集後" });
    });

    it("ignores non enter key presses while editing", () => {
        const handler = jest.fn();
        view.bindCallback("itemEditDone", handler);
        renderTodos([{ id: 9, title: "a", completed: false }]);
        view.render("editItem", { id: 9, title: "a" });

        const input = qs('[data-id="9"] input.edit');
        const keypress = new Event("keypress", { bubbles: true });
        keypress.keyCode = 65;
        input.dispatchEvent(keypress);

        expect(handler).not.toHaveBeenCalled();
    });

    it("binds itemEditCancel on escape and skips the save handler", () => {
        const done = jest.fn();
        const cancel = jest.fn();
        view.bindCallback("itemEditDone", done);
        view.bindCallback("itemEditCancel", cancel);
        renderTodos([{ id: 10, title: "a", completed: false }]);
        view.render("editItem", { id: 10, title: "a" });

        const input = qs('[data-id="10"] input.edit');
        input.value = "捨てられる";

        const escape = new Event("keyup", { bubbles: true });
        escape.keyCode = ESCAPE_KEY;
        input.dispatchEvent(escape);
        input.dispatchEvent(new Event("blur"));

        expect(cancel).toHaveBeenCalledWith({ id: 10 });
        expect(done).not.toHaveBeenCalled();
    });

    it("ignores other keyup keys while editing", () => {
        const cancel = jest.fn();
        view.bindCallback("itemEditCancel", cancel);
        renderTodos([{ id: 11, title: "a", completed: false }]);
        view.render("editItem", { id: 11, title: "a" });

        const keyup = new Event("keyup", { bubbles: true });
        keyup.keyCode = 65;
        qs('[data-id="11"] input.edit').dispatchEvent(keyup);

        expect(cancel).not.toHaveBeenCalled();
    });

    it("ignores unknown bind events", () => {
        expect(() => view.bindCallback("nope", jest.fn())).not.toThrow();
    });
});
