
import React from 'react';
import { DetectionResult } from '../types';
import { CATEGORY_COLORS } from '../constants';

interface ResultOverlayProps {
  results: DetectionResult[];
  imageDimensions: { width: number; height: number };
}

export const ResultOverlay: React.FC<ResultOverlayProps> = ({ results, imageDimensions }) => {
  if (!results.length) return null;

  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden rounded-2xl">
      {results.map((result, index) => {
        const { box, category, name } = result;
        const color = CATEGORY_COLORS[category];

        // 兼容处理：如果是像素坐标，转为百分比
        const isNormalized = box.ymax <= 1000 && box.xmax <= 1000 && box.ymin >= 0;
        
        let top, left, width, height;
        
        if (isNormalized) {
          top = (box.ymin / 1000) * 100;
          left = (box.xmin / 1000) * 100;
          width = ((box.xmax - box.xmin) / 1000) * 100;
          height = ((box.ymax - box.ymin) / 1000) * 100;
        } else {
          // 基于像素尺寸转换
          top = (box.ymin / imageDimensions.height) * 100;
          left = (box.xmin / imageDimensions.width) * 100;
          width = ((box.xmax - box.xmin) / imageDimensions.width) * 100;
          height = ((box.ymax - box.ymin) / imageDimensions.height) * 100;
        }

        return (
          <div
            key={index}
            style={{
              position: 'absolute',
              top: `${top}%`,
              left: `${left}%`,
              width: `${width}%`,
              height: `${height}%`,
              border: `6px solid ${color}`,
              boxSizing: 'border-box',
            }}
            className="rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.5)]"
          >
            <div
              className="absolute top-0 left-0 transform -translate-y-full text-white px-4 py-1 text-xl font-black rounded-t-lg whitespace-nowrap shadow-md"
              style={{ backgroundColor: color }}
            >
              {name}
            </div>
          </div>
        );
      })}
    </div>
  );
};
