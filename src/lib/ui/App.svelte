<script lang="ts">
    import { createBestiary, type Bestiary } from "$lib/bestiary";
    import { onMount } from "svelte";
    import MonsterFilter from "./MonsterFilter.svelte";
    import Loading from "./Loading.svelte";
    import Party from "./Party.svelte";
    import SmartFilters from "./SmartFilters.svelte";
    import Results from "./Results.svelte";
    import EditionPicker from "./Edition.svelte";

    import {
        predicateForFilters,
        type Facet,
        type FilterFacets,
    } from "$lib/data";
    import { getParty, saveParty } from "$lib/party";
    import { getEdition, saveEdition } from "$lib/edition";
    import type { Edition } from "$lib/costs/index";

    let party = getParty();
    $: saveParty(party);

    let bestiary: Bestiary | undefined;
    let edition = getEdition();
    $: saveEdition(edition);

    let filterFacets: FilterFacets = new Map();
    let specificMonsters = new Set<string>();
    $: filteredBestiary =
        bestiary?.filteredBestiary(party, predicateForFilters(filterFacets)) ??
        [];
    $: generationChoices =
        specificMonsters.size !== 0
            ? bestiary?.filteredBestiary(
                  party,
                  predicateForFilters(new Map([["name", specificMonsters]]))
              ) ?? []
            : filteredBestiary;

    $: counts = bestiary?.featureCounts(party, filterFacets) ?? new Map();

    onMount(async () => {
        const req = await fetch("/data/bestiary.json");
        bestiary = createBestiary(await req.json());
    });

    function handleSmartFilterChange(
        ev: CustomEvent<{ facet: Facet; selected: Set<string> }>
    ) {
        filterFacets.set(ev.detail.facet, ev.detail.selected);
        filterFacets = filterFacets;
    }

    function handleMonsterFilerChange(
        ev: CustomEvent<{ facet: "name"; selected: Set<string> }>
    ) {
        specificMonsters = ev.detail.selected;
    }
</script>

<div id="application">
    {#if bestiary === undefined}
        <Loading />
    {:else}
        <EditionPicker bind:edition />
        <Party bind:party {edition} />
        <SmartFilters
            {bestiary}
            on:change={handleSmartFilterChange}
            {counts}
            totalMonsters={filteredBestiary.length}
        />
        <MonsterFilter
            monsters={filteredBestiary}
            on:change={handleMonsterFilerChange}
        />
        <Results {party} choices={generationChoices} />
    {/if}
</div>

<style>
</style>
