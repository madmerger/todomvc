import { vi } from "vitest";
import { qs, qsa, $on, $delegate, $parent, remove } from "../src/helpers";
import { setupDom } from "./fixture";

describe("helpers", () => {
    beforeEach(() => {
        setupDom();
    });

    describe("qs / qsa", () => {
        it("document を既定のスコープとして要素を返す", () => {
            expect(qs(".new-todo")).toBe(document.querySelector(".new-todo"));
            expect(qsa("li").length).toBe(3);
        });

        it("スコープを渡すとその配下のみ検索する", () => {
            const footer = qs(".footer");

            expect(qs(".new-todo", footer)).toBeNull();
            expect(qsa("a", footer).length).toBe(3);
        });
    });

    describe("$on", () => {
        it("イベントリスナーを登録する", () => {
            const handler = vi.fn();
            const button = qs(".clear-completed");

            $on(button, "click", handler);
            button.click();

            expect(handler).toHaveBeenCalledTimes(1);
        });

        it("useCapture を真偽値へ変換して渡す", () => {
            const target = { addEventListener: vi.fn() };
            const handler = vi.fn();

            $on(target, "click", handler);
            $on(target, "click", handler, "truthy");

            expect(target.addEventListener).toHaveBeenNthCalledWith(1, "click", handler, false);
            expect(target.addEventListener).toHaveBeenNthCalledWith(2, "click", handler, true);
        });
    });

    describe("$delegate", () => {
        it("セレクターに一致する要素のイベントだけ処理する", () => {
            const list = qs(".todo-list");
            list.innerHTML = `<li><button class="destroy"></button><span></span></li>`;
            const handler = vi.fn();

            $delegate(list, ".destroy", "click", handler);

            qs(".destroy", list).click();
            expect(handler).toHaveBeenCalledTimes(1);

            qs("span", list).dispatchEvent(new Event("click", { bubbles: true }));
            expect(handler).toHaveBeenCalledTimes(1);
        });

        it("blur と focus はキャプチャーフェーズで購読する", () => {
            const list = qs(".todo-list");
            const spy = vi.spyOn(list, "addEventListener");

            $delegate(list, ".edit", "blur", vi.fn());
            $delegate(list, ".edit", "click", vi.fn());

            expect(spy.mock.calls[0][2]).toBe(true);
            expect(spy.mock.calls[1][2]).toBe(false);
        });
    });

    describe("$parent", () => {
        it("指定したタグ名の祖先要素を返す", () => {
            const list = qs(".todo-list");
            list.innerHTML = `<li data-id="42"><div class="view"><label>foo</label></div></li>`;
            const label = qs("label", list);

            expect($parent(label, "li")).toBe(qs("li", list));
            expect($parent(label, "DIV")).toBe(qs(".view", list));
        });

        it("親を持たない要素には undefined を返す", () => {
            expect($parent(document.createElement("div"), "li")).toBeUndefined();
        });
    });

    describe("remove", () => {
        it("要素を配列から取り除く", () => {
            const array = [1, 2, 3];

            remove(array, 2);

            expect(array).toEqual([1, 3]);
        });

        it("存在しない要素の場合は配列を変更しない", () => {
            const array = [1, 2, 3];

            expect(remove(array, 9)).toBe(array);
            expect(array).toEqual([1, 2, 3]);
        });
    });

    it("NodeList で forEach を使えるようにする", () => {
        const visited = [];

        qsa(".filters a").forEach((node) => visited.push(node.textContent));

        expect(visited).toEqual(["すべて", "未完了", "完了"]);
    });
});
