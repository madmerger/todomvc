import Template from "../src/template";

describe("Template", () => {
    let template;

    beforeEach(() => {
        template = new Template();
    });

    it("show は todo ごとに li 要素を生成する", () => {
        const html = template.show([
            { id: 1, title: "A", completed: false },
            { id: 2, title: "B", completed: true },
        ]);

        expect(html).toContain('data-id="1"');
        expect(html).toContain("<label>A</label>");
        expect(html).toContain('data-id="2"');
        expect(html).toContain('class="completed"');
        expect(html).toContain("checked");
    });

    it("show は未完了の todo に completed / checked を付けない", () => {
        const html = template.show([{ id: 1, title: "A", completed: false }]);

        expect(html).toContain('class=""');
        expect(html).not.toContain("checked>");
    });

    it("show は HTML 特殊文字をエスケープする", () => {
        const html = template.show([{ id: 1, title: "<script>&\"'`", completed: false }]);

        expect(html).not.toContain("<script>");
        expect(html).toContain("&lt");
        expect(html).toContain("&amp");
        expect(html).toContain("&quot");
        expect(html).toContain("&#x27");
        expect(html).toContain("&#x60");
    });

    it("show はエスケープ不要なタイトルをそのまま出力する", () => {
        const html = template.show([{ id: 1, title: "ふつうのタスク", completed: false }]);

        expect(html).toContain("<label>ふつうのタスク</label>");
    });

    it("show は空の配列に対して空文字を返す", () => {
        expect(template.show([])).toBe("");
    });

    it("itemCounter は残り件数を表示する", () => {
        expect(template.itemCounter(0)).toBe("残り <strong>0</strong> 件");
        expect(template.itemCounter(1)).toBe("残り <strong>1</strong> 件");
        expect(template.itemCounter(2)).toBe("残り <strong>2</strong> 件");
    });

    it("clearCompletedButton は完了済みがある場合だけラベルを返す", () => {
        expect(template.clearCompletedButton(0)).toBe("");
        expect(template.clearCompletedButton(3)).toBe("完了したタスクを削除");
    });
});
