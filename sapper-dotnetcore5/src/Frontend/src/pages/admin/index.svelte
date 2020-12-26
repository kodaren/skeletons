<script lang="ts">
    import { authStore } from "../../oauth";

    import { TodoItemDto, TodoListsClient } from "../../app/web-api-client";

    const client = new TodoListsClient("https://localhost:44300");

    async function getTodoItems(): Promise<TodoItemDto[]> {
        client.token = await authStore.getAccessToken();
        const { lists } = await client.get();
        return lists;
    }

    authStore.getAccessToken().then((token: string) => (client.token = token));
</script>

<div class="center-all">
    <h1>ADMIN</h1>

    {#await getTodoItems()}
        Getting todo list
    {:then items}
        <h2>Items</h2>
        <ul>
            {#each items as item,i}
            <li>{i}: {item.title}</li>
                 <!-- content here -->
            {/each}
        </ul>
    {/await}
</div>
