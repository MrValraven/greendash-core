import { Request, Response } from 'express';

import { OpenAI } from 'openai';
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function generateReportSection(
  reportChapterName: string,
  userInput: string,
): Promise<string | null> {
  const systemPrompt = `You are a sustainability reporting consultant that is developing a sustainability report under VSME from CSRD.`;

  const userPrompt = `Write a short text to include under the ${reportChapterName}, about ${userInput}. Please be succinct and concise, and use a professional tone. The text should be suitable for a sustainability report. Do not invent any made up data, just use the information provided in a language suitable for a report. Do not come up with any titles.`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4.1-nano',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.7,
  });

  return completion.choices[0].message.content;
}

const buildAiResponseController = async (request: Request, response: Response) => {
  const { reportChapterName, userInput } = request.body;

  if (!reportChapterName || !userInput) {
    response.status(400).json({
      success: false,
      message: 'Invalid input. Please provide a chapterName and some user input.',
    });
  }

  generateReportSection(reportChapterName, userInput)
    .then((section) => {
      response.status(200).json({
        success: true,
        section: section,
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
