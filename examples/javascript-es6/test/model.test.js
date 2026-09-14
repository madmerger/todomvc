import { vi } from "vitest";
import Model from "../src/model";
import Store from "../src/store";

const database = () => `db-${Math.random()}`;

describe("Model", () => {
    let store;
    let model;

    beforeEach(() => {
        store = new Store(database());
        model = new Model(store);
    });

    it("creates trimmed, incomplete todos and treats missing titles as empty", () => {
        const created = [];
        model.create("  task  ", (todos) => created.push(...todos));
        model.create(undefined, (todos) => created.push(...todos));
        model.create("", (todos) => created.push(...todos));

        expect(created).toEqual([
            { id: expect.any(Number), title: "task", completed: false },
            { id: expect.any(Number), title: "", completed: false },
            { id: expect.any(Number), title: "", completed: false },
        ]);
    });

    it("reads all todos when given a callback", () => {
        const callback = vi.fn();
        const findAll = vi.spyOn(store, "findAll");

        model.read(callback);

        expect(findAll).toHaveBeenCalledWith(callback);
        expect(callback).toHaveBeenCalledWith([]);
    });

    it("reads an id query as an integer", () => {
        const find = vi.spyOn(store, "find");
        const callback = vi.fn();

        model.read("1", callback);
        model.read(2, callback);

        expect(find).toHaveBeenNthCalledWith(1, { id: 1 }, callback);
        expect(find).toHaveBeenNthCalledWith(2, { id: 2 }, callback);
    });

    it("reads object queries and delegates updates and removals", () => {
        const query = { completed: true };
        const readCallback = vi.fn();
        const find = vi.spyOn(store, "find");
        model.read(query, readCallback);
        expect(find).toHaveBeenCalledWith(query, readCallback);

        const save = vi.spyOn(store, "save");
        const remove = vi.spyOn(store, "remove");
        const drop = vi.spyOn(store, "drop");
        const callback = vi.fn();

        model.update(4, { completed: true }, callback);
        model.remove(4, callback);
        model.removeAll(callback);

        expect(save).toHaveBeenCalledWith({ completed: true }, callback, 4);
        expect(remove).toHaveBeenCalledWith(4, callback);
        expect(drop).toHaveBeenCalledWith(callback);
    });

    it("updates and removes todos through real storage", () => {
        let created;
        model.create("before", (todos) => {
            created = todos[0];
        });

        model.update(created.id, { title: "after" });
        model.read(created.id, (todos) => expect(todos[0].title).toBe("after"));

        model.remove(created.id);
        model.read(created.id, (todos) => expect(todos).toEqual([]));

        model.create("another");
        model.removeAll();
        model.read((todos) => expect(todos).toEqual([]));
    });

    it("counts active, completed, and total todos", () => {
        store.save({ title: "active", completed: false });
        store.save({ title: "done one", completed: true });
        store.save({ title: "done two", completed: true });

        const callback = vi.fn();
        model.getCount(callback);

        expect(callback).toHaveBeenCalledWith({ active: 1, completed: 2, total: 3 });
    });

    it("returns early from getCount without a callback", () => {
        const findAll = vi.spyOn(store, "findAll");

        expect(model.getCount()).toBeUndefined();
        expect(findAll).not.toHaveBeenCalled();
    });
});
