<template>
  <v-tooltip :text="tooltipText" :location="tooltipLocation">
    <template v-slot:activator="{ props }">
      <v-btn icon v-bind="props" @click="onClick" :disabled="disabled">
        <v-icon>{{ icon }}</v-icon>
      </v-btn>
    </template>
  </v-tooltip>
</template>

<script setup lang="ts">
import { VTooltip } from 'vuetify/components'

// Extract the type of the location prop from VTooltip so we can use it in our props to not trigger a TypeError
type UnwrapReadonlyArray<A> = A extends Readonly<Array<infer I>> ? I : A;
type Anchor = UnwrapReadonlyArray<VTooltip['location']>

// Define props
interface Props {
  tooltipText: string;
  tooltipLocation?: Anchor;
  icon: string;
  onClick: () => void;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  tooltipLocation: 'top',
  disabled: false
})

// Validator for tooltipLocation
const isValidLocation = (value: string): boolean => {
  return ['top', 'bottom', 'left', 'right'].includes(value);
}

// Runtime prop validation
if (props.tooltipLocation && !isValidLocation(props.tooltipLocation)) {
  console.warn(`Invalid tooltipLocation: ${props.tooltipLocation}. Must be one of: top, bottom, left, right.`);
}
</script>

<style scoped>
</style>
