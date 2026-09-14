import Template from "../src/template";

describe("Template", () => {
    let template;

    beforeEach(() => {
        template = new Template();
    });

    describe("show", () => {
        it("未完了のアイテムを li として描画する", () => {
            const html = template.show([{ id: 1, title: "掃除", completed: false }]);

            expect(html).toContain('data-id="1"');
            expect(html).toContain('class=""');
            expect(html).toContain("<label>掃除</label>");
            expect(html).not.toContain("checked");
        });

        it("完了済みのアイテムには completed と checked を付ける", () => {
            const html = template.show([{ id: 2, title: "洗濯", completed: true }]);

            expect(html).toContain('class="completed"');
            expect(html).toContain('type="checkbox" checked');
        });

        it("複数アイテムを渡された順に連結する", () => {
            const html = template.show([
                { id: 1, title: "一つ目", completed: false },
                { id: 2, title: "二つ目", completed: false },
            ]);

            expect(html.indexOf("一つ目")).toBeLessThan(html.indexOf("二つ目"));
        });

        it("HTML 特殊文字をエスケープする", () => {
            const html = template.show([
                { id: 1, title: `<script>"x" & 'y' \`z\``, completed: false },
            ]);

            expect(html).not.toContain("<script>");
            expect(html).toContain("&lt");
            expect(html).toContain("&quot");
            expect(html).toContain("&#x27");
            expect(html).toContain("&#x60");
            expect(html).toContain("&amp");
        });

        it("エスケープ不要な題名はそのまま使う", () => {
            const html = template.show([{ id: 1, title: "ふつうの題名", completed: false }]);

            expect(html).toContain("<label>ふつうの題名</label>");
        });

        it("空の題名でも描画できる", () => {
            const html = template.show([{ id: 1, title: "", completed: false }]);

            expect(html).toContain("<label></label>");
        });

        it("アイテムが無ければ空文字を返す", () => {
            expect(template.show([])).toBe("");
        });
    });

    it("itemCounter は残件数を返す", () => {
        expect(template.itemCounter(0)).toBe("残り <strong>0</strong> 件");
        expect(template.itemCounter(3)).toBe("残り <strong>3</strong> 件");
    });

    it("clearCompletedButton は完了が 1 件以上のときだけ文言を返す", () => {
        expect(template.clearCompletedButton(0)).toBe("");
        expect(template.clearCompletedButton(2)).toBe("完了したタスクを削除");
    });
});
