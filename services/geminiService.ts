
import { GoogleGenAI, Type } from "@google/genai";
import { ClassificationResponse, GarbageCategory } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const classifyGarbage = async (base64Image: string): Promise<ClassificationResponse> => {
  const model = 'gemini-3-flash-preview';

  const systemInstruction = `
    你是一个针对中国垃圾分类标准的专业AI助手。
    你的任务是识别图像中的物品，并根据以下标准进行分类：
    1. 可回收物：报纸、书刊、纸板箱、塑料瓶、易拉罐、玻璃瓶、旧衣物等。
    2. 厨余垃圾：剩菜剩饭、果皮、花卉、菜叶等易腐烂垃圾。
    3. 有害垃圾：废电池、废药品、废灯管、油漆桶等。
    4. 其他垃圾：烟头、尘土、陶瓷碎块、受污染的纸张、一次性用品等。

    请特别注意识别结果必须使用准确的中文名称，并返回物品在图中的坐标 [ymin, xmin, ymax, xmax] (0-1000)。
  `;

  const response = await ai.models.generateContent({
    model: model,
    contents: [
      {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image,
            },
          },
          {
            text: "请识别这张图里的垃圾，按JSON格式返回。返回格式必须符合指定的Schema。只要返回最主要的一个或两个物品。",
          }
        ],
      },
    ],
    config: {
      systemInstruction: systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          results: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING, description: "物品的详细中文名称" },
                category: { 
                  type: Type.STRING, 
                  enum: [
                    GarbageCategory.RECYCLABLE, 
                    GarbageCategory.KITCHEN, 
                    GarbageCategory.HARMFUL, 
                    GarbageCategory.OTHER
                  ] 
                },
                confidence: { type: Type.NUMBER },
                box: {
                  type: Type.OBJECT,
                  properties: {
                    ymin: { type: Type.NUMBER },
                    xmin: { type: Type.NUMBER },
                    ymax: { type: Type.NUMBER },
                    xmax: { type: Type.NUMBER },
                  },
                  required: ["ymin", "xmin", "ymax", "xmax"]
                }
              },
              required: ["name", "category", "box"]
            }
          }
        },
        required: ["results"]
      }
    },
  });

  try {
    const text = response.text;
    return JSON.parse(text) as ClassificationResponse;
  } catch (error) {
    console.error("Failed to parse Gemini response:", error);
    return { results: [] };
  }
};
