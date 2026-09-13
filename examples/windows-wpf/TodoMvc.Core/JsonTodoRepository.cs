using System.Text.Json;
using System.Text.Json.Serialization;

namespace TodoMvc.Core;

/// <summary>Persists the todos as JSON on disk, e.g. %APPDATA%\todos-wpf\todos.json.</summary>
public sealed class JsonTodoRepository : ITodoRepository
{
    private static readonly JsonSerializerOptions SerializerOptions = new()
    {
        WriteIndented = true,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        Converters = { new JsonStringEnumConverter() }
    };

    public JsonTodoRepository(string? filePath = null)
    {
        FilePath = filePath ?? DefaultFilePath();
    }

    public string FilePath { get; }

    public static string DefaultFilePath() => Path.Combine(
        Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData),
        "todos-wpf",
        "todos.json");

    public TodoSnapshot Load()
    {
        if (!File.Exists(FilePath))
        {
            return new TodoSnapshot();
        }

        try
        {
            using FileStream stream = File.OpenRead(FilePath);
            return JsonSerializer.Deserialize<TodoSnapshot>(stream, SerializerOptions) ?? new TodoSnapshot();
        }
        catch (JsonException)
        {
            return new TodoSnapshot();
        }
    }

    public void Save(TodoSnapshot snapshot)
    {
        string? directory = Path.GetDirectoryName(FilePath);
        if (!string.IsNullOrEmpty(directory))
        {
            Directory.CreateDirectory(directory);
        }

        File.WriteAllText(FilePath, JsonSerializer.Serialize(snapshot, SerializerOptions));
    }
}
