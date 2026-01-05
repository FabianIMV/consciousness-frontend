import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: NextRequest) {
    try {
        const { text, targetLang } = await req.json();

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 });
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `
      Translate the following HTML content accurately from English to ${targetLang === 'es' ? 'Spanish' : 'English'}.
      
      CRITICAL RULES:
      1. MAINTAIN ALL HTML TAGS, ATTRIBUTES, and STRUCTURE.
      2. ONLY translate the visible text content.
      3. DO NOT translate technical terms, product names, or code if present.
      4. Ensure the tone is scientific, professional, and sophisticated.
      5. Return ONLY the translated HTML, no explanations.

      CONTENT:
      ${text}
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const translatedHtml = response.text();

        return NextResponse.json({ translatedText: translatedHtml });
    } catch (error: any) {
        console.error('Translation error:', error);
        return NextResponse.json({ error: 'Translation failed', details: error.message }, { status: 500 });
    }
}
