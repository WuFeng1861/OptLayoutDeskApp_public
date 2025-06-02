export type CostContourData = {
  'cost contour': {
    X: number[];
    Y: number[];
    cost: (number | null)[];
  };
};

export type CurvesData = {
  'CURVES' : {
    "MD": number[],
    "EAST": number[],
    "NORTH" : number[],
    "TVD": number[],
    "INCL": number[],
    "AZ": number[]
  }
}

type surfaceData = [number, number, 0, number | '-'];

type line3dData = [number, number, number];

type ContourToList = { x: number, y: number, value: number }[];

const formatDataToList = (data: CostContourData): ContourToList => {
  let result = [];
  for (let i = 0; i < data["cost contour"].X.length; i++) {
    result.push({
      x: data['cost contour'].X[i],
      y: data['cost contour'].Y[i],
      value: data['cost contour'].cost[i]
    });
  }
  return result;
};

// 处理花费云图数据
export const formatData_contour = (data: CostContourData[]): {
  data: surfaceData[],
  z: (number | '-')[][],
  minCost: number,
  maxCost: number,
  minX: number,
  maxX: number,
  minY: number,
  maxY: number,
} => {
  if  (!data || data.length === 0) {
    return {
      data: [],
      z: [],
      minCost: 0,
      maxCost: 0,
      minX: 0,
      maxX: 0,
      minY: 0,
      maxY: 0,
    };
  }
  const result: surfaceData[] = [];
  const z: (number | '-')[][] = [];
  // 从小到大
  let XList = [...new Set(data[0]['cost contour'].X)].sort((a, b) => a - b);
  let YList = [...new Set(data[0]['cost contour'].Y)].sort((a, b) => a - b);
  let minCost = Infinity;
  let maxCost = -Infinity;
  let minX = 0;
  let maxX = XList[XList.length - 1];
  let minY = 0;
  let maxY = YList[YList.length - 1];
  let rows = YList.length;
  let cols = XList.length;
  let xInterval = XList[1] - XList[0];
  let yInterval = YList[1] - YList[0];
  // 初始化z矩阵
  for (let i = 0; i < rows; i++) {
    z.push([]);
    for (let j = 0; j < cols; j++) {
      z[i].push('-');
    }
  }
  console.log(z, 1);
  
  // 遍历data，将数据填充到z矩阵和热力图中
  let resultPointsMap = new Map<string, number | '-'>();
  data.forEach((item) => {
    let dataList = formatDataToList(item);
    // 遍历数据列表，将数据填充到z矩阵
    dataList.forEach((point) => {
      let xIndex = Math.floor(point.x / xInterval);
      let yIndex = Math.floor(point.y / yInterval);
      if (point.value !== null) {
        // 确保索引在有效范围内，后面的数据什么时候覆盖前面的 在后面有数据的时候
        if (xIndex >= 0 && yIndex >= 0 && xIndex < cols && yIndex < rows) {
          z[yIndex][xIndex] = point.value;
        }
      }
    });
    
    // 生成热力图数据
    z.forEach((row, rowIndex) => {
      row.forEach((value, colIndex) => {
        if (!resultPointsMap.has(`${colIndex * yInterval}-${rowIndex * xInterval}`)) {
          resultPointsMap.set(`${colIndex * yInterval}-${rowIndex * xInterval}`, '-');
        }
        if (value !== '-') {
          minCost = Math.min(minCost, value);
          maxCost = Math.max(maxCost, value);
          resultPointsMap.set(`${colIndex * yInterval}-${rowIndex * xInterval}`, value);
        }
      });
    });
  });
  console.log(resultPointsMap);
  // 遍历resultPointsMap，将数据添加到result中
  resultPointsMap.forEach((value, key) => {
    result.push(<[number, number, 0, number | '-']>[...key.split('-').map(Number), 0, value]);
  });
  console.log('-----------------formatData_contour--------------------');
  console.log(result);
  console.log(z);
  console.log(minCost, maxCost, minX, maxX, minY, maxY);
  console.log('-----------------formatData_contour_end--------------------');
  return {data: result, z, minCost, maxCost, minX, maxX, minY, maxY};
};


// 处理曲线数据
export const formatData_curves = (data: CurvesData[]): {
  data: line3dData[][],
  maxZ:number,
  minZ: number
} => {
  if (!data || data.length === 0) {
    return {
      data: [],
      maxZ: 0,
      minZ: 0
    };
  }
  const result: line3dData[][] = [];
  let maxZ = -Infinity;
  let minZ = Infinity;
  data.forEach((item) => {
    const itemResult: line3dData[] = [];
    result.push(itemResult);
    let keys = Object.keys(item['CURVES'].EAST);
    for (let index = 0; index < keys.length; index++) {
      maxZ = Math.max(maxZ, item.CURVES.TVD[index]);
      minZ = Math.min(minZ, item.CURVES.TVD[index]);
      itemResult.push([item.CURVES.EAST[index], item.CURVES.NORTH[index], item.CURVES.TVD[index]])
    }
  });
  console.log('-----------------formatData_curves--------------------');
  console.log(result);
  console.log(maxZ, minZ);
  console.log('-----------------formatData_curves_end--------------------');
  return {
    data: result,
    maxZ,
    minZ
  };
};
