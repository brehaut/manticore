<script lang="ts">
    import FacetCheckbox from "./FacetCheckbox.svelte";
    import Toggle from "./Toggle.svelte";

    import { _ } from "./strings";
    import { createEventDispatcher } from "svelte";
    import type { Facet, FacetCounts } from "$lib/data";
    import { clusterItems } from '$lib/clusterItems.js';
    let dispatcher = createEventDispatcher();
    export let facet: Facet;
    export let heading: string;
    export let values: string[];
    export let cluster = false;
    export let width: 1 | 2 | 4 | 6;
    export let counts: FacetCounts | undefined = undefined;
    $: count = counts?.get(facet) ?? new Map();
    $: showCount = counts !== undefined;
    
    let selected = new Set<string>();
    let enabled = false;

    $: sorted = Array.from(clusterItems(values.sort((a,b) => a.localeCompare(b)), a => a));

    function tagToggled(ev: CustomEvent<{value:string, checked:boolean}>) {
        if (ev.detail.checked) {
            selected.add(ev.detail.value);
        }
        else {
            selected.delete(ev.detail.value);
        }

        dispatcher("change", {facet, selected});
    }

    $: { 
        dispatcher("change", {facet, selected: enabled ? selected : new Set()});
    }

    function enable() {
        enabled = true;
    }
</script>

<section class="width-{width}">
    <header><h1>{_(heading)} <Toggle bind:enabled/></h1></header>

    <ul>
        {#each sorted as group (group.title) }
        {#if cluster}
        <li class="title">{ group.title}</li>
        {/if}
        {#each group.items as value}        
        <li> 
            <FacetCheckbox text={value} value={value} {showCount} count={count?.get(value)} checked={selected.has(value)} {enabled} on:change={tagToggled} on:click={enable} on:keyup={enable}/>
        </li>
        {/each}
        {/each}
    </ul>
</section>

<style>
    section ul {
        display: grid;
        padding-left: 0;
        list-style: none;
        grid-column-gap: 0;
    }

    .width-2 ul, .width-4 ul, .width-6 ul {
        grid-template-columns: 1fr 1fr;
    }

    @media screen and (min-width:725px) {
        .width-6 ul {
            grid-template-columns: repeat(4, 1fr);
        }
    }

    @media screen and (min-width:1000px) {
        .width-4 ul {
            grid-template-columns: repeat(4, 1fr);
        }

        .width-6 ul {
            grid-template-columns: repeat(6, 1fr);
        }
    }

    li.title {
        grid-column-start: 1;
        grid-column-end: -1;
        font-weight: bold;
        margin-top: 0.25rem;
    }
</style>