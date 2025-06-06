<script setup lang="ts">
import { ref, inject } from 'vue'

const numberOfWells = inject<Readonly<Ref<number>>>('numberOfWells')!
const kickoffPoints = inject<Ref<Array<{
  pkx: number;
  pky: number;
  pkz: number;
}>>>('kickoffPoints')!
const kickoffDirections = inject<Ref<Array<{
  vkx: number;
  vky: number;
  vkz: number;
}>>>('kickoffDirections')!

// 控制折叠面板的展开状态，默认全部展开
const activeNames = ref(['depth', 'direction'])
</script>

<template>
  <div class="pb-6 max-h-[calc(100vh-500px)] overflow-y-auto">
    <el-collapse v-model="activeNames" class="custom-collapse">
      <!-- Kickoff Depth -->
      <el-collapse-item title="Kickoff Depth (PKz)" name="depth">
        <div class="table-scroll-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>PKx</th>
                <th>PKy</th>
                <th>PKz</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(point, index) in kickoffPoints" :key="index">
                <td>{{ index + 1 }}</td>
                <td>
                  <input
                    type="number"
                    v-model="point.pkx"
                    step="0.01"
                  >
                </td>
                <td>
                  <input
                    type="number"
                    v-model="point.pky"
                    step="0.01"
                  >
                </td>
                <td>
                  <input
                    type="number"
                    v-model="point.pkz"
                    step="0.01"
                  >
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </el-collapse-item>

      <!-- Direction -->
      <el-collapse-item title="Direction (VK)" name="direction">
        <div class="table-scroll-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>VKx</th>
                <th>VKy</th>
                <th>VKz</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(direction, index) in kickoffDirections" :key="index">
                <td>{{ index + 1 }}</td>
                <td>
                  <input
                    type="number"
                    v-model="direction.vkx"
                    step="0.01"
                  >
                </td>
                <td>
                  <input
                    type="number"
                    v-model="direction.vky"
                    step="0.01"
                  >
                </td>
                <td>
                  <input
                    type="number"
                    v-model="direction.vkz"
                    step="0.01"
                  >
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<style scoped>
@import '../styles/shared.css';
</style>