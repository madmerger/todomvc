import Store, { Store as NamedStore } from "../store";

let databaseNumber = 0;
const database = () => `store-test-${++databaseNumber}`;

describe("Store", () => {
    test("constructs collections and invokes an optional callback", () => {
        const callback = jest.fn();
        const name = database();
        const store = new Store(name, callback);
        new NamedStore(name);

        expect(store).toBeInstanceOf(NamedStore);
        expect(callback).toHaveBeenCalledWith({ todos: [] });
    });

    test("saves new records and updates records by id", () => {
        const store = new Store(database());
        const created = [];

        store.save({ title: "first" }, (items) => created.push(items));
        const id = created[0][0].id;
        store.save({ title: "updated", completed: true }, (items) => created.push(items), id);

        expect(created[0][0]).toMatchObject({ id, title: "first" });
        expect(created[1][0]).toMatchObject({ id, title: "updated", completed: true });
        store.save({ title: "ignored id" }, undefined, 99999);
    });

    test("finds matching records, finds all, removes, and drops", () => {
        const store = new Store(database());
        store.save({ title: "active", completed: false });
        store.save({ title: "done", completed: true });
        const found = jest.fn();
        const missing = jest.fn();
        const all = jest.fn();
        const removed = jest.fn();

        store.find({ completed: false, title: "active" }, found);
        store.find({ completed: false, title: "missing" }, missing);
        store.findAll(all);
        const firstId = all.mock.calls[0][0][0].id;
        store.remove(firstId, removed);
        store.remove(999, removed);
        store.drop((items) => expect(items).toEqual([]));

        expect(found).toHaveBeenCalledWith([{ id: expect.any(Number), title: "active", completed: false }]);
        expect(all.mock.calls[0][0]).toHaveLength(2);
        expect(removed.mock.calls[0][0]).toHaveLength(1);
        expect(removed.mock.calls[1][0]).toHaveLength(1);
    });

    test("returns early when callbacks are omitted", () => {
        const store = new Store(database());

        expect(store.find({})).toBeUndefined();
        expect(store.findAll()).toBeUndefined();
        expect(store.save({ title: "no callback" })).toBeUndefined();
        expect(store.remove(1)).toBeUndefined();
        expect(store.drop()).toBeUndefined();
    });
});
