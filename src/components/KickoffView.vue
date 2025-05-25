<script setup lang="ts">
import { ref, inject, watch } from 'vue'

const numberOfWells = inject<Readonly<Ref<number>>>('numberOfWells')!
const kickoffPoints = inject<Ref<Array<{
  p1z: number;
  v1x: number;
  v1y: number;
  v1z: number;
}>>>('kickoffPoints')!
</script>

<template>
  <div class="p-4 max-h-[calc(100vh-500px)] overflow-y-auto">
    <h2 class="text-lg font-serif mb-4 text-gray-800">Kickoff Depth (P<sub>Kz</sub>) & Direction (V<sub>K</sub>):</h2>

    <div class="border rounded max-h-[400px] overflow-y-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="bg-gray-50 border-b">
            <th class="w-12 py-2 px-2 text-center font-medium border-r">#</th>
            <th class="w-1/4 py-2 px-2 text-center font-medium border-r">P1z</th>
            <th class="w-1/4 py-2 px-2 text-center font-medium border-r">V1x</th>
            <th class="w-1/4 py-2 px-2 text-center font-medium border-r">V1y</th>
            <th class="w-1/4 py-2 px-2 text-center font-medium">V1z</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(point, index) in kickoffPoints" :key="index" class="border-b last:border-b-0">
            <td class="py-1.5 px-2 border-r text-center">{{ index + 1 }}</td>
            <td class="py-1.5 px-2 border-r">
              <input
                type="number"
                v-model="point.p1z"
                class="w-full px-1.5 py-1 border rounded text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                step="0.01"
              >
            </td>
            <td class="py-1.5 px-2 border-r">
              <input
                type="number"
                v-model="point.v1x"
                class="w-full px-1.5 py-1 border rounded text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                step="0.01"
              >
            </td>
            <td class="py-1.5 px-2 border-r">
              <input
                type="number"
                v-model="point.v1y"
                class="w-full px-1.5 py-1 border rounded text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                step="0.01"
              >
            </td>
            <td class="py-1.5 px-2">
              <input
                type="number"
                v-model="point.v1z"
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
