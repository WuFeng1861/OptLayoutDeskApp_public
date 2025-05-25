<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps<{
  tabs: Record<string, string>
  activeTab: string
}>()

const emit = defineEmits(['update:activeTab'])

const tabsContainer = ref<HTMLDivElement | null>(null)
const showLeftArrow = ref(false)
const showRightArrow = ref(false)
let resizeObserver: ResizeObserver | null = null

const scrollTabs = (direction: 'left' | 'right') => {
  if (!tabsContainer.value) return
  
  const scrollAmount = 200
  const newScrollLeft = tabsContainer.value.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount)
  tabsContainer.value.scrollTo({
    left: newScrollLeft,
    behavior: 'smooth'
  })
}

const checkArrows = () => {
  if (!tabsContainer.value) return
  
  const { scrollLeft, scrollWidth, clientWidth } = tabsContainer.value
  showLeftArrow.value = scrollLeft > 0
  showRightArrow.value = Math.ceil(scrollLeft + clientWidth) < scrollWidth
}

onMounted(() => {
  if (tabsContainer.value) {
    checkArrows()
    const element = tabsContainer.value
    element.addEventListener('scroll', checkArrows)
    
    // Create and store the ResizeObserver
    resizeObserver = new ResizeObserver(() => {
      // Use requestAnimationFrame to avoid the loop warning
      requestAnimationFrame(checkArrows)
    })
    resizeObserver.observe(element)
  }
})

onBeforeUnmount(() => {
  // Clean up event listeners and observers
  if (tabsContainer.value) {
    tabsContainer.value.removeEventListener('scroll', checkArrows)
  }
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }
})
</script>

<template>
  <div class="flex items-center border-b">
    <!-- Left Arrow -->
    <button
      v-show="showLeftArrow"
      @click="scrollTabs('left')"
      class="flex-none w-8 h-full px-2 bg-white hover:bg-gray-50 border-r"
    >
      <span class="text-gray-600">◀</span>
    </button>

    <!-- Tabs Container -->
    <div
      ref="tabsContainer"
      class="flex-1 flex overflow-x-auto scrollbar-hide"
      style="scroll-behavior: smooth;"
    >
      <button
        v-for="(label, tab) in tabs"
        :key="tab"
        :class="[
          'px-4 py-2 text-sm border-r whitespace-nowrap',
          activeTab === tab ? 'bg-gray-200' : 'hover:bg-gray-100'
        ]"
        @click="emit('update:activeTab', tab)"
      >
        {{ label }}
      </button>
    </div>

    <!-- Right Arrow -->
    <button
      v-show="showRightArrow"
      @click="scrollTabs('right')"
      class="flex-none w-8 h-full px-2 bg-white hover:bg-gray-50 border-l transition-opacity"
    >
      <span class="text-gray-600">▶</span>
    </button>
  </div>
</template>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>