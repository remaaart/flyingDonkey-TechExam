using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using FluentValidation;
using Todo_App.Application.TodoItems.Commands.CreateTodoItem;

namespace Todo_App.Application.Tags.Commands.CreateTag;
public class CreateTagCommandValidator : AbstractValidator<CreateTodoItemCommand>
{
    public CreateTagCommandValidator()
    {
       /* RuleFor(v => v.Title)
            .MaximumLength(200)
            .NotEmpty();*/
    }
}
