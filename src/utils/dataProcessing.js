import * as d3 from 'd3';
import * as topojson from 'topojson-client';

const projection = d3.geoAlbersUsa().scale(1300).translate([487.5, 305]);
const path = d3.geoPath().projection(projection);

async function fetchParkData() {
  const usResponse = await fetch('https://cdn.jsdelivr.net/npm/us-atlas@3/states-albers-10m.json');
  const us = await usResponse.json();
  const states = topojson.feature(us, us.objects.states).features;
  const mesh = topojson.mesh(us, us.objects.states, (a, b) => a !== b);

  const parksResponses = await fetch('data/clean-nps-locations.csv');
  const parksData = await d3.csv(parksResponses.url, d => ({
    ...d,
    position: projection([+d.Longitude, +d.Latitude])
  }));

  return { states, mesh, parksData };
}

export { fetchParkData, path, projection };