<script lang="ts">
  export let label: string;
  export let value: number;
  export let max: number;
  export let min: number = 1;
  const dataId = `${label}_options`;
</script>

<div class="field">
    <label for={dataId}>{label}</label>
    <input type="range" step="1" min="{min}" max={max} 
            bind:value={value} 
            />
    <span>{value}</span>
</div>

<style>
    .field {
        width: 100%;
        display: grid;
        grid-template-columns: 5fr 4fr 1fr;
        align-content: start;
        gap: 1rem;
        margin-bottom: 0.5rem;
    }

    input[type=range] {
        margin-top: -0.05rem;
    }

    @media screen and (min-width: 500px) {
        .field {
            width: 66.66%;
        }
    }

    @media screen and (min-width: 725px) {
        .field {
            width: 50%;
        }
    }

    @media screen and (min-width: 1000px) {
        .field {
            width: 33.33%;
        }
    }
</style>