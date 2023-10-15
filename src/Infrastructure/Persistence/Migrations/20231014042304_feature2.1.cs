using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Todo_App.Infrastructure.Persistence.Migrations
{
    public partial class feature21 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Tags_TodoItems_TodoItemId",
                table: "Tags");

            migrationBuilder.DropIndex(
                name: "IX_Tags_TodoItemId",
                table: "Tags");

            migrationBuilder.DropColumn(
                name: "TodoItemId",
                table: "Tags");

            migrationBuilder.CreateIndex(
                name: "IX_Tags_ItemId",
                table: "Tags",
                column: "ItemId");

            migrationBuilder.AddForeignKey(
                name: "FK_Tags_TodoItems_ItemId",
                table: "Tags",
                column: "ItemId",
                principalTable: "TodoItems",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Tags_TodoItems_ItemId",
                table: "Tags");

            migrationBuilder.DropIndex(
                name: "IX_Tags_ItemId",
                table: "Tags");

            migrationBuilder.AddColumn<int>(
                name: "TodoItemId",
                table: "Tags",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Tags_TodoItemId",
                table: "Tags",
                column: "TodoItemId");

            migrationBuilder.AddForeignKey(
                name: "FK_Tags_TodoItems_TodoItemId",
                table: "Tags",
                column: "TodoItemId",
                principalTable: "TodoItems",
                principalColumn: "Id");
        }
    }
}
