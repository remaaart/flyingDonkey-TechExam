using FluentAssertions;
using NUnit.Framework;
using Todo_App.Domain.Entities;
using Todo_App.Application.Common.Exceptions;
using Todo_App.Application.Tags.Commands.CreateTag;
using Todo_App.Application.TodoItems.Commands.CreateTodoItem;
using Todo_App.Application.TodoLists.Commands.CreateTodoList;
using Todo_App.Application.TodoLists.Queries.GetTodos;
using System.Collections.Generic;
using System.Collections;
using Microsoft.EntityFrameworkCore;

namespace Todo_App.Application.IntegrationTests.Tags.Commands;

using static Testing;

public class CreateTagTest : BaseTestFixture
{
    [Test]
    public async Task ShouldRequireMinimumFields()
    {
        var command = new CreateTagCommand();

        await FluentActions.Invoking(() =>
            SendAsync(command)).Should().ThrowAsync<NullReferenceException>();
    }

    [Test]
    public async Task ShouldCreateTag()
    {
        var userId = await RunAsDefaultUserAsync();

        var listId = await SendAsync(new CreateTodoListCommand
        {
            Title = "New List"
        });

        var itemId = await SendAsync(new CreateTodoItemCommand
        {
            ListId = listId,
            Title = "Tasks"
        });

        var command = new CreateTagCommand
        {
            Tags = new List<TagDto> 
            {
                new TagDto
                {
                    ItemId = itemId,
                    Title = "Tasks",
                } 
            }
        };

        var tagId = await SendAsync(command);
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

        tag.Should().NotBeNull();
        tag!.ItemId.Should().Be(command.Tags[0].ItemId);
        tag.Title.Should().Be(command.Tags[0].Title);
        tag.CreatedBy.Should().Be(userId);
        tag.Created.Should().BeCloseTo(DateTime.Now, TimeSpan.FromMilliseconds(10000));
    }
}
