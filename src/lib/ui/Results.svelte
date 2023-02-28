<script lang="ts">
    import type { Monster, IParty, GroupedEncounters } from "$lib/data";
    import type { Edition } from "$lib/costs";
    import { _ } from "./strings";
    import GenerateWorker from "$lib/generate.worker.ts?worker";
    import EncounterGroup from "./EncounterGroup.svelte";
    import Loading from "./Loading.svelte";
    import PaginatedData from "./PaginatedData.svelte";
    import Section from "./Section.svelte";

    export let choices: Monster[];
    export let party: IParty;
    export let edition: Edition;

    let generationWorker:Worker | undefined;

    let results:GroupedEncounters | undefined = []; 

    function generate(party: IParty, choices: Monster[]) {
        if (generationWorker) {
            generationWorker.terminate();
        }

        // A heuristic to not blank out the results if we think the new results will arrive quickly
        if (choices.length > 20) {
            results = undefined;
        }

        generationWorker = new GenerateWorker();

        generationWorker.onmessage = (ev) => {
            results = ev.data;
        }

        generationWorker?.postMessage([party, choices, edition]);      
    }

    $:{ 
        generate(party, choices); 
    }
</script>

<Section heading="Encounters" summary="[results summary]">
    {#if results}     
        <div>
            {_("Generated % encounters").replace("%", results.length.toString())}
        </div>

        <h2>{_("Key:")}</h2>
        <ol class="key">
            <li class="care-needed">{_("Be careful. A monster like this might pack an uncomfortable amount of damage into a single swing.")}</li>
            <li class="probable-mistake">{_("Probably a mistake to build a battle around monsters that dish out damage like these do.")}</li>
        </ol>

        <PaginatedData items={results} let:item={encounters}>
            <EncounterGroup {encounters} {party}/>
        </PaginatedData>
    {:else}
        <Loading/>
    {/if}
</Section>

<style>
    :global(body) {
        --care-needed-background-color: #fffade;
        --care-needed-border-color: rgba(109, 101, 49, 0.2);

        --probable-mistake-background-color:#ffddc6;
        --probable-mistake-border-color: rgba(109, 49, 8, 0.2);
    }

    h2 {
        font-size: 1rem;
        margin-bottom: 0;
    }

    .key {
        list-style: none;
        padding-left: 0;
        line-height: 1.2;
        margin-top: 0;
    }

    li:before {
        display: inline-block;
        content: '';
        width: 1em;
        height: 1em;
        border-width: 1px;
        border-style: solid;
        position: relative;
        top: 0.2rem;
        margin-right: 0.5rem;
    }

    .care-needed:before {
        background: var(--care-needed-background-color);
        border-color: var(--care-needed-border-color);
    }

    .probable-mistake:before {
        background: var(--probable-mistake-background-color);
        border-color: var(--probable-mistake-border-color);
    }

</style>
