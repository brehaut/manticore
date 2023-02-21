<script lang="ts">
    import type { Encounters } from "../data";
    import Encounter from "./Encounter.svelte";
    import { _ } from "./strings";
    export let encounters: Encounters;

    $: primary = encounters[0];
    $: variations = encounters.slice(1); 

    let showVariations = false;

    function toggleVariations() {
        showVariations = !showVariations;
    }
</script> 

<div class="encounter">
    <div class="stereotype">
        <Encounter encounter={primary} />
    </div>

    {#if variations.length > 0}
        <a href="#" on:click|preventDefault={toggleVariations} on:keyup|preventDefault={toggleVariations}>{variations.length} {_("variations")}</a>
        {#if showVariations}
            <ul class="variations">
                {#each variations as variation}
                <li>
                    <Encounter encounter={variation} abbreviated />
                </li>
                {/each}
            </ul>
        {/if}
    {/if}
</div>

<style>
    .encounter {
        margin-block-start: 3em;
    }

    .variations {
        list-style: none;
        padding-left: 1rem;
    }

    .variations > li + li {
        margin-top:0.5rem;
    }

    a { 
        display:inline-block;
        font-size: 1rem; 
        margin: 0.5rem 0.5rem;
    }
</style>