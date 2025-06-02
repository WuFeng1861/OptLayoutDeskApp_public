<script setup lang="ts">
import {ref, onMounted, onUnmounted} from 'vue';
import * as echarts from 'echarts';
import 'echarts-gl';
import {
  changeCurvesShow,
  changeDataShow,
  getContourIndexListRef,
  getContourShowData,
  getCurvesIndexListRef,
  getCurvesShowData
} from '../services/dataTemp';
import {CostContourData, CurvesData, formatData_contour, formatData_curves} from '../utils/calcData';
import {calculateGradientColor} from '../utils/colorUtil';

// 生成costContour示例数据
function generateCostContourData(list: CostContourData[]) {
  let result = formatData_contour(list);
  return {
    data: result.data,
    z: result.z,
    minCost: result.minCost,
    maxCost: result.maxCost,
    minx: result.minX,
    maxX: result.maxX,
    minY: result.minY,
    maxY: result.maxY
  };
}


// 生成line示例数据
function generateLineData(list: CurvesData[]) {
  let result = formatData_curves(list);
  return {
    data: result.data,
    maxZ: result.maxZ,
    minZ: result.minZ
  };
}

// const currentAngle = ref({alpha: 13, beta: -143});
const currentAngle = ref({alpha: 48, beta: -46});

const chartContainer = ref<HTMLDivElement | null>(null);
let chart: echarts.ECharts | null = null;
const totalLength = ref(0);
const feasibility = ref(0);

const visualComponents = ref({
  trajectory: true,
  annotation: true,
  costContour: true
});

const visualCostListRef = getContourIndexListRef();
const visualCurvesListRef = getCurvesIndexListRef();

const buttons = ref([
  {label: 'Hold', action: () => console.log('Hold clicked')},
  {label: 'Clear', action: () => console.log('Clear clicked')},
  {label: 'Pop Up', action: () => console.log('Pop Up clicked')}
]);

