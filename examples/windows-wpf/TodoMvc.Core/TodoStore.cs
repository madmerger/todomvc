using System.Collections.ObjectModel;
using System.Collections.Specialized;
using System.ComponentModel;
using System.Runtime.CompilerServices;

namespace TodoMvc.Core;

/// <summary>
/// UI independent todo list logic: adding, editing, filtering, counting and persistence.
/// </summary>
public sealed class TodoStore : INotifyPropertyChanged
{
    private readonly ITodoRepository _repository;
    private readonly ObservableCollection<TodoItem> _items = new();
    private readonly ObservableCollection<TodoItem> _filteredItems = new();
    private readonly ReadOnlyObservableCollection<TodoItem> _readOnlyItems;
    private readonly ReadOnlyObservableCollection<TodoItem> _readOnlyFilteredItems;
    private TodoFilter _filter;

    public TodoStore(ITodoRepository repository)
    {
        _repository = repository;
        _readOnlyItems = new ReadOnlyObservableCollection<TodoItem>(_items);
        _readOnlyFilteredItems = new ReadOnlyObservableCollection<TodoItem>(_filteredItems);

        TodoSnapshot snapshot = _repository.Load();
        _filter = snapshot.Filter;
        foreach (TodoRecord record in snapshot.Todos)
        {
            var item = new TodoItem(record.Title, record.Completed, record.Id);
            item.PropertyChanged += OnItemPropertyChanged;
            _items.Add(item);
        }

        _items.CollectionChanged += OnItemsCollectionChanged;
        RefreshFilteredItems();
    }

    public ReadOnlyObservableCollection<TodoItem> Items => _readOnlyItems;

    /// <summary>The todos visible under the active filter.</summary>
    public ReadOnlyObservableCollection<TodoItem> FilteredItems => _readOnlyFilteredItems;

    public TodoFilter Filter
    {
        get => _filter;
        set
        {
            if (_filter == value)
            {
                return;
            }

            _filter = value;
            OnPropertyChanged();
            RefreshFilteredItems();
            Save();
        }
    }

    public int ActiveCount => _items.Count(item => !item.Completed);

    public int CompletedCount => _items.Count(item => item.Completed);

    /// <summary>Pluralized counter text, e.g. "0 items", "1 item", "2 items".</summary>
    public string CounterText => $"{ActiveCount} {(ActiveCount == 1 ? "item" : "items")}";

    /// <summary>True when every todo is completed; setting it toggles all todos to that state.</summary>
    public bool AllCompleted
    {
        get => _items.Count > 0 && _items.All(item => item.Completed);
        set => ToggleAll(value);
    }

    public bool ShowClearCompleted => CompletedCount > 0;

    /// <summary>The main and footer sections are hidden when there are no todos.</summary>
    public bool ShowMainAndFooter => _items.Count > 0;

    public event PropertyChangedEventHandler? PropertyChanged;

    public TodoItem? Add(string title)
    {
        string trimmed = title.Trim();
        if (trimmed.Length == 0)
        {
            return null;
        }

        var item = new TodoItem(trimmed);
        item.PropertyChanged += OnItemPropertyChanged;
        _items.Add(item);
        return item;
    }

    public void Remove(TodoItem item)
    {
        if (_items.Remove(item))
        {
            item.PropertyChanged -= OnItemPropertyChanged;
        }
    }

    public void ToggleAll(bool completed)
    {
        foreach (TodoItem item in _items)
        {
            item.Completed = completed;
        }
    }

    public void ClearCompleted()
    {
        foreach (TodoItem item in _items.Where(item => item.Completed).ToList())
        {
            Remove(item);
        }
    }

    public void StartEdit(TodoItem item)
    {
        item.EditTitle = item.Title;
        item.IsEditing = true;
    }

    /// <summary>Saves the edit buffer; an empty title destroys the todo. Returns false when destroyed.</summary>
    public bool CommitEdit(TodoItem item)
    {
        if (!item.IsEditing)
        {
            return _items.Contains(item);
        }

        item.IsEditing = false;
        string trimmed = item.EditTitle.Trim();
        if (trimmed.Length == 0)
        {
            Remove(item);
            return false;
        }

        item.Title = trimmed;
        Save();
        return true;
    }

    public void CancelEdit(TodoItem item)
    {
        item.IsEditing = false;
        item.EditTitle = item.Title;
    }

    public TodoSnapshot CreateSnapshot() => new()
    {
        Filter = _filter,
        Todos = _items
            .Select(item => new TodoRecord { Id = item.Id, Title = item.Title, Completed = item.Completed })
            .ToList()
    };

    public IEnumerable<TodoItem> Filtered(TodoFilter filter) => filter switch
    {
        TodoFilter.Active => _items.Where(item => !item.Completed),
        TodoFilter.Completed => _items.Where(item => item.Completed),
        _ => _items
    };

    private void OnItemsCollectionChanged(object? sender, NotifyCollectionChangedEventArgs e)
    {
        RefreshFilteredItems();
        RaiseDerivedChanged();
        Save();
    }

    private void OnItemPropertyChanged(object? sender, PropertyChangedEventArgs e)
    {
        if (e.PropertyName is nameof(TodoItem.IsEditing) or nameof(TodoItem.EditTitle))
        {
            return;
        }

        if (e.PropertyName == nameof(TodoItem.Completed))
        {
            RefreshFilteredItems();
        }

        RaiseDerivedChanged();
        Save();
    }

    private void RefreshFilteredItems()
    {
        List<TodoItem> expected = Filtered(_filter).ToList();
        _filteredItems.Clear();
        foreach (TodoItem item in expected)
        {
            _filteredItems.Add(item);
        }
    }

    private void RaiseDerivedChanged()
    {
        OnPropertyChanged(nameof(ActiveCount));
        OnPropertyChanged(nameof(CompletedCount));
        OnPropertyChanged(nameof(CounterText));
        OnPropertyChanged(nameof(AllCompleted));
        OnPropertyChanged(nameof(ShowClearCompleted));
        OnPropertyChanged(nameof(ShowMainAndFooter));
    }

    private void Save() => _repository.Save(CreateSnapshot());

    private void OnPropertyChanged([CallerMemberName] string? propertyName = null) =>
        PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
}
