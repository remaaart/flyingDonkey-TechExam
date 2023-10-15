using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Todo_App.Application.Common.Mappings;
using Todo_App.Domain.Entities;

namespace Todo_App.Application.TodoLists.Queries.GetTodos;

public class TagDto : IMapFrom<Tag>
{
    public int Id { get; set; }

    public int ItemId { get; set; }

    public string? Title { get; set; }
}
