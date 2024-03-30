<script>
  import { onMount } from "svelte";
  import * as d3 from 'd3';
    import { tickFormat } from "d3";
    import { formatVisitorCount } from "../utils/timeFormat";
    import Tooltip from "./Tooltip.svelte";

  export let parkName = '';
  export let visitorMonthlyData = [];
  let mostRecentYear;
  let svg;

  // tooltip variables
  let radialTooltipVisible = false;
  let radialTooltipText = '';
  let radialTooltipPosition = { x: 0, y: 0 };

  $: if (parkName) {
    fetchAndDrawChart(parkName);
  }

  async function fetchAndDrawChart(parkName) {
    const visitorData = await fetchDataForPark(parkName);
    if (visitorData.length > 0) {
      drawChart(visitorData);
    }
  }

  async function fetchDataForPark(parkName) {
    const dataset = await d3.csv("data/clean-mom-visitors.csv");
    const filteredData = dataset.filter(d => d.ParkName === parkName);
    mostRecentYear = d3.max(filteredData, d => +d.Year);
    const recentData = filteredData.filter(d => +d.Year === mostRecentYear);

    return recentData.map(d => {
      const month = d.Month.padStart(2, "0");
      const year = d.Year;
      const date = d3.timeParse("%Y-%m")(`${mostRecentYear}-${month}`);
      return {
        park: d.ParkName,
        date: date,
        visits: +d.RecreationVisits
      };
    });
  };

  function drawChart(visitorMonthlyData) {
    if (svg) {
      d3.select(svg).selectAll("*").remove();
    }
    // create chart dimensions
    const width = 600;
    let dimensions = {
      width: width,
      height: width,
      radius: width / 2,
      margin: {
        top: 120,
        right: 120,
        bottom: 120,
        left: 120,
      },
    }

    dimensions.boundedWidth = dimensions.width
                              - dimensions.margin.left
                              - dimensions.margin.right;

    dimensions.boundedHeight = dimensions.height
                              - dimensions.margin.top
                              - dimensions.margin.bottom;

    dimensions.boundedRadius = dimensions.radius
                              - ((dimensions.margin.left + dimensions.margin.right) / 2);

    const getCoordinatesForAngle = (angle, offset=1) => [
      Math.cos(angle - Math.PI / 2) * dimensions.boundedRadius * offset,
      Math.sin(angle - Math.PI / 2) * dimensions.boundedRadius * offset,
    ]

    // draw canvas
    const wrapper = d3.select(svg)
                      // .append("svg")
                        .attr("width", dimensions.width)
                        .attr("height", dimensions.height);

    const bounds = wrapper.append("g")
                          .style("transform", `translate(${
                            dimensions.margin.left + dimensions.boundedRadius
                          }px, ${
                            dimensions.margin.top + dimensions.boundedRadius
                          }px)`);

    const defs = wrapper.append("defs");

    // create scales
    const startDate = new Date(mostRecentYear, 0, 1);
    const endDate = new Date(mostRecentYear + 1, 0, 1);

    const angleScale = d3.scaleTime()
                         .domain([startDate, endDate])
                         .range([0, 2 * Math.PI]);

    const radiusScale = d3.scaleLinear()
                          .domain([0, d3.max(visitorMonthlyData, d => d.visits)])
                          .range([0, dimensions.boundedRadius])
                          .nice();         

    // draw peripherals
    const peripherals = bounds.append("g")

    const months = d3.timeMonths(...angleScale.domain())
    console.log(months)
    months.forEach(month => {
      const angle = angleScale(month);
      const [x, y] = getCoordinatesForAngle(angle);

      peripherals.append("line")
                    .attr("x2", x)
                    .attr("y2", y)
                    .attr("class", "grid-line")
                    .style("stroke", "#dadadd")
                    .style("stroke-width", "2px");

      const labelOffset = Math.cos(angle) * 10;
      const [labelX, labelY] = getCoordinatesForAngle(angle, 1.2);
      peripherals.append("text")
                    .attr("x", labelX - labelOffset)
                    .attr("y", labelY)
                    .attr("class", "tick-label")
                    .text(d3.timeFormat("%b")(month))
                    .style("text-anchor",() => {
                      if (angle < Math.PI / 2 || angle > 3 * Math.PI / 2) return "start";
                      else if (angle > Math.PI / 2 && angle < 3 * Math.PI / 2) return "end";
                      else return "middle";
                    })
                    .style("alignment-baseline", "middle")
                    .style("stroke", "#f9f9f9")
    });

    const visitTicks = radiusScale.ticks(4);
    const gridCircles = visitTicks.map(d => (
      peripherals.append("circle")
                 .attr("r", radiusScale(d))
                 .attr("class", "grid-line")
                 .attr("fill", "none")
                 .attr("stroke", "#f9f9f9")
    ));

    const formatTick = d3.format("~s");
    const tickLabelBackgrounds = visitTicks.map(d => {
      if (!d) return
      return peripherals.append("rect")
                          .attr("y", -radiusScale(d) - 10)
                          .attr("width", 33)
                          .attr("height", 20)
                          .attr("fill", "#f9f9f9")
    });
    const tickLabels = visitTicks.map(d => {
      if (!d) return 
      return peripherals.append("text")
                          .attr("x", 4)
                          .attr("y", -radiusScale(d) + 4)
                          .text(formatTick(d))
                          .attr("class", "tick-label-visits")
                          .attr("fill", "f9f9f9")
                          .attr("font-size", "0.7em");
    });

    // draw data
    const lineGenerator = d3.lineRadial()
                            .angle(d => angleScale(d.date))
                            .radius(d => radiusScale(d.visits))
                            .curve(d3.curveCardinalClosed);

    bounds.append("path")
          .attr("fill", "none")
          .attr("stroke", "#dd988b")
          .attr("stroke-width", 2)
          .attr("d", lineGenerator((visitorMonthlyData)));

    const circleGroup = bounds.append("g").attr("class", "circle-group");
    const dataPoints = circleGroup.selectAll("circle")
                             .data(visitorMonthlyData)
                             .join("circle")
                              .attr("cx", d => getCoordinatesForAngle(angleScale(d.date), radiusScale(d.visits) / dimensions.boundedRadius)[0])
                              .attr("cy", d => getCoordinatesForAngle(angleScale(d.date), radiusScale(d.visits) / dimensions.boundedRadius)[1])
                              .attr("r", 3)
                              .attr("fill", "#f9f9f9")
                              .attr("stroke", "#dd988b")
                              .on("mouseover", (event, d) => showRadialTooltip(d, event))
                              .on("mouseout", hideRadialTooltip);

    // tooltip functions
    function showRadialTooltip(d, event) {
      const monthYear = `${d3.timeFormat("%B")(d.date)} ${d.date.getFullYear()}`;
      const visitorCount = formatVisitorCount(d.visits);
      
      const svgRect = svg.getBoundingClientRect();
      radialTooltipText = `${monthYear}: ${visitorCount} visitors`
      radialTooltipVisible = true;

      radialTooltipPosition = {
        x: event.clientX - svgRect.left,
        y: event.clientY + (svgRect.top / 11)
      };

      console.log("Tooltip position:", radialTooltipPosition); 
      console.log("Tooltip visibility:", radialTooltipVisible); 
      console.log(svgRect, event.clientX, event.clientY)
    };

    function hideRadialTooltip() {
      radialTooltipVisible = false;
    }
}
</script>

<div id="wrapper" class="radial-chart">
  <svg bind:this={svg} viewBox="0 0 600 600"></svg>
  <Tooltip text={radialTooltipText}
           visible={radialTooltipVisible}
           position={radialTooltipPosition}
  />
</div>

<style>
  #wrapper {
    font-family: 'Courier New', Courier, monospace;
  }

  .radial-chart {
    flex: 1;
    display: block;
    max-width: 100%;
    max-height: 95vh;
    aspect-ratio: 1 / 1;
  }

  svg {
    width: 100%;
    height: 100%;
  }

</style>