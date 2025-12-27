
export enum GarbageCategory {
  RECYCLABLE = '可回收物',
  KITCHEN = '厨余垃圾',
  HARMFUL = '有害垃圾',
  OTHER = '其他垃圾'
}

export interface BoundingBox {
  ymin: number;
  xmin: number;
  ymax: number;
  xmax: number;
}

export interface DetectionResult {
  name: string;
  category: GarbageCategory;
  confidence: number;
  box: BoundingBox;
}

export interface ClassificationResponse {
  results: DetectionResult[];
}
