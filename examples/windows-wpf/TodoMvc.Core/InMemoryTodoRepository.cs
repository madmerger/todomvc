namespace TodoMvc.Core;

public sealed class InMemoryTodoRepository : ITodoRepository
{
    private TodoSnapshot _snapshot;

    public InMemoryTodoRepository(TodoSnapshot? snapshot = null)
    {
        _snapshot = snapshot ?? new TodoSnapshot();
    }

    public int SaveCount { get; private set; }

    public TodoSnapshot Load() => _snapshot;

    public void Save(TodoSnapshot snapshot)
    {
        _snapshot = snapshot;
        SaveCount++;
    }
}
