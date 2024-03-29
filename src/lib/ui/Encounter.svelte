<script lang="ts">
    import { battleLevel } from '$lib/costs/second-edition.js';
    import type { Encounter, IParty } from "$lib/data";
    import { isCareRequired, isProbableMistake } from '$lib/levels.js';
    import { _ } from "./strings";
    import ViewInSrd from './ViewInSrd.svelte';

    export let encounter:Encounter
    export let abbreviated = false;
    export let party: IParty;

    $: battle = battleLevel(party.level, party.encountersPerDay);    
</script>

<div class={`encounter ${abbreviated ? "abbreviated" : ""}`}>
    {#each encounter.allocations as allocation }
    <div class="monster { isCareRequired(allocation.monster, battle) ? "-care" : ""} { isProbableMistake(allocation.monster, battle) ? "-mistake" : ""}">
        <span class="name">
            { allocation.monster.name } 
            <ViewInSrd url={allocation.monster.srdUrl} />
        </span>
        <span class="count">{ allocation.num }</span>
        {#if !abbreviated}
            <span class="kind">{allocation.monster.kind} {_("lvl")} {allocation.monster.level}</span>
            <span class="page"><span class="book">{allocation.monster.book}</span> {_("pg.")} {allocation.monster.pageNumber}</span>
        {/if}
    </div>
    {/each}

    {#if encounter.unspentPercentage > 0}
    <div class="monster unspent">
        <span class="unspent">
            { encounter.unspentPercentage }% of budget unspent
        </span>
    </div>
    {/if}
</div>

<style>
    .encounter {
        display:grid;
        grid-template-columns: repeat(2, 1fr);
    }

    .encounter.abbreviated {
        grid-template-columns: calc(50% - 0.75em) 1fr;
    }

    .monster {
        display: grid;
        width: 100%;
        background: #fafafa;
        font-size: 1rem;
        grid-template: "kind page page" "name name count";
        padding:0.5rem;
        --border: 1px solid rgba(70, 27, 14, 0.2);
        --corner: 0.3rem;
        border-left: var(--border);
        border-top: var(--border);
    }

    .monster.-care {
        background: var(--care-needed-background-color);
        --border: 1px solid var(--care-needed-border-color);
    }

    .monster.-mistake {
        background: var(--probable-mistake-background-color);
        --border: 1px solid var(--probable-mistake-border-color);
    }

    .monster:nth-child(4),
    .monster:last-child {
        border-right: var(--border);
    }

    .monster:nth-last-child(-n+4) {
        border-bottom: var(--border);
        margin-bottom:-1px;
    }


    .monster:first-child {
        border-top-left-radius: var(--corner);
    }
    .monster:last-child {
        border-bottom-right-radius: var(--corner);
    }

    .monster:nth-child(4n+1):nth-last-child(-n+4) {
        border-bottom-left-radius: var(--corner);
    }

    .monster:nth-child(4) {
        border-top-right-radius: var(--corner);
    }

    @media screen and (min-width:725px) {
        .encounter {
            display:grid;
            grid-template-columns: repeat(4, 1fr);
        }

        .encounter.abbreviated {
            grid-template-columns: calc(25% - 0.75em) repeat(3, 1fr);
        }


        .monster:nth-child(2){
            border-right: var(--border);
        }

        .monster:nth-last-child(-n+2) {
            border-bottom: var(--border);
            margin-bottom:-1px;
        }

        .monster:nth-child(2n+1):nth-last-child(-n+2) {
            border-bottom-left-radius: var(--corner);
        }

        .monster:nth-child(2) {
            border-top-right-radius: var(--corner);
        }
    }

    .kind { 
        grid-area: kind; 
        font-size: 0.8em; 
        color: var(--faded-body-copy-color);
    }
    .page { 
        grid-area: page; 
        font-size: 0.8em; 
        justify-items: end;
        text-align: end;
        color: var(--faded-body-copy-color);
    }
    .page .book {
        display: block;
    }
    @media screen and (min-width:725px) {
        .page .book {
            display: inline;
        }
    }

    .name { 
        grid-area: name;
    }
    .count { 
        grid-area: count;
        justify-items: end;
        text-align: end;
    }
    .count:before { 
        content: "×";
    }

    .monster.unspent {
        color: var(--faded-body-copy-color);
        grid-template: 'unspent';
        align-content: center;
    }

    span.unspent {
        grid-area: unspent;
        text-align: center;
    }
</style>