import { Component, TemplateRef, OnInit } from '@angular/core';
import { FormBuilder, FormArray, FormControl } from '@angular/forms';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import {
    TodoListsClient, TodoItemsClient,
    TodoListDto, TodoItemDto, PriorityLevelDto,
    CreateTodoListCommand, UpdateTodoListCommand,
    CreateTodoItemCommand, UpdateTodoItemDetailCommand, TagDto, TagsClient, CreateTagCommand,
} from '../web-api-client';

@Component({
    selector: 'app-todo-component',
    templateUrl: './todo.component.html',
    styleUrls: ['./todo.component.scss']
})
export class TodoComponent implements OnInit {
    debug = false;
    deleting = false;
    deleteCountDown = 0;
    deleteCountDownInterval: any;
    lists: TodoListDto[];
    priorityLevels: PriorityLevelDto[];
    selectedList: TodoListDto;
    selectedItem: TodoItemDto;
    newListEditor: any = {};
    newTagsEditor: any = {};
    newAddedTags: any = {};
    listOptionsEditor: any = {};
    newListModalRef: BsModalRef;
    listOptionsModalRef: BsModalRef;
    deleteListModalRef: BsModalRef;
    itemDetailsModalRef: BsModalRef;
    itemDetailsFormGroup = this.fb.group({
        id: [null],
        listId: [null],
        priority: [''],
        note: [''], 
        nTag: [''],
        tags: this.fb.array([]),
    });
    createTagCommands: any = {};
    addedTags: any;
    deletedTag: TagDto[] = [];
    distinctTags: string[] = [];
    selectedTags: string[] = [];
    filteredTodoItems: any = [];
    searchText: string = '';
    mostUsedTags: string[] = [];


    constructor(
        private listsClient: TodoListsClient,
        private itemsClient: TodoItemsClient,
        private tagsClient: TagsClient,
        private modalService: BsModalService,
        private fb: FormBuilder,
    ) { }

    ngOnInit(): void {
        this.listsClient.get().subscribe(
            result => {
                this.lists = result.lists;
                this.priorityLevels = result.priorityLevels;
                this.distinctTags = this.extractDistinctTags();
                if (this.lists.length) {
                    this.selectedList = this.lists[0];
                    this.filterTodoItems(); 
                    this.calculateMostUsedTags();
                }
            },
            error => console.error(error)
        );
    }

    extractDistinctTags(): string[] {
        const allTags: string[] = [];
        this.lists.forEach((list) => {
            list.items.forEach((item) => {
                const tagTitles = item.tags.map(tag => tag.title);
                allTags.push(...tagTitles);
            });
        });

        const distinctSortedTags = Array.from(new Set(allTags)).sort((a, b) => a.localeCompare(b));
        return distinctSortedTags;
    }

    filterTodoItems(): void {
        if (this.selectedTags.length > 0) {
            this.filteredTodoItems = this.selectedList.items.filter((item) =>
                item.tags.some((itemTag) => this.selectedTags.includes(itemTag.title))
            );
        } else {
            this.filteredTodoItems = this.selectedList.items;
        }
    }

    toggleTag(tag: string): void {
        const index = this.selectedTags.indexOf(tag);
        if (index === -1) {
            this.selectedTags.push(tag);
        } else {
            this.selectedTags.splice(index, 1);
        }
        this.filterTodoItems();
    }

    filterItemsBySearch() {
        if (this.searchText.trim() === '') {
            this.filterTodoItems();
        } else {
            this.filteredTodoItems = this.selectedList.items.filter((item) =>
                item.title.toLowerCase().includes(this.searchText.toLowerCase())
            );
        }
    }

    calculateMostUsedTags(): void {
        const tagFrequency: { [tag: string]: number } = {};
        this.selectedList.items.forEach(item => {
            item.tags.forEach(tag => {
                tagFrequency[tag.title] = (tagFrequency[tag.title] || 0) + 1;
            });
        });
        const sortedTags = Object.keys(tagFrequency).sort((a, b) => tagFrequency[b] - tagFrequency[a]);
        this.mostUsedTags = sortedTags.slice(0, 3);
    }

    addTag() {

        const nTag = this.itemDetailsFormGroup.get('nTag').value;

        if (nTag && nTag.trim() !== '') {
            this.newTagsEditor = {
                id: 0,
                itemId: this.selectedItem.id,
                title: nTag,
            } as TagDto;

            this.selectedItem.tags.push(this.newTagsEditor);
            this.itemDetailsFormGroup.get('nTag').setValue('');
        }
    }

    removeTag(index: number) {
        const removedTag = this.selectedItem.tags.splice(index, 1)[0];
        this.deletedTag.push(removedTag);
    }

    // Lists
    remainingItems(list: TodoListDto): number {
        return list.items.filter(t => !t.done).length;
    }

    showNewListModal(template: TemplateRef<any>): void {
        this.newListModalRef = this.modalService.show(template);
        setTimeout(() => document.getElementById('title').focus(), 250);
    }

    newListCancelled(): void {
        this.newListModalRef.hide();
        this.newListEditor = {};
    }

    addList(): void {
        const list = {
            id: 0,
            title: this.newListEditor.title,
            items: []
        } as TodoListDto;

        this.listsClient.create(list as CreateTodoListCommand).subscribe(
            result => {
                list.id = result;
                this.lists.push(list);
                this.selectedList = list;
                this.newListModalRef.hide();
                this.newListEditor = {};
            },
            error => {
                const errors = JSON.parse(error.response);

                if (errors && errors.Title) {
                    this.newListEditor.error = errors.Title[0];
                }

                setTimeout(() => document.getElementById('title').focus(), 250);
            }
        );
    }

