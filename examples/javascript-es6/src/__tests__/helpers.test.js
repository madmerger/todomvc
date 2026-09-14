import { $delegate, $on, $parent, qs, qsa, remove } from "../helpers";
import { loadFixture } from "./helpers/fixture";

describe("helpers", () => {
    beforeEach(() => loadFixture());

    test("queries elements and listens for events", () => {
        const input = qs(".new-todo");
        const listener = jest.fn();

        expect(input).toBe(document.querySelector(".new-todo"));
        expect(qsa(".new-todo")).toHaveLength(1);
        $on(input, "change", listener);
        input.dispatchEvent(new Event("change"));

        expect(listener).toHaveBeenCalledTimes(1);
    });

    test("delegates bubbling and captured events", () => {
        const list = qs(".todo-list");
        const item = document.createElement("li");
        const input = document.createElement("input");
        input.className = "edit";
        item.appendChild(input);
        list.appendChild(item);
        const clickHandler = jest.fn();
        const blurHandler = jest.fn();
        const focusHandler = jest.fn();

        $delegate(list, "li .edit", "click", clickHandler);
        $delegate(list, "li .edit", "blur", blurHandler);
        $delegate(list, "li .edit", "focus", focusHandler);
        input.dispatchEvent(new MouseEvent("click", { bubbles: true }));
        input.dispatchEvent(new FocusEvent("blur", { bubbles: true }));
        input.dispatchEvent(new FocusEvent("focus", { bubbles: true }));

        expect(clickHandler).toHaveBeenCalledWith(expect.any(MouseEvent));
        expect(blurHandler).toHaveBeenCalledWith(expect.any(FocusEvent));
        expect(focusHandler).toHaveBeenCalledWith(expect.any(FocusEvent));
        expect(clickHandler.mock.instances[0]).toBe(input);
    });

    test("delegation ignores nonmatching targets", () => {
        const list = qs(".todo-list");
        const input = document.createElement("input");
        list.appendChild(input);
        const handler = jest.fn();

        $delegate(list, ".edit", "click", handler);
        input.dispatchEvent(new MouseEvent("click", { bubbles: true }));

        expect(handler).not.toHaveBeenCalled();
    });

    test("finds parents recursively and handles detached elements", () => {
        const list = document.createElement("ul");
        const item = document.createElement("li");
        const label = document.createElement("label");
        item.appendChild(label);
        list.appendChild(item);

        expect($parent(label, "ul")).toBe(list);
        expect($parent(label, "LI")).toBe(item);
        expect($parent(document.createElement("span"), "li")).toBeUndefined();
    });

    test("removes matching array items and leaves misses unchanged", () => {
        const values = [1, 2, 3];
        const result = remove(values, 2);
        const unchanged = remove(values, 4);

        expect(result).toEqual([2]);
        expect(values).toEqual([1, 3]);
        expect(unchanged).toBe(values);
    });
});
