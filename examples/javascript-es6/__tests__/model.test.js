import Model from "../src/model";

const createStorage = () => ({
    save: jest.fn(),
    find: jest.fn(),
    findAll: jest.fn(),
    remove: jest.fn(),
    drop: jest.fn(),
});

describe("Model", () => {
    let storage;
    let model;

    beforeEach(() => {
        storage = createStorage();
        model = new Model(storage);
    });

    it("trims the title of a new todo", () => {
        const callback = jest.fn();
        model.create("  買い物  ", callback);

        expect(storage.save).toHaveBeenCalledWith({ title: "買い物", completed: false }, callback);
    });

    it("defaults the title to an empty string", () => {
        model.create();
        expect(storage.save).toHaveBeenCalledWith({ title: "", completed: false }, undefined);
    });

    it("reads everything when only a callback is given", () => {
        const callback = jest.fn();
        model.read(callback);
        expect(storage.findAll).toHaveBeenCalledWith(callback);
    });

    it("reads by numeric id", () => {
        const callback = jest.fn();
        model.read(42, callback);
        expect(storage.find).toHaveBeenCalledWith({ id: 42 }, callback);
    });

    it("reads by string id", () => {
        const callback = jest.fn();
        model.read("42", callback);
        expect(storage.find).toHaveBeenCalledWith({ id: 42 }, callback);
    });

    it("reads by query object", () => {
        const callback = jest.fn();
        model.read({ completed: true }, callback);
        expect(storage.find).toHaveBeenCalledWith({ completed: true }, callback);
    });

    it("updates, removes and drops through storage", () => {
        const callback = jest.fn();
        model.update(1, { title: "x" }, callback);
        model.remove(1, callback);
        model.removeAll(callback);

        expect(storage.save).toHaveBeenCalledWith({ title: "x" }, callback, 1);
        expect(storage.remove).toHaveBeenCalledWith(1, callback);
        expect(storage.drop).toHaveBeenCalledWith(callback);
    });

    it("counts active, completed and total todos", () => {
        storage.findAll.mockImplementation((cb) =>
            cb([
                { id: 1, title: "a", completed: false },
                { id: 2, title: "b", completed: true },
                { id: 3, title: "c", completed: false },
            ])
        );

        const callback = jest.fn();
        model.getCount(callback);

        expect(callback).toHaveBeenCalledWith({ active: 2, completed: 1, total: 3 });
    });

    it("does nothing when getCount has no callback", () => {
        model.getCount();
        expect(storage.findAll).not.toHaveBeenCalled();
    });
});
