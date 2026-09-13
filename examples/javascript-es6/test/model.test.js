import { beforeEach, describe, expect, it, vi } from "vitest";
import Model from "../src/model";

let storage;
let model;

beforeEach(() => {
    storage = {
        save: vi.fn(),
        find: vi.fn(),
        findAll: vi.fn(),
        remove: vi.fn(),
        drop: vi.fn(),
    };
    model = new Model(storage);
});

describe("Model", () => {
    it("creates a todo with a trimmed title", () => {
        const callback = vi.fn();

        model.create("  buy milk  ", callback);

        expect(storage.save).toHaveBeenCalledWith({ title: "buy milk", completed: false }, callback);
    });

    it("creates a todo with an empty title when none is given", () => {
        model.create();

        expect(storage.save).toHaveBeenCalledWith({ title: "", completed: false }, undefined);
    });

    it("reads every todo when only a callback is given", () => {
        const callback = vi.fn();

        model.read(callback);

        expect(storage.findAll).toHaveBeenCalledWith(callback);
    });

    it("reads a todo by numeric id", () => {
        const callback = vi.fn();

        model.read(3, callback);

        expect(storage.find).toHaveBeenCalledWith({ id: 3 }, callback);
    });

    it("reads a todo by string id", () => {
        const callback = vi.fn();

        model.read("3", callback);

        expect(storage.find).toHaveBeenCalledWith({ id: 3 }, callback);
    });

    it("reads todos by query object", () => {
        const callback = vi.fn();

        model.read({ completed: true }, callback);

        expect(storage.find).toHaveBeenCalledWith({ completed: true }, callback);
    });

    it("updates a todo", () => {
        const callback = vi.fn();

        model.update(7, { completed: true }, callback);

        expect(storage.save).toHaveBeenCalledWith({ completed: true }, callback, 7);
    });

    it("removes a todo", () => {
        const callback = vi.fn();

        model.remove(7, callback);

        expect(storage.remove).toHaveBeenCalledWith(7, callback);
    });

    it("removes all todos", () => {
        const callback = vi.fn();

        model.removeAll(callback);

        expect(storage.drop).toHaveBeenCalledWith(callback);
    });

    it("counts active, completed and total todos", () => {
        storage.findAll.mockImplementation((cb) =>
            cb([
                { completed: false },
                { completed: true },
                { completed: false },
            ])
        );
        const callback = vi.fn();

        model.getCount(callback);

        expect(callback).toHaveBeenCalledWith({ active: 2, completed: 1, total: 3 });
    });

    it("does nothing when getCount gets no callback", () => {
        model.getCount();

        expect(storage.findAll).not.toHaveBeenCalled();
    });
});
