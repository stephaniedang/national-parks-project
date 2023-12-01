<script>
	import { onMount } from 'svelte';
  import { statesStore } from '../utils/store';
  import Tooltip from './Tooltip.svelte';
  import ParkDetailView from './ParkDetailView.svelte';
  import { formatVisitorCount } from '../utils/timeFormat';
  import { fetchParkData, path, projection } from '../utils/dataProcessing';
  import { updateScale, mapScaleFactor as externalMapScaleFactor } from '../utils/tooltipScale';
	import { draw } from 'svelte/transition';
  import { csv, scaleSequential, max } from 'd3';
	
  // map + bubble variables
	let states = [];
  let parks = [];
  let areStatesDrawn = false;
  let displayedParks = [];
  let mostRecentYear;
  let visitorCountsByPark = {};
  let parksWithVisitors = {};
  let colorScale = scaleSequential(['#ef798a', '#613f75'])
                    .domain([0,1]);

  // tooltip variables
  let tooltipVisible = false;
  let tooltipText = '';
  let tooltipPosition = { x: 0, y: 0 };
  let circleRadius = 6;
  let localMapScaleFactor = 1;

  $: localMapScaleFactor = externalMapScaleFactor;

  // details section variables
  let selectedPark = null;
	
	onMount(async () => {
    let { states, parksData } = await fetchParkData();
    parks = parksData;
    statesStore.set(states);

    // Load and process YoY visitors data from CSV
    const visitorData = await csv('data/clean-yoy-visitors.csv', d => ({
      parkName: d['ParkName'],
      year: +d.Year,
      visitorCount: +d['RecreationVisits']
    }));
    // console.log(visitorData)

    // Determine most recent year
    mostRecentYear = max(visitorData, d => d.year);

    // Filter data for most recent year and sum up visitors for each park
    visitorData
      .filter(d => d.year === mostRecentYear)
      .forEach(d => {
        visitorCountsByPark[d.parkName] = (visitorCountsByPark[d.parkName] || 0) + d.visitorCount;
      });
    // console.log(visitorData)

    // Combine park data with visitor counts
    parksWithVisitors = parks.map(park => {
      return {
        ...park,
        visitorCount: visitorCountsByPark[park.Park] || 0,
        position: projection([+park.Longitude, +park.Latitude])
      }
    });
    // console.log(parksWithVisitors)

    // Create color scale
    colorScale.domain([0, max(Object.values(visitorCountsByPark))]);

    // Set the flag after the states have finished drawing
    const totalStatesDuration = states.length * 50 + 1000;
    setTimeout(() => {
      areStatesDrawn = true;

      parksWithVisitors.forEach((park, index) => {
          // Gradually add parks to the displayedParks array
          // console.log(park.Park, park.visitorCount);
          setTimeout(() => {
            displayedParks = [...displayedParks, park];
          }, index * 50);
        });
      }, totalStatesDuration);

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => {
      window.removeEventListener('resize', updateScale);
    }
	});

  $: console.log("States from store:", $statesStore);

  console.log("Outside of on-mount states:", states)

  // tooltip functions
  function showTooltip(park, event) {
    const svg = document.querySelector('.wrapper svg');
    const svgRect = svg.getBoundingClientRect();
    const additionalMargin = 5;

    tooltipText = `${park.Park}: ${formatVisitorCount(park.visitorCount)} visitors`;
    tooltipVisible = true;
    tooltipPosition = {
      x: event.clientX - svgRect.left + circleRadius + additionalMargin,
      y: event.clientY - svgRect.top
    };
    // console.log('Tooltip Position: ', tooltipPosition)
  };

  function hideTooltip() {
    tooltipVisible = false;
  };

  // details section functions
  function handleParkClick(park) {
    selectedPark = park;
  }
</script>

<div class="wrapper">
    <!-- State shapes -->
    <div class="map-container" fill="white" stroke="black" style="flex: {selectedPark ? '2' : '1'}">
      <svg viewBox="0 0 975 610">
      {#each $statesStore as feature, i}
        {console.log('SVG Path:', path(feature))}
          <path 
            d={path(feature)} 
            class="state" 
            in:draw={{ delay: i * 50, duration: 1000 }} 
          />
        {/each}

      <!-- Circles for displayed parks -->
      <g class="nat-parks">
        {#each displayedParks as park}
          {#if park.position}
            <circle
              class="park" 
              cx={park.position[0]} 
              cy={park.position[1]} 
              r={circleRadius} 
              fill={colorScale(park.visitorCount)}
              on:mouseover={event => showTooltip(park, event)}
              on:mouseout={hideTooltip}
              on:click={() => handleParkClick(park)}
            />
            {/if}
          {/each}
        </g>
      </svg>
    </div>

  <Tooltip text={tooltipText} 
           visible={tooltipVisible} 
           position={tooltipPosition} 
           style="transform: scale({localMapScaleFactor});"
  />

  <ParkDetailView park={selectedPark} isSelected={selectedPark !== null}/>
</div>

<style>

  * {
      box-sizing: border-box;
  }

  :global(body) {
      background-color: #f9f9f9; 
  }

  .wrapper {
      margin: 0;
      display: flex;
      flex-direction: row;
      position: relative;
      width: 100%;
      font-family: 'Open Sans', sans-serif;
  }

  .map-container {
    flex: 2;
    overflow: hidden;
  }

  /* .park-details {
    flex: 1;
    display: none;
  }

  .park-details.visible {
    display: block;
  } */

  .state {
    fill: white;
    stroke: #ccc;
    stroke-width: 1.2;
  }

  circle {
    opacity: 0;
    animation: fadeIn 1s ease-out forwards;
  }

  @keyframes fadeIn {
    to {
      opacity: 1;
    }
  }
</style>
