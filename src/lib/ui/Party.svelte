<script lang="ts">
    export let party:{size: number, level: number};
    import NumericInput from "./NumericInput.svelte";
    import Section from "./Section.svelte";
    import { _ } from "./strings";
</script>

<Section heading="Party" summary="[party summary]">
    <NumericInput label={_("Party size")} bind:value={party.size} max={10} />
    <NumericInput label={_("Party level")} bind:value={party.level} max={10} />
</Section>