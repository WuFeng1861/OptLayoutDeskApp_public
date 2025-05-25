<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  modelValue: number[]
  options: { id: number; label: string }[]
  disabled?: boolean
  placeholder?: string
}>()

const emit = defineEmits(['update:modelValue'])

const isOpen = ref(false)
const buttonRef = ref<HTMLButtonElement | null>(null)

const displayValue = computed(() => {
  if (props.modelValue.includes(-1)) return 'All'
  if (props.modelValue.length === 0) return props.placeholder || 'Select...'
  return props.modelValue.sort((a, b) => a - b).join(', ')
})

const handleSelect = (id: number) => {
  if (id === -1) {
    // If "All" is already selected, deselect it
    if (props.modelValue.includes(-1)) {
      emit('update:modelValue', [])
    } else {
      // Select "All" and deselect others
      emit('update:modelValue', [-1])
    }
  } else {
    // If "All" was selected, clear it
    let newValue = props.modelValue.filter(v => v !== -1)
    
    // Toggle the selected value
    if (newValue.includes(id)) {
      newValue = newValue.filter(v => v !== id)
    } else {
      newValue.push(id)
    }
    
    // If no options are selected, default to "All"
    emit('update:modelValue', newValue)
  }
  
  // Don't close dropdown on selection
  event?.stopPropagation()
}

const closeDropdown = (e: MouseEvent) => {
  if (!buttonRef.value?.contains(e.target as Node)) {
    isOpen.value = false
  }
}

// Close dropdown when clicking outside
if (typeof window !== 'undefined') {
  window.addEventListener('click', closeDropdown)
}
</script>

<template>
  <div class="relative">
    <button
      ref="buttonRef"
      type="button"
      @click="isOpen = !isOpen"
      :disabled="disabled"
      class="w-32 px-3 py-1 text-left text-sm border rounded bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed flex items-center justify-between"
    >
      <span class="truncate">{{ displayValue }}</span>
      <span class="ml-2">▼</span>
    </button>
    
    <div
      v-show="isOpen"
      class="absolute z-10 w-48 mt-1 bg-white border rounded shadow-lg"
    >
      <div class="py-1 max-h-48 overflow-auto">
        <button
          v-for="option in options"
          :key="option.id"
          @click="handleSelect(option.id)"
          class="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center"
        >
          <input
            type="checkbox"
            :checked="modelValue.includes(option.id)"
            @click="handleSelect(option.id)"
            class="mr-2"
            @click.stop
          >
          {{ option.label }}
        </button>
      </div>
    </div>
  </div>
</template>