const Colors = ['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8',
  '#ffffbf', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026'].reverse();

function initGrid3dData() {
  if (!chart) return;

  let data = getContourShowData();
  let getGenerateData = generateCostContourData(data);

  let lineData = getCurvesShowData();
  let getGenerateLineData = generateLineData(lineData);

  let seriesDataLine = getGenerateLineData.data.map(function (item) {
    return {
      type: 'line3D',
      data: item,
      lineStyle: {
        color: '#000',
        width: 4
      }
    };
  });


  // 更新图表数据
  chart.setOption({
    tooltip: {
      show: true,
      trigger: 'item', // 使用 'item' 触发方式
      formatter: function (params) {
        const point = params.value;
        if (point[3]) {
          return `X: ${Number(point[0].toFixed(2))}<br/>` +
          `Y: ${Number(point[1].toFixed(2))}<br/>`+
          `value: ${point[3] === '-' ? '-' : Number(point[3].toFixed(2))}`
        }
        return `X: ${point[0]}<br/>` +
            `Y: ${point[1]}<br/>`+
            `z: ${point[2]}`
      }
    },
    xAxis3D: {
      type: 'value',
      name: 'X',
      nameTextStyle: {color: '#000'},
      axisLabel: {show: true},
      min: getGenerateData.minx >= 0 ? getGenerateData.minx : 515000,
      max: getGenerateData.maxX >= 0 ? getGenerateData.maxX : 517000,
      axisLine: {
        show: true,
        lineStyle: {width: 2, color: '#000'}
      },
      position: 'right',
      nameGap: 20,
    },
    yAxis3D: {
      type: 'value',
      name: 'Y',
      nameTextStyle: {color: '#000'},
      axisLabel: {show: true},
      min: getGenerateData.minY >= 0 ? getGenerateData.minY : 6781500,
      max: getGenerateData.maxY >= 0 ? getGenerateData.maxY : 6784500,
      axisLine: {
        show: true,
        lineStyle: {width: 2, color: '#000'}
      },
      position: 'right',
      nameGap: 20,
    },
    zAxis3D: {
      type: 'value',
      name: 'Z',
      nameTextStyle: {color: '#000'},
      axisLabel: {show: true},
      inverse: true,
      min: getGenerateLineData.minZ,
      max: getGenerateLineData.maxZ,
      axisLine: {
        show: true,
        lineStyle: {width: 2, color: '#000'}
      },
      position: 'left',  // Z轴位置调整到左边
      nameGap: 20,
      nameLocation: 'start'  // Z轴标签位置调整到起始位置
    },
    grid3D: {
      show: true,
      boxWidth: 100,
      boxHeight: 100,
      boxDepth: 100,
      environment: '#fff',
      light: {
        main: {
          intensity: 1.2,
          shadow: false
        }
      },
      viewControl: {
        projection: 'orthographic',
        alpha: 13,    // 水平旋转角度
        beta: -143,   // 垂直旋转角度
        distance: 1500,  // 增加观察距离以适应坐标范围
        center: [0, 0, 0],  // 确保视图中心点正确
        autoRotate: false,
        damping: 0.5,
        rotateSensitivity: 7,
        zoomSensitivity: 2
      },
    },
    series: [
      {
        type: 'surface',
        wireframe: {
          // show: false
        },
        data: getGenerateData.data.map(function (item) {
          return {
            value: [item[0], item[1], getGenerateLineData.maxZ + Math.abs(getGenerateLineData.maxZ * 0.1), item[3]],
            itemStyle: {
              color: item[3] !== '-' ? calculateGradientColor(item[3] as number, getGenerateData.minCost, getGenerateData.maxCost, Colors) : 'transparent'
            }
          };
        })
      },
      ...seriesDataLine
    ]
  });
}

function updateGrid3dData() {
  if (!chart) return;

  let data = getContourShowData();
  let getGenerateData = generateCostContourData(data);

  let lineData = getCurvesShowData();
  let getGenerateLineData = generateLineData(lineData);
  console.log(getGenerateLineData.data.length, 'updateGrid3dData');
  console.log(JSON.stringify(getGenerateLineData.data), 'updateGrid3dData');
  let seriesDataLine = getGenerateLineData.data.map(function (item) {
    return {
      type: 'line3D',
      data: item,
      lineStyle: {
        color: '#000',
        width: 4
      }
    };
  });


  let option = chart.getOption();
  option.series = [
    {
      type: 'surface',
      wireframe: {
        // show: false
      },
      data: getGenerateData.data.map(function (item) {
        return {
          value: [item[0], item[1], getGenerateLineData.maxZ + Math.abs(getGenerateLineData.maxZ * 0.1), item[3]],
          itemStyle: {
            color: item[3] !== '-' ? calculateGradientColor(item[3] as number, getGenerateData.minCost, getGenerateData.maxCost, Colors) : 'transparent'
          }
        };
      })
    },
  ];
  if (getGenerateLineData.data.length > 0) {
    option.series.push(...seriesDataLine);
  }
  chart.setOption(option, true);
}

function initChart() {
  if (!chartContainer.value) return;

  chart = echarts.init(chartContainer.value);

  initGrid3dData();

  // Add event listener for view changes
  const updateViewAngle = () => {
    const viewControl = (chart as any).getModel().getComponent('grid3D').option.viewControl;
    if (viewControl && chart) {
      currentAngle.value = {
        alpha: viewControl.alpha,
        beta: viewControl.beta
      };
    }
  };

  // 监听多个事件以确保角度更新
  chart.on('graphroam', updateViewAngle);
  chart.on('mouseup', updateViewAngle);
  chart.on('mousemove', updateViewAngle);

  // 监听鼠标滚轮事件
  window.addEventListener('mousewheel', function (event) {
    // 防止默认行为
    event.preventDefault();

    // 获取当前的配置项
    if (!chartContainer.value) return;
    if (!chart) return;

    const viewControl = (chart as any).getModel().getComponent('grid3D').option.viewControl;
    const option = chart.getOption();
    // // 获取 viewControl 的配置
    // const viewControl = option.geo3D[0].viewControl;
    //
    // // 获取当前的缩放距离
    // const currentDistance = viewControl.distance;
    //
    // // 输出当前的缩放距离
    // console.log('当前缩放距离:', currentDistance);

    // 如果需要，可以根据当前距离执行其他操作
  });
}

const changeCostContourIndexShow = (index: number, value: boolean) => {
  changeDataShow(index, value);
  updateGrid3dData();
};
const changeCurvesIndexShow = (index: number, value: boolean) => {
  changeCurvesShow(index, value);
  updateGrid3dData();
};

onMounted(() => {
  initChart();
  window.addEventListener('resize', () => chart?.resize());
});

onUnmounted(() => {
  chart?.dispose();
  window.removeEventListener('resize', () => chart?.resize());
});
</script>

<template>
  <div class="flex h-full p-4 space-x-4">
    <!-- Main visualization area with status bar -->
    <div class="flex-1 flex flex-col min-w-0">
      <div class="flex-1 bg-white border rounded-lg mb-4 relative">
        <div class="absolute left-4 top-4 bg-white/80 px-3 py-1.5 rounded shadow-sm z-10">
          View Angle: α={{ Math.round(currentAngle.alpha) }}°, β={{ Math.round(currentAngle.beta) }}°
        </div>
        <div ref="chartContainer" class="w-full h-full">
        </div>
      </div>

      <!-- Status Bar -->
      <div class="bg-white p-4 border rounded-lg flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <div class="space-x-2">
            <span class="text-sm font-medium">Total Cost(or Length):</span>
            <input type="text" :value="totalLength.toFixed(2)" class="border rounded px-2 py-1 w-20" readonly>
          </div>
          <div class="space-x-2">
            <span class="text-sm font-medium">Solution Feasibility:</span>
            <input type="text" :value="feasibility" class="border rounded px-2 py-1 w-20" readonly>
          </div>
        </div>
      </div>
    </div>

    <!-- Controls -->
    <div class="w-48 flex flex-col space-y-4">
      <!-- Visual Components -->
      <div class="bg-white border rounded-lg p-4">
        <h3 class="text-sm font-medium mb-3 pb-2 border-b">Visual Components</h3>
        <div class="space-y-2">
          <label class="flex items-center space-x-2">
            <input
                type="checkbox"
                v-model="visualComponents.trajectory"
                :checked="true"
                class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            >
            <span class="text-sm">Trajectory</span>
          </label>
          <label class="flex items-center space-x-2">
            <input
                type="checkbox"
                v-model="visualComponents.annotation"
                class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            >
            <span class="text-sm">Annotation</span>
          </label>
          <label class="flex items-center space-x-2">
            <input
                type="checkbox"
                v-model="visualComponents.costContour"
                class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            >
            <span class="text-sm">CostContour</span>
          </label>
          <!--<label class="flex items-center space-x-2" v-for="(value, key, index) in visualCostListRef" >-->
          <!--  <input-->
          <!--      type="checkbox"-->
          <!--      v-model="visualCostListRef[key]"-->
          <!--      class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"-->
          <!--      @change="changeCostContourIndexShow(key, !value)"-->
          <!--  >-->
          <!--  <span class="text-sm">CostContour-{{Number(key)+1}}</span>-->
          <!--</label>-->
          <label class="flex items-center space-x-2" v-for="(value, key, index) in visualCurvesListRef">
            <input
                type="checkbox"
                v-model="visualCurvesListRef[key]"
                class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                @change="changeCurvesIndexShow(key, !value)"
            >
            <span class="text-sm">Line-{{ Number(key) + 1 }}</span>
          </label>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="space-y-2 mt-auto">
        <button
            v-for="btn in buttons"
            :key="btn.label"
            @click="btn.action"
            class="block w-full px-4 py-2 text-sm bg-white border rounded-lg hover:bg-gray-50 transition-colors"
        >
          {{ btn.label }}
        </button>
      </div>
    </div>
  </div>
</template>
