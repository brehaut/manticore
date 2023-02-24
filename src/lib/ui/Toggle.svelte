<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    export let enabled = false;

    const dispatch = createEventDispatcher();

    function toggle() {
        enabled = !enabled;

        dispatch("change", enabled)
    }
</script>

<span class="toggle {enabled ? "enabled" : "disabled"}" on:click={toggle} on:keypress={toggle}>
<span class="thumb"></span>
</span>

<style>
    .toggle { 
        display: inline-block;
        width: 2.5rem;
        height: 1.25rem;
        border-radius: 1rem;
        background: #cfc9c0;
        padding: 0;
        margin: 0 0.25rem;
        cursor: pointer;
        position: relative;
        top:0.25rem;
        transition: 80ms linear background-color;
    }

    .thumb {
        display: inline-block;
        border-radius: 1rem;
        height: 0.75rem;
        width: 0.75rem;
        margin: 0;
        background: white;
        position: absolute;
        top: 0.25rem;
        left: 0.25rem;
        transition: 80ms linear left;
    }

    .toggle.enabled {
        background: var(--brand-color);
    }

    .thumb:after {
        content: '';
    }

    .toggle.enabled .thumb {
        left: calc(1.5rem);
    }
</style>