    showListOptionsModal(template: TemplateRef<any>) {
        this.listOptionsEditor = {
            id: this.selectedList.id,
            title: this.selectedList.title
        };

        this.listOptionsModalRef = this.modalService.show(template);
    }

    updateListOptions() {
        const list = this.listOptionsEditor as UpdateTodoListCommand;
        this.listsClient.update(this.selectedList.id, list).subscribe(
            () => {
                (this.selectedList.title = this.listOptionsEditor.title),
                    this.listOptionsModalRef.hide();
                this.listOptionsEditor = {};
            },
            error => console.error(error)
        );
    }

    confirmDeleteList(template: TemplateRef<any>) {
        this.listOptionsModalRef.hide();
        this.deleteListModalRef = this.modalService.show(template);
    }

    deleteListConfirmed(): void {
        this.listsClient.delete(this.selectedList.id).subscribe(
            () => {
                this.deleteListModalRef.hide();
                this.lists = this.lists.filter(t => t.id !== this.selectedList.id);
                this.selectedList = this.lists.length ? this.lists[0] : null;
            },
            error => console.error(error)
        );
    }

    // Items
    showItemDetailsModal(template: TemplateRef<any>, item: TodoItemDto): void {
        this.selectedItem = item;
        this.itemDetailsFormGroup.patchValue(this.selectedItem);

        this.itemDetailsModalRef = this.modalService.show(template);
        this.itemDetailsModalRef.onHidden.subscribe(() => {
            this.stopDeleteCountDown();
        });
    }

    updateItemDetails(): void {

        this.addedTags = this.selectedItem.tags.filter(x => x.id == 0);

        const tag = {
            id: 0,
            tags: this.addedTags,
        } as TodoItemDto;

        if (this.addedTags.length > 0) {
            this.tagsClient.create(tag as CreateTagCommand).subscribe(
                (result) => {
                    this.newListModalRef.hide();
                    this.newTagsEditor = {};

                    
                },
                error => {
                    const errors = JSON.parse(error.response);

                    if (errors && errors.Title) {
                        this.newListEditor.error = errors.Title[0];
                    }

                    setTimeout(() => document.getElementById('title').focus(), 250);
                }
            );
        }

        if (this.deletedTag.length > 0) {
            const tagIds = this.deletedTag.map(tag => tag.id);
            this.tagsClient.delete('id',tagIds).subscribe(
                () => {
                    this.selectedItem.tags = this.selectedItem.tags.filter(
                        t => t.id !== tag.id
                    );
                    this.deletedTag = [];
                },
            );
        }

        const item = new UpdateTodoItemDetailCommand(this.itemDetailsFormGroup.value);
        this.itemsClient.updateItemDetails(this.selectedItem.id, item).subscribe(
            () => {
                if (this.selectedItem.listId !== item.listId) {
                    this.selectedList.items = this.selectedList.items.filter(
                        i => i.id !== this.selectedItem.id
                    );
                    const listIndex = this.lists.findIndex(
                        l => l.id === item.listId
                    );
                    this.selectedItem.listId = item.listId;
                    this.lists[listIndex].items.push(this.selectedItem);
                }

                this.selectedItem.priority = item.priority;
                this.selectedItem.note = item.note;
                this.calculateMostUsedTags();
                this.distinctTags = this.extractDistinctTags();
                this.itemDetailsModalRef.hide();
                this.itemDetailsFormGroup.reset();
            },
            error => console.error(error)
        );
    }

    addItem() {
        const item = {
            id: 0,
            listId: this.selectedList.id,
            priority: this.priorityLevels[0].value,
            title: '',
            done: false,
            tags: [],
        } as TodoItemDto;

        this.selectedList.items.push(item);
        const index = this.selectedList.items.length - 1;
        this.editItem(item, 'itemTitle' + index);
    }

    editItem(item: TodoItemDto, inputId: string): void {
        this.selectedItem = item;
        setTimeout(() => document.getElementById(inputId).focus(), 100);
    }

    updateItem(item: TodoItemDto, pressedEnter: boolean = false): void {
        const isNewItem = item.id === 0;

        if (!item.title.trim()) {
            this.deleteItem(item);
            return;
        }

        if (item.id === 0) {
            this.itemsClient
                .create({
                    ...item, listId: this.selectedList.id
                } as CreateTodoItemCommand)
                .subscribe(
                    result => {
                        item.id = result;
                    },
                    error => console.error(error)
                );
        } else {
            this.itemsClient.update(item.id, item).subscribe(
                () => console.log('Update succeeded.'),
                error => console.error(error)
            );
        }

        this.selectedItem = null;

        if (isNewItem && pressedEnter) {
            setTimeout(() => this.addItem(), 250);
        }
    }

    deleteItem(item: TodoItemDto, countDown?: boolean) {
        if (countDown) {
            if (this.deleting) {
                this.stopDeleteCountDown();
                return;
            }
            this.deleteCountDown = 3;
            this.deleting = true;
            this.deleteCountDownInterval = setInterval(() => {
                if (this.deleting && --this.deleteCountDown <= 0) {
                    this.deleteItem(item, false);
                }
            }, 1000);
            return;
        }
        this.deleting = false;
        if (this.itemDetailsModalRef) {
            this.itemDetailsModalRef.hide();
        }

        if (item.id === 0) {
            const itemIndex = this.selectedList.items.indexOf(this.selectedItem);
            this.selectedList.items.splice(itemIndex, 1);
        } else {
            this.itemsClient.delete(item.id).subscribe(
                () =>
                (this.selectedList.items = this.selectedList.items.filter(
                    t => t.id !== item.id
                )),
                error => console.error(error)
            );
        }
    }

    stopDeleteCountDown() {
        clearInterval(this.deleteCountDownInterval);
        this.deleteCountDown = 0;
        this.deleting = false;
    }
}