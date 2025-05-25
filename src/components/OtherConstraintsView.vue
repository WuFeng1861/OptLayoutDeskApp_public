<script setup lang="ts">
import { ref, inject, computed, watch } from 'vue'
import MultiSelect from './MultiSelect.vue'

interface Surface {
  depth: number;
  inclination: string;
  selectedWells: number[];
  areaFormula: string;
  displayArea: boolean;
  setIntermediatePoint: boolean;
}

const numberOfWells = inject<Readonly<Ref<number>>>('numberOfWells')!
const otherConstraints = inject<Ref<{
  drillSiteEnabled: boolean;
  drillSiteFormula: string;
  firstCurveEnabled: boolean;
  firstCurveAngle: number;
  firstCurveSelectedWells: number[];
  secondCurveEnabled: boolean;
  secondCurveAngle: number;
  secondCurveSelectedWells: number[];
  customFunctionEnabled: boolean;
  customFunctionFormula: string;
  numberOfSurfaces: number;
}>>('otherConstraints')!

const firstCurveWellsMode = ref('all')
const firstCurveWellsValue = ref('')
const secondCurveWellsMode = ref('all')
const secondCurveWellsValue = ref('')

// Watch firstCurveWellsMode and update selectedWells
watch([firstCurveWellsMode, firstCurveWellsValue], ([mode, value]) => {
  if (mode === 'all') {
    otherConstraints.value.firstCurveSelectedWells = [-1]
  } else {
    try {
      const wells = JSON.parse(value)
      if (Array.isArray(wells)) {
        otherConstraints.value.firstCurveSelectedWells = wells
      }
    } catch (e) {
      // Invalid JSON, keep current selection
    }
  }
})

// Watch secondCurveWellsMode and update selectedWells
watch([secondCurveWellsMode, secondCurveWellsValue], ([mode, value]) => {
  if (mode === 'all') {
    otherConstraints.value.secondCurveSelectedWells = [-1]
  } else {
    try {
      const wells = JSON.parse(value)
      if (Array.isArray(wells)) {
        otherConstraints.value.secondCurveSelectedWells = wells
      }
    } catch (e) {
      // Invalid JSON, keep current selection
    }
  }
})

const surfaces = inject<Ref<Surface[]>>('surfaces')!
const activeSurfaceIndex = inject<Ref<number>>('activeSurfaceIndex')!

interface Well {
  id: number;
  label: string;
}

const wellOptions = computed(() => {
  const options: Well[] = [{ id: -1, label: 'All' }]
  for (let i = 0; i < numberOfWells.value; i++) {
    options.push({ id: i, label: i.toString() })
  }
  return options
})

// Watch for changes in numberOfSurfaces and update surfaces array
watch(() => otherConstraints.value.numberOfSurfaces, (newValue) => {
  while (surfaces.value.length < newValue) {
    surfaces.value.push({
      depth: -1000,
      inclination: '',
      selectedWells: [-1],
      areaFormula: '',
      displayArea: false,
      setIntermediatePoint: false
    })
  }
  while (surfaces.value.length > newValue) {
    surfaces.value.pop()
  }
})
</script>

