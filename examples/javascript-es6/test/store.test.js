import Store from "../src/store";

const seed = (store, titles) => {
    const saved = [];

    for (const title of titles)
        store.save({ title, completed: false }, (items) => saved.push(items[0]));

    return saved;
};

describe("Store", () => {
    let store;

    beforeEach(() => {
        store = new Store("test-db");
        store.drop();
    });

    it("コレクションが無ければ空で初期化し、コールバックへ渡す", () => {
        const callback = jest.fn();

        new Store("fresh-db", callback);

        expect(callback).toHaveBeenCalledWith({ todos: [] });
    });

    it("既存のコレクションは初期化で上書きしない", () => {
        seed(store, ["既存"]);
        const callback = jest.fn();

        new Store("test-db", callback);

        expect(callback.mock.calls[0][0].todos).toHaveLength(1);
    });

    describe("save", () => {
        it("新規アイテムに一意な ID を採番して追加する", () => {
            const [first, second] = seed(store, ["一つ目", "二つ目"]);

            expect(first.id).toEqual(expect.any(Number));
            expect(second.id).toBe(first.id + 1);
        });

        it("ID 指定時は既存アイテムのプロパティーを更新する", () => {
            const [item] = seed(store, ["元の題名"]);
            const callback = jest.fn();

            store.save({ title: "新しい題名", completed: true }, callback, item.id);

            expect(callback.mock.calls[0][0]).toEqual([
                { id: item.id, title: "新しい題名", completed: true },
            ]);
        });

        it("存在しない ID の更新は何も変更しない", () => {
            seed(store, ["残るタスク"]);

            store.save({ title: "無視される" }, undefined, 9999);

            store.findAll((todos) => {
                expect(todos).toHaveLength(1);
                expect(todos[0].title).toBe("残るタスク");
            });
        });

        it("コールバックなしでも保存できる", () => {
            store.save({ title: "黙って保存", completed: false });

            store.findAll((todos) => expect(todos).toHaveLength(1));
        });
    });

    describe("find", () => {
        it("クエリーに一致するアイテムだけ返す", () => {
            const [active, completed] = seed(store, ["未完了", "完了"]);
            store.save({ completed: true }, undefined, completed.id);
            const callback = jest.fn();

            store.find({ completed: false }, callback);

            expect(callback.mock.calls[0][0]).toEqual([
                { id: active.id, title: "未完了", completed: false },
            ]);
        });

        it("複数条件をすべて満たすアイテムを返す", () => {
            const [item] = seed(store, ["対象"]);
            const callback = jest.fn();

            store.find({ id: item.id, completed: false }, callback);
            store.find({ id: item.id, completed: true }, callback);

            expect(callback.mock.calls[0][0]).toHaveLength(1);
            expect(callback.mock.calls[1][0]).toHaveLength(0);
        });

        it("コールバックが無ければ何もしない", () => {
            expect(store.find({ completed: true })).toBeUndefined();
        });
    });

    describe("findAll", () => {
        it("全アイテムを返す", () => {
            seed(store, ["A", "B"]);
            const callback = jest.fn();

            store.findAll(callback);

            expect(callback.mock.calls[0][0]).toHaveLength(2);
        });

        it("コールバックが無ければ何もしない", () => {
            expect(store.findAll()).toBeUndefined();
        });
    });

    describe("remove", () => {
        it("ID を指定してアイテムを削除する", () => {
            const [first, second] = seed(store, ["消す", "残す"]);
            const callback = jest.fn();

            store.remove(first.id, callback);

            expect(callback.mock.calls[0][0]).toEqual([
                { id: second.id, title: "残す", completed: false },
            ]);
        });

        it("一致する ID が無ければ何も削除しない", () => {
            seed(store, ["残る"]);
            const callback = jest.fn();

            store.remove(9999, callback);

            expect(callback.mock.calls[0][0]).toHaveLength(1);
        });

        it("コールバックなしでも削除できる", () => {
            const [item] = seed(store, ["消える"]);

            store.remove(item.id);

            store.findAll((todos) => expect(todos).toHaveLength(0));
        });
    });

    describe("drop", () => {
        it("全データを削除する", () => {
            seed(store, ["A", "B"]);
            const callback = jest.fn();

            store.drop(callback);

            expect(callback).toHaveBeenCalledWith([]);
        });

        it("コールバックなしでも削除できる", () => {
            seed(store, ["A"]);

            store.drop();

            store.findAll((todos) => expect(todos).toEqual([]));
        });
    });

    it("DB 名ごとにデータを分離する", () => {
        const other = new Store("other-db");
        other.drop();
        seed(store, ["こちらだけ"]);

        other.findAll((todos) => expect(todos).toEqual([]));
        store.findAll((todos) => expect(todos).toHaveLength(1));
    });
});
