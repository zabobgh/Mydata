
import { GoogleGenAI } from "@google/genai";
import { Drug, Transaction } from '../types';

// IMPORTANT: This assumes the API_KEY is set in the execution environment as per the coding guidelines.
const ai = new GoogleGenAI({apiKey: process.env.API_KEY});

export const generateStockAnalysis = async (drugs: Drug[]): Promise<string> => {
    if (!process.env.API_KEY) {
        return "API Key is not configured. Please set the API_KEY environment variable.";
    }

    const prompt = `
        คุณคือผู้ช่วย AI สำหรับวิเคราะห์คลังยาของ รพ.สต.บ้านกาหลง
        โปรดวิเคราะห์ข้อมูลยาในสต็อกต่อไปนี้และสรุปสถานการณ์ปัจจุบัน โดยเน้นที่:
        1.  ภาพรวมของสต็อก
        2.  รายการยาที่ใกล้หมด (เหลือน้อยกว่า 20 หน่วย)
        3.  รายการยาที่ใกล้หมดอายุ (ภายใน 90 วัน)
        4.  รายการยาที่หมดอายุแล้ว
        5.  ข้อเสนอแนะในการจัดการสต็อก (เช่น ควรจัดซื้ออะไรเพิ่ม หรือควรจัดการยาที่หมดอายุอย่างไร)

        ข้อมูลยา:
        ${JSON.stringify(drugs, null, 2)}

        โปรดสร้างรายงานที่เป็นมิตรและเข้าใจง่ายในรูปแบบ Markdown.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-preview-04-17',
            contents: prompt,
        });
        return response.text ?? "AI response was empty.";
    } catch (error) {
        console.error("Error generating stock analysis with Gemini:", error);
        return "เกิดข้อผิดพลาดในการเรียกใช้ AI เพื่อวิเคราะห์ข้อมูล โปรดตรวจสอบ Console และการตั้งค่า API Key";
    }
};


export const getAIChatResponse = async (
    question: string,
    drugs: Drug[],
    transactions: Transaction[]
): Promise<string> => {
     if (!process.env.API_KEY) {
        return "API Key is not configured. Please set the API_KEY environment variable.";
    }

    const systemInstruction = `
        คุณคือ "กาหลง AI" ผู้ช่วยอัจฉริยะสำหรับระบบจัดการคลังยาของ รพ.สต.บ้านกาหลง
        หน้าที่ของคุณคือการตอบคำถามเกี่ยวกับข้อมูลยาในคลัง, ประวัติการทำรายการ, และให้ข้อมูลที่เป็นประโยชน์อื่นๆ
        โดยใช้ข้อมูลที่ได้รับมาเท่านั้น อย่าสร้างข้อมูลขึ้นมาเอง
        ตอบคำถามด้วยภาษาไทยที่เป็นธรรมชาติ สุภาพ และเข้าใจง่าย
    `;
    const contents = `
        นี่คือข้อมูลปัจจุบันสำหรับใช้ในการตอบคำถาม:
        
        ข้อมูลยาทั้งหมดในคลัง (Current Drug Inventory):
        ${JSON.stringify(drugs, null, 2)}

        ประวัติการทำรายการล่าสุด (Recent Transactions):
        ${JSON.stringify(transactions.slice(-50), null, 2)}

        ---
        คำถามจากผู้ใช้: ${question}
        ---
        โปรดตอบคำถามนี้โดยอ้างอิงจากข้อมูลที่ให้มา.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-preview-04-17',
            contents: contents,
            config: {
                systemInstruction: systemInstruction,
            }
        });

        return response.text ?? "AI response was empty.";
    } catch (error) {
        console.error("Error getting AI chat response with Gemini:", error);
        return "ขออภัยค่ะ เกิดข้อผิดพลาดในการเชื่อมต่อกับ AI โปรดตรวจสอบ Console และการตั้งค่า API Key";
    }
};