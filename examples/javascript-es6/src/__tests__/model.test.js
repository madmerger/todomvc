import Model from "../model";

const makeStorage = () => ({
    save: jest.fn(),
    find: jest.fn(),
    findAll: jest.fn(),
    remove: jest.fn(),
    drop: jest.fn(),
});

describe("Model", () => {
    test("creates trimmed and empty-title items", () => {
        const storage = makeStorage();
        const model = new Model(storage);
        const callback = jest.fn();

        model.create("  title  ", callback);
        model.create();

        expect(storage.save).toHaveBeenNthCalledWith(1, { title: "title", completed: false }, callback);
        expect(storage.save).toHaveBeenNthCalledWith(2, { title: "", completed: false }, undefined);
    });

    test("dispatches reads for functions, ids, and objects", () => {
        const storage = makeStorage();
        const model = new Model(storage);
        const all = jest.fn();
        const byString = jest.fn();
        const byNumber = jest.fn();
        const byObject = jest.fn();

        model.read(all);
        model.read("12", byString);
        model.read(13, byNumber);
        model.read({ completed: true }, byObject);

        expect(storage.findAll).toHaveBeenCalledWith(all);
        expect(storage.find).toHaveBeenNthCalledWith(1, { id: 12 }, byString);
        expect(storage.find).toHaveBeenNthCalledWith(2, { id: 13 }, byNumber);
        expect(storage.find).toHaveBeenNthCalledWith(3, { completed: true }, byObject);
    });

    test("delegates update, removal, and removeAll", () => {
        const storage = makeStorage();
        const model = new Model(storage);
        const callback = jest.fn();

        model.update(1, { completed: true }, callback);
        model.remove(1, callback);
        model.removeAll(callback);

        expect(storage.save).toHaveBeenCalledWith({ completed: true }, callback, 1);
        expect(storage.remove).toHaveBeenCalledWith(1, callback);
        expect(storage.drop).toHaveBeenCalledWith(callback);
    });

    test("counts active, completed, and total todos", () => {
        const storage = makeStorage();
        const model = new Model(storage);
        const callback = jest.fn();
        storage.findAll.mockImplementation((handler) => handler([
            { completed: false },
            { completed: true },
            { completed: 1 },
        ]));

        model.getCount(callback);
        model.getCount();

        expect(callback).toHaveBeenCalledWith({ active: 1, completed: 2, total: 3 });
        expect(storage.findAll).toHaveBeenCalledTimes(1);
    });
});
