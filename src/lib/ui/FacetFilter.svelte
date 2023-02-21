<script lang="ts">
    import FacetCheckbox from "./FacetCheckbox.svelte";
    import { _ } from "./strings";
    import { createEventDispatcher } from "svelte";
    import type { Facet, FacetCounts } from "$lib/data";
    let dispatcher = createEventDispatcher();
    export let facet: Facet;
    export let heading: string;
    export let values: string[];
    export let width: 1 | 2 | 4 | 6;
    export let counts: FacetCounts | undefined = undefined;
    $: count = counts?.get(facet) ?? new Map();
    $: showCount = counts !== undefined;
    
    let selected = new Set<string>();

    $: sorted = values.sort((a,b) => a.localeCompare(b))

    function tagToggled(ev: CustomEvent<{value:string, checked:boolean}>) {
        if (ev.detail.checked) {
            selected.add(ev.detail.value);
        }
        else {
            selected.delete(ev.detail.value);
        }

        dispatcher("change", {facet, selected});
    }
</script>

<section class="width-{width}">
    <header><h1>{_(heading)}</h1></header>

    <ul>
        {#each sorted as value (value) }
        <li> 
            <FacetCheckbox text={value} value={value} {showCount} count={count?.get(value)} checked={selected.has(value)} on:change={tagToggled}/>
        </li>
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

    .width-2 ul {
        grid-template-columns: 1fr 1fr;
    }

    .width-4 ul {
        grid-template-columns: repeat(4, 1fr);
    }

    .width-6 ul {
        grid-template-columns: repeat(6, 1fr);
    }
</style>