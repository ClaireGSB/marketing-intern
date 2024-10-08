// src/components/ContentValidation.vue

<template>
  <v-container>
    <v-expansion-panels v-model="openPanels" multiple>
      <v-expansion-panel v-for="(item, itemIndex) in validations" :key="item.id">
        <v-expansion-panel-title>
          {{ item.step_output_type }}
          <template v-slot:actions="{ expanded }">
            <v-icon :color="getIconColor(itemIndex)" :icon="getIconName(itemIndex, expanded)"></v-icon>
          </template>
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <v-row>
            <v-col v-for="[versionNum, content] in Object.entries(item.options)" :key="versionNum" cols="12" md="6">
              <v-card :elevation="item.selected_option === versionNum ? 8 : 2" :class="{
      'selected': item.selected_option === versionNum,
      'dimmed': item.selected_option && item.selected_option !== versionNum
    }">
                <v-card-title :class="{ 'primary white--text': item.selected_option === versionNum }">
                  Version {{ versionNum }}
                </v-card-title>
                <v-card-text>{{ content }}</v-card-text>
                <v-card-actions>
                  <v-btn @click="toggleSelection(itemIndex, versionNum)"
                    :color="item.selected_option === versionNum ? 'primary' : ''">
                    {{ item.selected_option === versionNum ? 'Unselect version' : 'Select this version' }}
                  </v-btn>
                  <v-btn @click="toggleFeedback(itemIndex, versionNum)">
                    {{ showFeedback[itemIndex]?.[versionNum] ? 'Hide feedback' : 'Give feedback' }}
                  </v-btn>
                </v-card-actions>
                <v-expand-transition>
                  <div v-if="showFeedback[itemIndex]?.[versionNum]">
                    <v-divider></v-divider>
                    <v-card-text>
                      <v-textarea v-model="validations[itemIndex].feedback[versionNum]" label="Your feedback" rows="3"
                        auto-grow></v-textarea>
                    </v-card-text>
                  </div>
                </v-expand-transition>
              </v-card>
            </v-col>
          </v-row>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>

    <v-row class="mt-4">
      <v-col cols="12" class="d-flex justify-space-between">
        <v-tooltip bottom>
          <template v-slot:activator="{ props }">
            <div v-bind="props">
              <v-btn color="primary" :disabled="!canConfirmSelection" @click="confirmSelection">
                Confirm Selection
              </v-btn>
            </div>
          </template>
          <span>{{ generateTooltip }}</span>
        </v-tooltip>

        <v-tooltip bottom>
          <template v-slot:activator="{ props }">
            <div v-bind="props">
              <v-btn color="secondary" :disabled="!canRegenerate" @click="regenerate">
                Regenerate {{ regenerateButtonText }}
              </v-btn>
            </div>
          </template>
          <span>{{ regenerateTooltip }}</span>
        </v-tooltip>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { ref, computed, watch } from 'vue';
import { Validations } from '../types/frontendTypes';

export default {
  emits: ['confirm', 'regenerate'],
  props: {
    validations: {
      type: Array as () => Validations[],
      required: true,
    },
  },
  setup(props, { emit }) {
    const openPanels = ref<number[]>([0]);
    const showFeedback = ref<Record<number, Record<string, boolean>>>({});

    watch(() => props.validations.length, (newLength) => {
      if (openPanels.value.length === 0 && newLength > 0) {
        openPanels.value = [0];
      }
    }, { immediate: true });

    const toggleFeedback = (itemIndex: number, versionNum: string) => {
      if (!showFeedback.value[itemIndex]) {
        showFeedback.value[itemIndex] = {};
      }
      showFeedback.value[itemIndex][versionNum] = !showFeedback.value[itemIndex][versionNum];
    };

    const toggleSelection = (itemIndex: number, optionKey: string) => {
      if (props.validations[itemIndex].selected_option === optionKey) {
        props.validations[itemIndex].selected_option = "";
      } else {
        props.validations[itemIndex].selected_option = optionKey;
        props.validations[itemIndex].validation_status = 'completed';
      }
    };

    const isItemSelected = (itemIndex: number) => props.validations[itemIndex].selected_option !== "";

    const isItemFullyReviewed = (itemIndex: number) => {
      return Object.values(props.validations[itemIndex].feedback).some(feedback => feedback.trim() !== '');
    };

    const canConfirmSelection = computed(() => props.validations.every(v => v.selected_option !== ""));

    const canRegenerate = computed(() => {
      return props.validations.some(v => v.selected_option === "") &&
        props.validations.some(v => Object.values(v.feedback).some(f => f.trim() !== ''));
    });

    const regenerateButtonText = computed(() => {
      const itemsToRegenerate = props.validations
        .filter(v => v.selected_option === "")
        .map(item => item.step_output_type);
      return itemsToRegenerate.join(', ');
    });

    const regenerateTooltip = computed(() => {
      if (!canRegenerate.value) {
        return "Please provide feedback for at least one version of an unselected item to regenerate";
      }
      return "Regenerate versions based on your feedback for unselected items";
    });

    const generateTooltip = computed(() => {
      if (!canConfirmSelection.value) {
        return "Please select a version for all items to confirm your selection";
      }
      return "Confirm your selection and proceed to the final content";
    });

    const confirmSelection = () => {
      if (canConfirmSelection.value) {
        console.log("confirm");
        console.log(props.validations);
        emit('confirm', props.validations);
      }
    };

    const regenerate = () => {
      if (canRegenerate.value) {
        console.log("regenerate");
        console.log(props.validations);
        const itemsToRegenerate = props.validations
          .filter(v => v.selected_option === "");
        emit('regenerate', itemsToRegenerate);
      }
    };

    const getIconColor = (itemIndex: number) => {
      if (isItemSelected(itemIndex)) return 'success';
      if (isItemFullyReviewed(itemIndex)) return 'info';
      return 'warning';
    };

    const getIconName = (itemIndex: number, expanded: boolean) => {
      if (isItemSelected(itemIndex)) return 'mdi-check-circle';
      if (isItemFullyReviewed(itemIndex)) return 'mdi-eye-check';
      if (expanded) return 'mdi-chevron-up';
      return 'mdi-chevron-down';
    };

    return {
      openPanels,
      showFeedback,
      toggleFeedback,
      toggleSelection,
      isItemSelected,
      isItemFullyReviewed,
      canConfirmSelection,
      canRegenerate,
      regenerateButtonText,
      regenerateTooltip,
      generateTooltip,
      confirmSelection,
      regenerate,
      getIconColor,
      getIconName,
    };
  },
};
</script>

<style scoped>
.selected {
  border: 2px solid var(--v-primary-base);
}

.dimmed {
  opacity: 0.6;
  filter: grayscale(30%);
  transition: opacity 0.3s ease, filter 0.3s ease;
}

.dimmed:hover {
  opacity: 0.8;
  filter: grayscale(10%);
}
</style>