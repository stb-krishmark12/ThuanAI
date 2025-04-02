"use server";

import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export async function generateCareerPDF(answers) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Simplified prompt with less HTML complexity
  const prompt = `
    Based on the following personality and career preferences, give three different career paths one related to professional, one entrepreneurial career path. Provide a detailed career roadmap for each career path with free courses and internships.
    
    Work Preference: ${answers.work_preference}
    Task Preference: ${answers.task_preference}
    Learning Style: ${answers.learning_style}
    Social Interaction: ${answers.social_interaction}
    Job Motivation: ${answers.job_motivation}
    Risk Preference: ${answers.risk_preference}
    Pressure Handling: ${answers.pressure_handling}
    Work Environment: ${answers.work_environment}

    Please provide the response in a simple HTML format with minimal styling:

    <div class="career-guide">
      <h1>Your Personalized Career Guide</h1>
      
      <div class="career-path">
        <h2>Career Path 1</h2>
        <p>[Career description]</p>
        <h3>Required Skills</h3>
        <ul>[Skills list]</ul>
        <h3>Recommended Courses</h3>
        <ul>[Course list]</ul>
        <h3>Internship Opportunities</h3>
        <ul>[Internship list]</ul>
      </div>

      <div class="career-path">
        <h2>Career Path 2</h2>
        [Similar structure as above]
      </div>

      <div class="career-path">
        <h2>Career Path 3</h2>
        [Similar structure as above]
      </div>
    </div>
  `;

  try {
    const result = await model.generateContent(prompt);
    const htmlContent = result.response.text();

    // Basic HTML validation
    if (!htmlContent.includes('<div class="career-guide">')) {
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