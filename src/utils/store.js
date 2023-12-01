import { writable } from 'svelte/store';
import { scaleSequential } from 'd3';

export const statesStore = writable([]);
export const colorScale = writable(scaleSequential(['#ef798a', '#613f75']).domain([0, 1]));

export function updateColorScaleDomain(newDomain) {
  colorScale.update(scale => {
    scale.domain(newDomain);
    return scale;
  })
}