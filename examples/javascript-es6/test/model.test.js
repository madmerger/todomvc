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

    describe("create", () => {
        it("題名の前後の空白を除いて保存する", () => {
            const callback = jest.fn();

            model.create("  買い物  ", callback);

            expect(storage.save).toHaveBeenCalledWith({ title: "買い物", completed: false }, callback);
        });

        it("題名が無い場合は空文字で作成する", () => {
            model.create();

            expect(storage.save).toHaveBeenCalledWith({ title: "", completed: false }, undefined);
        });
    });

    describe("read", () => {
        it("関数のみ渡すと全件取得する", () => {
            const callback = jest.fn();

            model.read(callback);

            expect(storage.findAll).toHaveBeenCalledWith(callback);
        });

        it("文字列や数値は ID として検索する", () => {
            const callback = jest.fn();

            model.read("3", callback);
            model.read(7, callback);

            expect(storage.find).toHaveBeenNthCalledWith(1, { id: 3 }, callback);
            expect(storage.find).toHaveBeenNthCalledWith(2, { id: 7 }, callback);
        });

        it("オブジェクトはクエリーとして検索する", () => {
            const callback = jest.fn();

            model.read({ completed: true }, callback);

            expect(storage.find).toHaveBeenCalledWith({ completed: true }, callback);
        });
    });

    it("update は ID 付きで保存する", () => {
        const callback = jest.fn();

        model.update(1, { title: "更新" }, callback);

        expect(storage.save).toHaveBeenCalledWith({ title: "更新" }, callback, 1);
    });

    it("remove はストレージの削除を呼ぶ", () => {
        const callback = jest.fn();

        model.remove(2, callback);

        expect(storage.remove).toHaveBeenCalledWith(2, callback);
    });

    it("removeAll はストレージを破棄する", () => {
        const callback = jest.fn();

        model.removeAll(callback);

        expect(storage.drop).toHaveBeenCalledWith(callback);
    });

    describe("getCount", () => {
        it("未完了・完了・合計を数える", () => {
            storage.findAll.mockImplementation((cb) =>
                cb([
                    { completed: true },
                    { completed: false },
                    { completed: false },
                ])
            );
            const callback = jest.fn();

            model.getCount(callback);

            expect(callback).toHaveBeenCalledWith({ active: 2, completed: 1, total: 3 });
        });

        it("コールバックが無ければ何もしない", () => {
            expect(model.getCount()).toBeUndefined();
            expect(storage.findAll).not.toHaveBeenCalled();
        });
    });
});
