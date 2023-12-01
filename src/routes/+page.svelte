<script>
  import Visualization from '../components/Visualization.svelte';
  import Legend from '../components/Legend.svelte';
  import LandingOverlay from '../components/LandingOverlay.svelte';
  import "@fontsource/lato/100.css";

  let width;
  let colorScale;
  let maxVisitorCount;
  let showOverlay = true;
</script>

<div class="app-container">
  <header class="title-container">
    <h1 class="title">Adventure Awaits: Discovering U.S. National Parks</h1>
  </header>

  <div class="content-container">
    <div class="info-container">
      <div class="summary">
        <p>Since moving to the East Coast, I realized I had no clue what 
          lays out and about in these parts of the woods. These visualizations 
          were created to learn more about my new greater surrounding 
          neighborhood! The data used is from the National Park 
          Service’s data portal. The visitor counts reflected are for the 
          past 2022 calendar year. Hover around and click on some of 
          the circles to find out more about the most, least, and in-between 
          visited parks! </p>
      </div>

    <div class="legend">
      <Legend {colorScale} {maxVisitorCount} />
      </div>
    </div>

    <div class="viz-wrapper">
      <Visualization bind:maxVisitorCount bind:colorScale/>
    </div>
  </div>
</div>

<div class="mobile-message">
  For the best experience, please view this map on a computer! 🌻
</div>


<style>
  * {
    box-sizing: border-box;
  }

  :global(body) {
    background-color: #383b4c;
  }

  .app-container {
    display: flex;
    flex-direction: column;
    height: 98vh;
    overflow: hidden;
    font-family: 'Courier New', Courier, monospace;
    font-weight: lighter;
    color: #f9f9f9;
  }

  .content-container {
    display: flex;
    flex-direction: column;
    overflow: hidden; 
  }

  .info-container {
    display: flex;
    flex-direction: row;
    overflow: hidden;
  }

  .title-container {
    padding: 0 2em;
    font-size: 0.9vw;
  }

  .title {
    margin-bottom: 0;
  }

  .summary, .legend {
    padding: 0 2em;
    font-family: "Lato";
  }

  .summary {
    flex-basis: 75%;
    font-size: 1.13vw;
    margin: 0;
    word-wrap: break-word;
    overflow-wrap: break-word;
    color: white;
  }

  .legend {
    flex-basis: 25%;
  }

  .viz-wrapper {
    flex-grow: 1;
    overflow: hidden; 
  }

  .mobile-message {
    display: none;
    background-color: #383b4c;
    color: #ccc;
    text-align: center;
    padding: 10px;
    border-radius: 5px;
    margin: 10px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    font-size: 14px;
  }

  @media (max-width: 768px) {
  .info-container {
    flex-direction: column;
  }

  .summary, .legend {
    flex: 1 0 auto;
  }

  .mobile-message {
    display: block;
  }
}

</style>