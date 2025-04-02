"use server";

import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export async function generateCareerPDF(answers) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const prompt = `
    Based on the following personality and career preferences, provide three career paths (professional, entrepreneurial, and alternative) with detailed information.
    
    Work Preference: ${answers.work_preference}
    Task Preference: ${answers.task_preference}
    Learning Style: ${answers.learning_style}
    Social Interaction: ${answers.social_interaction}
    Job Motivation: ${answers.job_motivation}
    Risk Preference: ${answers.risk_preference}
    Pressure Handling: ${answers.pressure_handling}
    Work Environment: ${answers.work_environment}

    Format the response as follows:

    <div class="career-guide">
      <h1>Your Personalized Career Guide</h1>
      
      <div class="career-path">
        <h2>Professional Career Path</h2>
        <p>Detailed description of the professional career path that matches your preferences.</p>
        <h3>Required Skills</h3>
        <ul>
          <li>Skill 1 with brief explanation</li>
          <li>Skill 2 with brief explanation</li>
          <li>Skill 3 with brief explanation</li>
        </ul>
        <h3>Free Online Courses</h3>
        <ul>
          <li>Course 1: [Course Name] - Platform (URL if available)</li>
          <li>Course 2: [Course Name] - Platform (URL if available)</li>
        </ul>
        <h3>Internship Opportunities</h3>
        <ul>
          <li>Type of internship 1 and where to find it</li>
          <li>Type of internship 2 and where to find it</li>
        </ul>
      </div>

      <div class="career-path">
        <h2>Entrepreneurial Path</h2>
        [Follow same structure as above]
      </div>

      <div class="career-path">
        <h2>Alternative Career Path</h2>
        [Follow same structure as above]
      </div>
    </div>
  `;

  try {
    console.log("Generating career guide with answers:", answers);
    const result = await model.generateContent(prompt);
    const htmlContent = result.response.text();
    console.log("Generated HTML content:", htmlContent);

    // Validate content
    if (!htmlContent || htmlContent.trim().length === 0) {
      throw new Error("Empty response from AI");
    }

    if (!htmlContent.includes('<div class="career-guide">')) {
      // Try to format unstructured content
      const formattedContent = `
        <div class="career-guide">
          <h1>Your Personalized Career Guide</h1>
          <div class="career-path">
            ${htmlContent.replace(/\n/g, '<br>')}
          </div>
        </div>
      `;
      return { success: true, htmlContent: formattedContent };
    }

    return { success: true, htmlContent };
  } catch (error) {
    console.error("Career guide generation error:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      answers: answers
    });
    throw new Error(`Failed to generate career guide: ${error.message}`);
  }
}