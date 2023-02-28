<script lang="ts">
    import type { Monster, IParty, GroupedEncounters } from "$lib/data";
    import type { Edition } from "$lib/costs";
    import { _ } from "./strings";
    import GenerateWorker from "$lib/generate.worker.ts?worker";
    import EncounterGroup from "./EncounterGroup.svelte";
    import Loading from "./Loading.svelte";
    import PaginatedData from "./PaginatedData.svelte";
    import Section from "./Section.svelte";
    import { GenerationProcess } from '$lib/allocator/index.js';

    export let choices: Monster[];
    export let party: IParty;
    export let edition: Edition;
    export let hasUserFilteredAnything: boolean;

    let deterministicGeneration = true;

    let generationWorker:Worker | undefined;

    let results:GroupedEncounters | undefined = []; 

    function generate(party: IParty, choices: Monster[]) {
        if (!hasUserFilteredAnything) return;

        if (generationWorker) {
            generationWorker.terminate();
        }

        // A heuristic to not blank out the results if we think the new results will arrive quickly
        if (deterministicGeneration && choices.length > 40) {
            results = undefined;
        }

        generationWorker = new GenerateWorker();

        generationWorker.onmessage = (ev) => {
            results = ev.data;
        }

        generationWorker?.postMessage({ party, monsters: choices, edition, generationProcess: deterministicGeneration ? GenerationProcess.Deterministic : GenerationProcess.Random });      
    }

    $:{
        deterministicGeneration, generate(party, choices);  
    }
</script>

<Section heading="Encounters" summary="[results summary]">
    <div class="method">
        <h2>How should results be generated?</h2>
        <input type="radio" bind:group={deterministicGeneration} value={true} id="deterministicGeneration" name="generationProcess" /><label for="deterministicGeneration">{_("Exhaustively")}</label>
        <input type="radio" bind:group={deterministicGeneration} id="randomGeneration" name="generationProcess" /><label for="randomGeneration">{_("Randomly")}</label>

        {#if !deterministicGeneration}
        <br/><button on:click={() => generate(party, choices)}>{_("Roll the dice")}</button>
        {/if}
    </div>

    {#if !hasUserFilteredAnything}
        <div class="no-selection">
            <p>{_("You need to make some kind of selection with the filters and/or monster selection above.")}</p>
        </div>
    {:else if results}         
        <div>
            {_("Generated % encounters").replace("%", results.length.toString())}
        </div>

        {#if results.length > 0}
            <h2>{_("Key:")}</h2>
            <ol class="key">
                <li class="care-needed">{_("Be careful. A monster like this might pack an uncomfortable amount of damage into a single swing.")}</li>
                <li class="probable-mistake">{_("Probably a mistake to build a battle around monsters that dish out damage like these do.")}</li>
            </ol>

            <PaginatedData items={results} let:item={encounters}>
                <EncounterGroup {encounters} {party}/>
            </PaginatedData>
        {:else}
            <div class="no-results">
                <p>{_("The selected monsters could not be organised into an encounter for the specified party. This can occur because the selected monsters are too large/threatening for the size of the party.")}</p>
                <p>{_("Try adjusting your filters and selection to allow more monsters to be selected.")}</p>
            </div>
        {/if}
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

    .method {
        margin-bottom: 1rem;
    }

    .method button {
        margin-top: 0.5rem;
        padding: 0.5rem 1rem;
        border-radius: 0.3rem;
        font-family: "Alegreya";
        font-size: 1.1rem;
        background: var(--brand-color);
        color: var(--background-color);
        border: 1px solid var(--brand-color);
        cursor: pointer;
    }

    .method button:hover {
        background-color: var(--background-color);
        color: var(--brand-color);
    }
    .care-needed:before {
        background: var(--care-needed-background-color);
        border-color: var(--care-needed-border-color);
    }

    .probable-mistake:before {
        background: var(--probable-mistake-background-color);
        border-color: var(--probable-mistake-border-color);
    }

    .no-results, .no-selection {
        border: 1px solid rgb(203 197 190);
        background: #e1dcd5;
        padding: 0 1rem;
        margin: 0.5rem -1rem;
    }

    .no-results > p, .no-selection > p {
        max-width: 50rem;
    }
</style>
