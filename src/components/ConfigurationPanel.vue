<script setup lang="ts">
import { ref, inject, computed } from 'vue'
import CompletionIntervalsView from './CompletionIntervalsView.vue'
import ObjectiveView from './ObjectiveView.vue'
import KickoffView from './KickoffView.vue'
import DoglegView from './DoglegView.vue'
import OtherConstraintsView from './OtherConstraintsView.vue'
import ComputeView from './ComputeView.vue'
import CostItemsView from './CostItemsView.vue'
import TabNavigation from './TabNavigation.vue'

const activeTab = inject('activeTab')
const computeState = inject<Ref<{
  problemType: string;
  sitePreparationCost: number;
  numberOfClusterSizes: number;
  clusterSizes: Array<{ size: number; cost: number }>;
  economicZoneThreshold: number;
  parallelComputing: boolean;
  threadCount: number;
  designatePosition: boolean;
  ranges: {
    x: { mode: 'Auto' | 'Manual'; value: string };
    y: { mode: 'Auto' | 'Manual'; value: string };
    radius: { mode: 'Auto' | 'Manual'; value: string };
    resolution: { mode: 'Auto' | 'Manual'; value: string };
    wellNo: { mode: 'All' | 'Manual'; value: string };
    initialGuess: { mode: 'Auto' | 'Manual'; value: string };
  };
}>>('computeState')!

const isOtherConstraintsOpen = ref(true)
const isComputeOpen = ref(true)

const navigationItems = computed(() => {
  const items = [
    'Completion Intervals',
    'Objective',
    'Kickoff',
    'Dogleg',
    'Other Constraints'
  ]

  if (computeState.value.problemType === 'K-Sites-N-Wells') {
    items.splice(4, 0, 'Cost Items')
  }

  items.push('Compute')
  return items
})

const otherConstraints = [
  'Drill Site Location',
  'Max Turn Angle',
  'Layers'
]
</script>

<template>
  <div class="bg-white border-r h-full flex flex-col overflow-hidden">
    <!-- Problem Type Selection -->
    <div class="p-4 border-b">
      <div class="flex space-x-4">
        <label class="inline-flex items-center">
          <input
              type="radio"
              v-model="computeState.problemType"
              value="1-Site-N-Wells"
              class="form-radio"
          >
          <span class="ml-2 text-sm">1-Site-N-Wells</span>
        </label>
        <label class="inline-flex items-center">
          <input
              type="radio"
              v-model="computeState.problemType"
              value="K-Sites-N-Wells"
              class="form-radio"
          >
          <span class="ml-2 text-sm">K-Sites-N-Wells</span>
        </label>
      </div>
    </div>

    <!-- Main Configuration Area -->
    <div class="overflow-y-auto">
      <!-- Configuration Header -->
      <div class="p-2 bg-gray-100 border-b font-medium">Configuration</div>

      <!-- Main Navigation -->
      <div class="px-4 py-2 max-h-[300px] overflow-y-auto">
        <template v-for="item in navigationItems" :key="item">
          <template v-if="!['Other Constraints', 'Compute'].includes(item)">
            <button
                class="w-full text-left p-2 text-sm"
                :class="activeTab === item.toLowerCase().replace(' ', '-') ? 'bg-gray-200' : 'hover:bg-gray-100'"
                @click="activeTab = item.toLowerCase().replace(' ', '-')"
            >
              {{ item }}
            </button>
          </template>
        </template>

        <!-- Other Constraints Section -->
        <div class="pt-2">
          <button
              class="flex items-center space-x-2 p-2 text-sm w-full hover:bg-gray-100"
              :class="{ 'bg-gray-200': activeTab === 'constraints' && isOtherConstraintsOpen }"
              @click="isOtherConstraintsOpen = !isOtherConstraintsOpen"
          >
            <span
                class="transform transition-transform duration-200"
                :class="isOtherConstraintsOpen ? 'rotate-90' : ''"
            >▶</span>
            <span>Other Constraints</span>
          </button>
          <div
              v-show="isOtherConstraintsOpen"
              class="pl-6 space-y-1"
          >
            <button
                v-for="constraint in otherConstraints"
                :key="constraint"
                class="w-full text-left p-2 text-sm transition-colors"
                :class="activeTab === 'constraints' ? 'bg-gray-200' : 'hover:bg-gray-100'"
                @click="activeTab = 'constraints'"
            >
              {{ constraint }}
            </button>
          </div>
        </div>

        <!-- Compute Section -->
        <div class="pt-2">
          <button
              class="flex items-center space-x-2 p-2 text-sm w-full hover:bg-gray-100"
              :class="{ 'bg-gray-200': activeTab === 'compute' && isComputeOpen }"
              @click="isComputeOpen = !isComputeOpen"
          >
            <span
                class="transform transition-transform duration-200"
                :class="isComputeOpen ? 'rotate-90' : ''"
            >▶</span>
            <span>Compute</span>
          </button>
          <div
              v-show="isComputeOpen"
              class="pl-6 space-y-1"
          >
            <button
                class="w-full text-left p-2 text-sm transition-colors"
                :class="activeTab === 'compute' ? 'bg-gray-200' : 'hover:bg-gray-100'"
                @click="activeTab = 'compute'"
            >
              Cost Contour
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Tab Navigation -->
    <div class="border-t">
      <TabNavigation
          :tabs="computeState.problemType === 'K-Sites-N-Wells'
          ? {
            'completion-intervals': 'Completion Intervals',
            objective: 'Objective',
            kickoff: 'Kickoff',
            dogleg: 'Dogleg',
            'cost-items': 'Cost Items',
            constraints: 'Other Constraints',
            compute: 'Compute'
          }
          : {
            'completion-intervals': 'Completion Intervals',
            objective: 'Objective',
            kickoff: 'Kickoff',
            dogleg: 'Dogleg',
            constraints: 'Other Constraints',
            compute: 'Compute'
          }"
          :active-tab="activeTab"
          @update:active-tab="tab => activeTab = tab"
      />
    </div>

    <!-- Dynamic Component Views -->
    <div class="border-t overflow-y-auto flex-1">
      <CompletionIntervalsView v-if="activeTab === 'completion-intervals'" />
      <ObjectiveView v-else-if="activeTab === 'objective'" />
      <KickoffView v-else-if="activeTab === 'kickoff'" />
      <DoglegView v-else-if="activeTab === 'dogleg'" />
      <CostItemsView v-else-if="activeTab === 'cost-items'" />
      <OtherConstraintsView v-else-if="activeTab === 'constraints'" />
      <ComputeView v-else-if="activeTab === 'compute'" />
    </div>
  </div>
</template>
