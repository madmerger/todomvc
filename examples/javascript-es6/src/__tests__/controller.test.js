import Controller from "../controller";
import Model from "../model";
import Store from "../store";
import Template from "../template";
import View from "../view";
import { loadFixture, keyboardEvent } from "./helpers/fixture";

let databaseNumber = 0;

const createApp = () => {
    const model = new Model(new Store(`controller-test-${++databaseNumber}`));
    const view = new View(new Template());
    const controller = new Controller(model, view);
    controller.setView("#/");
    return { controller, model, view };
};

const add = (controller, title) => {
    controller.addItem(title);
    const item = document.querySelector(".todo-list li:last-child");
    return Number(item.dataset.id);
};

describe("Controller integration", () => {
    beforeEach(() => loadFixture());

    test("adds trimmed items through the new-todo change event", () => {
        const { controller } = createApp();
        const input = document.querySelector(".new-todo");

        input.value = "  first task  ";
        input.dispatchEvent(new Event("change", { bubbles: true }));
        controller.addItem("   ");

        expect(document.querySelector(".todo-list li label").textContent).toBe("first task");
        expect(input.value).toBe("");
        expect(document.querySelector(".todo-count strong").textContent).toBe("1");
    });

    test("edits on double click, saves on blur and Enter, and cancels on Escape", () => {
        const { controller } = createApp();
        const id = add(controller, "first");
        document.querySelector(`[data-id="${id}"] label`).dispatchEvent(new MouseEvent("dblclick", { bubbles: true }));
        let input = document.querySelector(".edit");
        input.value = "  renamed  ";
        input.dispatchEvent(new Event("blur", { bubbles: true }));
        expect(document.querySelector(`[data-id="${id}"] label`).textContent).toBe("renamed");
        controller.editItem(id);
        input = document.querySelector(".edit");
        input.value = "entered";
        input.dispatchEvent(keyboardEvent("keypress", 13));
        expect(document.querySelector(`[data-id="${id}"] label`).textContent).toBe("entered");
        controller.editItem(id);
        input = document.querySelector(".edit");
        input.value = "discarded";
        input.dispatchEvent(keyboardEvent("keyup", 27));

        expect(document.querySelector(`[data-id="${id}"] label`).textContent).toBe("entered");
        controller.editItemSave(id, "   ");
        expect(document.querySelector(`[data-id="${id}"]`)).toBeNull();
    });

    test("toggles completion, updates count, and removes an item", () => {
        const { controller } = createApp();
        const id = add(controller, "first");
        const toggle = document.querySelector(`[data-id="${id}"] .toggle`);

        toggle.click();
        expect(document.querySelector(`[data-id="${id}"]`).className).toBe("completed");
        expect(document.querySelector(".todo-count strong").textContent).toBe("0");
        document.querySelector(`[data-id="${id}"] .destroy`).click();

        expect(document.querySelector(`[data-id="${id}"]`)).toBeNull();
        expect(document.querySelector(".main").style.display).toBe("none");
    });

    test("controls clear-completed visibility and removes completed items", () => {
        const { controller } = createApp();
        const first = add(controller, "first");
        add(controller, "second");
        controller.toggleComplete(first, true);
        const clear = document.querySelector(".clear-completed");

        expect(clear.style.display).toBe("block");
        expect(clear.textContent).toBe("完了したタスクを削除");
        clear.click();

        expect(document.querySelectorAll(".todo-list li")).toHaveLength(1);
        expect(clear.style.display).toBe("none");
    });

    test("toggles all items and applies all, active, and completed filters", () => {
        const { controller } = createApp();
        const first = add(controller, "first");
        add(controller, "second");
        document.querySelector(".toggle-all-label").click();
        expect(document.querySelectorAll(".todo-list li.completed")).toHaveLength(2);
        document.querySelector(".toggle-all-label").click();
        expect(document.querySelectorAll(".todo-list li.completed")).toHaveLength(0);
        controller.setView("#/active");
        expect(document.querySelector('.filters [href="#/active"]').className).toBe("selected");
        expect(document.querySelectorAll(".todo-list li")).toHaveLength(2);
        controller.toggleComplete(first, true);
        controller.setView("#/completed");
        expect(document.querySelector('.filters [href="#/completed"]').className).toBe("selected");
        expect(document.querySelectorAll(".todo-list li")).toHaveLength(1);
        controller.setView("#/");
        expect(document.querySelector('.filters [href="#/"]').className).toBe("selected");
        expect(document.querySelectorAll(".todo-list li")).toHaveLength(2);
    });

    test("shows all, active, and completed items directly", () => {
        const { controller } = createApp();
        const first = add(controller, "first");
        add(controller, "second");
        controller.toggleComplete(first, true, true);
        controller.showAll();
        expect(document.querySelectorAll(".todo-list li")).toHaveLength(2);
        controller.showActive();
        expect(document.querySelectorAll(".todo-list li")).toHaveLength(1);
        controller.showCompleted();
        expect(document.querySelectorAll(".todo-list li")).toHaveLength(1);
    });
});
