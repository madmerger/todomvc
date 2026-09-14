describe("Store", () => {
    let Store;
    let store;

    beforeEach(() => {
        jest.resetModules();
        Store = require("../src/store").default;
        store = new Store("todos-javascript-es6");
    });

    it("初期化時に空のコレクションを作成する", () => {
        const callback = jest.fn();
        store.findAll(callback);

        expect(callback).toHaveBeenCalledWith([]);
    });

    it("コンストラクターのコールバックに現在のデータを渡す", () => {
        const callback = jest.fn();
        new Store("todos-javascript-es6", callback);

        expect(callback).toHaveBeenCalledWith({ todos: [] });
    });

    it("既存のコレクションがある場合は初期化し直さない", () => {
        store.save({ title: "既存", completed: false });

        const callback = jest.fn();
        new Store("todos-javascript-es6", callback);

        expect(callback.mock.calls[0][0].todos).toHaveLength(1);
    });

    it("save で新しい todo に一意の ID を採番する", () => {
        const first = jest.fn();
        const second = jest.fn();

        store.save({ title: "A", completed: false }, first);
        store.save({ title: "B", completed: false }, second);

        const firstId = first.mock.calls[0][0][0].id;
        const secondId = second.mock.calls[0][0][0].id;

        expect(typeof firstId).toBe("number");
        expect(secondId).toBe(firstId + 1);
    });

    it("ID を指定した save は既存の todo を更新する", () => {
        let id;
        store.save({ title: "A", completed: false }, (todos) => (id = todos[0].id));

        const callback = jest.fn();
        store.save({ title: "A+", completed: true }, callback, id);

        expect(callback).toHaveBeenCalledWith([{ id, title: "A+", completed: true }]);
    });

    it("存在しない ID を指定した save は何も変更しない", () => {
        store.save({ title: "A", completed: false });

        const callback = jest.fn();
        store.save({ title: "更新されない" }, callback, 9999);

        expect(callback.mock.calls[0][0][0].title).toBe("A");
    });

    it("コールバックなしでも save / remove / drop / find が例外を投げない", () => {
        expect(() => {
            store.save({ title: "A", completed: false });
            store.save({ title: "B", completed: false }, undefined, 1);
            store.find({ completed: false });
            store.findAll();
            store.remove(1);
            store.drop();
        }).not.toThrow();
    });

    it("find はクエリに一致する todo だけを返す", () => {
        store.save({ title: "A", completed: false });
        store.save({ title: "B", completed: true });

        const callback = jest.fn();
        store.find({ completed: true }, callback);

        expect(callback.mock.calls[0][0]).toHaveLength(1);
        expect(callback.mock.calls[0][0][0].title).toBe("B");
    });

    it("remove は指定した todo を削除する", () => {
        let id;
        store.save({ title: "A", completed: false }, (todos) => (id = todos[0].id));
        store.save({ title: "B", completed: false });

        const callback = jest.fn();
        store.remove(id, callback);

        expect(callback.mock.calls[0][0]).toHaveLength(1);
        expect(callback.mock.calls[0][0][0].title).toBe("B");
    });

    it("存在しない ID の remove は何も削除しない", () => {
        store.save({ title: "A", completed: false });

        const callback = jest.fn();
        store.remove(9999, callback);

        expect(callback.mock.calls[0][0]).toHaveLength(1);
    });

    it("drop はすべてのデータを削除する", () => {
        store.save({ title: "A", completed: false });

        const callback = jest.fn();
        store.drop(callback);

        expect(callback).toHaveBeenCalledWith([]);
    });

    it("名前空間ごとにデータを分離して保持する", () => {
        const other = new Store("todos-other");
        store.save({ title: "A", completed: false });

        const callback = jest.fn();
        other.findAll(callback);

        expect(callback).toHaveBeenCalledWith([]);
    });
});
