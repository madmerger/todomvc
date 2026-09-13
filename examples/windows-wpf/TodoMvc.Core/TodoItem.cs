using System.ComponentModel;
using System.Runtime.CompilerServices;

namespace TodoMvc.Core;

public sealed class TodoItem : INotifyPropertyChanged
{
    private string _title;
    private bool _completed;
    private bool _isEditing;
    private string _editTitle = string.Empty;

    public TodoItem(string title, bool completed = false, string? id = null)
    {
        Id = id ?? Guid.NewGuid().ToString();
        _title = title;
        _completed = completed;
    }

    public string Id { get; }

    public string Title
    {
        get => _title;
        set => Set(ref _title, value);
    }

    public bool Completed
    {
        get => _completed;
        set => Set(ref _completed, value);
    }

    /// <summary>Transient editing state. Never persisted.</summary>
    public bool IsEditing
    {
        get => _isEditing;
        set => Set(ref _isEditing, value);
    }

    /// <summary>Buffer holding the in-progress title while editing.</summary>
    public string EditTitle
    {
        get => _editTitle;
        set => Set(ref _editTitle, value);
    }

    public event PropertyChangedEventHandler? PropertyChanged;

    private void Set<T>(ref T field, T value, [CallerMemberName] string? propertyName = null)
    {
        if (EqualityComparer<T>.Default.Equals(field, value))
        {
            return;
        }

        field = value;
        PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
    }
}
