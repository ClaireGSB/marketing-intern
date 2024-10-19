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
                  <v-btn v-if="isEditable" @click="toggleSelection(itemIndex, versionNum)"
                    :color="item.selected_option === versionNum ? 'primary' : ''">
                    {{ item.selected_option === versionNum ? 'Unselect version' : 'Select this version' }}
                  </v-btn>
                  <v-chip v-else-if="item.selected_option === versionNum" color="primary" label>
                    Selected version
                  </v-chip>
                  <v-btn @click="toggleFeedback(itemIndex, versionNum)">
                    {{ showFeedback[itemIndex]?.[versionNum] ? 'Hide feedback' : (isEditable ? 'Add feedback' : 'Show Feedback') }}
                  </v-btn>
                </v-card-actions>
                <v-expand-transition>
                  <div v-if="showFeedback[itemIndex]?.[versionNum]">
                    <v-divider></v-divider>
                    <v-card-text>
                      <v-textarea v-model="validations[itemIndex].feedback[versionNum]" label="Your feedback" rows="3"
                        auto-grow :disabled="!isEditable"></v-textarea>
                    </v-card-text>
                  </div>
                </v-expand-transition>
              </v-card>
            </v-col>
          </v-row>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>

    <v-row v-if="isEditable" class="mt-4">
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

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useUserDataStore } from '../stores/userdata'; // Assuming this is the correct import
import { Validations } from '../types/frontendTypes';

const props = defineProps<{
  contentOutputID: string
}>();

const emit = defineEmits<{
  (e: 'confirm', validations: Validations[]): void
  (e: 'regenerate', itemsToRegenerate: Validations[]): void
}>();

const userStore = useUserDataStore();
const validations = ref<Validations[]>([]);
const openPanels = ref<number[]>([0]);
const showFeedback = ref<Record<number, Record<string, boolean>>>({});

const isEditable = computed(() => {
  const contentOutput = userStore.getContentOutputById(props.contentOutputID);
  return !contentOutput || contentOutput.status !== 'completed';
});

const loadValidations = async () => {
  validations.value = await userStore.fetchValidations(props.contentOutputID);
};

onMounted(loadValidations);
watch(() => props.contentOutputID, loadValidations);

const toggleFeedback = (itemIndex: number, versionNum: string) => {
  if (!showFeedback.value[itemIndex]) {
    showFeedback.value[itemIndex] = {};
  }
  showFeedback.value[itemIndex][versionNum] = !showFeedback.value[itemIndex][versionNum];
};

const toggleSelection = (itemIndex: number, optionKey: string) => {
  if (validations.value[itemIndex].selected_option === optionKey) {
    validations.value[itemIndex].selected_option = "";
  } else {
    validations.value[itemIndex].selected_option = optionKey;
    validations.value[itemIndex].validation_status = 'completed';
  }
};

const isItemSelected = (itemIndex: number) => validations.value[itemIndex].selected_option !== "";

const isItemFullyReviewed = (itemIndex: number) => {
  return Object.values(validations.value[itemIndex].feedback).some(feedback => feedback.trim() !== '');
};

const canConfirmSelection = computed(() => validations.value.every(v => v.selected_option !== ""));

const canRegenerate = computed(() => {
  return validations.value.some(v => v.selected_option === "") &&
    validations.value.some(v => Object.values(v.feedback).some(f => f.trim() !== ''));
});

const regenerateButtonText = computed(() => {
  const itemsToRegenerate = validations.value
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
    emit('confirm', validations.value);
  }
};

const regenerate = () => {
  if (canRegenerate.value) {
    console.log("regenerate");
    const itemsToRegenerate = validations.value
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

.v-card-text {
  white-space: pre-wrap;
}
</style>
