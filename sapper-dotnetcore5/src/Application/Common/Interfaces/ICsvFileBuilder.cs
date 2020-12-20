using SvelteStore.Application.TodoLists.Queries.ExportTodos;
using System.Collections.Generic;

namespace SvelteStore.Application.Common.Interfaces
{
    public interface ICsvFileBuilder
    {
        byte[] BuildTodoItemsFile(IEnumerable<TodoItemRecord> records);
    }
}
