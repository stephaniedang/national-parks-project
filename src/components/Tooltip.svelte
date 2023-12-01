<script>
  export let text = '';
  export let visible = false;
  export let position = { x: 0, y: 0 };
</script>

<div class="tooltip" 
     class:visible={visible} 
     style="left: {position.x}px; top: {position.y}px;">
  {text}
</div>


<style>
  .tooltip {
    position: absolute;
    background-color: rgba(73, 56, 63, 0.9);
    color: white;
    padding: 0.3em 0.6em;
    border-radius: 0.75em;
    border-style: solid;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
    font-size: 14px;
    opacity: 0;
    transition: opacity 0.3s, transform 0.2s ease;
    pointer-events: none;
    transform-origin: top left;
    transform: scale(0.95);
  }

  .tooltip.visible {
    opacity: 1;
    transform: scale(1);
  }

</style>