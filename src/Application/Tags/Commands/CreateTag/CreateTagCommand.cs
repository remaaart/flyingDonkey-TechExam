using MediatR;
using Todo_App.Application.Common.Exceptions;
using Todo_App.Application.Common.Interfaces;
using Todo_App.Application.TodoLists.Queries.GetTodos;
using Todo_App.Domain.Entities;
using Todo_App.Domain.Events;

namespace Todo_App.Application.Tags.Commands.CreateTag;
public class CreateTagCommand : IRequest<List<int>>
{
    public List<TagDto> Tags { get; init; }
}

public class CreateTagCommandHandler : IRequestHandler<CreateTagCommand, List<int>>
{
    private readonly IApplicationDbContext _context;

    public CreateTagCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<int>> Handle(CreateTagCommand request, CancellationToken cancellationToken)
    {
        var createdTagIds = new List<int>();
        try
        {
            foreach (var tagData in request.Tags)
            {
                var entity = new Tag
                {
                    ItemId = tagData.ItemId,
                    Title = tagData.Title,
                };

                entity.AddDomainEvent(new TagCreatedEvent(entity));

                _context.Tags.Add(entity);

                await _context.SaveChangesAsync(cancellationToken);

                createdTagIds.Add(entity.Id);
            }
        }
        catch (ValidationException ex)
        {
            throw ex; 
        }
        return createdTagIds;
    }
}
