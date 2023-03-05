<script lang="ts">
    import type { Encounters, IParty } from "../data";
    import Arrow from './Arrow.svelte';
    import { ArrowFacing } from './arrowFacing.js';
    import Encounter from "./Encounter.svelte";
    import { _ } from "./strings";
    export let encounters: Encounters;
    export let party: IParty;

    $: primary = encounters[0];
    $: variations = encounters.slice(1); 

    let showVariations = false;

    function toggleVariations() {
        showVariations = !showVariations;
    }
</script> 

<div class="encounter">
    <div class="stereotype">
        <Encounter encounter={primary} {party}/>
    </div>

    {#if variations.length > 0}
        <a href="#" on:click|preventDefault={toggleVariations} on:keyup|preventDefault={toggleVariations}>
            <span class="disclosure"><Arrow facing={showVariations ? ArrowFacing.Down : ArrowFacing.Right } /></span>
            {variations.length} {_("variations")}
        </a>
        {#if showVariations}
            <ul class="variations">
                {#each variations as variation}
                <li>
                    <Encounter encounter={variation} {party} abbreviated />
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
        position: relative;
        left: 1em;
    }

    .disclosure {
        display: inline-block;
        font-size: 0.75em;
        position: absolute;
        left: -1.5em;
        top: 0.4em;
    }
</style>