import Template from "../src/template";

describe("Template", () => {
    let template;

    beforeEach(() => {
        template = new Template();
    });

    it("renders todo list items and marks completed items", () => {
        const output = template.show([
            { id: 1, title: "active", completed: false },
            { id: 2, title: "done", completed: true },
        ]);

        expect(output).toContain('<li data-id="1" class="">');
        expect(output).toContain('<li data-id="2" class="completed">');
        expect(output).toContain('<input class="toggle" type="checkbox" >');
        expect(output).toContain('<input class="toggle" type="checkbox" checked>');
    });

    it("escapes todo titles using the source escape map", () => {
        const output = template.show([
            { id: 1, title: `& < > " ' \``, completed: false },
        ]);

        expect(output).toContain("&amp &lt &gt &quot &#x27 &#x60");
    });

    it("returns an empty string for an empty todo list", () => {
        expect(template.show([])).toBe("");
    });

    it("renders the Japanese counter and clear-completed labels", () => {
        expect(template.itemCounter(3)).toBe("残り <strong>3</strong> 件");
        expect(template.clearCompletedButton(2)).toBe("完了したタスクを削除");
        expect(template.clearCompletedButton(0)).toBe("");
    });
});
