<script setup lang="ts">
import { inject, watch, ref, computed } from 'vue'
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
const kickoffPoints = inject<Ref<Array<{pkx: number, pky: number, pkz: number}>>>('kickoffPoints')!
const kickoffDirections = inject<Ref<Array<{vkx: number, vky: number, vkz: number}>>>('kickoffDirections')!
const doglegPoints = inject<Ref<Array<{dogleg: number, radius: number}>>>('doglegPoints')!

// 根据problemType动态计算应该显示的面板
const availablePanels = computed(() => {
  const panels = ['cost-contour']
  
  if (computeState.value.problemType === 'K-Site-N-Wells') {
    panels.push('optimal-layout')
  } else if (computeState.value.problemType === '1-Sites-N-Wells') {
    panels.push('optimal-site')
  }
  
  return panels
})

// 控制折叠面板的展开状态，默认全部展开
const activeNames = ref(['cost-contour', 'optimal-layout', 'optimal-site'])

// 监听problemType变化，更新activeNames
watch(() => computeState.value.problemType, () => {
  activeNames.value = [...availablePanels.value]
}, { immediate: true })

const sendRequest = async () => {
  try {
    const data = buildRequestData(
        numberOfWells.value,
        targetPoints.value,
        entryDirections.value,
        kickoffPoints.value,
        kickoffDirections.value,
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
  <div class="pb-6 max-h-[calc(100vh-500px)] overflow-y-auto">
    <el-collapse v-model="activeNames" class="custom-collapse">
      <!-- Cost Contour -->
      <el-collapse-item title="Cost Contour" name="cost-contour">
        <div class="p-4 space-y-3">
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

          <!-- Run Button -->
          <div class="flex items-center space-x-3">
            <button
                @click="sendRequest"
                class="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-green-600 transition-colors">
              ▶
            </button>
            <span class="text-sm text-gray-600">Run Cost Contour Analysis</span>
          </div>
        </div>
      </el-collapse-item>

      <!-- Optimal Layout -->
      <el-collapse-item 
        v-if="computeState.problemType === '1-Site-N-Wells'"
        title="Optimal Layout" 
        name="optimal-layout"
      >
        <div class="p-4 space-y-3">
          <!-- Minimum Clusters -->
          <div class="flex items-center space-x-2">
            <span class="text-sm whitespace-nowrap">Minimum Clusters:</span>
            <input
                type="number"
                v-model="computeState.cluster_min"
                min="1"
                class="border rounded px-2 py-1 w-20 text-sm text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            >
          </div>

          <!-- Maximum Clusters -->
          <div class="flex items-center space-x-2">
            <span class="text-sm whitespace-nowrap">Maximum Clusters:</span>
            <input
                type="number"
                v-model="computeState.cluster_max"
                min="1"
                class="border rounded px-2 py-1 w-20 text-sm text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            >
          </div>
        </div>
      </el-collapse-item>

      <!-- Optimal Site -->
      <el-collapse-item 
        v-if="computeState.problemType === 'K-Sites-N-Wells'"
        title="Optimal Site" 
        name="optimal-site"
      >
        <div class="p-4 space-y-3">
          <!-- Initial Guess -->
          <div class="grid grid-cols-[100px,1fr] items-center gap-2">
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
                    placeholder="[x, y]"
                >
              </label>
            </div>
          </div>

          <!-- Run Button -->
          <div class="flex items-center space-x-3">
            <button class="px-4 py-1 border rounded text-sm hover:bg-gray-50 transition-colors">
              Run Optimization
            </button>
          </div>
        </div>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<style scoped>
@import '../styles/shared.css';
</style>