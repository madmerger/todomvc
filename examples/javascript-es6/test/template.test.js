import { beforeEach, describe, expect, it } from "vitest";
import Template from "../src/template";

let template;

beforeEach(() => {
    template = new Template();
});

describe("Template#show", () => {
    it("renders an empty string for no todos", () => {
        expect(template.show([]).trim()).toBe("");
    });

    it("renders an active todo without completed markers", () => {
        const html = template.show([{ id: 1, title: "buy milk", completed: false }]);

        expect(html).toContain('data-id="1"');
        expect(html).toContain('class=""');
        expect(html).toContain("<label>buy milk</label>");
        expect(html).not.toContain("checked");
    });

    it("marks completed todos as completed and checked", () => {
        const html = template.show([{ id: 2, title: "done", completed: true }]);

        expect(html).toContain('class="completed"');
        expect(html).toContain('type="checkbox" checked');
    });

    it("renders every todo passed in", () => {
        const html = template.show([
            { id: 1, title: "a", completed: false },
            { id: 2, title: "b", completed: false },
        ]);

        expect(html.match(/<li /g)).toHaveLength(2);
    });

    it("escapes html in the title", () => {
        const html = template.show([{ id: 1, title: "<script>alert('x')</script>", completed: false }]);

        expect(html).not.toContain("<script>");
        expect(html).toContain("&lt");
    });

    it("leaves titles without html untouched", () => {
        const html = template.show([{ id: 1, title: "plain title", completed: false }]);

        expect(html).toContain("<label>plain title</label>");
    });

    it("handles an empty title", () => {
        const html = template.show([{ id: 1, title: "", completed: false }]);

        expect(html).toContain("<label></label>");
    });
});

describe("Template#itemCounter", () => {
    it("pluralizes zero items", () => {
        expect(template.itemCounter(0)).toBe("<strong>0</strong> items left");
    });

    it("uses the singular form for one item", () => {
        expect(template.itemCounter(1)).toBe("<strong>1</strong> item left");
    });

    it("pluralizes more than one item", () => {
        expect(template.itemCounter(2)).toBe("<strong>2</strong> items left");
    });
});

describe("Template#clearCompletedButton", () => {
    it("returns the label when there are completed todos", () => {
        expect(template.clearCompletedButton(1)).toBe("Clear completed");
    });

    it("returns an empty string when nothing is completed", () => {
        expect(template.clearCompletedButton(0)).toBe("");
    });
});
