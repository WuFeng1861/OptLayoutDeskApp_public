<script setup lang="ts">
const props = defineProps<{
  modelValue: {
    x: string;
    y: string;
    z: string;
  }
}>();

const emit = defineEmits(['update:modelValue'])

const updateCoordinate = (coordinate: 'x' | 'y' | 'z', value: string) => {
  emit('update:modelValue', {
    ...props.modelValue,
    [coordinate]: value
  })
}
</script>

<template>
  <div class="grid grid-cols-3 gap-2">
    <div>
      <label class="text-xs block">V2x</label>
      <input 
        type="number"
        step="any"
        :value="modelValue.x"
        @input="e => updateCoordinate('x', (e.target as HTMLInputElement).value)"
        class="border rounded px-2 py-1 w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      >
    </div>
    <div>
      <label class="text-xs block">V2y</label>
      <input 
        type="number"
        step="any"
        :value="modelValue.y"
        @input="e => updateCoordinate('y', (e.target as HTMLInputElement).value)"
        class="border rounded px-2 py-1 w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      >
    </div>
    <div>
      <label class="text-xs block">V2z</label>
      <input 
        type="number"
        step="any"
        :value="modelValue.z"
        @input="e => updateCoordinate('z', (e.target as HTMLInputElement).value)"
        class="border rounded px-2 py-1 w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      >
    </div>
  </div>
</template>