import Template from "../src/template";
import View from "../src/view";

const fixture = () => `
    <section class="todoapp">
        <input class="new-todo" />
        <input class="toggle-all" type="checkbox" />
        <label class="toggle-all-label"></label>
        <main class="main"><ul class="todo-list"></ul></main>
        <footer class="footer">
            <span class="todo-count"></span>
            <ul class="filters">
                <li><a href="#/" class="selected">all</a></li>
                <li><a href="#/active">active</a></li>
                <li><a href="#/completed">completed</a></li>
            </ul>
            <button class="clear-completed"></button>
        </footer>
    </section>
`;

const keyEvent = (type, keyCode) => {
    const event = new Event(type, { bubbles: true });
    Object.defineProperty(event, "keyCode", { value: keyCode });
    return event;
};

describe("View", () => {
    let view;

    beforeEach(() => {
        document.body.innerHTML = fixture();
        view = new View(new Template());
    });

    it("renders entries, counts, visibility, toggles, and a cleared input", () => {
        view.render("showEntries", [{ id: 1, title: "task", completed: false }]);
        expect(document.querySelector(".todo-list li").dataset.id).toBe("1");

        view.render("updateElementCount", 2);
        expect(document.querySelector(".todo-count").innerHTML).toBe("残り <strong>2</strong> 件");

        view.render("contentBlockVisibility", { visible: true });
        expect(document.querySelector(".main").style.display).toBe("block");
        expect(document.querySelector(".footer").style.display).toBe("block");
        view.render("contentBlockVisibility", { visible: false });
        expect(document.querySelector(".main").style.display).toBe("none");

        const toggle = document.querySelector(".toggle-all");
        view.render("toggleAll", { checked: true });
        expect(toggle.checked).toBe(true);
        document.querySelector(".new-todo").value = "temporary";
        view.render("clearNewTodo");
        expect(document.querySelector(".new-todo").value).toBe("");
    });

    it("renders completion, editing, removal, filter, and clear-completed commands", () => {
        view.render("showEntries", [{ id: 1, title: "task", completed: false }]);
        view.render("elementComplete", { id: 1, completed: true });
        expect(document.querySelector("li").className).toBe("completed");
        expect(document.querySelector(".toggle").checked).toBe(true);
        view.render("elementComplete", { id: 1, completed: false });
        expect(document.querySelector("li").className).toBe("");

        view.render("editItem", { id: 1, title: "task" });
        expect(document.querySelector("li").className).toContain("editing");
        expect(document.querySelector("input.edit").value).toBe("task");
        view.render("editItemDone", { id: 1, title: "updated" });
        expect(document.querySelector("input.edit")).toBeNull();
        expect(document.querySelector("li label").textContent).toBe("updated");

        view.render("setFilter", "active");
        expect(document.querySelector('.filters [href="#/active"]').className).toBe("selected");
        view.render("clearCompletedButton", { completed: 2, visible: true });
        expect(document.querySelector(".clear-completed").innerHTML).toBe("完了したタスクを削除");
        expect(document.querySelector(".clear-completed").style.display).toBe("block");
        view.render("clearCompletedButton", { completed: 0, visible: false });
        expect(document.querySelector(".clear-completed").innerHTML).toBe("");
        expect(document.querySelector(".clear-completed").style.display).toBe("none");

        view.render("removeItem", 1);
        expect(document.querySelector(".todo-list li")).toBeNull();
        view.render("removeItem", 99);
    });

    it("returns early for commands targeting missing list items", () => {
        view.render("elementComplete", { id: 1, completed: true });
        view.render("editItem", { id: 1, title: "missing" });
        view.render("editItemDone", { id: 1, title: "missing" });
        view.render("removeItem", 1);
    });

    it("binds all callbacks and dispatches their DOM events", () => {
        const handlers = {
            newTodo: vi.fn(),
            removeCompleted: vi.fn(),
            toggleAll: vi.fn(),
            itemEdit: vi.fn(),
            itemRemove: vi.fn(),
            itemToggle: vi.fn(),
            itemEditDone: vi.fn(),
            itemEditCancel: vi.fn(),
        };

        Object.entries(handlers).forEach(([event, handler]) => view.bindCallback(event, handler));
        const input = document.querySelector(".new-todo");
        input.value = "new title";
        input.dispatchEvent(new Event("change"));
        document.querySelector(".clear-completed").dispatchEvent(new Event("click"));
        document.querySelector(".toggle-all-label").dispatchEvent(new Event("click", { bubbles: true }));

        view.render("showEntries", [{ id: 7, title: "task", completed: false }]);
        const item = document.querySelector("li");
        item.querySelector("label").dispatchEvent(new Event("dblclick", { bubbles: true }));
        item.querySelector(".destroy").dispatchEvent(new Event("click", { bubbles: true }));
        const toggle = item.querySelector(".toggle");
        toggle.checked = true;
        toggle.dispatchEvent(new Event("click", { bubbles: true }));

        view.render("editItem", { id: 7, title: "task" });
        const edit = item.querySelector("input.edit");
        edit.value = "changed";
        edit.dispatchEvent(new Event("blur", { bubbles: false }));
        view.render("editItemDone", { id: 7, title: "changed" });

        view.render("editItem", { id: 7, title: "task" });
        const enterEdit = item.querySelector("input.edit");
        enterEdit.value = "entered";
        enterEdit.dispatchEvent(keyEvent("keypress", 13));
        view.render("editItemDone", { id: 7, title: "entered" });

        view.render("editItem", { id: 7, title: "task" });
        const canceledEdit = item.querySelector("input.edit");
        canceledEdit.dispatchEvent(keyEvent("keyup", 27));

        expect(handlers.newTodo).toHaveBeenCalledWith("new title");
        expect(handlers.removeCompleted).toHaveBeenCalledOnce();
        expect(handlers.toggleAll).toHaveBeenCalledWith({ completed: true });
        expect(handlers.itemEdit).toHaveBeenCalledWith({ id: 7 });
        expect(handlers.itemRemove).toHaveBeenCalledWith({ id: 7 });
        expect(handlers.itemToggle).toHaveBeenCalledWith({ id: 7, completed: true });
        expect(handlers.itemEditDone).toHaveBeenNthCalledWith(1, { id: 7, title: "changed" });
        expect(handlers.itemEditDone).toHaveBeenNthCalledWith(2, { id: 7, title: "entered" });
        expect(handlers.itemEditCancel).toHaveBeenCalledWith({ id: 7 });
        expect(handlers.itemEditDone).toHaveBeenCalledTimes(2);
    });
});
