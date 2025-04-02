"use server";

import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export async function generateCareerPDF(answers) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Modified prompt to request HTML output
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

    Please provide the response in HTML format with proper styling. Use the following template and fill in the content:

    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; }
        .header { background: #2980b9; color: white; padding: 20px; text-align: center; }
        .career-path { margin: 20px; padding: 20px; background: #f8f9fa; border-radius: 8px; }
        .path-title { color: #2980b9; font-size: 24px; margin-bottom: 15px; }
        .description { margin-bottom: 20px; }
        .section { margin: 15px 0; }
        .section-title { color: #2980b9; font-size: 18px; margin-bottom: 10px; }
        .skill-list, .course-list, .internship-list { padding-left: 20px; }
        .course { margin-bottom: 15px; }
        .course-title { color: #2980b9; }
        .internship { margin-bottom: 20px; }
        .roadmap { background: #f8f9fa; padding: 20px; margin: 20px; border-radius: 8px; }
        .timeline { margin: 15px 0; }
        .timeline-title { color: #2980b9; font-size: 20px; }
        ul { list-style-type: circle; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Your Personalized Career Guide</h1>
      </div>
      
      <!-- Career Paths Section -->
      [Insert career paths here with proper HTML structure]
      
      <!-- Learning Roadmap Section -->
      [Insert learning roadmap here with proper HTML structure]
    </body>
    </html>

    Fill in the sections with detailed content about career paths, required skills, courses, internships, and the learning roadmap. Make sure to maintain proper HTML structure and use the provided CSS classes.
  `;

  try {
    // Set a longer timeout for the API call
    const result = await Promise.race([
      model.generateContent(prompt),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Request timeout")), 60000) // 60 second timeout
      )
    ]);

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
    if (error.message === "Request timeout") {
      throw new Error("The request took too long to complete. Please try again.");
    }
    throw new Error("Failed to generate career guide. Please try again.");
  }
}