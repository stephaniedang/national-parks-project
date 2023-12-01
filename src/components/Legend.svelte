<script>
    import { format } from "d3";
  import { formatVisitorCountAbbrev } from "../utils/timeFormat";
  
  export let colorScale;
  export let maxVisitorCount;

  let intervals = [];

  $: if (maxVisitorCount && colorScale) {
    intervals = Array.from({length: 5}, (_, i) => Math.round(i * maxVisitorCount / 4));
  }

  function calculatePosition(value) {
    const scaleRange = [0, 100];
    const position = (value / maxVisitorCount) * (scaleRange[1] - scaleRange[0]);
    return position + '%';
  }
</script>

<div class="legend">
  <h5 class="legend-title">Visitor Count</h5>
  <div class="gradient-bar-container">
    <div class="gradient-bar"> </div>
      {#each intervals as value}
        <div class="tick-mark" style="left: {calculatePosition(value)};">
          <span class="tick"></span>
          <span class="label">{formatVisitorCountAbbrev(value)}</span>
        </div>
      {/each}
  </div>
</div>

<style>
  .legend {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    margin-right: 1.5em;
  }

  .legend-title {
    margin: 0.6em 0;
    font-size: 0.8em;
    color: #f9f9f9;
  }

  .gradient-bar-container {
    position: relative;
    width: 100%;
  }

  .gradient-bar {
    height: 10px;
    background: linear-gradient(to right, #ef798a, #232860, #6787e7);
  }

  .tick-mark {
    position: absolute;
    text-align: center;
    transform: translateY(-80%);
    white-space: nowrap;
  }

  .tick {
    display: block;
    height: 1em;
    border-left: 1px solid #f9f9f9;
  }

  .label {
    position: absolute;
    top: 1.5em;
    font-size: 0.8em;
    transform: translateX(-50%);
  }
</style>