<script lang="ts">
    import type { IParty } from '$lib/data';
    import { Edition } from "$lib/costs";

    import NumericInput from "./NumericInput.svelte";
    import Section from "./Section.svelte";
    import { _ } from "./strings";

    export let party:IParty;
    export let edition: Edition;
</script>

<Section heading="Party" summary="[party summary]">
    <NumericInput label={_("Party size")} bind:value={party.size} max={10} />
    <NumericInput label={_("Party level")} bind:value={party.level} max={10} />
    {#if edition === Edition.Second }
        <NumericInput label={_("Encounters/day")} bind:value={party.encountersPerDay} min={3} max={4} />
    {/if}
</Section>