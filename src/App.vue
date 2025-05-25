<script setup lang="ts">
import { ref, provide, readonly, watch } from 'vue'
import ConfigurationPanel from './components/ConfigurationPanel.vue'
import VisualizationPanel from './components/VisualizationPanel.vue'

interface CustomFunction {
  formula: string
}

interface Point {
  x: string
  y: string
  z: string
}

interface KickoffPoint {
  p1z: number
  v1x: number
  v1y: number
  v1z: number
}

interface DoglegPoint {
  dogleg: number
  radius: number
}

interface Surface {
  depth: number
  inclination: string
  selectedWells: number[]
  areaFormula: string
  displayArea: boolean
  setIntermediatePoint: boolean
}

interface ComputeState {
  problemType: string
  cluster_min: number
  cluster_max: number
  sitePreparationCost: number
  numberOfClusterSizes: number
  clusterSizes: Array<{ size: number; cost: number }>
  economicZoneThreshold: number
  parallelComputing: boolean
  threadCount: number
  designatePosition: boolean
  ranges: {
    x: { mode: 'Auto' | 'Manual'; value: string }
    y: { mode: 'Auto' | 'Manual'; value: string }
    radius: { mode: 'Auto' | 'Manual'; value: string }
    resolution: { mode: 'Auto' | 'Manual'; value: string }
    wellNo: { mode: 'All' | 'Manual'; value: string }
    initialGuess: { mode: 'Auto' | 'Manual'; value: string }
  }
}

interface OtherConstraintsState {
  drillSiteEnabled: boolean
  drillSiteFormula: string
  firstCurveEnabled: boolean
  firstCurveAngle: number
  firstCurveSelectedWells: number[]
  secondCurveEnabled: boolean
  secondCurveAngle: number
  secondCurveSelectedWells: number[]
  customFunctionEnabled: boolean
  customFunctionFormula: string
  numberOfSurfaces: number
}

const activeTab = ref('completion-intervals')
const numberOfWells = ref(1)
const targetPoints = ref<Point[]>([{ x: '', y: '', z: '' }])
const entryDirections = ref<Point[]>([{ x: '', y: '', z: '' }])

// Kickoff state
const kickoffPoints = ref<KickoffPoint[]>([{
  p1z: -300.00,
  v1x: 0,
  v1y: 0,
  v1z: -1.00
}])

const surfaces = ref<Surface[]>([{
  depth: -1000,
  inclination: '',
  selectedWells: [-1],
  areaFormula: '',
  displayArea: false,
  setIntermediatePoint: false
}])

const activeSurfaceIndex = ref(0)

// Dogleg state
const doglegPoints = ref<DoglegPoint[]>([{
  dogleg: 2.00,
  radius: 859.44
}])

// Other Constraints state
const otherConstraints = ref<OtherConstraintsState>({
  drillSiteEnabled: false,
  drillSiteFormula: 'Y-1000',
  firstCurveEnabled: false,
  firstCurveAngle: 90,
  firstCurveSelectedWells: [-1],
  secondCurveEnabled: false,
  secondCurveAngle: 90,
  secondCurveSelectedWells: [-1],
  customFunctionEnabled: false,
  customFunctionFormula: 'theta1(2)-pi/2; theta2(3)-deg2rad(80)',
  numberOfSurfaces: 0
})

// Compute state
const computeState = ref<ComputeState>({
  problemType: '1-Site-N-Wells',
  cluster_min: 10,
  cluster_max: 10,
  sitePreparationCost: 300,
  numberOfClusterSizes: 4,
  clusterSizes: [
    { size: 1.00, cost: 20.00 },
    { size: 2.00, cost: 30.00 },
    { size: 3.00, cost: 50.00 },
    { size: 4.00, cost: 50.00 }
  ],
  economicZoneThreshold: 20,
  parallelComputing: false,
  threadCount: 11,
  designatePosition: false,
  ranges: {
    x: { mode: 'Auto', value: '' },
    y: { mode: 'Auto', value: '' },
    radius: { mode: 'Auto', value: '' },
    resolution: { mode: 'Auto', value: '' },
    wellNo: { mode: 'All', value: '[1,3]' },
    initialGuess: { mode: 'Auto', value: '[0, 0]' }
  }
})

const selectedObjective = ref('Minimum Length')
const objectiveType = ref('unify')
const formula = ref('Ls + Lc')
const customFunctions = ref<CustomFunction[]>([{ formula: '(1+sin(theta))*Ls+2*Lc' }])

provide('activeTab', activeTab)
provide('numberOfWells', readonly(numberOfWells))
provide('updateNumberOfWells', (value: number) => {
  numberOfWells.value = value


  // Update arrays when number of wells changes
  while (targetPoints.value.length < value) {
    targetPoints.value.push({ x: '', y: '', z: '' })
  }
  while (targetPoints.value.length > value) {
    targetPoints.value.pop()
  }

  while (entryDirections.value.length < value) {
    entryDirections.value.push({ x: '', y: '', z: '' })
  }
  while (entryDirections.value.length > value) {
    entryDirections.value.pop()
  }

  // Update custom functions array
  while (customFunctions.value.length < value) {
    customFunctions.value.push({ formula: '(1+sin(theta))*Ls+2*Lc' })
  }
  while (customFunctions.value.length > value) {
    customFunctions.value.pop()
  }

  // Update kickoff points
  while (kickoffPoints.value.length < value) {
    kickoffPoints.value.push({
      p1z: -300.00,
      v1x: 0,
      v1y: 0,
      v1z: -1.00
    })
  }
  while (kickoffPoints.value.length > value) {
    kickoffPoints.value.pop()
  }

  // Update dogleg points
  while (doglegPoints.value.length < value) {
    doglegPoints.value.push({
      dogleg: 2.00,
      radius: 859.44
    })
  }
  while (doglegPoints.value.length > value) {
    doglegPoints.value.pop()
  }
})

provide('targetPoints', targetPoints)
provide('entryDirections', entryDirections)
provide('selectedObjective', selectedObjective)
provide('objectiveType', objectiveType)
provide('formula', formula)
provide('customFunctions', customFunctions)
provide('kickoffPoints', kickoffPoints)
provide('doglegPoints', doglegPoints)
provide('otherConstraints', otherConstraints)
provide('surfaces', surfaces)
provide('activeSurfaceIndex', activeSurfaceIndex)
provide('computeState', computeState)

// Reset formula when switching objectives
watch(selectedObjective, (newValue) => {
  if (newValue === 'Minimum Length') {
    formula.value = 'Ls + Lc'
    objectiveType.value = 'unify'
  }
})
</script>

<template>
  <div class="h-screen bg-gray-50 flex flex-col overflow-hidden">
    <div class="flex-1 grid grid-cols-[400px,1fr]">
      <!-- Left Panel -->
      <ConfigurationPanel :number-of-wells="numberOfWells" />

      <!-- Right Panel -->
      <VisualizationPanel />
    </div>
  </div>
</template>