<template>
  <div class="p-4 space-y-6 max-h-[calc(100vh-500px)] overflow-y-auto">
    <!-- Drill Site Location -->
    <div class="border rounded p-4 bg-white">
      <div class="text-sm font-medium mb-3">Drill Site Location f(X,Y)≥0</div>
      <div class="flex items-center space-x-2">
        <input
            type="checkbox"
            v-model="otherConstraints.drillSiteEnabled"
            class="rounded border-gray-300"
        >
        <span class="text-sm italic whitespace-nowrap">f(X,Y) =</span>
        <input
            type="text"
            v-model="otherConstraints.drillSiteFormula"
            class="border rounded px-2 py-1 w-64 text-sm"
            :disabled="!otherConstraints.drillSiteEnabled"
        >
      </div>
    </div>

    <!-- Max Turn Angle -->
    <div class="border rounded p-4 space-y-4 bg-white">
      <div class="text-sm font-medium">Max Turn Angle</div>
      <div class="space-y-4">
        <!-- First Curve -->
        <div class="space-y-2">
          <div class="flex items-center space-x-4">
            <div class="flex items-center space-x-2">
              <input
                  type="checkbox"
                  v-model="otherConstraints.firstCurveEnabled"
                  class="rounded border-gray-300"
              >
              <span class="text-sm">1st curve (buildup)</span>
            </div>
            <div class="flex items-center space-x-1">
              <input
                  type="number"
                  v-model="otherConstraints.firstCurveAngle"
                  class="border rounded px-2 py-1 w-20 text-sm text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  :disabled="!otherConstraints.firstCurveEnabled"
              >
              <span class="text-sm">°</span>
            </div>
          </div>
          <div class="ml-6 flex items-center space-x-2">
            <span class="text-sm whitespace-nowrap">Specify Wells:</span>
            <label class="inline-flex items-center">
              <input
                  type="radio"
                  v-model="firstCurveWellsMode"
                  value="all"
                  :disabled="!otherConstraints.firstCurveEnabled"
                  class="form-radio"
              >
              <span class="ml-2 text-sm">All</span>
            </label>
            <label class="inline-flex items-center">
              <input
                  type="radio"
                  v-model="firstCurveWellsMode"
                  value="manual"
                  :disabled="!otherConstraints.firstCurveEnabled"
                  class="form-radio"
              >
              <input
                  type="text"
                  v-model="firstCurveWellsValue"
                  class="ml-2 border rounded px-2 py-1 w-28 text-sm"
                  :disabled="!otherConstraints.firstCurveEnabled || firstCurveWellsMode === 'all'"
              >
            </label>
          </div>
        </div>

        <!-- Second Curve -->
        <div class="space-y-2">
          <div class="flex items-center space-x-4">
            <div class="flex items-center space-x-2">
              <input
                  type="checkbox"
                  v-model="otherConstraints.secondCurveEnabled"
                  class="rounded border-gray-300"
              >
              <span class="text-sm">2nd curve (buildup/drop)</span>
            </div>
            <div class="flex items-center space-x-1">
              <input
                  type="number"
                  v-model="otherConstraints.secondCurveAngle"
                  class="border rounded px-2 py-1 w-20 text-sm text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  :disabled="!otherConstraints.secondCurveEnabled"
              >
              <span class="text-sm">°</span>
            </div>
          </div>
          <div class="ml-6 flex items-center space-x-2">
            <span class="text-sm whitespace-nowrap">Specify Wells:</span>
            <label class="inline-flex items-center">
              <input
                  type="radio"
                  v-model="secondCurveWellsMode"
                  value="all"
                  :disabled="!otherConstraints.secondCurveEnabled"
                  class="form-radio"
              >
              <span class="ml-2 text-sm">All</span>
            </label>
            <label class="inline-flex items-center">
              <input
                  type="radio"
                  v-model="secondCurveWellsMode"
                  value="manual"
                  :disabled="!otherConstraints.secondCurveEnabled"
                  class="form-radio"
              >
              <input
                  type="text"
                  v-model="secondCurveWellsValue"
                  class="ml-2 border rounded px-2 py-1 w-28 text-sm"
                  :disabled="!otherConstraints.secondCurveEnabled || secondCurveWellsMode === 'all'"
              >
            </label>
          </div>
        </div>
      </div>

      <!-- Custom Function -->
      <div class="space-y-3">
        <div class="flex items-center space-x-2">
          <input
              type="checkbox"
              v-model="otherConstraints.customFunctionEnabled"
              class="rounded border-gray-300"
          >
          <span class="text-sm">Custom Function f(theta1, theta2)≥0:</span>
        </div>
        <div class="ml-6 grid grid-cols-[auto,1fr] items-center gap-2">
          <span class="text-sm italic whitespace-nowrap">f(theta1, theta2) =</span>
          <input
              type="text"
              v-model="otherConstraints.customFunctionFormula"
              class="border rounded px-2 py-1 text-sm"
              :disabled="!otherConstraints.customFunctionEnabled"
          >
        </div>
      </div>
    </div>

    <!-- Layers -->
    <div class="border rounded p-4 bg-white">
      <div class="text-sm font-medium mb-3">Layers</div>
      <div class="space-y-4">
        <!-- Number of Surfaces -->
        <div class="flex items-center space-x-3">
          <span class="text-sm">Number of Surfaces:</span>
          <input
              type="number"
              v-model="otherConstraints.numberOfSurfaces"
              min="0"
              class="border rounded px-2 py-1 w-20 text-sm text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          >
        </div>

        <!-- Surface Tabs -->
        <div v-if="otherConstraints.numberOfSurfaces > 0" class="border rounded">
          <!-- Tab Headers -->
          <div class="flex flex-wrap border-b">
            <button
                v-for="(_, index) in surfaces"
                :key="index"
                class="px-4 py-2 text-sm border-r border-b last:border-r-0 hover:bg-gray-50"
                :class="{ 'bg-gray-100': activeSurfaceIndex === index }"
                @click="activeSurfaceIndex = index"
            >
              S{{ index + 1 }}
            </button>
          </div>

          <!-- Surface Configuration -->
          <div class="p-4 space-y-4 overflow-y-auto max-h-[400px]">
            <!-- Surface Definition -->
            <div class="grid grid-cols-[auto,1fr] items-center gap-2">
              <span class="text-sm whitespace-nowrap">Surface Definition:</span>
              <div class="flex items-center space-x-2">
                <select class="border rounded px-2 py-1 text-sm w-20">
                  <option>Depth</option>
                </select>
                <input
                    type="number"
                    v-model="surfaces[activeSurfaceIndex].depth"
                    class="border rounded px-2 py-1 w-20 text-sm text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                >
              </div>
            </div>

            <!-- Inclination -->
            <div class="space-y-2">
              <div class="flex items-center space-x-2">
                <span class="text-sm whitespace-nowrap">Inclination ≤</span>
                <input
                    type="text"
                    v-model="surfaces[activeSurfaceIndex].inclination"
                    class="border rounded px-2 py-1 w-24 text-sm"
                >
                <span class="text-sm">°</span>
              </div>
              <div class="flex items-center space-x-2">
                <span class="text-sm whitespace-nowrap">Specify Wells</span>
                <MultiSelect
                    v-model="surfaces[activeSurfaceIndex].selectedWells"
                    :options="wellOptions"
                    placeholder="Select wells"
                />
              </div>
            </div>

            <!-- Area Function -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-sm italic">Area f(X,Y) ≤ 0</span>
                <label class="flex items-center space-x-2">
                  <input
                      type="checkbox"
                      v-model="surfaces[activeSurfaceIndex].displayArea"
                      class="rounded border-gray-300"
                  >
                  <span class="text-sm">DisplayArea</span>
                </label>
              </div>
              <div class="flex items-center space-x-2">
                <span class="text-sm italic">f(X,Y) =</span>
                <input
                    type="text"
                    v-model="surfaces[activeSurfaceIndex].areaFormula"
                    class="flex-1 border rounded px-2 py-1 text-sm"
                >
              </div>
            </div>

            <!-- Set Intermediate Point -->
            <div>
              <label class="flex items-center space-x-2">
                <input
                    type="checkbox"
                    v-model="surfaces[activeSurfaceIndex].setIntermediatePoint"
                    class="rounded border-gray-300"
                >
                <span class="text-sm">Set intermediate point</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
