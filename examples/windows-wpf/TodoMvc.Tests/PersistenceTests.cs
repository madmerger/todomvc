using TodoMvc.Core;
using Xunit;

namespace TodoMvc.Tests;

public class PersistenceTests
{
    [Fact]
    public void Store_PersistsTodosAndFilterThroughTheRepository()
    {
        var repository = new InMemoryTodoRepository();
        var store = new TodoStore(repository);
        store.Add("a");
        store.Add("b");
        store.Items[1].Completed = true;
        store.Filter = TodoFilter.Completed;

        var reloaded = new TodoStore(repository);

        Assert.Equal(new[] { "a", "b" }, reloaded.Items.Select(item => item.Title));
        Assert.Equal(store.Items.Select(item => item.Id), reloaded.Items.Select(item => item.Id));
        Assert.False(reloaded.Items[0].Completed);
        Assert.True(reloaded.Items[1].Completed);
        Assert.Equal(TodoFilter.Completed, reloaded.Filter);
        Assert.Equal(new[] { "b" }, reloaded.FilteredItems.Select(item => item.Title));
    }

    [Fact]
    public void Store_DoesNotPersistEditingState()
    {
        var repository = new InMemoryTodoRepository();
        var store = new TodoStore(repository);
        store.Add("a");
        store.StartEdit(store.Items[0]);
        store.Items[0].EditTitle = "half typed";

        var reloaded = new TodoStore(repository);

        Assert.False(reloaded.Items[0].IsEditing);
        Assert.Equal("a", reloaded.Items[0].Title);
        Assert.Equal(string.Empty, reloaded.Items[0].EditTitle);
    }

    [Fact]
    public void Store_PersistsRemovals()
    {
        var repository = new InMemoryTodoRepository();
        var store = new TodoStore(repository);
        store.Add("a");
        store.Add("b");
        store.Remove(store.Items[0]);

        Assert.Equal(new[] { "b" }, new TodoStore(repository).Items.Select(item => item.Title));
    }

    [Fact]
    public void JsonRepository_RoundTripsTheSnapshot()
    {
        string path = Path.Combine(Path.GetTempPath(), $"todomvc-wpf-{Guid.NewGuid()}", "todos.json");
        try
        {
            var repository = new JsonTodoRepository(path);
            Assert.Empty(repository.Load().Todos);

            var store = new TodoStore(repository);
            store.Add(" write tests ");
            store.Add("ship it");
            store.Items[0].Completed = true;
            store.Filter = TodoFilter.Active;

            TodoSnapshot loaded = new JsonTodoRepository(path).Load();

            Assert.Equal(TodoFilter.Active, loaded.Filter);
            Assert.Equal(new[] { "write tests", "ship it" }, loaded.Todos.Select(todo => todo.Title));
            Assert.True(loaded.Todos[0].Completed);
            Assert.All(loaded.Todos, todo => Assert.NotEmpty(todo.Id));
        }
        finally
        {
            string? directory = Path.GetDirectoryName(path);
            if (directory is not null && Directory.Exists(directory))
            {
                Directory.Delete(directory, recursive: true);
            }
        }
    }

    [Fact]
    public void JsonRepository_ReturnsAnEmptySnapshotForCorruptFiles()
    {
        string path = Path.Combine(Path.GetTempPath(), $"todomvc-wpf-{Guid.NewGuid()}.json");
        File.WriteAllText(path, "not json");
        try
        {
            TodoSnapshot snapshot = new JsonTodoRepository(path).Load();

            Assert.Empty(snapshot.Todos);
            Assert.Equal(TodoFilter.All, snapshot.Filter);
        }
        finally
        {
            File.Delete(path);
        }
    }
}
