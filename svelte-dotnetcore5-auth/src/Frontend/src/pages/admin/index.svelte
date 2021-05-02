<script lang="ts">
    import { url, ready } from "@roxi/routify";
    import { TodoListDto, TodoListsClient } from "../../app/web-api-client";
import { appSettings } from "../../common/app-settings";

    $ready()

    const client = new TodoListsClient(appSettings.API_URL);

    async function getTodoLists(): Promise<TodoListDto[]> {
        const { lists } = await client.get();
        return lists;
    }

</script>

<div class="center-all">
    <h1>Todo lists</h1>

    {#await getTodoLists()}
        Getting todo lists
    {:then todoLists}
        <ul>
            {#each todoLists as todoItem}
                <li>
                    <a href={$url('./:listId', { listId: todoItem.id })}>{todoItem.title}</a>
                </li>
            {/each}
        </ul>

    {/await}
</div>
