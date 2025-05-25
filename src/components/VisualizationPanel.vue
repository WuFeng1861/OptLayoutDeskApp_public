<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import 'echarts-gl'

// 生成示例数据
function generateData() {
  const data = [];
  const z = [];
  const xMin = 515000;
  const xMax = 517000;
  const yMin = 6781500;
  const yMax = 6784500;
  const zBase = -350;  // 基准深度
  const amplitude = 200; // 波动幅度

  // 生成100x100的网格
  for (let i = 0; i < 100; i++) {
    z.push([]);
    const x = xMin + (i / 99) * (xMax - xMin);
    for (let j = 0; j < 100; j++) {
      const y = yMin + (j / 99) * (yMax - yMin);
      // 使用多个正弦波叠加创造更复杂的地形
      const value =
          Math.sin(i / 10) * Math.cos(j / 8) * amplitude +
          Math.sin(i / 15 + j / 12) * amplitude * 0.5 +
          Math.cos(i / 12 - j / 15) * amplitude * 0.3;
      z[i].push(value);
    }
  }

  // 生成热力图数据
  const surfaceData = [];
  for (let i = 0; i < 100; i++) {
    const x = xMin + (i / 99) * (xMax - xMin);
    for (let j = 0; j < 100; j++) {
      const y = yMin + (j / 99) * (yMax - yMin);
      surfaceData.push([x, y, 0, z[i][j] / amplitude]);
    }
  }

  return { data: surfaceData, z };
}

const currentAngle = ref({ alpha: 13, beta: -143 })

interface TrajectoryData {
  r: number[];      // 转弯半径数组
  r1: number;       // 起始点转弯半径
  r2: number;       // 结束点转弯半径
  P1: number[];     // 起始点
  P2: number[];     // 结束点
  V1: number[];     // 方向
  V2: number[];     // 结束点的切线方向
  v1: number[];     // 单位向量的方向
  v2: number[];     // 结束点单位向量的方向
  T: number[];      // 中间直线的向量长度
  t: number[];      // 大T的单位向量
  Ls: number;       // 直线段的长度
  O1: number[];     // 第一个弧段的圆心
  O2: number[];     // 第二个弧段的圆心
  PO1: number[];    // 起始点到O1的向量
  po1: number[];    // 大PO1的单位向量
  C1: number[];     // 第一个弧线与直线交界点
  C2: number[];     // 第二个弧线与直线交界点
  CO1: number[];    // 第一个圆心到交界点的向量
  CO2: number[];    // 第二个圆心到交界点的向量
  co1: number[];    // CO1的单位向量
  co2: number[];    // CO2的单位向量
  theta1: number;   // 第一个圆弧转过的角度（弧度）
  theta2: number;   // 第二个圆弧转过的角度（弧度）
  L1: number;       // 第一个弧段的弧长
  L2: number;       // 第二个弧段的弧长
  L: number;        // 整个曲线的长度
  error: number;    // 结果是否可算（0可钻）
}

const chartContainer = ref<HTMLDivElement | null>(null)
let chart: echarts.ECharts | null = null
const totalLength = ref(0)
const feasibility = ref(0)
const trajectoryPoints = ref<{
  firstArc: number[][];
  straightLine: number[][];
  secondArc: number[][];
}>({
  firstArc: [],
  straightLine: [],
  secondArc: []
})

const visualComponents = ref({
  trajectory: false,
  annotation: false,
  costContour: false
})

const buttons = ref([
  { label: 'Hold', action: () => console.log('Hold clicked') },
  { label: 'Clear', action: () => console.log('Clear clicked') },
  { label: 'Pop Up', action: () => console.log('Pop Up clicked') }
])

// 计算向量叉积
function crossProduct(a: number[], b: number[]): number[] {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0]
  ]
}

// 计算向量点积
function dotProduct(a: number[], b: number[]): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
}

// 向量标准化
function normalize(v: number[]): number[] {
  const length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2])
  return [v[0] / length, v[1] / length, v[2] / length]
}

