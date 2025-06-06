import { Request, Response } from 'express';

import { OpenAI } from 'openai';
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function generateReportSection(topic: string, dataPoints: string[]): Promise<string | null> {
  const systemPrompt = `
    You are a top-tier sustainability reporting expert specialized in the CSRD (Corporate Sustainability Reporting Directive) and ESRS (European Sustainability Reporting Standards).

    Your job is to receive a sustainability report topic and a list of structured data points (facts, figures, or qualitative insights), and write a concise, legally compliant, and insightful paragraph or section suitable for a CSRD sustainability report.

    Follow these rules:
    - Prioritize clarity, materiality, and strategic relevance.
    - Follow the structure and tone of professional sustainability reports.
    - Use simple, accessible language without diluting technical accuracy.
    - Cite or align your writing with VSME standards if appropriate.
    - Do not invent facts. Only write based on the input data.

    If the input is too vague or insufficient to write a proper section, don't write anything but make sure it makes sense as the continuation of the following phrase:
    " ...has implemented a range of practices:". Only give back the continuation of this phrase, not the full sentence.
    `;

  const userPrompt = `
    Write a sustainability report section on the topic: "${topic}".

    Use the following data points:
        ${dataPoints.map((point: string, i: number) => `- ${point}`).join('\n')}
        `;

  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.7,
  });

  return completion.choices[0].message.content;
}

const buildAiResponseController = async (request: Request, response: Response) => {
  const { topic, dataPoints } = request.body;

  if (!topic || !dataPoints || !Array.isArray(dataPoints) /* || dataPoints.length === 0 */) {
    response.status(400).json({
      success: false,
      message: 'Invalid input. Please provide a topic and a list of data points.',
    });
  }

  generateReportSection(topic, dataPoints)
    .then((section) => {
      response.status(200).json({
        success: true,
        section,
      });
    })
    .catch((error) => {
      console.error('Error generating report section:', error);
      response.status(500).json({
        success: false,
        message: 'Failed to generate report section. Please try again later.',
      });
    });
};

export default {
  buildAiResponse: buildAiResponseController,
};
