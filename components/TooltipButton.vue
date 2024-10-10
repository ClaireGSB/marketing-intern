<template>
  <v-tooltip :text="tooltipText" :location="tooltipLocation">
    <template v-slot:activator="{ props }">
      <v-btn icon v-bind="props" @click="onClick" :disabled="disabled">
        <v-icon>{{ icon }}</v-icon>
      </v-btn>
    </template>
  </v-tooltip>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { VTooltip } from 'vuetify/components' 

// Extract the type of the location prop from VTooltip so we can use it in our props to not trigger a TypeError
type UnwrapReadonlyArray<A> = A extends Readonly<Array<infer I>> ? I : A;
type Anchor = UnwrapReadonlyArray<VTooltip['location']>


export default defineComponent({
  name: 'TooltipButton',
  props: {
    tooltipText: {
      type: String,
      required: true
    },
    tooltipLocation: {
      type: String as () => Anchor,
      default: 'top',
      validator: (value: string): boolean => {
        return ['top', 'bottom', 'left', 'right'].includes(value);
      }
    },
    icon: {
      type: String,
      required: true
    },
    onClick: {
      type: Function,
      required: true
    },
    disabled: {
      type: Boolean,
      default: false
    }
  }
});
</script>

<style scoped>
</style>
