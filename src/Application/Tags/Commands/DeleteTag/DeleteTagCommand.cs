﻿using MediatR;
using Todo_App.Application.Common.Exceptions;
using Todo_App.Application.Common.Interfaces;
using Todo_App.Domain.Entities;
using Todo_App.Domain.Events;

namespace Todo_App.Application.Tags.Commands.DeleteTag;

public record DeleteTagCommand(List<int> Id) : IRequest;

public class DeleteTagCommandHandler : IRequestHandler<DeleteTagCommand>
{
    private readonly IApplicationDbContext _context;

    public DeleteTagCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Unit> Handle(DeleteTagCommand request, CancellationToken cancellationToken)
    {
        foreach (var tagData in request.Id)
        {
            var entity = await _context.Tags
            .FindAsync(new object[] { tagData }, cancellationToken);

            if (entity == null)
            {
                throw new NotFoundException(nameof(Tag), request.Id);
            }

            _context.Tags.Remove(entity);

            entity.AddDomainEvent(new TagDeletedEvent(entity));

            await _context.SaveChangesAsync(cancellationToken);

        }

        return Unit.Value;
    }
}
