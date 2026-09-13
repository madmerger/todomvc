namespace TodoMvc.Core;

/// <summary>Persisted shape of the app state: the todos plus the active filter.</summary>
public sealed class TodoSnapshot
{
    public List<TodoRecord> Todos { get; set; } = new();

    public TodoFilter Filter { get; set; } = TodoFilter.All;
}

public sealed class TodoRecord
{
    public string Id { get; set; } = string.Empty;

    public string Title { get; set; } = string.Empty;

    public bool Completed { get; set; }
}
