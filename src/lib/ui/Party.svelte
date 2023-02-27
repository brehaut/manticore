<script lang="ts">
    import type { IParty } from '$lib/data.js';
    export let party:IParty;
    import NumericInput from "./NumericInput.svelte";
    import Section from "./Section.svelte";
    import { _ } from "./strings";
</script>

<Section heading="Party" summary="[party summary]">
    <NumericInput label={_("Party size")} bind:value={party.size} max={10} />
    <NumericInput label={_("Party level")} bind:value={party.level} max={10} />
    <NumericInput label={_("Encounters/day")} bind:value={party.encountersPerDay} min={3} max={4} />
</Section>