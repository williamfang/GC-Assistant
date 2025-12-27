
import { GarbageCategory } from './types';

export const CATEGORY_COLORS: Record<GarbageCategory, string> = {
  [GarbageCategory.RECYCLABLE]: '#2563eb', // Blue
  [GarbageCategory.KITCHEN]: '#16a34a',    // Green
  [GarbageCategory.HARMFUL]: '#dc2626',    // Red
  [GarbageCategory.OTHER]: '#4b5563',      // Gray
};

export const CATEGORY_BG: Record<GarbageCategory, string> = {
  [GarbageCategory.RECYCLABLE]: 'bg-blue-600',
  [GarbageCategory.KITCHEN]: 'bg-green-600',
  [GarbageCategory.HARMFUL]: 'bg-red-600',
  [GarbageCategory.OTHER]: 'bg-gray-600',
};

export const CATEGORY_BORDER: Record<GarbageCategory, string> = {
  [GarbageCategory.RECYCLABLE]: 'border-blue-500',
  [GarbageCategory.KITCHEN]: 'border-green-500',
  [GarbageCategory.HARMFUL]: 'border-red-500',
  [GarbageCategory.OTHER]: 'border-gray-500',
};

export const CATEGORY_DESCRIPTION: Record<GarbageCategory, string> = {
  [GarbageCategory.RECYCLABLE]: '报纸、塑料瓶、易拉罐等',
  [GarbageCategory.KITCHEN]: '剩菜剩饭、果皮、花卉等',
  [GarbageCategory.HARMFUL]: '电池、药品、油漆桶等',
  [GarbageCategory.OTHER]: '尘土、烟头、陶瓷碎块等',
};
