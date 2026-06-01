import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  console.log('API KEY:', process.env.GEMINI_API_KEY);
  try {
    const { base64, mediaType } = await request.json();

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  inline_data: {
                    mime_type: mediaType,
                    data: base64,
                  },
                },
                {
                  text: `This is a handwritten enquiry/lead form. Extract all fields and return ONLY a valid JSON object with these exact keys (use "" if not found):
{
  "eqName": "",
  "contact": "",
  "email": "",
  "city": "",
  "state": "",
  "address": "",
  "software": "",
  "admissionStatus": "",
  "fee": "",
  "preDemoDate": "",
  "demoDate": ""
}

Rules:
- contact: digits only
- fee: digits only
- preDemoDate and demoDate: convert to YYYY-MM-DD format (23/05/2026 becomes 2026-05-23)
- software: map to one of exactly: Python, Java, C++, ML, Data Science
- admissionStatus: "Admitted" or "Not Admitted" or ""
- Return ONLY raw JSON, no markdown, no backticks, no explanation`,
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await response.json();
    console.log('Gemini full response:', JSON.stringify(data, null, 2));

    // Handle Gemini API errors explicitly
    if (data.error) {
      return NextResponse.json(
        { success: false, message: data.error.message },
        { status: data.error.code || 500 }
      );
    }

    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    console.log('Gemini raw text:', rawText);

    if (!rawText) {
      return NextResponse.json(
        { success: false, message: 'No text returned from Gemini' },
        { status: 500 }
      );
    }

    const clean = rawText.replace(/```json|```/g, '').trim();
    const extracted = JSON.parse(clean);

    return NextResponse.json({ success: true, data: extracted });

  } catch (error: any) {
    console.error('OCR API error:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}