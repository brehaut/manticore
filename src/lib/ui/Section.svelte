<script lang="ts">
    export let heading: string;
    export let summary: string;
    export let collapsable: boolean = false;
    export let collapsed: boolean = false;

    import { _ } from "./strings";

    function toggle(event:MouseEvent) {
        collapsed = !collapsed;
    }
</script>

<section class="{collapsable ? "collapsable" : ""} {collapsed ? "collapsed": ""}">
    <header>
        <h1>{_(heading)}</h1>
        <p>
            {_(summary)}
        </p>
        {#if collapsable}
        <a href="#"  on:click|preventDefault={toggle}>{_(collapsed ? "expand" : "collapse")}</a>
        {/if}
    </header>

    <div>
        <slot></slot>
    </div>
</section>

<style>
    section {
        padding-left: 10px;
        padding-right: 10px;
        margin-top: 2em;
        margin-block-start: 5em;
        --padding: 10px;
    }

    section > header {
        border-top: 2px solid #097E6C; /*#461B0E;*/
        border-bottom: 1px solid rgba(70, 27, 14, 0.1);
        margin: 1em 0;
        padding: 1em 0 0 0;
    }

    @media screen and (min-width:640px) {
        section > header {
            padding: 1em var(--padding) 0 var(--padding);
        }
    }

    section > header > h1 {
        font-size: 1.25em;
    }

    section > header > p {
        font-size: 0.9em;
        margin-top: 0.25em;
        margin-bottom: 1.5em;
    }

    section > div {
        padding: 0 var(--padding);
    }

    .collapsable.collapsed > div {
        display: none;
    } 
</style>