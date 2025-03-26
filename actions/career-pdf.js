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
        <p>Based on Your Individual Preferences and Strengths</p>
      </div>

      <div class="career-paths">
        [Insert 3 detailed career paths here, each in a div with class="career-path", including:
        - Path title in h2 with class="path-title"
        - Description
        - Required skills in a section with class="section" and ul with class="skill-list"
        - Free courses in a section with class="section" and div with class="course" for each course
        - Internship opportunities in a section with class="section" and div with class="internship" for each opportunity]
      </div>

      <div class="roadmap">
        <h2 class="timeline-title">Learning Roadmap</h2>
        [Insert learning roadmap with short-term, medium-term, and long-term goals in sections with class="section"]
      </div>
    </body>
    </html>
    
    Make sure to fill in all sections with detailed, relevant content based on the user's preferences. Include actual course names, platforms, and URLs. Make the content engaging and actionable.
  `;

  try {
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