namespace TodoMvc.Core;

public interface ITodoRepository
{
    TodoSnapshot Load();

    void Save(TodoSnapshot snapshot);
}
