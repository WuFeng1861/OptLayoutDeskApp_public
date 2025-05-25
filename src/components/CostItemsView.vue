<script setup lang="ts">
import { inject, watch } from 'vue'

const computeState = inject<Ref<{
  sitePreparationCost: number;
  numberOfClusterSizes: number;
  clusterSizes: Array<{ size: number; cost: number }>;
  economicZoneThreshold: number;
}>>('computeState')!

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
    <div class="border rounded p-4 bg-white max-w-2xl">
      <div class="text-sm font-medium mb-3">Cost Items</div>
      <div class="space-y-4">
        <!-- Site Preparation Cost -->
        <div class="grid grid-cols-[180px,1fr] items-center gap-2">
          <span class="text-sm">Site Preparation Cost</span>
          <input
            type="number"
            v-model="computeState.sitePreparationCost"
            class="border rounded px-2 py-1 w-28 text-sm text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          >
        </div>

        <!-- Number of Cluster Sizes -->
        <div class="grid grid-cols-[180px,1fr] items-center gap-2">
          <span class="text-sm">Number of Cluster Sizes</span>
          <input
            type="number"
            v-model.number="computeState.numberOfClusterSizes"
            min="1"
            step="1"
            class="border rounded px-2 py-1 w-28 text-sm text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          >
        </div>

        <!-- Cluster Sizes Table -->
        <div class="border rounded max-h-[300px] overflow-y-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-gray-50 border-b">
                <th class="w-12 py-2 px-2 text-center font-medium border-r">#</th>
                <th class="py-2 px-2 text-center font-medium border-r">cluster size</th>
                <th class="py-2 px-2 text-center font-medium">facility cost</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in computeState.clusterSizes" :key="index" class="border-b last:border-b-0">
                <td class="py-1.5 px-2 border-r text-center">{{ index + 1 }}</td>
                <td class="py-1.5 px-2 border-r">
                  <input
                    type="number"
                    v-model="item.size"
                    class="w-full px-1.5 py-1 border rounded text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    step="0.01"
                  >
                </td>
                <td class="py-1.5 px-2">
                  <input
                    type="number"
                    v-model="item.cost"
                    class="w-full px-1.5 py-1 border rounded text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    step="0.01"
                  >
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Economic Zone Threshold -->
        <div class="grid grid-cols-[180px,1fr] items-center gap-2">
          <span class="text-sm">Economic Zone Threshold</span>
          <input
            type="number"
            v-model="computeState.economicZoneThreshold"
            class="border rounded px-2 py-1 w-28 text-sm text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          >
        </div>
      </div>
    </div>
  </div>
</template>