// 生成3D圆弧上的点
function generateArcPoints(center: number[], startPoint: number[], endPoint: number[], radius: number, numPoints = 100): number[][] {
  const points: number[][] = []

  // 计算起点和终点相对于圆心的向量
  let startVector = [
    startPoint[0] - center[0],
    startPoint[1] - center[1],
    startPoint[2] - center[2]
  ]
  let endVector = [
    endPoint[0] - center[0],
    endPoint[1] - center[1],
    endPoint[2] - center[2]
  ]

  // 标准化向量
  startVector = normalize(startVector)
  endVector = normalize(endVector)

  // 计算旋转轴（两个向量的叉积）
  const rotationAxis = normalize(crossProduct(startVector, endVector))

  // 计算旋转角度
  const cosTheta = dotProduct(startVector, endVector)
  const theta = Math.acos(Math.max(-1, Math.min(1, cosTheta)))

  // 生成圆弧点
  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints
    const angle = theta * t

    // 罗德里格旋转公式
    const cosA = Math.cos(angle)
    const sinA = Math.sin(angle)

    const rotated = [
      startVector[0] * cosA + rotationAxis[0] * (dotProduct(rotationAxis, startVector)) * (1 - cosA) +
      (crossProduct(rotationAxis, startVector)[0]) * sinA,
      startVector[1] * cosA + rotationAxis[1] * (dotProduct(rotationAxis, startVector)) * (1 - cosA) +
      (crossProduct(rotationAxis, startVector)[1]) * sinA,
      startVector[2] * cosA + rotationAxis[2] * (dotProduct(rotationAxis, startVector)) * (1 - cosA) +
      (crossProduct(rotationAxis, startVector)[2]) * sinA
    ]

    points.push([
      center[0] + rotated[0] * radius,
      center[1] + rotated[1] * radius,
      center[2] + rotated[2] * radius
    ])
  }

  return points
}

// 生成Z轴标记点
function generateZMarkers(points: number[][]): number[][] {
  const markers: number[][] = []
  const zStep = 30 // 每30米一个标记点

  // 找到最小和最大Z值
  const zValues = points.map(p => p[2])
  const minZ = Math.min(...zValues)
  const maxZ = Math.max(...zValues)

  // 从最小Z值开始，每30米生成一个标记点
  for (let z = minZ; z <= maxZ; z += zStep) {
    // 找到最接近这个Z值的点
    const closestPoint = points.reduce((prev, curr) => {
      return Math.abs(curr[2] - z) < Math.abs(prev[2] - z) ? curr : prev
    })
    markers.push([...closestPoint])
  }

  return markers
}

