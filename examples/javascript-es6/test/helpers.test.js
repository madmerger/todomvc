import { $delegate, $on, $parent, qsa, qs, remove } from "../src/helpers";

describe("helpers", () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <div class="scope">
                <div class="ancestor">
                    <button class="first">first</button>
                    <button class="second">second</button>
                </div>
            </div>
        `;
    });

    it("queries the document and an optional scope", () => {
        const scope = qs(".scope");

        expect(qs(".first")).toBe(scope.querySelector(".first"));
        expect(qs(".first", scope)).toBe(scope.querySelector(".first"));
        expect(qsa("button")).toHaveLength(2);
        expect(qsa("button", scope)).toHaveLength(2);
    });

    it("registers event handlers with $on", () => {
        const handler = vi.fn();
        const button = qs(".first");

        $on(button, "click", handler);
        button.dispatchEvent(new Event("click"));

        expect(handler).toHaveBeenCalledOnce();
    });

    it("delegates events only to matching elements", () => {
        const scope = qs(".scope");
        const handler = vi.fn();
        $delegate(scope, ".first", "click", handler);

        qs(".first").dispatchEvent(new Event("click", { bubbles: true }));
        qs(".second").dispatchEvent(new Event("click", { bubbles: true }));

        expect(handler).toHaveBeenCalledOnce();
        expect(handler.mock.instances[0]).toBe(qs(".first"));
    });

    it("delegates blur events with capture", () => {
        const scope = qs(".scope");
        const handler = vi.fn();
        $delegate(scope, ".first", "blur", handler);

        qs(".first").dispatchEvent(new Event("blur", { bubbles: false }));

        expect(handler).toHaveBeenCalledOnce();
    });

    it("finds direct parents and ancestors, and returns undefined at root", () => {
        const button = qs(".first");
        const ancestor = qs(".ancestor");

        expect($parent(button, "div")).toBe(ancestor);
        expect($parent(button, "body")).toBe(document.body);
        expect($parent(document.createElement("div"), "body")).toBeUndefined();
    });

    it("removes present items and leaves absent items unchanged", () => {
        const values = [1, 2, 3];

        expect(remove(values, 2)).toEqual([2]);
        expect(values).toEqual([1, 3]);
        expect(remove(values, 9)).toBe(values);
        expect(values).toEqual([1, 3]);
    });
});
