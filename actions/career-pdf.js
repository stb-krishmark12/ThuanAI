"use server";

import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export async function generateCareerPDF(answers) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  try {
    const prompt = `
      Based on the following personality and career preferences, create a detailed career guide.
      
      Work Preference: ${answers.work_preference}
      Task Preference: ${answers.task_preference}
      Learning Style: ${answers.learning_style}
      Social Interaction: ${answers.social_interaction}
      Job Motivation: ${answers.job_motivation}
      Risk Preference: ${answers.risk_preference}
      Pressure Handling: ${answers.pressure_handling}
      Work Environment: ${answers.work_environment}

      Provide the response as a complete HTML document with embedded styles. Use this exact structure:

      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #2980b9, #2c3e50);
            color: white;
            padding: 30px;
            text-align: center;
            border
    `;

    const result = await model.generateContent(prompt);
    const htmlContent = result.response.text();

    // Validate HTML content
    if (!htmlContent.includes('<html>') || !htmlContent.includes('</html>')) {
      throw new Error("Invalid HTML response from AI");
    }

    return { 
      success: true,
      htmlContent
    };
  } catch (error) {
    console.error("Career guide generation error:", error);
    throw new Error("Failed to generate career guide");
  }
}