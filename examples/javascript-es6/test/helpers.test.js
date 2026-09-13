import { beforeEach, describe, expect, it, vi } from "vitest";
import { $delegate, $on, $parent, qs, qsa, remove } from "../src/helpers";

beforeEach(() => {
    document.body.innerHTML = `
        <div id="root">
            <ul class="list">
                <li class="item" data-id="1"><label>one</label><button class="destroy"></button></li>
                <li class="item" data-id="2"><label>two</label><button class="destroy"></button></li>
            </ul>
        </div>
    `;
});

describe("qs / qsa", () => {
    it("queries a single element in the document", () => {
        expect(qs(".list").tagName).toBe("UL");
    });

    it("queries within a scope", () => {
        const item = qs('[data-id="2"]');

        expect(qs("label", item).textContent).toBe("two");
    });

    it("queries all matching elements", () => {
        expect(qsa(".item")).toHaveLength(2);
    });

    it("queries all matching elements within a scope", () => {
        expect(qsa("label", qs('[data-id="1"]'))).toHaveLength(1);
    });
});

describe("$on", () => {
    it("registers an event listener", () => {
        const handler = vi.fn();
        const button = qs(".destroy");

        $on(button, "click", handler);
        button.click();

        expect(handler).toHaveBeenCalledTimes(1);
    });

    it("registers a capturing listener", () => {
        const handler = vi.fn();

        $on(qs("#root"), "click", handler, true);
        qs(".destroy").click();

        expect(handler).toHaveBeenCalledTimes(1);
    });
});

describe("$delegate", () => {
    it("calls the handler for matching descendants", () => {
        const handler = vi.fn();

        $delegate(qs(".list"), ".destroy", "click", handler);
        qs('[data-id="2"] .destroy').click();

        expect(handler).toHaveBeenCalledTimes(1);
        expect(handler.mock.instances[0]).toBe(qs('[data-id="2"] .destroy'));
    });

    it("ignores events from non matching elements", () => {
        const handler = vi.fn();

        $delegate(qs(".list"), ".destroy", "click", handler);
        qs("label").click();

        expect(handler).not.toHaveBeenCalled();
    });

    it("delegates non bubbling events such as blur through capturing", () => {
        const handler = vi.fn();

        $delegate(qs(".list"), "label", "blur", handler);
        qs("label").dispatchEvent(new Event("blur", { bubbles: false }));

        expect(handler).toHaveBeenCalledTimes(1);
    });

    it("delegates to elements added after registration", () => {
        const handler = vi.fn();
        $delegate(qs(".list"), ".destroy", "click", handler);

        const item = document.createElement("li");
        item.innerHTML = '<button class="destroy"></button>';
        qs(".list").appendChild(item);
        qs("button", item).click();

        expect(handler).toHaveBeenCalledTimes(1);
    });
});

describe("$parent", () => {
    it("finds the closest parent with the given tag name", () => {
        const label = qs('[data-id="1"] label');

        expect($parent(label, "li")).toBe(qs('[data-id="1"]'));
    });

    it("walks up several levels", () => {
        const label = qs('[data-id="1"] label');

        expect($parent(label, "div")).toBe(qs("#root"));
    });

    it("is case insensitive", () => {
        const label = qs('[data-id="1"] label');

        expect($parent(label, "LI")).toBe(qs('[data-id="1"]'));
    });

    it("returns undefined for a detached element", () => {
        expect($parent(document.createElement("span"), "div")).toBeUndefined();
    });
});

describe("remove", () => {
    it("removes an existing entry", () => {
        const array = [1, 2, 3];

        remove(array, 2);

        expect(array).toEqual([1, 3]);
    });

    it("returns the array untouched when the entry is missing", () => {
        const array = [1, 2, 3];

        expect(remove(array, 4)).toBe(array);
        expect(array).toEqual([1, 2, 3]);
    });
});

describe("NodeList#forEach", () => {
    it("is available on node lists", () => {
        const ids = [];

        qsa(".item").forEach((item) => ids.push(item.dataset.id));

        expect(ids).toEqual(["1", "2"]);
    });
});
