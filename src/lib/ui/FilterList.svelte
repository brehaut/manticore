<script lang="ts">
    import Toggle from "./Toggle.svelte";

    import { _ } from "./strings";
    
    export let heading: string;
    export let width: 1 | 2 | 4 | 6;
    
    export let enabled = false;
</script>

<section class="width-{width}">
    <header><h1>{_(heading)} <Toggle bind:enabled/></h1></header>

    <ul>
        <slot></slot>
    </ul>
</section>

<style>
    section ul {
        display: grid;
        padding-left: 0;
        list-style: none;
        grid-column-gap: 0;
    }

    .width-2 ul, .width-4 ul, .width-6 ul {
        grid-template-columns: 1fr 1fr;
    }

    @media screen and (min-width:725px) {
        .width-6 ul {
            grid-template-columns: repeat(4, 1fr);
        }
    }

    @media screen and (min-width:1000px) {
        .width-4 ul {
            grid-template-columns: repeat(4, 1fr);
        }

        .width-6 ul {
            grid-template-columns: repeat(6, 1fr);
        }
    }
</style>