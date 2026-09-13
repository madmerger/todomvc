using System.Windows;
using TodoMvc.Core;

namespace TodoMvc.Wpf;

public partial class MainWindow : Window
{
    public MainWindow()
        : this(new MainViewModel(new JsonTodoRepository()))
    {
    }

    public MainWindow(MainViewModel viewModel)
    {
        InitializeComponent();
        DataContext = viewModel;
    }

    /// <summary>The spec requires an edit to be saved on blur as well as on Enter.</summary>
    private void OnEditBoxLostFocus(object sender, RoutedEventArgs e)
    {
        if (sender is FrameworkElement { DataContext: TodoItem item } && DataContext is MainViewModel viewModel)
        {
            viewModel.Store.CommitEdit(item);
        }
    }
}
