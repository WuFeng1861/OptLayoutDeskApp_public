<script setup lang="ts">
import { ref, inject, watch } from 'vue'

const numberOfWells = inject<Readonly<Ref<number>>>('numberOfWells')!
const doglegPoints = inject<Ref<Array<{
  dogleg: string;
  radius: number;
}>>>('doglegPoints')!
</script>

<template>
  <div class="p-4 max-h-[calc(100vh-500px)] overflow-y-auto">
    <h2 class="text-lg font-serif mb-4 text-gray-800">Dogleg Severity & Corresponding Minimum Radius</h2>

    <div class="border rounded max-h-[400px] overflow-y-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="bg-gray-50 border-b">
            <th class="w-12 py-2 px-2 text-center font-medium border-r">#</th>
            <th class="w-1/2 py-2 px-2 text-center font-medium border-r">dogleg (°/30m)</th>
            <th class="w-1/2 py-2 px-2 text-center font-medium">radius(m)</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(point, index) in doglegPoints" :key="index" class="border-b last:border-b-0">
            <td class="py-1.5 px-2 border-r text-center">{{ index + 1 }}</td>
            <td class="py-1.5 px-2 border-r">
              <input
                type="text"
                v-model="point.dogleg"
                class="w-full px-1.5 py-1 border rounded text-right"
                placeholder="example: 2.0 or 2.0,3.0,4.0"
              >
            </td>
            <td class="py-1.5 px-2">
              <input
                type="number"
                v-model="point.radius"
                class="w-full px-1.5 py-1 border rounded text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                step="0.01"
              >
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>