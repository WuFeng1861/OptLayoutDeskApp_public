<script setup lang="ts">

export interface TreeNode {
  id: string;
  label: string;
  checked: boolean;
  children?: TreeNode[];
  expanded?: boolean;
}

const props = defineProps<{
  data: TreeNode[];
}>();

const emit = defineEmits(['nodeChecked']);

// 切换节点展开状态
const toggleExpand = (node: TreeNode) => {
  node.expanded = !node.expanded;
};

// 切换节点选中状态
const toggleCheck = (node: TreeNode) => {
  node.checked = !node.checked;

  // 如果有子节点，同步子节点的选中状态
  if (node.children) {
    updateChildrenChecked(node.children, node.checked);
  }

  // 向上同步父节点的选中状态
  emit('nodeChecked', node);
};

// 更新所有子节点的选中状态
const updateChildrenChecked = (children: TreeNode[], checked: boolean) => {
  for (const child of children) {
    child.checked = checked;
    if (child.children) {
      updateChildrenChecked(child.children, checked);
    }
  }
};

</script>

<template>
  <div class="tree-view max-h-[300px] overflow-y-auto">
    <div v-for="node in data" :key="node.id">
      <!-- 节点本身 -->
      <div class="flex items-center py-1">
        <!-- 展开/折叠图标 -->
        <button
            v-if="node.children && node.children.length > 0"
            class="w-4 h-4 flex items-center justify-center mr-1 text-gray-500 focus:outline-none"
            @click="toggleExpand(node)"
        >
          <span
              class="transform transition-transform duration-200"
              :class="node.expanded ? 'rotate-90' : ''"
          >▶</span>
        </button>
        <div v-else class="w-4 mr-1"></div>

        <!-- 复选框 -->
        <input
            type="checkbox"
            v-model="node.checked"
            class="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
            @change="toggleCheck(node)"
        >

        <!-- 标签 -->
        <span class="text-sm">{{ node.label }}</span>
      </div>

      <!-- 子节点 -->
      <div
          v-if="node.children && node.expanded"
          class="pl-4"
      >
        <template v-for="childNode in node.children" :key="childNode.id">
          <div class="tree-node">
            <!-- 子节点本身 -->
            <div class="flex items-center py-1">
              <!-- 展开/折叠图标 -->
              <button
                  v-if="childNode.children && childNode.children.length > 0"
                  class="w-4 h-4 flex items-center justify-center mr-1 text-gray-500 focus:outline-none"
                  @click="toggleExpand(childNode)"
              >
                <span
                    class="transform transition-transform duration-200"
                    :class="childNode.expanded ? 'rotate-90' : ''"
                >▶</span>
              </button>
              <div v-else class="w-4 mr-1"></div>

              <!-- 复选框 -->
              <input
                  type="checkbox"
                  v-model="childNode.checked"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                  @change="toggleCheck(childNode)"
              >

              <!-- 标签 -->
              <span class="text-sm">{{ childNode.label }}</span>
            </div>

            <!-- 孙节点 -->
            <div
                v-if="childNode.children && childNode.expanded"
                class="pl-4"
            >
              <template v-for="grandChildNode in childNode.children" :key="grandChildNode.id">
                <div class="flex items-center py-1">
                  <!-- 展开/折叠图标 -->
                  <button
                      v-if="grandChildNode.children && grandChildNode.children.length > 0"
                      class="w-4 h-4 flex items-center justify-center mr-1 text-gray-500 focus:outline-none"
                      @click="toggleExpand(grandChildNode)"
                  >
                    <span
                        class="transform transition-transform duration-200"
                        :class="grandChildNode.expanded ? 'rotate-90' : ''"
                    >▶</span>
                  </button>
                  <div v-else class="w-4 mr-1"></div>

                  <!-- 复选框 -->
                  <input
                      type="checkbox"
                      v-model="grandChildNode.checked"
                      class="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                      @change="toggleCheck(grandChildNode)"
                  >

                  <!-- 标签 -->
                  <span class="text-sm">{{ grandChildNode.label }}</span>
                </div>
              </template>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
