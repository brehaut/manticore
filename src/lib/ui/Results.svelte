<script lang="ts">
    import type { Monster, IParty, GroupedEncounters } from "$lib/data";
    import { _ } from "./strings";
    import GenerateWorker from "$lib/generate.worker.ts?worker";
    import EncounterGroup from "./EncounterGroup.svelte";
    import Loading from "./Loading.svelte";
    import PaginatedData from "./PaginatedData.svelte";
    import Section from "./Section.svelte";

    export let choices: Monster[];
    export let party: IParty;

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

        generationWorker?.postMessage([party, choices]);      
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

        <PaginatedData items={results} let:item={encounters}>
            <EncounterGroup {encounters} />
        </PaginatedData>
    {:else}
        <Loading/>
    {/if}
</Section>
