using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Runtime.CompilerServices;
using System.Windows.Input;
using TodoMvc.Core;

namespace TodoMvc.Wpf;

public sealed class MainViewModel : INotifyPropertyChanged
{
    private string _newTodoTitle = string.Empty;

    public MainViewModel(ITodoRepository repository)
    {
        Store = new TodoStore(repository);
        Store.PropertyChanged += (_, e) =>
        {
            OnPropertyChanged(e.PropertyName);
            if (e.PropertyName == nameof(TodoStore.Filter))
            {
                OnPropertyChanged(nameof(IsAllFilter));
                OnPropertyChanged(nameof(IsActiveFilter));
                OnPropertyChanged(nameof(IsCompletedFilter));
            }
        };

        AddCommand = new RelayCommand(AddTodo);
        RemoveCommand = new RelayCommand(parameter => Store.Remove((TodoItem)parameter!));
        StartEditCommand = new RelayCommand(parameter => Store.StartEdit((TodoItem)parameter!));
        CommitEditCommand = new RelayCommand(parameter => Store.CommitEdit((TodoItem)parameter!));
        CancelEditCommand = new RelayCommand(parameter => Store.CancelEdit((TodoItem)parameter!));
        ClearCompletedCommand = new RelayCommand(Store.ClearCompleted);
        SetFilterCommand = new RelayCommand(parameter => Store.Filter = (TodoFilter)parameter!);
    }

    public TodoStore Store { get; }

    public ReadOnlyObservableCollection<TodoItem> VisibleTodos => Store.FilteredItems;

    public string NewTodoTitle
    {
        get => _newTodoTitle;
        set
        {
            if (_newTodoTitle == value)
            {
                return;
            }

            _newTodoTitle = value;
            OnPropertyChanged();
        }
    }

    public bool IsAllFilter => Store.Filter == TodoFilter.All;

    public bool IsActiveFilter => Store.Filter == TodoFilter.Active;

    public bool IsCompletedFilter => Store.Filter == TodoFilter.Completed;

    public ICommand AddCommand { get; }

    public ICommand RemoveCommand { get; }

    public ICommand StartEditCommand { get; }

    public ICommand CommitEditCommand { get; }

    public ICommand CancelEditCommand { get; }

    public ICommand ClearCompletedCommand { get; }

    public ICommand SetFilterCommand { get; }

    public event PropertyChangedEventHandler? PropertyChanged;

    private void AddTodo()
    {
        if (Store.Add(NewTodoTitle) is not null)
        {
            NewTodoTitle = string.Empty;
        }
    }

    private void OnPropertyChanged([CallerMemberName] string? propertyName = null) =>
        PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
}
