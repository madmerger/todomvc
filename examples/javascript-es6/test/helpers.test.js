import { qs, qsa, $on, $delegate, $parent, remove } from "../src/helpers";

describe("helpers", () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <div id="root">
                <ul class="list">
                    <li data-id="1"><label class="item">A</label></li>
                    <li data-id="2"><label class="item">B</label></li>
                </ul>
            </div>
        `;
    });

    it("qs は document から要素を取得する", () => {
        expect(qs(".list").tagName).toBe("UL");
    });

    it("qs はスコープ内から要素を取得する", () => {
        const scope = qs('[data-id="2"]');

        expect(qs(".item", scope).textContent).toBe("B");
    });

    it("qsa は複数要素を取得する", () => {
        expect(qsa(".item")).toHaveLength(2);
        expect(qsa(".item", qs('[data-id="1"]'))).toHaveLength(1);
    });

    it("$on はイベントリスナーを登録する", () => {
        const handler = jest.fn();
        $on(qs(".list"), "click", handler);
        qs(".item").click();

        expect(handler).toHaveBeenCalled();
    });

    it("$on は useCapture を真偽値に変換して渡す", () => {
        const target = { addEventListener: jest.fn() };
        const handler = jest.fn();
        $on(target, "click", handler);
        $on(target, "click", handler, "yes");

        expect(target.addEventListener).toHaveBeenNthCalledWith(1, "click", handler, false);
        expect(target.addEventListener).toHaveBeenNthCalledWith(2, "click", handler, true);
    });

    it("$delegate はセレクターに一致する要素のイベントだけを処理する", () => {
        const handler = jest.fn();
        $delegate(qs(".list"), ".item", "click", handler);

        qs(".item").click();
        expect(handler).toHaveBeenCalledTimes(1);

        qs('[data-id="1"]').click();
        expect(handler).toHaveBeenCalledTimes(1);
    });

    it("$delegate は blur をキャプチャフェーズで登録する", () => {
        const target = { addEventListener: jest.fn() };
        $delegate(target, ".item", "blur", jest.fn());

        expect(target.addEventListener.mock.calls[0][2]).toBe(true);
    });

    it("$parent は指定したタグの祖先要素を返す", () => {
        const label = qs(".item");

        expect($parent(label, "li").dataset.id).toBe("1");
        expect($parent(label, "ul").className).toBe("list");
    });

    it("$parent は該当する祖先がなければ undefined を返す", () => {
        expect($parent(document.createElement("span"), "div")).toBeUndefined();
    });

    it("remove は配列から要素を取り除く", () => {
        const array = [1, 2, 3];
        remove(array, 2);

        expect(array).toEqual([1, 3]);
    });

    it("remove は存在しない要素の場合に配列をそのまま返す", () => {
        const array = [1, 2, 3];

        expect(remove(array, 9)).toBe(array);
        expect(array).toEqual([1, 2, 3]);
    });

    it("NodeList に forEach を生やす", () => {
        const titles = [];
        qsa(".item").forEach((el) => titles.push(el.textContent));

        expect(titles).toEqual(["A", "B"]);
    });
});
