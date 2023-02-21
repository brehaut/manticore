<script lang="ts">
    import type { Monster, IParty, GroupedEncounters } from "$lib/data";
    import { _ } from "./strings";
    import GenerateWorker from "$lib/generate.worker.ts?worker";
    import EncounterGroup from "./EncounterGroup.svelte";
    import Loading from "./Loading.svelte";
    import PaginatedData from "./PaginatedData.svelte";
    import Section from "./Section.svelte";

    export let generationWorker = new GenerateWorker();
    export let choices: Monster[];
    export let party: IParty;

    let results:GroupedEncounters | undefined = []; 

    function generate(event:Event) {
        results = undefined;
        generationWorker?.postMessage([party, choices]);      
    }

    generationWorker.onmessage = (ev) => {
        results = ev.data;
    }
</script>

<Section heading="Encounters" summary="[results summary]">
    <button on:click|preventDefault={generate}>Generate</button>

    {#if results}     
        <div>
            {_("Generated % encounters").replace("%", results.length.toString())}
        </div>

        <PaginatedData items={results} let:item={encounters}>
            <EncounterGroup {encounters} />
        </PaginatedData>
    {:else}
        <Loading/>
    {/if}
</Section>
