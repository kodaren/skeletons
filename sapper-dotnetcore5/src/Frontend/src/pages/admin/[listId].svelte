<script lang="ts">
    import { ready } from "@roxi/routify";
    import {
        PaginatedListOfTodoItemDto,
        TodoItemsClient,
    } from "../../app/web-api-client";

    export let listId: number

	$ready();

    const client = new TodoItemsClient("https://localhost:44300");


    async function getTodoItems(): Promise<PaginatedListOfTodoItemDto> {
        const list: PaginatedListOfTodoItemDto = await client.getTodoItemsWithPagination(
            listId,
            1,
            10
        );
        return list;
    }
</script>

<div class="center-all">
    {#await getTodoItems()}
        Getting todo items
    {:then paginatedListOfitems}
        <h1>Todo Items ({paginatedListOfitems.totalCount})</h1>
        <ul>
            {#each paginatedListOfitems.items as todoItem, i}
                <li>{todoItem.title} {todoItem.done}</li>
            {/each}
        </ul>
    {/await}
</div>
