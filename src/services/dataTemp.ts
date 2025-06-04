import {ref} from 'vue';
import {CostContourData, CurvesData} from '../utils/calcData';
import {ContourData1} from './testData/ContourData-1';
import {ContourData2} from './testData/ContourData-2';
import {ContourData3} from './testData/ContourData-3';
import {ContourData4} from './testData/ContourData-4';
import {ContourData5} from './testData/ContourData-5';
import {ContourData6} from './testData/ContourData-6';
import {ContourData7} from './testData/ContourData-7';
import {ContourData8} from './testData/ContourData-8';
import {ContourData9} from './testData/ContourData-9';
import {ContourData10} from './testData/ContourData-10';
import {ContourData11} from './testData/ContourData-11';
import {ContourData12} from './testData/ContourData-12';
import {ContourData13} from './testData/ContourData-13';
import {ContourData14} from './testData/ContourData-14';
import {ContourData15} from './testData/ContourData-15';
import {ContourData16} from './testData/ContourData-16';
import {ContourData17} from './testData/ContourData-17';
import {ContourData18} from './testData/ContourData-18';
import {ContourData19} from './testData/ContourData-19';
import {ContourData20} from './testData/ContourData-20';
import {ContourData21} from './testData/ContourData-21';
import {ContourData22} from './testData/ContourData-22';
import {ContourData23} from './testData/ContourData-23';
import {ContourData24} from './testData/ContourData-24';
import {ContourData25} from './testData/ContourData-25';
import {ContourData26} from './testData/ContourData-26';
import {ContourData27} from './testData/ContourData-27';
import {ContourData28} from './testData/ContourData-28';
import {ContourData29} from './testData/ContourData-29';
import {ContourData30} from './testData/ContourData-30';
import {lineData1} from './testData/lineData-1';
import {lineData2} from './testData/lineData-2';
import {lineData3} from './testData/lineData-3';
import {lineData4} from './testData/lineData-4';
import {lineData5} from './testData/lineData-5';
import {lineData6} from './testData/lineData-6';
import {lineData7} from './testData/lineData-7';
import {lineData8} from './testData/lineData-8';
import {lineData9} from './testData/lineData-9';
import {lineData10} from './testData/lineData-10';
import {lineData11} from './testData/lineData-11';
import {lineData12} from './testData/lineData-12';
import {lineData13} from './testData/lineData-13';
import {lineData14} from './testData/lineData-14';
import {lineData15} from './testData/lineData-15';
import {lineData16} from './testData/lineData-16';
import {lineData17} from './testData/lineData-17';
import {lineData18} from './testData/lineData-18';
import {lineData19} from './testData/lineData-19';
import {lineData20} from './testData/lineData-20';
import {lineData21} from './testData/lineData-21';
import {lineData22} from './testData/lineData-22';
import {lineData23} from './testData/lineData-23';
import {lineData24} from './testData/lineData-24';
import {lineData25} from './testData/lineData-25';
import {lineData26} from './testData/lineData-26';
import {lineData27} from './testData/lineData-27';
import {lineData28} from './testData/lineData-28';
import {lineData29} from './testData/lineData-29';
import {lineData30} from './testData/lineData-30';

let wellNum = 30;
let siteNum = 0;
let SiteData: number[][] = [];

const ContourDataObj: { [key: string]: CostContourData } = {
  '0': ContourData1,
  '1': ContourData2,
  '2': ContourData3,
  '3': ContourData4,
  '4': ContourData5,
  '5': ContourData6,
  '6': ContourData7,
  '7': ContourData8,
  '8': ContourData9,
  '9': ContourData10,
  '10': ContourData11,
  '11': ContourData12,
  '12': ContourData13,
  '13': ContourData14,
  '14': ContourData15,
  '15': ContourData16,
  '16': ContourData17,
  '17': ContourData18,
  '18': ContourData19,
  '19': ContourData20,
  '20': ContourData21,
  '21': ContourData22,
  '22': ContourData23,
  '23': ContourData24,
  '24': ContourData25,
  '25': ContourData26,
  '26': ContourData27,
  '27': ContourData28,
  '28': ContourData29,
  '29': ContourData30
};
const CurvesDataObj: { [key: string]: CurvesData } = {
  '0': lineData1,
  '1': lineData2,
  '2': lineData3,
  '3': lineData4,
  '4': lineData5,
  '5': lineData6,
  '6': lineData7,
  '7': lineData8,
  '8': lineData9,
  '9': lineData10,
  '10': lineData11,
  '11': lineData12,
  '12': lineData13,
  '13': lineData14,
  '14': lineData15,
  '15': lineData16,
  '16': lineData17,
  '17': lineData18,
  '18': lineData19,
  '19': lineData20,
  '20': lineData21,
  '21': lineData22,
  '22': lineData23,
  '23': lineData24,
  '24': lineData25,
  '25': lineData26,
  '26': lineData27,
  '27': lineData28,
  '28': lineData29,
  '29': lineData30
};

