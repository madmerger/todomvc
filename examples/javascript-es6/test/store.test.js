import Store from "../src/store";

const database = () => `db-${Math.random()}`;

describe("Store", () => {
    let store;

    beforeEach(() => {
        store = new Store(database());
    });

    it("returns undefined when find has no callback and finds matching todos", () => {
        expect(store.find({ completed: false })).toBeUndefined();

        store.save({ title: "active", completed: false });
        store.save({ title: "done", completed: true });

        let result;
        store.find({ completed: false }, (todos) => {
            result = todos;
        });

        expect(result).toHaveLength(1);
        expect(result[0].title).toBe("active");
    });

    it("finds all todos and returns undefined without a callback", () => {
        expect(store.findAll()).toBeUndefined();
        store.save({ title: "first" });
        store.save({ title: "second" });

        const todos = [];
        store.findAll((data) => todos.push(...data));

        expect(todos.map(({ title }) => title)).toEqual(["first", "second"]);
    });

    it("inserts a todo, assigns an id, and returns the inserted item", () => {
        const todo = { title: "new", completed: false };
        let result;

        store.save(todo, (todos) => {
            result = todos;
        });

        expect(todo.id).toEqual(expect.any(Number));
        expect(result).toEqual([todo]);
        store.findAll((todos) => expect(todos).toEqual([todo]));
    });

    it("updates only a matching id and merges update keys", () => {
        let inserted;
        store.save({ title: "before", completed: false, extra: "keep" }, (todos) => {
            inserted = todos[0];
        });

        store.save({ title: "after", completed: true }, undefined, inserted.id);
        store.findAll((todos) => {
            expect(todos[0]).toEqual({
                id: inserted.id,
                title: "after",
                completed: true,
                extra: "keep",
            });
        });

        store.save({ title: "ignored" }, undefined, inserted.id + 1);
        store.findAll((todos) => expect(todos[0].title).toBe("after"));
    });

    it("removes a todo and drops all todos", () => {
        let first;
        let second;
        store.save({ title: "first" }, (todos) => {
            first = todos[0];
        });
        store.save({ title: "second" }, (todos) => {
            second = todos[0];
        });

        let afterRemove;
        store.remove(first.id, (todos) => {
            afterRemove = todos;
        });
        expect(afterRemove).toEqual([second]);

        let afterDrop;
        store.drop((todos) => {
            afterDrop = todos;
        });
        expect(afterDrop).toEqual([]);
    });

    it("passes initial data to the constructor callback", () => {
        let initial;
        new Store(database(), (data) => {
            initial = data;
        });

        expect(initial).toEqual({ todos: [] });
    });
});
