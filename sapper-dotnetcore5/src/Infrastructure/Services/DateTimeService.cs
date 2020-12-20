using SvelteStore.Application.Common.Interfaces;
using System;

namespace SvelteStore.Infrastructure.Services
{
    public class DateTimeService : IDateTime
    {
        public DateTime Now => DateTime.Now;
    }
}
