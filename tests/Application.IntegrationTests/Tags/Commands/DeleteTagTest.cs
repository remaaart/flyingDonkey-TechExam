using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using NUnit.Framework;
using Todo_App.Application.Common.Exceptions;
using Todo_App.Application.Tags.Commands.CreateTag;
using Todo_App.Application.Tags.Commands.DeleteTag;
using Todo_App.Application.TodoItems.Commands.CreateTodoItem;
using Todo_App.Application.TodoLists.Commands.CreateTodoList;
using Todo_App.Application.TodoLists.Queries.GetTodos;
using Todo_App.Domain.Entities;

namespace Todo_App.Application.IntegrationTests.Tags.Commands;

using static Testing;

public class DeleteTagTest : BaseTestFixture
{
    [Test]
    public async Task ShouldRequireValidTodoItemId()
    {
        var command = new DeleteTagCommand(
            new List<int> { 99 });

        await FluentActions.Invoking(() =>
            SendAsync(command)).Should().ThrowAsync<NotFoundException>();
    }

    [Test]
    public async Task ShouldDeleteTodoItem()
    {
        var listId = await SendAsync(new CreateTodoListCommand
        {
            Title = "New List"
        });

        var itemId = await SendAsync(new CreateTodoItemCommand
        {
            ListId = listId,
            Title = "New Item"
        });

        var tagId = await SendAsync(new CreateTagCommand
        {
            Tags = new List<TagDto>
            {
                new TagDto
                {
                    ItemId = itemId,
                    Title = "Tasks",
                }
            }
        });

        await SendAsync(new DeleteTagCommand(tagId));

        var tag = new Tag();

        List<Tag> tags = new List<Tag>();
        foreach (var id in tagId)
        {
            tag = await FindAsync<Tag>(id);
            if (tag != null)
            {
                tags.Add(tag);
            }
        }

        tag.Should().BeNull();
    }
}
