# WPF (.NET 8) • TodoMVC

A Windows native desktop implementation of the TodoMVC [app spec](../../app-spec.md), written in C# with
WPF and the MVVM pattern.

## Framework

[WPF](https://learn.microsoft.com/dotnet/desktop/wpf/) is the XAML based UI framework for Windows desktop
apps. Views are declared in XAML and bound to view models through data binding, `INotifyPropertyChanged`
and `ICommand`, which makes MVVM the idiomatic architecture.

## Implementation

| Project | Target | Contents |
| --- | --- | --- |
| `TodoMvc.Core` | `net8.0` | `TodoItem` model, `TodoStore` (all todo logic), `ITodoRepository` and its JSON/in-memory implementations. UI independent, so it runs and is tested on any platform. |
| `TodoMvc.Wpf` | `net8.0-windows` | `MainWindow.xaml` view, `MainViewModel` (thin wrapper exposing commands to XAML), value converters and the edit-box focus behavior. |
| `TodoMvc.Tests` | `net8.0` | xUnit tests covering the app spec functionality against `TodoMvc.Core`. |

- **New todo** — Enter in the header text box adds the trimmed title and clears the input; blank input is ignored.
- **Item** — checkbox toggles `Completed`, double-clicking the title starts editing, `×` destroys the todo.
- **Editing** — the edit box replaces the other controls and takes focus; Enter and losing focus save the
  trimmed title (an empty title destroys the todo), Escape discards the changes.
- **Mark all as complete** — bound to `TodoStore.AllCompleted`, which toggles every todo and is itself
  computed from the items, so it follows individual checkboxes and resets after "Clear completed".
- **Counter / Clear completed** — `"0 items"` / `"1 item"` / `"2 items"`; the button is hidden when nothing
  is completed, and the main and footer sections are hidden when there are no todos.
- **Filters** — All / Active / Completed replace hash routing; the selected filter is highlighted, applied on
  the model level and persisted.
- **Persistence** — `JsonTodoRepository` serializes `id`, `title`, `completed` (plus the active filter) with
  `System.Text.Json` to `%APPDATA%\todos-wpf\todos.json` on every change. Editing state is never persisted.

## Prerequisites

[.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0). Running the app requires Windows; building
and testing the non-UI projects works on any platform.

## Build

```sh
dotnet build TodoMvc.sln
```

## Run

```sh
dotnet run --project TodoMvc.Wpf
```

## Test

```sh
dotnet test TodoMvc.sln
```
