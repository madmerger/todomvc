import Template from "../src/template";

describe("Template", () => {
    const template = new Template();

    it("renders an empty string for no todos", () => {
        expect(template.show([]).trim()).toBe("");
    });

    it("renders an active todo without the completed class", () => {
        const html = template.show([{ id: 1, title: "買い物", completed: false }]);

        expect(html).toContain('data-id="1"');
        expect(html).toContain("買い物");
        expect(html).not.toContain("completed");
        expect(html).not.toContain("checked");
    });

    it("marks completed todos as completed and checked", () => {
        const html = template.show([{ id: 2, title: "済", completed: true }]);

        expect(html).toContain('class="completed"');
        expect(html).toContain("checked");
    });

    it("escapes html in the title", () => {
        const html = template.show([{ id: 3, title: `<script>"x"&'y'\`z\`</script>`, completed: false }]);

        expect(html).not.toContain("<script>");
        expect(html).toContain("&lt");
        expect(html).toContain("&quot");
        expect(html).toContain("&#x27");
        expect(html).toContain("&#x60");
        expect(html).toContain("&amp");
    });

    it("leaves titles without special characters untouched", () => {
        expect(template.show([{ id: 4, title: "plain", completed: false }])).toContain(">plain<");
    });

    it("renders the item counter", () => {
        expect(template.itemCounter(0)).toBe("残り <strong>0</strong> 件");
        expect(template.itemCounter(1)).toBe("残り <strong>1</strong> 件");
        expect(template.itemCounter(2)).toBe("残り <strong>2</strong> 件");
    });

    it("renders the clear completed button only when there are completed todos", () => {
        expect(template.clearCompletedButton(0)).toBe("");
        expect(template.clearCompletedButton(3)).toBe("完了したタスクを削除");
    });
});
