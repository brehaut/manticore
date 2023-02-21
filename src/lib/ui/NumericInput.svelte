<script lang="ts">
  export let label: string;
  export let value: number;
  export let max: number;
  const dataId = `${label}_options`;
</script>

<div class="field">
    <label for={dataId}>{label}</label>
    <input type="range" step="1" min="1" max={max} 
            bind:value={value} 
 
            list={dataId}
            />
    <datalist id={dataId}>
        {#each [1,2,3,4,5,6,7,8,9,10] as v (v)}
            <option value={v} />
        {/each}
    </datalist>
    <span>{value}</span>
</div>

<style>
    .field {
        max-width: 20rem;
        display: grid;
        grid-template-columns: 3fr 2fr 1fr;
        align-content: start;
    }
</style>