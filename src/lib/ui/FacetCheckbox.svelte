<script context="module" lang="ts">
    let counter = 0;
</script>

<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher();

    export let value:string;
    export let text:string;
    export let count:number = 0;
    export let showCount = true;
    export let checked = false;
    export let enabled = true;

    let id = `cb_${counter++}`;

    function toggle() {
        checked = !checked;
        dispatch('change', {value, checked});
    }
</script>

<span class="{showCount && (count ?? 0) < 1 ? "unavailable" : ""}" on:click on:keyup>
<input type="checkbox" {checked} {id} on:change={toggle} disabled={!enabled}/>
<label for={id}>{text}</label>
{#if showCount}<span class="count">{count ?? 0}</span>{/if}
</span>

<style>
    span {
        display: inline-grid;
        grid-template-columns: min-content auto min-content;
        width: 100%;
        padding-right:1rem;
        align-items: start;
        margin-bottom:0.25rem;
    }

    .unavailable label, .unavailable .count {
        color: var(--faded-body-copy-color);
    }
    .unavailable input {
        opacity: 0.5;
    }

    label { 
        text-transform: capitalize;
        padding-left: 0.5rem;      
    }

    span.count {
        display: inline-block;
        padding-left: 0.25rem;
        font-size: 0.9em;
        opacity: 0.7;
        text-transform: uppercase;
    }
</style>
