<script lang="ts">
    import Section from "./Section.svelte";
    import type { Bestiary } from "../bestiary";
    import FacetFilter from "./FacetFilter.svelte";
    import type { FacetCounts } from "$lib/data";
    import { _ } from "./strings";

    export let bestiary: Bestiary;
    export let counts: FacetCounts;
    export let totalMonsters: number;
</script>

<Section heading="Filters" summary="[filter summary]">
    <div class="facets">
        <div class="book">
            <FacetFilter facet="source" heading="Book" values={bestiary.allSources()} width={6} {counts} on:change />
        </div>
        <div class="size">
            <FacetFilter facet="size" heading="Size" values={bestiary.allSizes()} width={1} {counts} on:change />
        </div>
        <div class="kind">
            <FacetFilter facet="kind" heading="Kind" values={bestiary.allKinds()} width={1} {counts} on:change />
        </div>
        <div class="attributes">
            <FacetFilter facet="attributes" heading="Attributes" values={bestiary.allAttributes()} width={4} {counts} cluster on:change />
        </div>
    </div>
    <div>{_("Total available monsters after filtering:")} {totalMonsters}</div>
</Section>

<style>

    .facets {
        display: grid;
        grid-template: "book book" "size kind" "attributes attributes";
        grid-column-gap: 0;
        grid-template-columns: 1fr 1fr;
    }

    @media screen and (min-width:725px) {
        .facets {
            grid-template: "book book book" "size kind attributes";
            grid-template-columns: 1fr 1fr 2fr;
        }
    }

    @media screen and (min-width:1000px) {
        .facets {
            grid-template-columns: 1fr 1fr 4fr;
        }
    }


    .book { grid-area: book; }
    .size { grid-area: size; }
    .kind { grid-area: kind; }
    .attributes { grid-area: attributes; }
</style>