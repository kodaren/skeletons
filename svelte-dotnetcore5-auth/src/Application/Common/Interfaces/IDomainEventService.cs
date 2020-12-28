using SvelteStore.Domain.Common;
using System.Threading.Tasks;

namespace SvelteStore.Application.Common.Interfaces
{
    public interface IDomainEventService
    {
        Task Publish(DomainEvent domainEvent);
    }
}
