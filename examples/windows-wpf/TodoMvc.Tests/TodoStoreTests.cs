using TodoMvc.Core;
using Xunit;

namespace TodoMvc.Tests;

public class TodoStoreTests
{
    private static TodoStore CreateStore(params string[] titles)
    {
        var store = new TodoStore(new InMemoryTodoRepository());
        foreach (string title in titles)
        {
            store.Add(title);
        }

        return store;
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData("\t\n")]
    public void Add_IgnoresBlankTitles(string title)
    {
        TodoStore store = CreateStore();

        Assert.Null(store.Add(title));
        Assert.Empty(store.Items);
    }

    [Fact]
    public void Add_TrimsTitle()
    {
        TodoStore store = CreateStore();

        TodoItem? item = store.Add("  buy milk  ");

        Assert.NotNull(item);
        Assert.Equal("buy milk", item!.Title);
        Assert.Single(store.Items);
    }

    [Fact]
    public void Remove_TakesItemOutOfTheCollection()
    {
        TodoStore store = CreateStore("a", "b");

        store.Remove(store.Items[0]);

        Assert.Equal(new[] { "b" }, store.Items.Select(item => item.Title));
    }

    [Fact]
    public void ToggleAll_SetsEveryItemToTheSameState()
    {
        TodoStore store = CreateStore("a", "b", "c");
        store.Items[1].Completed = true;

        store.ToggleAll(true);
        Assert.All(store.Items, item => Assert.True(item.Completed));
        Assert.True(store.AllCompleted);

        store.ToggleAll(false);
        Assert.All(store.Items, item => Assert.False(item.Completed));
        Assert.False(store.AllCompleted);
    }

    [Fact]
    public void AllCompleted_FollowsIndividualItems()
    {
        TodoStore store = CreateStore("a", "b");

        Assert.False(store.AllCompleted);

        store.Items[0].Completed = true;
        Assert.False(store.AllCompleted);

        store.Items[1].Completed = true;
        Assert.True(store.AllCompleted);

        store.Items[0].Completed = false;
        Assert.False(store.AllCompleted);
    }

    [Fact]
    public void AllCompleted_IsFalseWhenThereAreNoTodos()
    {
        Assert.False(CreateStore().AllCompleted);
    }

    [Fact]
    public void AllCompleted_IsClearedAfterClearCompleted()
    {
        TodoStore store = CreateStore("a", "b");
        store.ToggleAll(true);

        store.ClearCompleted();

        Assert.False(store.AllCompleted);
        Assert.Empty(store.Items);
    }

    [Theory]
    [InlineData(0, "0 items")]
    [InlineData(1, "1 item")]
    [InlineData(2, "2 items")]
    public void CounterText_IsPluralized(int activeCount, string expected)
    {
        TodoStore store = CreateStore("a", "b");
        store.ToggleAll(true);
        for (int i = 0; i < activeCount; i++)
        {
            store.Items[i].Completed = false;
        }

        Assert.Equal(activeCount, store.ActiveCount);
        Assert.Equal(expected, store.CounterText);
    }

    [Fact]
    public void ClearCompleted_RemovesOnlyCompletedTodos()
    {
        TodoStore store = CreateStore("a", "b", "c");
        store.Items[0].Completed = true;
        store.Items[2].Completed = true;

        store.ClearCompleted();

        Assert.Equal(new[] { "b" }, store.Items.Select(item => item.Title));
    }

    [Fact]
    public void ShowClearCompleted_IsFalseWithoutCompletedTodos()
    {
        TodoStore store = CreateStore("a");

        Assert.False(store.ShowClearCompleted);

        store.Items[0].Completed = true;
        Assert.True(store.ShowClearCompleted);

        store.ClearCompleted();
        Assert.False(store.ShowClearCompleted);
    }

    [Fact]
    public void ShowMainAndFooter_IsFalseWithoutTodos()
    {
        TodoStore store = CreateStore();
        Assert.False(store.ShowMainAndFooter);

        TodoItem? item = store.Add("a");
        Assert.True(store.ShowMainAndFooter);

        store.Remove(item!);
        Assert.False(store.ShowMainAndFooter);
    }

    [Fact]
    public void Filter_RestrictsTheVisibleTodos()
    {
        TodoStore store = CreateStore("active", "done");
        store.Items[1].Completed = true;

        Assert.Equal(new[] { "active", "done" }, store.FilteredItems.Select(item => item.Title));

        store.Filter = TodoFilter.Active;
        Assert.Equal(new[] { "active" }, store.FilteredItems.Select(item => item.Title));

        store.Filter = TodoFilter.Completed;
        Assert.Equal(new[] { "done" }, store.FilteredItems.Select(item => item.Title));

        store.Filter = TodoFilter.All;
        Assert.Equal(2, store.FilteredItems.Count);
    }

    [Fact]
    public void Filter_IsAppliedWhenAnItemChangesWhileFiltered()
    {
        TodoStore store = CreateStore("a", "b");
        store.Filter = TodoFilter.Active;

        store.Items[0].Completed = true;

        Assert.Equal(new[] { "b" }, store.FilteredItems.Select(item => item.Title));
    }

    [Fact]
    public void CommitEdit_SavesTheTrimmedTitle()
    {
        TodoStore store = CreateStore("a");
        TodoItem item = store.Items[0];

        store.StartEdit(item);
        Assert.True(item.IsEditing);
        Assert.Equal("a", item.EditTitle);

        item.EditTitle = "  updated  ";
        Assert.True(store.CommitEdit(item));

        Assert.False(item.IsEditing);
        Assert.Equal("updated", item.Title);
    }

    [Fact]
    public void CommitEdit_DestroysTheTodoWhenTheTitleIsEmpty()
    {
        TodoStore store = CreateStore("a", "b");
        TodoItem item = store.Items[0];

        store.StartEdit(item);
        item.EditTitle = "   ";

        Assert.False(store.CommitEdit(item));
        Assert.Equal(new[] { "b" }, store.Items.Select(todo => todo.Title));
    }

    [Fact]
    public void CommitEdit_IsANoOpWhenNotEditing()
    {
        TodoStore store = CreateStore("a");
        TodoItem item = store.Items[0];

        Assert.True(store.CommitEdit(item));
        Assert.Equal("a", item.Title);
        Assert.Single(store.Items);
    }

    [Fact]
    public void CancelEdit_DiscardsTheChanges()
    {
        TodoStore store = CreateStore("a");
        TodoItem item = store.Items[0];

        store.StartEdit(item);
        item.EditTitle = "changed";
        store.CancelEdit(item);

        Assert.False(item.IsEditing);
        Assert.Equal("a", item.Title);
        Assert.Equal("a", item.EditTitle);
    }
}
