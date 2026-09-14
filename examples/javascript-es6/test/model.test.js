import Model from "../src/model";

describe("Model", () => {
    let storage;
    let model;

    beforeEach(() => {
        storage = {
            save: jest.fn(),
            find: jest.fn(),
            findAll: jest.fn(),
            remove: jest.fn(),
            drop: jest.fn(),
        };
        model = new Model(storage);
    });

    it("create はタイトルを trim して未完了の todo を保存する", () => {
        const callback = jest.fn();
        model.create("  買い物  ", callback);

        expect(storage.save).toHaveBeenCalledWith({ title: "買い物", completed: false }, callback);
    });

    it("create はタイトル未指定なら空文字として扱う", () => {
        model.create();

        expect(storage.save).toHaveBeenCalledWith({ title: "", completed: false }, undefined);
    });

    it("read に関数のみを渡すと全件取得する", () => {
        const callback = jest.fn();
        model.read(callback);

        expect(storage.findAll).toHaveBeenCalledWith(callback);
    });

    it("read に数値を渡すと ID で検索する", () => {
        const callback = jest.fn();
        model.read(3, callback);

        expect(storage.find).toHaveBeenCalledWith({ id: 3 }, callback);
    });

    it("read に文字列を渡すと数値の ID に変換して検索する", () => {
        const callback = jest.fn();
        model.read("3", callback);

        expect(storage.find).toHaveBeenCalledWith({ id: 3 }, callback);
    });

    it("read にオブジェクトを渡すとそのままクエリとして検索する", () => {
        const callback = jest.fn();
        model.read({ completed: true }, callback);

        expect(storage.find).toHaveBeenCalledWith({ completed: true }, callback);
    });

    it("update は ID 付きで保存する", () => {
        const callback = jest.fn();
        model.update(1, { title: "更新" }, callback);

        expect(storage.save).toHaveBeenCalledWith({ title: "更新" }, callback, 1);
    });

    it("remove はストレージの remove を呼ぶ", () => {
        const callback = jest.fn();
        model.remove(1, callback);

        expect(storage.remove).toHaveBeenCalledWith(1, callback);
    });

    it("removeAll はストレージを drop する", () => {
        const callback = jest.fn();
        model.removeAll(callback);

        expect(storage.drop).toHaveBeenCalledWith(callback);
    });

    it("getCount は未完了・完了・合計件数を集計する", () => {
        storage.findAll.mockImplementation((cb) =>
            cb([
                { id: 1, title: "A", completed: false },
                { id: 2, title: "B", completed: true },
                { id: 3, title: "C", completed: false },
            ])
        );

        const callback = jest.fn();
        model.getCount(callback);

        expect(callback).toHaveBeenCalledWith({ active: 2, completed: 1, total: 3 });
    });

    it("getCount はコールバックがなければ何もしない", () => {
        model.getCount();

        expect(storage.findAll).not.toHaveBeenCalled();
    });
});
