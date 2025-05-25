<script setup lang="ts">
import { inject, Ref } from 'vue'

const numberOfWells = inject<Readonly<Ref<number>>>('numberOfWells')!
const targetPoints = inject<Ref<Array<{x: string, y: string, z: string}>>>('targetPoints')!
const entryDirections = inject<Ref<Array<{x: string, y: string, z: string}>>>('entryDirections')!
const updateNumberOfWells = inject<(value: number) => void>('updateNumberOfWells')!
const computeState = inject<Ref<{
  problemType: string;
  cluster_min: number;
  cluster_max: number;
}>>('computeState')!

const handleNumberOfWellsInput = (e: Event) => {
  const input = e.target as HTMLInputElement
  const value = input.value.replace(/[^0-9]/g, '')
  const numValue = value ? Math.max(1, parseInt(value)) : 1
  updateNumberOfWells(numValue)
}


</script>

<template>
  <div class="p-6 space-y-6 max-h-[calc(100vh-500px)] overflow-y-auto">
    <!-- Input Fields -->
    <div class="space-y-4">
      <div class="flex items-center space-x-2">
        <label class="text-sm">Number of Wells:</label>
        <input
            type="number"
            min="1"
            :value="numberOfWells"
            @input="handleNumberOfWellsInput"
            class="border rounded px-2 py-1 w-16 text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        >
      </div>

      <div class="flex items-center space-x-2">
        <label class="text-sm">Minimum Clusters:</label>
        <input
            type="number"
            v-model="computeState.cluster_min"
            min="1"
            class="border rounded px-2 py-1 w-16 text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        >
      </div>

      <div class="flex items-center space-x-2">
        <label class="text-sm">Maximum Clusters:</label>
        <input
            type="number"
            v-model="computeState.cluster_max"
            min="1"
            class="border rounded px-2 py-1 w-16 text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        >
      </div>
    </div>

    <!-- Target Point -->
    <div class="space-y-4">
      <h3 class="text-sm font-medium">Target Points (PT):</h3>
      <div class="max-h-[200px] overflow-y-auto">
        <table class="w-full text-sm border-collapse">
          <thead class="bg-gray-50">
          <tr>
            <th class="py-2 px-2 text-left font-medium border">#</th>
            <th class="py-2 px-2 text-center font-medium border">P2x</th>
            <th class="py-2 px-2 text-center font-medium border">P2y</th>
            <th class="py-2 px-2 text-center font-medium border">P2z</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="(point, index) in targetPoints" :key="index">
            <td class="py-1.5 px-2 border">{{ index + 1 }}</td>
            <td class="py-1.5 px-2 border">
              <input
                  type="number"
                  step="any"
                  v-model="point.x"
                  class="w-full px-2 py-1 border rounded text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              >
            </td>
            <td class="py-1.5 px-2 border">
              <input
                  type="number"
                  step="any"
                  v-model="point.y"
                  class="w-full px-2 py-1 border rounded text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              >
            </td>
            <td class="py-1.5 px-2 border">
              <input
                  type="number"
                  step="any"
                  v-model="point.z"
                  class="w-full px-2 py-1 border rounded text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              >
            </td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Entry Direction -->
    <div class="space-y-4">
      <h3 class="text-sm font-medium">Entry Directions (VT):</h3>
      <div class="max-h-[200px] overflow-y-auto">
        <table class="w-full text-sm border-collapse">
          <thead class="bg-gray-50">
          <tr>
            <th class="py-2 px-2 text-left font-medium border">#</th>
            <th class="py-2 px-2 text-center font-medium border">V2x</th>
            <th class="py-2 px-2 text-center font-medium border">V2y</th>
            <th class="py-2 px-2 text-center font-medium border">V2z</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="(direction, index) in entryDirections" :key="index">
            <td class="py-1.5 px-2 border">{{ index + 1 }}</td>
            <td class="py-1.5 px-2 border">
              <input
                  type="number"
                  step="any"
                  v-model="direction.x"
                  class="w-full px-2 py-1 border rounded text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              >
            </td>
            <td class="py-1.5 px-2 border">
              <input
                  type="number"
                  step="any"
                  v-model="direction.y"
                  class="w-full px-2 py-1 border rounded text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              >
            </td>
            <td class="py-1.5 px-2 border">
              <input
                  type="number"
                  step="any"
                  v-model="direction.z"
                  class="w-full px-2 py-1 border rounded text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              >
            </td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
