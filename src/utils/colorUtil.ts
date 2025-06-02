// 定义颜色类型
type Color = string;
// 定义 RGB 对象类型
interface RGB {
  r: number;
  g: number;
  b: number;
}

// 计算两个颜色之间的插值
function interpolateColor(startColor: Color, endColor: Color, factor: number): Color {
  // 将颜色从十六进制转换为 RGB
  const startRGB: RGB | null = hexToRgb(startColor);
  const endRGB: RGB | null = hexToRgb(endColor);
  
  if (!startRGB || !endRGB) {
    throw new Error('Invalid color format');
  }
  
  // 计算插值后的 RGB 值
  const interpolatedR: number = Math.round(startRGB.r + factor * (endRGB.r - startRGB.r));
  const interpolatedG: number = Math.round(startRGB.g + factor * (endRGB.g - startRGB.g));
  const interpolatedB: number = Math.round(startRGB.b + factor * (endRGB.b - startRGB.b));
  
  // 将 RGB 转换回十六进制
  return rgbToHex(interpolatedR, interpolatedG, interpolatedB);
}

// 十六进制转 RGB
function hexToRgb(hex: Color): RGB | null {
  const result: RegExpExecArray | null = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

// RGB 转十六进制
function rgbToHex(r: number, g: number, b: number): Color {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

// 计算渐变颜色
export function calculateGradientColor(value: number, min: number, max: number, colors: Color[]): Color {
  if  (colors.length < 2) {
    throw new Error('At least two colors are required');
  }
  if (value < min || value > max) {
    throw new Error('Value is out of range');
  }
  // 将值映射到 0 到 1 的范围
  let normalizedValue: number = (value - min) / (max - min);
  normalizedValue = Math.max(0, Math.min(1, normalizedValue));
  
  // 计算颜色区间索引
  const index: number = Math.floor(normalizedValue * (colors.length - 1));
  
  // 获取相邻的两个颜色
  const startColor: Color = colors[index];
  const endColor: Color = index === colors.length - 1 ? startColor :colors[index + 1];
  
  // 计算插值因子
  const factor: number = (normalizedValue * (colors.length - 1)) % 1;
  
  // 插值计算颜色
  return interpolateColor(startColor, endColor, factor);
}
