using SvelteStore.Application.Common.Interfaces;
using SvelteStore.Application.TodoLists.Queries.ExportTodos;
using SvelteStore.Infrastructure.Files.Maps;
using CsvHelper;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using CsvHelper.Configuration;

namespace SvelteStore.Infrastructure.Files
{
    public class CsvFileBuilder : ICsvFileBuilder
    {
        private const string delimiter = "\t";
        public byte[] BuildTodoItemsFile(IEnumerable<TodoItemRecord> records)
        {
            using var memoryStream = new MemoryStream();
            using (var streamWriter = new StreamWriter(memoryStream))
            {
                streamWriter.WriteLine($"sep={delimiter}"); // Excel compatibility

                var config = new CsvConfiguration(CultureInfo.InvariantCulture)
                {
                    Delimiter = delimiter
                };
                using var csvWriter = new CsvWriter(streamWriter, config);
                
                csvWriter.Context.RegisterClassMap<TodoItemRecordMap>();
                csvWriter.WriteRecords(records);
            }

            return memoryStream.ToArray();
        }
    }
}