function updateTrajectoryData(data: TrajectoryData) {
  if (!chart) return

  trajectoryPoints.value = {
    firstArc: generateArcPoints(
        data.O1,    // 圆心
        data.P1,    // 起始点
        data.C1,    // 第一个交界点
        data.r1     // 半径
    ),
    straightLine: [
      data.C1,    // 第一个交界点
      data.C2     // 第二个交界点
    ],
    secondArc: generateArcPoints(
        data.O2,    // 圆心
        data.C2,    // 第二个交界点
        data.P2,    // 终点
        data.r2     // 半径
    )
  }

  // 合并所有点以生成Z轴标记
  const allPoints = [
    ...trajectoryPoints.value.firstArc,
    ...trajectoryPoints.value.straightLine,
    ...trajectoryPoints.value.secondArc
  ]

  // 计算每30米的点位信息
  const zStep = 30
  const zValues = allPoints.map(p => p[2])
  const minZ = Math.min(...zValues)
  const maxZ = Math.max(...zValues)
  const zMarkerPoints: { [key: number]: number[] } = {}

  for (let z = minZ; z <= maxZ; z += zStep) {
    const closestPoint = allPoints.reduce((prev, curr) => {
      return Math.abs(curr[2] - z) < Math.abs(prev[2] - z) ? curr : prev
    })
    zMarkerPoints[Math.round(z / zStep) * zStep] = closestPoint
  }

  // 为每个点添加标签
  const pointLabels = {
    firstArc: trajectoryPoints.value.firstArc.map(p =>
        {
          const nearestZ = Math.round(p[2] / zStep) * zStep
          const isMarker = zMarkerPoints[nearestZ]?.every((v, i) => Math.abs(v - p[i]) < 0.01)
          return isMarker
              ? `Depth ${nearestZ}m: (${p[0].toFixed(2)}, ${p[1].toFixed(2)}, ${p[2].toFixed(2)})`
              : `(${p[0].toFixed(2)}, ${p[1].toFixed(2)}, ${p[2].toFixed(2)})`
        }
    ),
    straightLine: trajectoryPoints.value.straightLine.map(p =>
        {
          const nearestZ = Math.round(p[2] / zStep) * zStep
          const isMarker = zMarkerPoints[nearestZ]?.every((v, i) => Math.abs(v - p[i]) < 0.01)
          return isMarker
              ? `Depth ${nearestZ}m: (${p[0].toFixed(2)}, ${p[1].toFixed(2)}, ${p[2].toFixed(2)})`
              : `(${p[0].toFixed(2)}, ${p[1].toFixed(2)}, ${p[2].toFixed(2)})`
        }
    ),
    secondArc: trajectoryPoints.value.secondArc.map(p =>
        {
          const nearestZ = Math.round(p[2] / zStep) * zStep
          const isMarker = zMarkerPoints[nearestZ]?.every((v, i) => Math.abs(v - p[i]) < 0.01)
          return isMarker
              ? `Depth ${nearestZ}m: (${p[0].toFixed(2)}, ${p[1].toFixed(2)}, ${p[2].toFixed(2)})`
              : `(${p[0].toFixed(2)}, ${p[1].toFixed(2)}, ${p[2].toFixed(2)})`
        }
    )
  }

  // 更新图表数据
  chart.setOption({
    tooltip: {
      show: true,
      trigger: 'axis',
      formatter: function(params: any) {
        if (params.length > 0) {
          const point = params[0].data;
          return `X: ${point[0].toFixed(2)}<br/>` +
              `Y: ${point[1].toFixed(2)}<br/>` +
              `Z: ${point[2].toFixed(2)}`;
        }
        return '';
      }
    },
    series: [
      // 表面图1
      {
        type: 'surface',
        data: generateData().z,
        dimensions: ['x', 'y', 'z'],
        shading: 'realistic',
        itemStyle: {
          color: function(params) {
            const value = params.value[2];
            return `hsl(${(value + 1) * 120}, 100%, 50%)`;
          }
        }
      },
      // 表面图2
      {
        type: 'surface',
        data: generateData().data.map(function(item) {
          return [item[0], item[1], item[2], item[3]];
        }),
        dimensions: ['x', 'y', 'z', 'value'],
        shading: 'realistic',
        itemStyle: {
          color: function(params) {
            const value = params.value[3];
            return `hsl(${(value + 1) * 120}, 100%, 50%)`;
          }
        }
      },
      // 关键点标记
      {
        type: 'scatter3D',
        name: 'Key Points',
        data: [{
          value: data.P1,
          name: 'P1 (Start)',
          info: `Start Point (${data.P1[0].toFixed(2)}, ${data.P1[1].toFixed(2)}, ${data.P1[2].toFixed(2)})\nDirection: (${data.V1.map(v => v.toFixed(2)).join(', ')})`
        }, {
          value: data.C1,
          name: 'C1',
          info: `First Arc End (${data.C1[0].toFixed(2)}, ${data.C1[1].toFixed(2)}, ${data.C1[2].toFixed(2)})`
        }, {
          value: data.C2,
          name: 'C2',
          info: `Second Arc Start (${data.C2[0].toFixed(2)}, ${data.C2[1].toFixed(2)}, ${data.C2[2].toFixed(2)})`
        }, {
          value: data.P2,
          name: 'P2 (End)',
          info: `End Point (${data.P2[0].toFixed(2)}, ${data.P2[1].toFixed(2)}, ${data.P2[2].toFixed(2)})\nDirection: (${data.V2.map(v => v.toFixed(2)).join(', ')})`
        }],
        symbolSize: 10,
        itemStyle: {
          color: '#FF5722',
          opacity: 1
        },
        label: {
          show: true,
          formatter: function(params: any) {
            return params.data.info;
          },
          position: 'top',
          textStyle: {
            color: '#000',
            fontSize: 12,
            backgroundColor: 'rgba(255,255,255,0.8)',
            padding: [4, 8]
          }
        },
        tooltip: {
          formatter: function(params: any) {
            const point = params.data.value;
            return params.data.info.replace(/\n/g, '<br/>');
          }
        }
      },
      {
        type: 'line3D',
        data: trajectoryPoints.value.firstArc,
        lineStyle: { width: 4, color: '#4CAF50' },
        tooltip: {
          formatter: (params: any) => pointLabels.firstArc[params.dataIndex]
        }
      },
      {
        type: 'line3D',
        data: trajectoryPoints.value.straightLine,
        lineStyle: { width: 4, color: '#2196F3' },
        tooltip: {
          formatter: (params: any) => pointLabels.straightLine[params.dataIndex]
        }
      },
      {
        type: 'line3D',
        data: trajectoryPoints.value.secondArc,
        lineStyle: { width: 4, color: '#9C27B0' },
        tooltip: {
          formatter: (params: any) => pointLabels.secondArc[params.dataIndex]
        }
      }
    ]
  })

  // 更新状态栏数据
  totalLength.value = data.L
  feasibility.value = data.error === 0 ? 1 : 0
}

