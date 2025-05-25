import axios from 'axios'

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

export function buildRequestData(
  numberOfWells: number,
  targetPoints: Point[],
  entryDirections: Point[],
  kickoffPoints: KickoffPoint[],
  doglegPoints: DoglegPoint[],
  computeState: ComputeState
) {
  const wellIndices = computeState.clusterSizes.map((item) => item.size);
  
  return {
    "FIELDOPT INPUT BLOCK": {
      "n": {
        "DESCRIPTION": "number of wells",
        "UNIT": "",
        "VALUE": numberOfWells
      },
      "WellNo": {
        "DESCRIPTION": "well index",
        "UNIT": "",
        "VALUE": wellIndices
      },
      "PCM": {
        "DESCRIPTION": "target location, i.e., the 1st point of completion interval. 3D, [EAST,NORTH,Depth]",
        "UNIT": "m",
        "VALUE": targetPoints.map(point => [
          parseFloat(point.x) || 0,
          parseFloat(point.y) || 0,
          parseFloat(point.z) || 0
        ])
      },
      "VCM": {
        "DESCRIPTION": "driling direction at the target, 3D, [EAST,NORTH,Depth]",
        "UNIT": "m",
        "VALUE": entryDirections.map(dir => [
          parseFloat(dir.x) || 0,
          parseFloat(dir.y) || 0,
          parseFloat(dir.z) || 0
        ])
      },
      "PKzM": {
        "DESCRIPTION": "kickoff depth, [Depth]",
        "UNIT": "m",
        "VALUE": kickoffPoints.map(point => [point.p1z])
      },
      "MD_intervalM": {
        "DESCRIPTION": "measured depth interval in output data of well trajectory",
        "UNIT": "m",
        "VALUE": [
          [
            30.0
          ],
          [
            100.0
          ],
          [NaN
          ],
          [NaN
          ]
        ]
      },
      "VKM": {
        "DESCRIPTION": "driling direction at the KOP, 3D, [EAST,NORTH,Depth]",
        "UNIT": "m",
        "VALUE": kickoffPoints.map(point => [point.v1x, point.v1y, point.v1z])
      },
      "DLSM": {
        "DESCRIPTION": "dogleg severity, [Depth]",
        "UNIT": "deg/30m",
        "VALUE": doglegPoints.map(point => [point.dogleg])
      },
      "rM": {
        "DESCRIPTION": "turning radius",
        "UNIT": "m",
        "VALUE": doglegPoints.map(point => [point.radius])
      },
      "XRange": {
        "DESCRIPTION": "X(East) range for computing",
        "UNIT": "m",
        "VALUE": computeState.ranges.x.mode === 'Manual'
          ? JSON.parse(computeState.ranges.x.value || '[0, 0]')
          : "Auto"
      },
      "YRange": {
        "DESCRIPTION": "Y(North) range for computing",
        "UNIT": "m",
        "VALUE": computeState.ranges.y.mode === 'Manual'
          ? JSON.parse(computeState.ranges.y.value || '[0, 0]')
          : "Auto"
      },
      "resolution": {
        "DESCRIPTION": "resolution for computing nodes",
        "UNIT": "m",
        "VALUE": computeState.ranges.resolution.mode === 'Manual'
          ? parseFloat(computeState.ranges.resolution.value) || 0.0
          : "Auto"
      },
      "cst_radiusM": {
        "DESCRIPTION": "radius for computing cost contour",
        "UNIT": "m",
        "VALUE":
          computeState.ranges.radius.mode === 'Manual'
            ? JSON.parse(computeState.ranges.radius.value) || 0.0
            : "Auto"
      },
      "PKM": {
        "DESCRIPTION": "kickoff point, [East, North, Depth]",
        "UNIT": "m",
        "VALUE": kickoffPoints.map(point => [NaN, NaN, point.p1z])
      },
      "necon": {
        "DESCRIPTION": "non-equal constraints",
        "UNIT": "",
        "VALUE": null
      },
      "lay_con": {
        "DESCRIPTION": "formation constraints in special layer(s)",
        "UNIT": "",
        "VALUE": null
      },
      "cst_Site": {
        "DESCRIPTION": "drill site preparation cost",
        "UNIT": "",
        "VALUE": computeState.sitePreparationCost
      },
      "slot": {
        "DESCRIPTION": "available slot numbers in one cluster",
        "UNIT": "",
        "VALUE": computeState.clusterSizes.map(item => item.size)
      },
      "cst_WH": {
        "DESCRIPTION": "cost of subsea wellhead equipment of different slots, corresponding with slot",
        "UNIT": "",
        "VALUE": computeState.clusterSizes.map(item => item.cost)
      },
      "cluster_min": {
        "DESCRIPTION": "minimum number of clusters(drill sites)",
        "UNIT": "",
        "VALUE": computeState.cluster_min
      },
      "cluster_max": {
        "DESCRIPTION": "maximum number of clusters(drill sites)",
        "UNIT": "",
        "VALUE": computeState.cluster_max
      }
    }
  }
}

export async function sendComputeRequest(requestData: any) {
  // try {
  //   const response = await axios.post('/api/compute', requestData)
  //   return response.data
  // } catch (error) {
  //   console.error('Error:', error)
  //   throw error
  // }
  alert(JSON.stringify(requestData));
}
