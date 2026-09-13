using System.Windows;
using System.Windows.Controls;

namespace TodoMvc.Wpf;

/// <summary>Focuses and selects a text box as soon as it becomes visible (editing mode).</summary>
public static class FocusBehavior
{
    public static readonly DependencyProperty FocusOnVisibleProperty = DependencyProperty.RegisterAttached(
        "FocusOnVisible",
        typeof(bool),
        typeof(FocusBehavior),
        new PropertyMetadata(false, OnFocusOnVisibleChanged));

    public static void SetFocusOnVisible(DependencyObject element, bool value) =>
        element.SetValue(FocusOnVisibleProperty, value);

    public static bool GetFocusOnVisible(DependencyObject element) =>
        (bool)element.GetValue(FocusOnVisibleProperty);

    private static void OnFocusOnVisibleChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
    {
        if (d is not TextBox textBox)
        {
            return;
        }

        if (e.NewValue is true)
        {
            textBox.IsVisibleChanged += OnIsVisibleChanged;
        }
        else
        {
            textBox.IsVisibleChanged -= OnIsVisibleChanged;
        }
    }

    private static void OnIsVisibleChanged(object sender, DependencyPropertyChangedEventArgs e)
    {
        if (sender is not TextBox textBox || e.NewValue is not true)
        {
            return;
        }

        textBox.Dispatcher.BeginInvoke(() =>
        {
            textBox.Focus();
            textBox.CaretIndex = textBox.Text.Length;
        });
    }
}
