<script lang="ts">
    export let faceRight = false;
</script>

<svg class="{faceRight ? "right" : "left"}" viewBox="0 0 64 64" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;">
    <path d="M9.681,29.219L54.633,4.66C55.065,4.457 55.548,4.343 56.058,4.343C57.907,4.343 59.409,5.844 59.409,7.694L59.409,11.727C59.409,12.525 58.87,13.198 58.136,13.402C58.062,13.416 57.987,13.431 57.913,13.448C52.452,14.674 48.234,22.518 48.234,32C48.234,41.531 52.495,49.408 57.998,50.571C58.016,50.574 58.034,50.578 58.052,50.582C58.828,50.756 59.409,51.449 59.409,52.277L59.409,56.308C59.409,58.157 57.907,59.659 56.058,59.659C55.554,59.659 55.077,59.547 54.649,59.348L9.681,34.781C8.788,34.179 8.2,33.158 8.2,32C8.2,30.842 8.788,29.821 9.681,29.219Z" />
</svg>

<style>
svg {
    display: inline-block;
    height: 1rem;
}

svg path {
    fill:var(--brand-color);
}

svg:hover {
    opacity: 0.5;
}

.right {
    transform:rotate(180deg);
}
</style>