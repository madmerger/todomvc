import Template from "../template";
import View from "../view";
import { loadFixture, keyboardEvent } from "./helpers/fixture";

describe("View", () => {
    let view;

    beforeEach(() => {
        loadFixture();
        view = new View(new Template());
    });

    test("renders every view command", () => {
        view.render("showEntries", [{ id: 1, title: "task", completed: false }]);
        expect(document.querySelector(".todo-list li")).not.toBeNull();
        view.render("updateElementCount", 2);
        expect(document.querySelector(".todo-count").innerHTML).toBe("残り <strong>2</strong> 件");
        view.render("contentBlockVisibility", { visible: true });
        expect(document.querySelector(".main").style.display).toBe("block");
        view.render("contentBlockVisibility", { visible: false });
        expect(document.querySelector(".footer").style.display).toBe("none");
        view.render("toggleAll", { checked: true });
        expect(document.querySelector(".toggle-all").checked).toBe(true);
        document.querySelector(".new-todo").value = "value";
        view.render("clearNewTodo");
        expect(document.querySelector(".new-todo").value).toBe("");
        view.render("clearCompletedButton", { completed: 1, visible: true });
        expect(document.querySelector(".clear-completed").style.display).toBe("block");
        expect(document.querySelector(".clear-completed").textContent).toBe("完了したタスクを削除");
        view.render("clearCompletedButton", { completed: 0, visible: false });
        expect(document.querySelector(".clear-completed").style.display).toBe("none");
        view.render("setFilter", "active");
        expect(document.querySelector('.filters [href="#/active"]').className).toBe("selected");
        view.render("elementComplete", { id: 1, completed: true });
        expect(document.querySelector("[data-id='1']").className).toBe("completed");
        view.render("elementComplete", { id: 1, completed: false });
        expect(document.querySelector("[data-id='1']").className).toBe("");
        view.render("editItem", { id: 1, title: "edited" });
        expect(document.querySelector("[data-id='1'] input.edit").value).toBe("edited");
        view.render("editItemDone", { id: 1, title: "saved" });
        expect(document.querySelector("[data-id='1'] label").textContent).toBe("saved");
        view.render("removeItem", 1);
        expect(document.querySelector("[data-id='1']")).toBeNull();
    });

    test("handles missing elements in element commands", () => {
        expect(() => view.render("elementComplete", { id: 999, completed: true })).not.toThrow();
        expect(() => view.render("editItem", { id: 999, title: "missing" })).not.toThrow();
        expect(() => view.render("editItemDone", { id: 999, title: "missing" })).not.toThrow();
        expect(() => view.render("removeItem", 999)).not.toThrow();
    });

    test("binds new, remove, toggle-all, edit, remove, and toggle events", () => {
        view.render("showEntries", [{ id: 1, title: "task", completed: false }]);
        const newTodo = jest.fn();
        const removeCompleted = jest.fn();
        const toggleAll = jest.fn();
        const itemEdit = jest.fn();
        const itemRemove = jest.fn();
        const itemToggle = jest.fn();
        view.bindCallback("newTodo", newTodo);
        view.bindCallback("removeCompleted", removeCompleted);
        view.bindCallback("toggleAll", toggleAll);
        view.bindCallback("itemEdit", itemEdit);
        view.bindCallback("itemRemove", itemRemove);
        view.bindCallback("itemToggle", itemToggle);

        const input = document.querySelector(".new-todo");
        input.value = "new";
        input.dispatchEvent(new Event("change", { bubbles: true }));
        document.querySelector(".clear-completed").click();
        document.querySelector(".toggle-all-label").click();
        document.querySelector("[data-id='1'] label").dispatchEvent(new MouseEvent("dblclick", { bubbles: true }));
        document.querySelector("[data-id='1'] .destroy").click();
        document.querySelector("[data-id='1'] .toggle").click();

        expect(newTodo).toHaveBeenCalledWith("new");
        expect(removeCompleted).toHaveBeenCalled();
        expect(toggleAll).toHaveBeenCalledWith({ completed: true });
        expect(itemEdit).toHaveBeenCalledWith({ id: 1 });
        expect(itemRemove).toHaveBeenCalledWith({ id: 1 });
        expect(itemToggle).toHaveBeenCalledWith({ id: 1, completed: true });
    });

    test("binds edit completion and cancellation keyboard paths", () => {
        view.render("showEntries", [{ id: 1, title: "task", completed: false }]);
        const done = jest.fn();
        const cancel = jest.fn();
        view.bindCallback("itemEditDone", done);
        view.bindCallback("itemEditCancel", cancel);
        view.render("editItem", { id: 1, title: "task" });
        const input = document.querySelector(".edit");
        input.value = "saved";
        input.dispatchEvent(keyboardEvent("keypress", 65));
        input.dispatchEvent(keyboardEvent("keypress", 13));
        expect(done).toHaveBeenCalledWith({ id: 1, title: "saved" });
        view.render("editItem", { id: 1, title: "task" });
        const canceled = document.querySelector(".edit");
        canceled.dispatchEvent(keyboardEvent("keyup", 65));
        canceled.dispatchEvent(keyboardEvent("keyup", 27));

        expect(cancel).toHaveBeenCalledWith({ id: 1 });
        expect(done).toHaveBeenCalledTimes(1);
    });
});
