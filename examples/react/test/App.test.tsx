import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import App from "../src/App";
import { STORAGE_KEY } from "../src/lib/storage";

const addTodo = async (user: ReturnType<typeof userEvent.setup>, title: string) => {
    await user.type(screen.getByLabelText("新しいタスク"), `${title}{Enter}`);
};

const items = () => screen.queryAllByRole("listitem").filter((item) => item.querySelector(".view"));

const setHash = (hash: string) =>
    act(() => {
        window.location.hash = hash;
        window.dispatchEvent(new HashChangeEvent("hashchange"));
    });

describe("App", () => {
    it("hides main and footer when there are no todos", () => {
        const { container } = render(<App />);

        expect(container.querySelector(".main")).toBeNull();
        expect(container.querySelector(".footer")).toBeNull();
    });

    it("adds trimmed todos, clears the input and ignores empty input", async () => {
        const user = userEvent.setup();
        render(<App />);

        await addTodo(user, "  買い物  ");
        await addTodo(user, "   ");

        expect(items()).toHaveLength(1);
        expect(screen.getByText("買い物")).toBeInTheDocument();
        expect(screen.getByLabelText("新しいタスク")).toHaveValue("");
    });

    it("pluralizes the remaining counter", async () => {
        const user = userEvent.setup();
        const { container } = render(<App />);

        await addTodo(user, "買い物");
        expect(container.querySelector(".todo-count")).toHaveTextContent("1 item left");

        await addTodo(user, "掃除");
        expect(container.querySelector(".todo-count")).toHaveTextContent("2 items left");
    });

    it("toggles todos individually and with mark all as complete", async () => {
        const user = userEvent.setup();
        const { container } = render(<App />);

        await addTodo(user, "買い物");
        await addTodo(user, "掃除");

        const toggleAll = container.querySelector(".toggle-all") as HTMLInputElement;

        await user.click(toggleAll);
        expect(items().every((item) => item.className.includes("completed"))).toBe(true);
        expect(toggleAll.checked).toBe(true);

        await user.click(within(items()[0]).getByRole("checkbox"));
        expect(toggleAll.checked).toBe(false);
        expect(container.querySelector(".todo-count")).toHaveTextContent("1 item left");
    });

    it("edits a todo on double click, saving on Enter and discarding on Escape", async () => {
        const user = userEvent.setup();
        const { container } = render(<App />);

        await addTodo(user, "買い物");

        await user.dblClick(screen.getByText("買い物"));
        expect(container.querySelector("li.editing")).not.toBeNull();

        const edit = screen.getByLabelText("買い物 を編集");
        expect(edit).toHaveFocus();

        await user.clear(edit);
        await user.type(edit, "洗濯{Enter}");
        expect(screen.getByText("洗濯")).toBeInTheDocument();
        expect(container.querySelector("li.editing")).toBeNull();

        await user.dblClick(screen.getByText("洗濯"));
        await user.type(screen.getByLabelText("洗濯 を編集"), "する{Escape}");
        expect(screen.getByText("洗濯")).toBeInTheDocument();
    });

    it("saves an edit on blur and destroys the todo when the edit is empty", async () => {
        const user = userEvent.setup();
        render(<App />);

        await addTodo(user, "買い物");
        await addTodo(user, "掃除");

        await user.dblClick(screen.getByText("買い物"));
        await user.clear(screen.getByLabelText("買い物 を編集"));
        await user.type(screen.getByLabelText("買い物 を編集"), "料理");
        await user.tab();
        expect(screen.getByText("料理")).toBeInTheDocument();

        await user.dblClick(screen.getByText("料理"));
        await user.clear(screen.getByLabelText("料理 を編集"));
        await user.tab();
        expect(items()).toHaveLength(1);
    });

    it("removes a todo with the destroy button and clears completed todos", async () => {
        const user = userEvent.setup();
        const { container } = render(<App />);

        await addTodo(user, "買い物");
        await addTodo(user, "掃除");

        await user.click(screen.getByLabelText("買い物 を削除"));
        expect(items()).toHaveLength(1);

        await user.click(within(items()[0]).getByRole("checkbox"));
        await user.click(screen.getByRole("button", { name: "完了したタスクを削除" }));
        expect(items()).toHaveLength(0);
        expect(container.querySelector(".clear-completed")).toBeNull();
    });

    it("filters todos through hash routing and marks the selected filter", async () => {
        const user = userEvent.setup();
        const { container } = render(<App />);

        await addTodo(user, "買い物");
        await addTodo(user, "掃除");
        await user.click(within(items()[1]).getByRole("checkbox"));

        setHash("#/active");
        expect(items()).toHaveLength(1);
        expect(screen.getByText("買い物")).toBeInTheDocument();
        expect(container.querySelector(".filters .selected")).toHaveTextContent("未完了");

        setHash("#/completed");
        expect(items()).toHaveLength(1);
        expect(screen.getByText("掃除")).toBeInTheDocument();

        setHash("#/");
        expect(items()).toHaveLength(2);
    });

    it("persists todos to localStorage and restores them on reload", async () => {
        const user = userEvent.setup();
        const { unmount } = render(<App />);

        await addTodo(user, "買い物");

        expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]")).toEqual([
            { id: expect.any(String), title: "買い物", completed: false },
        ]);

        unmount();
        render(<App />);

        expect(screen.getByText("買い物")).toBeInTheDocument();
    });
});
