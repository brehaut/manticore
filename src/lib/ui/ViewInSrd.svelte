<script lang="ts">
    import { _ } from './strings.js';

    export let url: string | undefined;
</script>

{#if url }<a target="srd" title="View on SRD" href="{url}">{_("SRD")}<span>↗</span></a>{/if}

<style>
    a {
        display: inline-block;
        text-decoration: none;
        font-size: 0.8rem;
        line-height: 1;
        padding: 0 0.2rem 0.1rem 0.2rem;
        margin-left: 0.1rem;
        background: transparent;
        color: var(--link-color);
        border: 1px solid var(--link-color);
        border-radius: 0.2rem;
    }

    a:hover {
        background: var(--link-color);
        color: var(--background-color);
    }

    span {
        font-size: 1rem;
    }
</style>