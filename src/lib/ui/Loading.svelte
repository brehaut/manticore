<script lang="ts">
    import {onMount, onDestroy } from "svelte";
    let interval: ReturnType<typeof setInterval>; 
    let count = 0;
    
    onMount(()=>{
        interval = setInterval(() => count = (count + 1) % 5, 500);
    });

    onDestroy(() => clearInterval(interval));

    function repeat(s:any, x: number): string {
        const a:string[] = [];

        for (let i = 0; i < x; i++) a.push(s);
        
        return a.join("");
    }
</script>

<div>
    Loading{repeat(".", count)}
</div>

<style>
    div {
        text-align: center;
        font-size: 1.2rem;
        opacity: 0.5;
    }
</style>