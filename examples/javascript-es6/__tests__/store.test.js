describe("Store", () => {
    let Store;

    beforeEach(() => {
        jest.resetModules();
        Store = require("../src/store").default;
    });

    const makeStore = (name = "test-db") => new Store(name);

    it("creates an empty collection and passes it to the callback", () => {
        const callback = jest.fn();
        new Store("fresh-db", callback);

        expect(callback).toHaveBeenCalledWith({ todos: [] });
    });

    it("reuses an already existing collection", () => {
        const store = makeStore("shared-db");
        store.save({ title: "keep me", completed: false });

        const callback = jest.fn();
        new Store("shared-db", callback);

        expect(callback.mock.calls[0][0].todos).toHaveLength(1);
    });

    it("assigns unique incrementing ids on save", () => {
        const store = makeStore();
        const first = jest.fn();
        const second = jest.fn();

        store.save({ title: "one", completed: false }, first);
        store.save({ title: "two", completed: false }, second);

        const firstId = first.mock.calls[0][0][0].id;
        const secondId = second.mock.calls[0][0][0].id;
        expect(secondId).toBe(firstId + 1);
    });

    it("saves without a callback", () => {
        const store = makeStore();
        store.save({ title: "silent", completed: false });

        const callback = jest.fn();
        store.findAll(callback);
        expect(callback.mock.calls[0][0]).toHaveLength(1);
    });

    it("updates an existing item when an id is given", () => {
        const store = makeStore();
        let id;
        store.save({ title: "old", completed: false }, (todos) => (id = todos[0].id));

        const callback = jest.fn();
        store.save({ title: "new", completed: true }, callback, id);

        const todos = callback.mock.calls[0][0];
        expect(todos[0]).toMatchObject({ id, title: "new", completed: true });
    });

    it("updates by id without a callback and ignores unknown ids", () => {
        const store = makeStore();
        let id;
        store.save({ title: "old", completed: false }, (todos) => (id = todos[0].id));

        store.save({ title: "silent update" }, undefined, id);
        store.save({ title: "nobody" }, undefined, 9999);

        const callback = jest.fn();
        store.findAll(callback);
        expect(callback.mock.calls[0][0]).toEqual([{ id, title: "silent update", completed: false }]);
    });

    it("finds items matching a query", () => {
        const store = makeStore();
        store.save({ title: "active", completed: false });
        store.save({ title: "done", completed: true });

        const callback = jest.fn();
        store.find({ completed: true }, callback);

        expect(callback.mock.calls[0][0]).toHaveLength(1);
        expect(callback.mock.calls[0][0][0].title).toBe("done");
    });

    it("does nothing when find or findAll are called without a callback", () => {
        const store = makeStore();
        expect(store.find({ completed: true })).toBeUndefined();
        expect(store.findAll()).toBeUndefined();
    });

    it("removes an item by id", () => {
        const store = makeStore();
        let id;
        store.save({ title: "remove me", completed: false }, (todos) => (id = todos[0].id));
        store.save({ title: "keep me", completed: false });

        const callback = jest.fn();
        store.remove(id, callback);

        const todos = callback.mock.calls[0][0];
        expect(todos).toHaveLength(1);
        expect(todos[0].title).toBe("keep me");
    });

    it("removes without a callback", () => {
        const store = makeStore();
        let id;
        store.save({ title: "remove me", completed: false }, (todos) => (id = todos[0].id));

        store.remove(id);

        const callback = jest.fn();
        store.findAll(callback);
        expect(callback.mock.calls[0][0]).toHaveLength(0);
    });

    it("drops all data", () => {
        const store = makeStore();
        store.save({ title: "one", completed: false });
        store.save({ title: "two", completed: true });

        const callback = jest.fn();
        store.drop(callback);
        expect(callback.mock.calls[0][0]).toEqual([]);

        store.drop();
        const after = jest.fn();
        store.findAll(after);
        expect(after.mock.calls[0][0]).toEqual([]);
    });

    it("persists todos with id, title and completed", () => {
        const store = makeStore("todos-javascript-es6-webpack");
        store.save({ title: "persisted", completed: false });

        const callback = jest.fn();
        store.findAll(callback);
        expect(Object.keys(callback.mock.calls[0][0][0]).sort()).toEqual(["completed", "id", "title"]);
    });
});
