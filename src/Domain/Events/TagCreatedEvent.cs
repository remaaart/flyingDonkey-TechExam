using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Todo_App.Domain.Events;
public class TagCreatedEvent : BaseEvent
{
    public TagCreatedEvent(Tag tag)
    {
        tag = tag;
    }

    public Tag Tag { get; }
}
