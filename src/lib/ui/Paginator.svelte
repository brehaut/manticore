<script lang="ts">
    import Arrow from "./Arrow.svelte";
    import { range } from '$lib/iter.js';
    import { onMount } from 'svelte';
    import { debounce } from './debounce.js';
    import { ArrowFacing } from './arrowFacing.js';

    export let count: number;
    export let page: number;
    export let pageSize: number;

    $: totalPages = Math.floor(count / pageSize);

    function next() { page = Math.min(totalPages, page + 1); }
    function toPage(n:number) { page = Math.max(Math.min(totalPages, n), 0); }

    let numberPages = 20;

    const setNumberPages = debounce(() => {
        if (window.matchMedia("(min-width:800px)").matches) {
            numberPages = 20;
        }
        else {
            numberPages = 10;
        }
    });

    setNumberPages();

    onMount(() => {
        window.addEventListener('resize', setNumberPages);
    });

    $: firstShorthandPage = Math.max(0, page - (numberPages / 2));
    $: lastShorthandPage = Math.min(firstShorthandPage + numberPages, totalPages)
    $: pageNumbers = Array.from(range(Math.max(0, lastShorthandPage - numberPages), lastShorthandPage));
</script>

{#if totalPages > 1}
<div class="paginator">    
    <!-- svelte-ignore missing-declaration -->
    <button on:click={() => toPage(page - 1)} disabled={page - 1 < 0} class="prev"><Arrow /></button> 
    <ul class="pages">
        {#each pageNumbers as p}
            <li>
                {#if page === p}
                <span>{p + 1}</span>
                {:else}
                <button on:click={() => toPage(p)}>{p + 1}</button>
                {/if}
            </li>
        {/each}
    </ul>
    <button on:click={() => toPage(page + 1)} disabled={page + 1 > totalPages} class="next"><Arrow facing={ArrowFacing.Right}/></button> 
    <span class="summary">{page + 1} of {totalPages + 1}</span>
</div>
{/if}


<style>
    .paginator { 
        display: grid;
        grid-template-columns: min-content auto min-content;
        gap: 1rem;
        font-size: 1.2rem;
    }

    .pages {
        display: flex;
        justify-content: space-between;
        margin: 0;
        padding: 0;
        list-style: none;
        width: 100%;
        padding-left: 0;
    }

    .pages > li > span {
        display: block;
        line-height: 1.5;
    }

    button {
        border: none;
        background: transparent;
        color: var(--brand-color);
        cursor: pointer;
        font-family: Alegreya;
        font-size: 1.2rem;
    }

    .prev, .next {
        font-size: 1.25rem;
        padding-top: 0.3rem;
    }

    .summary {
        display: none;
    }

    @media screen and (min-width: 750px) {
        .paginator { 
            grid-template-columns: min-content auto min-content max-content;
        }

        .summary {
            display: block;
            min-width: calc(100% / 12);
        }
    }
</style>