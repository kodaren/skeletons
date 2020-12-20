using SvelteStore.Domain.Common;
using SvelteStore.Domain.Entities;

namespace SvelteStore.Domain.Events
{
    public class TodoItemCompletedEvent : DomainEvent
    {
        public TodoItemCompletedEvent(TodoItem item)
        {
            Item = item;
        }

        public TodoItem Item { get; }
    }
}
