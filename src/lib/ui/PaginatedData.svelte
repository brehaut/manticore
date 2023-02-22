<script lang="ts">
    import Paginator from "./Paginator.svelte";


    type T = $$Generic;

    export let items:T[];
    export let pageSize = 50;

    let page = 0;
    $: view = items.slice(page * pageSize, (page * pageSize) + pageSize);
</script>

<section>
    <header>
        <Paginator count={items.length} bind:page {pageSize} />
    </header>
    
    {#each view as item}
        <slot {item}></slot>
    {/each}

    <footer>
        <Paginator count={items.length} bind:page {pageSize} />
    </footer>
</section>

<style>
    header {
        margin-top: 1rem;
        margin-bottom: -2rem;
    }

    footer {
        margin-top: 1rem;
    }
</style>