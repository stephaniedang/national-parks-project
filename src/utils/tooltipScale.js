export let mapScaleFactor = 1;

export function updateScale() {
  const mapElement = document.querySelector('.wrapper');

  if (mapElement) {
    const mapWidth = mapElement.offsetWidth;
    const baseMapWidth = 1000;
    mapScaleFactor = mapWidth / baseMapWidth;
    console.log("Updated mapScaleFactor: ", mapScaleFactor)
  }
};