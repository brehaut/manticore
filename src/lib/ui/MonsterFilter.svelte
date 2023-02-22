<script lang="ts">
    import Section from "./Section.svelte";
    import FacetFilter from "./FacetFilter.svelte";
    import type { FacetCounts, Monster } from "$lib/data";
    import { clusterItems } from '$lib/clusterItems.js';

    export let monsters: Monster[];
</script>

<Section heading="Specific monsters" summary="Optionally choose specific monsters from the filtered results." collapsed>
    <FacetFilter facet="name" heading="Monters" values={monsters.map(m => m.name)} width={6} cluster on:change />
</Section>


<style>
</style>