function initChart() {
  if (!chartContainer.value) return

  chart = echarts.init(chartContainer.value)

  const option = {
    visualMap: {
      type: 'continuous',
      min: -2,
      max: 2,
      calculable: true,
      inRange: {
        color: ['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8',
          '#ffffbf', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026']
      },
      precision: 2,
      textStyle: {
        color: '#000'
      },
      orient: 'vertical',
      right: 10,
      top: 'center'
    },
    tooltip: {
      show: true,
      trigger: 'axis',
      formatter: function(params: any) {
        if (params.length > 0) {
          const point = params[0].data;
          return `X: ${point[0].toFixed(2)}<br/>` +
              `Y: ${point[1].toFixed(2)}<br/>` +
              `Z: ${point[2].toFixed(2)}`;
        }
        return '';
      }
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
          shadow: true
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
        rotateSensitivity: 3,
        zoomSensitivity: 2
      }
    },
    xAxis3D: {
      type: 'value',
      name: 'X',
      nameTextStyle: { color: '#000' },
      axisLabel: { show: true },
      min: 515000,  // 增加冗余
      max: 517000,
      axisLine: {
        show: true,
        lineStyle: { width: 2, color: '#000' }
      },
      position: 'right',
      nameGap: 20,
    },
    yAxis3D: {
      type: 'value',
      name: 'Y',
      nameTextStyle: { color: '#000' },
      axisLabel: { show: true },
      min: 6781500,  // 增加冗余
      max: 6784500,
      axisLine: {
        show: true,
        lineStyle: { width: 2, color: '#000' }
      },
      position: 'right',
      nameGap: 20,
    },
    zAxis3D: {
      type: 'value',
      name: 'Z',
      nameTextStyle: { color: '#000' },
      axisLabel: { show: true },
      inverse: true,
      min: -1700,  // 增加冗余
      max: -300,
      axisLine: {
        show: true,
        lineStyle: { width: 2, color: '#000' }
      },
      position: 'left',  // Z轴位置调整到左边
      nameGap: 20,
      nameLocation: 'start'  // Z轴标签位置调整到起始位置
    },
    series: [
      {
        type: 'scatter3D',
        data: [],
        symbolSize: 10,
        itemStyle: {
          color: '#FF5722',
          opacity: 1
        },
        emphasis: {
          itemStyle: {
            opacity: 1
          }
        },
        animation: false,
        label: {
          show: true,
          position: 'top',
          textStyle: {
            color: '#000',
            fontSize: 12,
            backgroundColor: 'rgba(255,255,255,0.8)',
            padding: [4, 8]
          }
        }
      },
      {
        type: 'line3D',
        data: [],
        lineStyle: {
          width: 4,
          color: '#4CAF50',
          opacity: 1
        },
        emphasis: {
          lineStyle: {
            width: 6
          }
        },
        animation: false
      },
      {
        type: 'line3D',
        data: [],
        lineStyle: {
          width: 4,
          color: '#2196F3',
          opacity: 1
        },
        emphasis: {
          lineStyle: {
            width: 6
          }
        },
        animation: false
      },
      {
        type: 'line3D',
        data: [],
        lineStyle: {
          width: 4,
          color: '#9C27B0',
          opacity: 1
        },
        emphasis: {
          lineStyle: {
            width: 6
          }
        },
        animation: false
      }
    ]
  }

  chart.setOption(option)

  // Add event listener for view changes
  const updateViewAngle = () => {
    const viewControl = (chart as any).getModel().getComponent('grid3D').option.viewControl;
    console.log(viewControl, 'updateViewAngle');
    if (viewControl && chart) {
      currentAngle.value = {
        alpha: viewControl.alpha,
        beta: viewControl.beta
      }
    }
  }

  // 监听多个事件以确保角度更新
  chart.on('graphroam', updateViewAngle);
  chart.on('mouseup', updateViewAngle);
  chart.on('mousemove', updateViewAngle);

  // 示例：使用你提供的数据初始化图表
  const sampleData: TrajectoryData = {
    r: [572.9577951308232],
    r1: 572.9577951308232,
    r2: 572.9577951308232,
    P1: [516461.6462312718, 6782340.26520238, -400.0],
    P2: [515726.0, 6784079.0, -1577.0],
    V1: [0.0, 0.0, -1.0],
    V2: [541.0, 1051.0, -4.0],
    v1: [0.0, 0.0, -1.0],
    v2: [0.457670316966908, 0.8891155325919045, -0.0033838840441176195],
    T: [-557.1910360434844, 889.979593438654, -508.497698228203],
    Ls: 1166.6599489516316,
    t: [-0.4775950666208949, 0.7628440440064781, -0.4358576795964775],
    O1: [516157.60503926605, 6782825.898385518, -400.0],
    O2: [516170.672048685, 6783851.173312833, -1296.5674684813926],
    PO1: [-557.1910360434844, 889.979593438654, 0.0],
    po1: [-0.5306519862188076, 0.8475898002701746, 0.0],
    C1: [516290.1237277154, 6782614.23143318, -915.6709546803314],
    C2: [515732.9326916716, 6783504.211026618, -1424.1686529089102],
    CO1: [-283330.3593014995, 452552.57473362744, 1102525.5273844432],
    CO2: [934895.4383158028, 741019.6352067902, 272522.36595513317],
    co1: [-0.2312887433865914, 0.36942852359540007, 0.9000156016074246],
    co2: [0.7639993045447349, 0.6055634274693532, 0.22270607977046974],
    theta1: 1.1198053088634847,
    theta2: 1.0915051975672512,
    L1: 641.6011807422127,
    L2: 625.3864113719658,
    L: 2433.6475410658104,
    error: 0
  }

  updateTrajectoryData(sampleData)
}

onMounted(() => {
  initChart()
  window.addEventListener('resize', () => chart?.resize())
})

onUnmounted(() => {
  chart?.dispose()
  window.removeEventListener('resize', () => chart?.resize())
})
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
