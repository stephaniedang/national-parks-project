<script>
  import RadialChart from './RadialChart.svelte';
  import { slide } from 'svelte/transition';
  import "@fontsource/fira-mono";
  import "@fontsource/oswald";
  import "@fontsource/lato/100.css";
  import "@fontsource/montserrat";


  export let park = null;
  export let isSelected = false;

  function getYear(dateString) {
    return new Date(dateString).getFullYear();
  }
  
  function closeDetails() {
    isSelected = false;
  }
</script>

{#if isSelected}
<div class="overlay" on:click={closeDetails}></div>
  <div class="park-details {isSelected ? 'visible' : ''}" 
        in:slide={{ delay: 50, duration: 400 }}
        out:slide={{ delay: 50, duration: 200 }}
      >
    <button class="close-button" on:click={closeDetails}>X</button>
    <h2 class="park-name">{park.name}(Est.{getYear(park.established)})</h2>
    <h3 class="location">Catch me out in <span style="color: #dd988b">{park.state}</span>!</h3>
    <p class="description">{park.description}</p>
    <RadialChart parkName={park.name}/>
  </div>
{/if}

<style>
  .overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 1;
  }

  .park-details {
    border-left: dashed #f9f9f9;
    display: flex;
    flex-direction: column;
    align-items: center;
    position: fixed;
    right: 0;
    top: 0;
    bottom: 0;
    width: 50%;
    background: #383b4c;
    color: #f9f9f9;
    z-index: 2;
    overflow-x: hidden;
    overflow-y: hidden;
    box-sizing: border-box;
    padding: 1.5em;
    font-family: 'Courier New', Courier, monospace;
  }

  .park-details * {
    max-width: 100%;
    box-sizing: border-box;
  }

  .close-button {
    position: absolute;
    top: 20px;
    right: 20px;
    border: none;
    background: transparent;
    cursor: pointer;
    font-size: 20px;
    color: #f9f9f9;
  }

  .park-name {
    font-weight: 500;
    font-size: 2em;
    margin: 0.25em 0;
  }

  .location {
    margin: 0.5em 0;
    font-size: 1.3em;
    font-weight: lighter;
  }

  .description {
    padding: 0 4em;
    margin: 0;
    font-family: "Lato", sans-serif;
    font-weight: 100;
    font-size: 1.2em;
  }

  @media (max-width: 768px) {
    .park-details {
      width: 100%;
      height: 100vh;
    }
}
</style>