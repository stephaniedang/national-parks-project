<script>
import { onMount } from 'svelte';
import Tooltip from './Tooltip.svelte';
import ParkDetailView from './ParkDetailView.svelte';
import { formatVisitorCount } from '../utils/timeFormat';
import { updateScale, mapScaleFactor as externalMapScaleFactor } from '../utils/tooltipScale';
import * as topojson from 'topojson-client';
import { draw } from 'svelte/transition';
import { geoPath, geoAlbersUsa, csv, scaleSequential, max, interpolateRgbBasis } from 'd3';

// https://github.com/topojson/us-atlas#us-atlas-topojson
const projection = geoAlbersUsa().scale(1300).translate([487.5, 305])
const path = geoPath().projection(null);

// map + bubble variables
let states = [];
let parks = [];
let mesh;
let areStatesDrawn = false;
let displayedParks = [];
let mostRecentYear;
let visitorCountsByPark = {};
let parksWithVisitors = {};
export let colorScale;
export let maxVisitorCount;
export let startAnimation = false;

// tooltip variables
let tooltipVisible = false;
let tooltipText = '';
let tooltipPosition = { x: 0, y: 0 };
let circleRadius = 4.3;
let localMapScaleFactor = 1;

$: localMapScaleFactor = externalMapScaleFactor;

// details section variables
let selectedPark = null;

onMount(async () => {
  const us = await fetch('https://cdn.jsdelivr.net/npm/us-atlas@3/states-albers-10m.json')
    .then(d => d.json())
  
  states = topojson.feature(us, us.objects.states).features;
  mesh = topojson.mesh(us, us.objects.states, (a, b) => a !== b);
  
  // Load and process the parks data from CSV
  const parksData = await csv('data/clean-nps-locations.csv', d => ({
    name: d.Park,
    lat: +d.Latitude,
    lng: +d.Longitude,
    state: d.State,
    established: d.Established,
    description: d.Description
  }));

  parks = parksData.map(park => ({
    ...park,
    position: projection([park.lng, park.lat])
  }));

  // Load and process YoY visitors data from CSV
  const visitorData = await csv('data/clean-yoy-visitors.csv', d => ({
    parkName: d['ParkName'],
    year: +d.Year,
    visitorCount: +d['RecreationVisits']
  }));

    // Load and process YoY visitors data from CSV
    const visitorMonthlyData = await csv('data/clean-mom-visitors.csv', d => ({
    parkName: d['ParkName'],
    year: +d.Year,
    month: +d.Month,
    visitorCount: +d['RecreationVisits']
  }));

  // Determine most recent year
  mostRecentYear = max(visitorData, d => d.year);

  // Filter data for most recent year and sum up visitors for each park
  visitorData
    .filter(d => d.year === mostRecentYear)
    .forEach(d => {
      visitorCountsByPark[d.parkName] = (visitorCountsByPark[d.parkName] || 0) + d.visitorCount;
    });

  maxVisitorCount = max(visitorData, d => d.visitorCount);

  // Combine park data with visitor counts
  parksWithVisitors = parksData.map(park => {
    return {
      ...park,
      visitorCount: visitorCountsByPark[park.name] || 0,
      position: projection([park.lng, park.lat])
    }
  });

  // Create color scale
  colorScale = scaleSequential(interpolateRgbBasis(['#ef798a', '#232860', '#6787e7']))
                        .domain([0,max(visitorData, d => d.visitorCount)]);

  // Set the flag after the states have finished drawing
  const totalStatesDuration = states.length * 50 + 1000;
  setTimeout(() => {
    areStatesDrawn = true;

    parksWithVisitors.forEach((park, index) => {
        // Gradually add parks to the displayedParks array
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

  // tooltip functions
  function showTooltip(park, event) {
    const svg = document.querySelector('.wrapper svg');
    const svgRect = svg.getBoundingClientRect();
    const additionalMargin = 5;

    tooltipText = `${park.name}: ${formatVisitorCount(park.visitorCount)} visitors`;
    tooltipVisible = true;
    tooltipPosition = {
      x: event.clientX - svgRect.left + circleRadius + additionalMargin,
      y: event.clientY - svgRect.top
    };
    console.log('Tooltip Position: ', tooltipPosition)
  };

  function hideTooltip() {
    tooltipVisible = false;
  };

  // details section functions
  function handleParkClick(park) {
    selectedPark = park;
  };
  
</script>

<div class="wrapper">
  <!-- State shapes -->
  <div class="map-container" style="flex: {selectedPark ? '2' : '1'}">
    <svg viewBox="0 0 975 610" preserveAspectRatio="xMidYMid meet"> 
    {#each states as feature, i}
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

          <circle
          cx={park.position[0]}
          cy={park.position[1]}
          r={5.5}
          fill="transparent"
          stroke={colorScale(park.visitorCount)}
          stroke-opacity="0.5"
          stroke-width="2"
          pointer-events="none">
          <animate
            attributeName="r"
            values="6; 9; 6"
            dur="7s"
            repeatCount="indefinite"/>
          <animate
            attributeName="stroke-opacity"
            values="0.5;0;0.5"
            dur="7s"
            repeatCount="indefinite"/>
          </circle>
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
  /* outline: 1px solid blue; */
}

.wrapper {
  margin: 0;
  display: flex;
  flex-direction: row;
  align-items: stretch;
  position: relative;
  width: 100%;
  height: 100%;
  font-family: 'Open Sans', sans-serif;
}

.map-container {
  overflow: hidden;
  position: relative;
  width: 100%;
  overflow: hidden;
}

svg {
  width: 100%;
  height: 100%;
}

.state {
  fill: white;
  fill-opacity: 0;
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