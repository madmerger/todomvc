using System.Globalization;
using System.Windows;
using System.Windows.Data;

namespace TodoMvc.Wpf;

/// <summary>Collapses the element when the bound boolean is true.</summary>
public sealed class InverseBooleanToVisibilityConverter : IValueConverter
{
    public object Convert(object value, Type targetType, object parameter, CultureInfo culture) =>
        value is true ? Visibility.Collapsed : Visibility.Visible;

    public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture) =>
        value is Visibility.Collapsed;
}
