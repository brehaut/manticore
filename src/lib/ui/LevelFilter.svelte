<script lang="ts">
    import type { Bestiary } from '$lib/bestiary.js';
    import { range } from '$lib/iter.js';
    import { createEventDispatcher } from 'svelte';
    import Page from '../../routes/+page.svelte';
    import FacetCheckbox from "./FacetCheckbox.svelte";
    import FilterList from "./FilterList.svelte";
    import { _ } from "./strings";

    export let battleLevel:number;
    export let bestiary:Bestiary;
    export let counts:Map<string, number> | undefined;
    const facet = "level";

    let dispatcher = createEventDispatcher();
    $: availableLevels = new Set(bestiary.allLevels())

    $: levels = Array.from(range(battleLevel - 2, battleLevel + 2))
        .filter(level => availableLevels.has(level));
    let enabled = false;

    let selected = new Set<string>();

    $: { battleLevelChanged(levels); }

    function battleLevelChanged(levels: number[]) {
        const oldSelected = selected;
        selected = new Set(levels.filter(l => oldSelected.has(l.toString())).map(l => l.toString()));

        dispatcher("change", {facet, selected});        
    }
    
    function levelToggled(ev: CustomEvent<{value:string, checked:boolean}>) {
        if (ev.detail.checked) {
            selected.add(ev.detail.value);
        }
        else {
            selected.delete(ev.detail.value);
        }

        dispatcher("change", {facet, selected});
    }

    function enable() {
        enabled = true;
    }
</script>

<FilterList heading="Levels" width={1} bind:enabled>
    {#each levels as level (level)}
    <li>            
        <FacetCheckbox 
            text={_("Level %".replace("%", level.toString()))} 
            value={level.toString()} 
            showCount={true} 
            count={counts?.get(level.toString()) ?? 0}
            checked={false}
            {enabled} 
            on:change={levelToggled} 
            on:click={enable} 
            on:keyup={enable}
            />
    </li>
    {/each}
</FilterList>

