using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Todo_App.Domain.Events;
public class TagDeletedEvent : BaseEvent
{
    public TagDeletedEvent(Tag tag)
    {
        Tag = tag;
    }

    public Tag Tag { get; }
}