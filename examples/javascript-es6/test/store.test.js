import { describe, expect, it, vi } from "vitest";
import Store from "../src/store";
import { uniqueDbName } from "./fixture";

const newStore = () => new Store(uniqueDbName());

describe("Store", () => {
    it("creates an empty collection and hands it to the callback", () => {
        const callback = vi.fn();
        new Store(uniqueDbName(), callback);

        expect(callback).toHaveBeenCalledWith({ todos: [] });
    });

    it("reuses an existing collection for the same db name", () => {
        const name = uniqueDbName();
        const store = new Store(name);
        store.save({ title: "kept", completed: false });

        const callback = vi.fn();
        new Store(name, callback);

        expect(callback.mock.calls[0][0].todos).toHaveLength(1);
    });

    it("saves a new item with a generated id", () => {
        const store = newStore();
        const callback = vi.fn();

        store.save({ title: "write tests", completed: false }, callback);

        const [saved] = callback.mock.calls[0][0];
        expect(saved.title).toBe("write tests");
        expect(saved.id).toBeTypeOf("number");
    });

    it("generates increasing ids", () => {
        const store = newStore();
        const first = vi.fn();
        const second = vi.fn();

        store.save({ title: "one" }, first);
        store.save({ title: "two" }, second);

        expect(second.mock.calls[0][0][0].id).toBeGreaterThan(first.mock.calls[0][0][0].id);
    });

    it("saves without a callback", () => {
        const store = newStore();

        expect(() => store.save({ title: "silent" })).not.toThrow();

        const callback = vi.fn();
        store.findAll(callback);
        expect(callback.mock.calls[0][0]).toHaveLength(1);
    });

    it("updates the properties of an existing item", () => {
        const store = newStore();
        const created = vi.fn();
        store.save({ title: "old", completed: false }, created);
        const { id } = created.mock.calls[0][0][0];

        const updated = vi.fn();
        store.save({ title: "new", completed: true }, updated, id);

        expect(updated.mock.calls[0][0]).toEqual([{ id, title: "new", completed: true }]);
    });

    it("leaves the collection untouched when updating an unknown id", () => {
        const store = newStore();
        store.save({ title: "kept", completed: false });

        const callback = vi.fn();
        store.save({ title: "ignored" }, callback, 99999);

        expect(callback.mock.calls[0][0][0].title).toBe("kept");
    });

    it("updates without a callback", () => {
        const store = newStore();
        const created = vi.fn();
        store.save({ title: "old" }, created);
        const { id } = created.mock.calls[0][0][0];

        expect(() => store.save({ title: "new" }, undefined, id)).not.toThrow();

        const callback = vi.fn();
        store.findAll(callback);
        expect(callback.mock.calls[0][0][0].title).toBe("new");
    });

    it("finds items matching a query", () => {
        const store = newStore();
        store.save({ title: "active", completed: false });
        store.save({ title: "done", completed: true });

        const callback = vi.fn();
        store.find({ completed: true }, callback);

        expect(callback.mock.calls[0][0]).toHaveLength(1);
        expect(callback.mock.calls[0][0][0].title).toBe("done");
    });

    it("does nothing when find gets no callback", () => {
        expect(() => newStore().find({ completed: true })).not.toThrow();
    });

    it("returns every item from findAll", () => {
        const store = newStore();
        store.save({ title: "a" });
        store.save({ title: "b" });

        const callback = vi.fn();
        store.findAll(callback);

        expect(callback.mock.calls[0][0]).toHaveLength(2);
    });

    it("does nothing when findAll gets no callback", () => {
        expect(() => newStore().findAll()).not.toThrow();
    });

    it("removes an item by id", () => {
        const store = newStore();
        const created = vi.fn();
        store.save({ title: "gone" }, created);
        store.save({ title: "kept" });
        const { id } = created.mock.calls[0][0][0];

        const callback = vi.fn();
        store.remove(id, callback);

        expect(callback.mock.calls[0][0]).toHaveLength(1);
        expect(callback.mock.calls[0][0][0].title).toBe("kept");
    });

    it("keeps the collection when removing an unknown id", () => {
        const store = newStore();
        store.save({ title: "kept" });

        const callback = vi.fn();
        store.remove(12345678, callback);

        expect(callback.mock.calls[0][0]).toHaveLength(1);
    });

    it("removes without a callback", () => {
        const store = newStore();
        const created = vi.fn();
        store.save({ title: "gone" }, created);

        expect(() => store.remove(created.mock.calls[0][0][0].id)).not.toThrow();
    });

    it("drops all data", () => {
        const store = newStore();
        store.save({ title: "a" });

        const callback = vi.fn();
        store.drop(callback);

        expect(callback).toHaveBeenCalledWith([]);
    });

    it("drops without a callback", () => {
        const store = newStore();
        store.save({ title: "a" });

        expect(() => store.drop()).not.toThrow();

        const callback = vi.fn();
        store.findAll(callback);
        expect(callback.mock.calls[0][0]).toEqual([]);
    });
});
