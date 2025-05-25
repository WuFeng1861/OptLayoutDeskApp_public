<script setup lang="ts">
import { inject, watch } from 'vue'
import { buildRequestData, sendComputeRequest } from '../services/api'

const computeState = inject<Ref<{
  problemType: string;
  cluster_min: number;
  cluster_max: number;
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

const numberOfWells = inject<Readonly<Ref<number>>>('numberOfWells')!
const targetPoints = inject<Ref<Array<{x: string, y: string, z: string}>>>('targetPoints')!
const entryDirections = inject<Ref<Array<{x: string, y: string, z: string}>>>('entryDirections')!
const kickoffPoints = inject<Ref<Array<{p1z: number, v1x: number, v1y: number, v1z: number}>>>('kickoffPoints')!
const doglegPoints = inject<Ref<Array<{dogleg: number, radius: number}>>>('doglegPoints')!

const sendRequest = async () => {
  try {
    const data = buildRequestData(
        numberOfWells.value,
        targetPoints.value,
        entryDirections.value,
        kickoffPoints.value,
        doglegPoints.value,
        computeState.value
    )
    const response = await sendComputeRequest(data)
    console.log('Response:', response)
  } catch (error) {
    console.error('Error:', error)
  }
}

// Watch for changes in numberOfClusterSizes and update clusterSizes array
watch(() => computeState.value.numberOfClusterSizes, (newValue) => {
  const currentLength = computeState.value.clusterSizes.length
  if (newValue > currentLength) {
    // Add new rows
    for (let i = currentLength; i < newValue; i++) {
      computeState.value.clusterSizes.push({ size: 1.00, cost: 20.00 })
    }
  } else if (newValue < currentLength) {
    // Remove excess rows
    computeState.value.clusterSizes.splice(newValue)
  }
})

// Watch clusterSizes length and update numberOfClusterSizes
watch(() => computeState.value.clusterSizes.length, (newLength) => {
  computeState.value.numberOfClusterSizes = newLength
})
</script>

<template>
  <div class="p-6 space-y-6 max-h-[calc(100vh-500px)] overflow-y-auto">
    <!-- Cost Contour -->
    <div class="border rounded p-4 bg-white max-w-2xl">
      <div class="text-sm font-medium mb-3">Cost Contour</div>
      <div class="space-y-3">
        <!-- X Range -->
        <div class="grid grid-cols-[80px,1fr] items-center gap-2">
          <span class="text-sm">X Range:</span>
          <div class="flex items-center space-x-3">
            <label class="inline-flex items-center">
              <input type="radio" v-model="computeState.ranges.x.mode" value="Auto" class="form-radio">
              <span class="ml-2 text-sm">Auto</span>
            </label>
            <label class="inline-flex items-center">
              <input type="radio" v-model="computeState.ranges.x.mode" value="Manual" class="form-radio">
              <input
                  type="text"
                  v-model="computeState.ranges.x.value"
                  class="ml-2 border rounded px-2 py-1 w-28 text-sm"
                  :disabled="computeState.ranges.x.mode === 'Auto'"
              >
            </label>
          </div>
        </div>

        <!-- Y Range -->
        <div class="grid grid-cols-[80px,1fr] items-center gap-2">
          <span class="text-sm">Y Range:</span>
          <div class="flex items-center space-x-3">
            <label class="inline-flex items-center">
              <input type="radio" v-model="computeState.ranges.y.mode" value="Auto" class="form-radio">
              <span class="ml-2 text-sm">Auto</span>
            </label>
            <label class="inline-flex items-center">
              <input type="radio" v-model="computeState.ranges.y.mode" value="Manual" class="form-radio">
              <input
                  type="text"
                  v-model="computeState.ranges.y.value"
                  class="ml-2 border rounded px-2 py-1 w-28 text-sm"
                  :disabled="computeState.ranges.y.mode === 'Auto'"
              >
            </label>
          </div>
        </div>

        <!-- Radius -->
        <div class="grid grid-cols-[80px,1fr] items-center gap-2">
          <span class="text-sm">Radius:</span>
          <div class="flex items-center space-x-3">
            <label class="inline-flex items-center">
              <input type="radio" v-model="computeState.ranges.radius.mode" value="Auto" class="form-radio">
              <span class="ml-2 text-sm">Auto</span>
            </label>
            <label class="inline-flex items-center">
              <input type="radio" v-model="computeState.ranges.radius.mode" value="Manual" class="form-radio">
              <input
                  type="text"
                  v-model="computeState.ranges.radius.value"
                  class="ml-2 border rounded px-2 py-1 w-28 text-sm"
                  :disabled="computeState.ranges.radius.mode === 'Auto'"
              >
            </label>
          </div>
        </div>

        <!-- Resolution -->
        <div class="grid grid-cols-[80px,1fr] items-center gap-2">
          <span class="text-sm">Resolution:</span>
          <div class="flex items-center space-x-3">
            <label class="inline-flex items-center">
              <input type="radio" v-model="computeState.ranges.resolution.mode" value="Auto" class="form-radio">
              <span class="ml-2 text-sm">Auto</span>
            </label>
            <label class="inline-flex items-center">
              <input type="radio" v-model="computeState.ranges.resolution.mode" value="Manual" class="form-radio">
              <input
                  type="text"
                  v-model="computeState.ranges.resolution.value"
                  class="ml-2 border rounded px-2 py-1 w-28 text-sm"
                  :disabled="computeState.ranges.resolution.mode === 'Auto'"
              >
            </label>
          </div>
        </div>

        <!-- Well NO -->
        <div class="grid grid-cols-[80px,1fr] items-center gap-2">
          <span class="text-sm">Well NO:</span>
          <div class="flex items-center space-x-3">
            <label class="inline-flex items-center">
              <input type="radio" v-model="computeState.ranges.wellNo.mode" value="All" class="form-radio">
              <span class="ml-2 text-sm">All &nbsp&nbsp&nbsp</span>
            </label>
            <label class="inline-flex items-center">
              <input type="radio" v-model="computeState.ranges.wellNo.mode" value="Manual" class="form-radio">
              <input
                  type="text"
                  v-model="computeState.ranges.wellNo.value"
                  class="ml-2 border rounded px-2 py-1 w-28 text-sm"
                  :disabled="computeState.ranges.wellNo.mode === 'All'"
              >
            </label>
          </div>
        </div>

        <!-- Parallel Computing -->
        <div class="flex items-center space-x-3">
          <label class="inline-flex items-center">
            <input type="checkbox" v-model="computeState.parallelComputing" class="form-checkbox">
            <span class="ml-2 text-sm">Enable Parallel Computing</span>
          </label>
          <input
              type="number"
              v-model="computeState.threadCount"
              class="border rounded px-2 py-1 w-16 text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              :disabled="!computeState.parallelComputing"
          >
          <button
              @click="sendRequest"
              class="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center">
            ▶
          </button>
        </div>
      </div>
    </div>

    <!-- Optimal Site -->
    <div class="border rounded p-4 bg-white max-w-2xl">
      <div class="text-sm font-medium mb-3">Optimal Site</div>
      <div class="space-y-3">
        <!-- Initial Guess -->
        <div class="grid grid-cols-[80px,1fr] items-center gap-2">
          <span class="text-sm whitespace-nowrap">Initial Guess:</span>
          <div class="flex items-center space-x-3">
            <label class="inline-flex items-center">
              <input type="radio" v-model="computeState.ranges.initialGuess.mode" value="Auto" class="form-radio">
              <span class="ml-2 text-sm">Auto</span>
            </label>
            <label class="inline-flex items-center">
              <input type="radio" v-model="computeState.ranges.initialGuess.mode" value="Manual" class="form-radio">
              <input
                  type="text"
                  v-model="computeState.ranges.initialGuess.value"
                  class="ml-2 border rounded px-2 py-1 w-28 text-sm"
                  :disabled="computeState.ranges.initialGuess.mode === 'Auto'"
              >
            </label>
          </div>
        </div>

        <!-- Designate Position -->
        <div class="flex items-center space-x-3">
          <label class="inline-flex items-center">
            <input type="checkbox" v-model="computeState.designatePosition" class="form-checkbox">
            <span class="ml-2 text-sm">Designate Position</span>
          </label>
          <input
              type="text"
              class="border rounded px-2 py-1 w-28 text-sm"
              :disabled="!computeState.designatePosition"
          >
          <button class="px-4 py-1 border rounded text-sm hover:bg-gray-50">
            Run
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
