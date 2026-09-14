import Template from "../template";

describe("Template", () => {
    const template = new Template();

    test("renders completed and active items", () => {
        const html = template.show([
            { id: 1, title: "active", completed: false },
            { id: 2, title: "done", completed: true },
        ]);

        expect(html).toContain('<li data-id="1" class="">');
        expect(html).toContain('<li data-id="2" class="completed">');
        expect(html).toContain('<input class="toggle" type="checkbox" >');
        expect(html).toContain('<input class="toggle" type="checkbox" checked>');
        expect(template.show([])).toBe("");
    });

    test("escapes HTML characters using the implementation's output", () => {
        const html = template.show([{ id: 1, title: "&<>'\"`", completed: false }]);

        expect(html).toContain("&amp&lt&gt&#x27&quot&#x60");
    });

    test("renders item and completed counters", () => {
        expect(template.itemCounter(0)).toBe("残り <strong>0</strong> 件");
        expect(template.itemCounter(2)).toBe("残り <strong>2</strong> 件");
        expect(template.clearCompletedButton(1)).toBe("完了したタスクを削除");
        expect(template.clearCompletedButton(0)).toBe("");
    });
});
