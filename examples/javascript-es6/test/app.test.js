import { vi } from "vitest";
import { qs, qsa } from "../src/helpers";
import { setupDom } from "./fixture";

const registeredListeners = [];

const loadApp = async () => {
    const addEventListener = window.addEventListener.bind(window);
    vi.spyOn(window, "addEventListener").mockImplementation((type, listener, options) => {
        registeredListeners.push([type, listener, options]);
        addEventListener(type, listener, options);
    });

    vi.resetModules();
    await import("../src/app");

    window.addEventListener.mockRestore();
    window.dispatchEvent(new Event("load"));
};

describe("app", () => {
    beforeEach(() => {
        setupDom();
        document.location.hash = "";
        vi.resetModules();
    });

    afterEach(() => {
        // アプリは window にリスナーを登録するため、テスト間で持ち越さないよう解除する
        while (registeredListeners.length) {
            const [type, listener, options] = registeredListeners.pop();
            window.removeEventListener(type, listener, options);
        }
    });

    it("読み込み時にアプリを初期化して空のリストを描画する", async () => {
        await loadApp();

        expect(qsa(".todo-list li")).toHaveLength(0);
        expect(qs(".todo-count").textContent).toBe("残り 0 件");
        expect(qs('.filters [href="#/"]').className).toBe("selected");
    });

    it("入力欄からタスクを追加できる", async () => {
        await loadApp();

        qs(".new-todo").value = "牛乳を買う";
        qs(".new-todo").dispatchEvent(new Event("change"));

        expect(qsa(".todo-list li")).toHaveLength(1);
        expect(qs(".todo-list label").textContent).toBe("牛乳を買う");
        expect(qs(".new-todo").value).toBe("");
    });

    it("ハッシュ変更でフィルターを切り替える", async () => {
        await loadApp();
        qs(".new-todo").value = "未完了のタスク";
        qs(".new-todo").dispatchEvent(new Event("change"));
        qs(".todo-list .toggle").click();

        document.location.hash = "#/active";
        window.dispatchEvent(new Event("hashchange"));

        expect(qsa(".todo-list li")).toHaveLength(0);
        expect(qs('.filters [href="#/active"]').className).toBe("selected");

        document.location.hash = "#/completed";
        window.dispatchEvent(new Event("hashchange"));

        expect(qsa(".todo-list li")).toHaveLength(1);
    });
});
