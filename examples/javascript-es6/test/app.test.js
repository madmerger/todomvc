import { qs, qsa } from "../src/helpers";
import { setupDom } from "./fixture";

describe("app", () => {
    beforeEach(() => {
        jest.resetModules();
        setupDom();
        window.location.hash = "";
    });

    const load = () => {
        require("../src/app");
        window.dispatchEvent(new window.Event("load"));
    };

    it("load 時にアプリを初期化して一覧を描画する", () => {
        load();

        expect(qs(".todo-count").innerHTML).toBe("残り <strong>0</strong> 件");
        expect(qs('.filters [href="#/"]').className).toBe("selected");
    });

    it("初期化後に todo を追加できる", () => {
        load();

        qs(".new-todo").value = "アプリ経由のタスク";
        qs(".new-todo").dispatchEvent(new window.Event("change", { bubbles: true }));

        expect(qsa(".todo-list li")).toHaveLength(1);
        expect(qs(".todo-list li label").textContent).toBe("アプリ経由のタスク");
    });

    it("hashchange でフィルターを切り替える", () => {
        load();

        qs(".new-todo").value = "A";
        qs(".new-todo").dispatchEvent(new window.Event("change", { bubbles: true }));
        qs(".todo-list .toggle").click();

        window.location.hash = "#/active";
        window.dispatchEvent(new window.Event("hashchange"));

        expect(qsa(".todo-list li")).toHaveLength(0);
        expect(qs('.filters [href="#/active"]').className).toBe("selected");
    });
});
