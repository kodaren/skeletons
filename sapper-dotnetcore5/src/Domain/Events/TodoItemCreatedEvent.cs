using SvelteStore.Domain.Common;
using SvelteStore.Domain.Entities;

namespace SvelteStore.Domain.Events
{
    public class TodoItemCreatedEvent : DomainEvent
    {
        public TodoItemCreatedEvent(TodoItem item)
        {
            Item = item;
        }

        public TodoItem Item { get; }
    }
}
