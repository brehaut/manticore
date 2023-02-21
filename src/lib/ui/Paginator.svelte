<script lang="ts">
    export let count: number;
    export let page: number;
    export let pageSize: number;

    $: totalPages = Math.ceil(count / pageSize);

    function next() { page = Math.min(totalPages, page + 1); }
    function prev() { page = Math.max(0, page - 1); }
</script>

{#if totalPages > 1}
<div>
    <button on:click={prev}>{ page - 1 }</button> {page} of {totalPages} <button on:click={next}>{ page + 1 }</button>
</div>
{/if}