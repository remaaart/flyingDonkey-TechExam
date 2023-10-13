using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Todo_App.Domain.Entities;

public class Tag : BaseAuditableEntity
{
    public int Id { get; set; }

    public int ItemId { get; set; }

    public string? Title { get; set; }
}
