<script lang="ts">
    import { Edition } from '$lib/costs/index.js';
    import Toggle from './Toggle.svelte';

    export let edition: Edition;

    function use2e(event:CustomEvent<boolean>) {
        edition = event.detail ? Edition.Second : Edition.First;
    }
</script>

<div>
    <span>Use <cite>13th Age 2e</cite> Alpha rules</span> <Toggle on:change={use2e} enabled={edition === Edition.Second}/>
</div>

<style>
    div {
        position: absolute;
        top: 1rem;
        right: 2rem;
    }

    span {
        opacity: 0.5;
    }
</style>