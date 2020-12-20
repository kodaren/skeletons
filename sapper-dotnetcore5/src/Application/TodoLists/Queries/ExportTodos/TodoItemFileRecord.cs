using SvelteStore.Application.Common.Mappings;
using SvelteStore.Domain.Entities;

namespace SvelteStore.Application.TodoLists.Queries.ExportTodos
{
    public class TodoItemRecord : IMapFrom<TodoItem>
    {
        public string Title { get; set; }

        public bool Done { get; set; }
    }
}
