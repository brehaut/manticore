<script lang="ts">
    import type { Allocation } from "$lib/data";
    import { _ } from "./strings";

    export let encounter:Allocation[]
    export let abbreviated = false;
</script>

<div class={`encounter ${abbreviated ? "abbreviated" : ""}`}>
    {#each encounter as allocation }
    <div class="monster">
        <span class="name">{ allocation.monster.name }</span>
        <span class="count">{ allocation.num }</span>
        {#if !abbreviated}
            <span class="kind">{allocation.monster.kind} {_("lvl")} {allocation.monster.level}</span>
            <span class="page"><span class="book">{allocation.monster.book}</span> {_("pg.")} {allocation.monster.pageNumber}</span>
        {/if}
    </div>
    {/each}
</div>

<style>
    .encounter {
        display:grid;
        grid-template-columns: repeat(2, 1fr);
    }

    .monster {
        display: grid;
        width: 100%;
        background: #fafafa;
        font-size: 1rem;
        grid-template: "kind page" "name count";
        padding:0.5rem;
        --border: 1px solid rgba(70, 27, 14, 0.2);
        --corner: 0.3rem;
        border-left: var(--border);
        border-top: var(--border);
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
</style>