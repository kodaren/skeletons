<script>
  import {Sample} from './Sample.ts';
  import Button, {Label, Icon} from '@smui/button';
  let clicked = new Sample().clicked;
</script>

<style>
  .grayed {
    opacity: .6;
  }

  .container {
    display: flex;
    flex-direction: column;
  }

  p {
    text-align: center;
  }
</style>

<div class="container">
  <Button on:click={() => clicked++}>
    <Icon class="material-icons">thumb_up</Icon>
    <Label>Click Me</Label>
  </Button>
  <p>
    {#if clicked}
      You've clicked the material button {clicked} time{clicked === 1 ? '' : 's'}.
    {:else}
      <span class="grayed">You haven't clicked the material button.</span>
    {/if}
  </p>
</div>