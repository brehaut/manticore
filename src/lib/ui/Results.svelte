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

<style>
    button {
        border: 1px solid rgba(70, 27, 14, 0.2);
        background: var(--brand-color);
        color: white;
        border-radius: 3px;
        cursor: pointer;
        display: inline-block;
        padding: 0.5rem 2em;
        margin-bottom: 2em;
        font-family: Alegreya;
        font-size: 1.2rem;
    }

    button:hover {
        background: rgba(70, 27, 14, 0.05);
        color: #461B0E;
    }
</style>