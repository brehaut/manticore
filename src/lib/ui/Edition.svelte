<script lang="ts">
    import { Edition } from '$lib/costs/index.js';
    import Section from './Section.svelte';
    import Toggle from './Toggle.svelte';

    export let edition: Edition;

    function use2e(event:CustomEvent<boolean>) {
        edition = event.detail ? Edition.Second : Edition.First;
    }
</script>

<div>
    <span>Use <cite>13th Age 2e</cite> Alpha rules</span> <Toggle on:change={use2e} enabled={edition === Edition.Second}/>
</div>

{#if edition === Edition.Second}
<div class="warning">
Second edition support is currently in early alpha stages and likely contains bugs
</div>
{/if}

<style>
    div:not(.warning) {
        position: absolute;
        top: 1rem;
        right: 2rem;
    }

    span {
        opacity: 0.5;
    }

    div.warning {
        background: rgb(255, 255, 176);
        padding: 1rem;
        font-weight: bold;
        text-align: center;
    }
</style>