const ContourIndexListRef = ref<{ [key: number]: boolean }>({});
const CurvesIndexListRef = ref<{ [key: number]: boolean }>({});


for (let i = 0; i < 30; i++) {
  ContourIndexListRef.value[i] = true;
  CurvesIndexListRef.value[i] = true;
}

export const getWellNum = () => {
  return wellNum;
};

export const getSiteNum = () => {
  return siteNum;
};

export const getContourShowData = () => {
  // 遍历ContourIndexList返回新的数组
  let result: CostContourData[] = [];
  let keys = Object.keys(ContourIndexListRef.value);
  for (let i = 0; i < keys.length; i++) {
    let key = keys[i];
    if (ContourIndexListRef.value[key]) {
      result.push(ContourDataObj[key]);
    }
  }
  return result;
};

export const getCurvesShowData = () => {
  // 遍历CurvesIndexList返回新的数组
  let result: CurvesData[] = [];
  let keys = Object.keys(CurvesIndexListRef.value);
  for (let i = 0; i < keys.length; i++) {
    let key = keys[i];
    if (CurvesIndexListRef.value[key]) {
      result.push(CurvesDataObj[key]);
    }
  }
  return result;
};

export const getContourIndexListRef = () => {
  return ContourIndexListRef;
};

export const getCurvesIndexListRef = () => {
  return CurvesIndexListRef;
};

export const getSiteData = () => {
  if (SiteData.length > 0) {
    return SiteData;
  }
  let result = [];
  let resultObj = {};
  let keys = Object.keys(CurvesIndexListRef.value);
  for (let i = 0; i < keys.length; i++) {
    let key = Number(keys[i]);
    let x = Number(CurvesDataObj[key]['CURVES']['EAST'][0]);
    let y = Number(CurvesDataObj[key]['CURVES']['NORTH'][0]);
    if (!resultObj[`${x}-${y}`]) {
      resultObj[`${x}-${y}`] = [key];
    } else {
      resultObj[`${x}-${y}`].push(key);
    }
  }
  // 遍历 resultObj
  for (let key in resultObj) {
    result.push(resultObj[key]);
  }
  SiteData = result;
  siteNum = result.length;
  return result;
};

export const changeContourShow = (index: number, isDelete: boolean) => {
  ContourIndexListRef.value[index] = !isDelete;
};

export const changeCurvesShow = (index: number, isDelete: boolean) => {
  CurvesIndexListRef.value[index] = !isDelete;
};

export const changeWellShow = (index: number, isDelete: boolean) => {
  changeContourShow(index, isDelete);
  changeCurvesShow(index, isDelete);
};

export const changeAllDataShow = (isDelete: boolean) => {
  for (let i = 0; i < wellNum; i++) {
    changeContourShow(i, isDelete);
    changeCurvesShow(i, isDelete);
  }
}

export const changeAllCurvesShow = (isDelete: boolean) => {
  for (let i = 0; i < wellNum; i++) {
    changeCurvesShow(i, isDelete);
  }
};

export const changeAllContourShow = (isDelete: boolean) => {
  for (let i = 0; i < wellNum; i++) {
    changeContourShow(i, isDelete);
  }
};

export const changeSiteContourShow = (index: number, isDelete: boolean) => {
  let siteIndex = SiteData[index];
  for (let i = 0; i < siteIndex.length; i++) {
    changeContourShow(siteIndex[i], isDelete);
  }
};

export const changeSiteCurvesShow = (index: number, isDelete: boolean) => {
  let siteIndex = SiteData[index];
  for (let i = 0; i < siteIndex.length; i++) {
    changeCurvesShow(siteIndex[i], isDelete);
  }
};

export const changeSiteShow = (index: number, isDelete: boolean) => {
  changeSiteContourShow(index, isDelete);
  changeSiteCurvesShow(index, isDelete);
};


// init all data 初始化所有数据
getSiteData()

