import { qs, qsa, $on, $delegate, $parent, remove } from "../src/helpers";
import { setupDom } from "./fixture";

describe("helpers", () => {
    beforeEach(setupDom);

    it("qs and qsa query the document by default and within a scope", () => {
        expect(qs(".new-todo")).not.toBeNull();
        expect(qsa(".filters li")).toHaveLength(3);
        expect(qsa("a", qs(".filters"))).toHaveLength(3);
        expect(qs("a", qs(".filters")).getAttribute("href")).toBe("#/");
    });

    it("$on registers an event listener", () => {
        const handler = jest.fn();
        const button = qs(".clear-completed");

        $on(button, "click", handler);
        button.click();

        expect(handler).toHaveBeenCalledTimes(1);
    });

    it("$on supports capture", () => {
        const handler = jest.fn();
        $on(qs(".todo-list"), "focus", handler, true);

        qs(".todo-list").dispatchEvent(new Event("focus"));
        expect(handler).toHaveBeenCalled();
    });

    it("$delegate only calls the handler for matching descendants", () => {
        const list = qs(".todo-list");
        list.innerHTML = `<li data-id="1"><button class="destroy"></button><span class="other"></span></li>`;
        const handler = jest.fn();

        $delegate(list, ".destroy", "click", handler);

        qs(".other", list).click();
        expect(handler).not.toHaveBeenCalled();

        qs(".destroy", list).click();
        expect(handler).toHaveBeenCalledTimes(1);
    });

    it("$delegate uses capture for blur events", () => {
        const list = qs(".todo-list");
        list.innerHTML = `<li data-id="1"><input class="edit" /></li>`;
        const handler = jest.fn();

        $delegate(list, "li .edit", "blur", handler);
        qs(".edit", list).dispatchEvent(new Event("blur"));

        expect(handler).toHaveBeenCalledTimes(1);
    });

    it("$parent walks up the tree and returns undefined at the root", () => {
        const list = qs(".todo-list");
        list.innerHTML = `<li data-id="7"><div class="view"><label>x</label></div></li>`;

        expect($parent(qs("label", list), "li").dataset.id).toBe("7");
        expect($parent(qs("label", list), "LI").dataset.id).toBe("7");
        expect($parent(document.createElement("div"), "li")).toBeUndefined();
    });

    it("remove deletes an existing entry and leaves the array alone otherwise", () => {
        const array = [1, 2, 3];

        remove(array, 2);
        expect(array).toEqual([1, 3]);

        expect(remove(array, 99)).toEqual([1, 3]);
        expect(array).toEqual([1, 3]);
    });

    it("makes NodeList iterable with forEach", () => {
        const seen = [];
        qsa(".filters a").forEach((node) => seen.push(node.getAttribute("href")));

        expect(seen).toEqual(["#/", "#/active", "#/completed"]);
    });
});
