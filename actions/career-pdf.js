"use server";

import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// Helper function to generate HTML sections
async function generateSection(prompt) {
  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Section generation error:", error);
    throw error;
  }
}

export async function generateCareerPDF(answers) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  try {
    // Generate career paths section with strict HTML structure
    const careerPathsPrompt = `
      Based on the following preferences and personal interests, suggest three different career paths (one professional, one entrepreneurial, one alternative):
      
      Work Preference: ${answers.work_preference}
      Task Preference: ${answers.task_preference}
      Learning Style: ${answers.learning_style}
      Social Interaction: ${answers.social_interaction}
      Job Motivation: ${answers.job_motivation}
      Risk Preference: ${answers.risk_preference}
      Pressure Handling: ${answers.pressure_handling}
      Work Environment: ${answers.work_environment}
      Personal Interests: ${answers.personal_interests}

      Consider their personal interests and goals when suggesting career paths. Align the suggestions with their stated interests and provide paths that would allow them to pursue their passions while leveraging their work preferences.

      For each career path, provide:
      1. Path name and description (incorporating relevant aspects of their interests)
      2. Required skills (5-7 key skills)
      3. Expected salary range
      4. Growth potential
      5. Entry requirements

      Format EXACTLY as follows (replace text in brackets):
      <div class="career-paths-container">
        <div class="career-path">
          <h2 class="path-title">[Career Path 1 Name]</h2>
          <div class="path-details">
            <p class="description">[Clear, concise description]</p>
            <div class="info-grid">
              <div class="info-item">
                <h4>Required Skills</h4>
                <ul>
                  <li>[Skill 1]</li>
                  <li>[Skill 2]</li>
                  <!-- Add 3-5 more skills -->
                </ul>
              </div>
              <div class="info-item">
                <h4>Salary Range</h4>
                <p>[Entry Level - Experienced]</p>
              </div>
              <div class="info-item">
                <h4>Growth Potential</h4>
                <p>[Growth prospects and timeline]</p>
              </div>
              <div class="info-item">
                <h4>Entry Requirements</h4>
                <p>[Education/certification needed]</p>
              </div>
            </div>
          </div>
        </div>
        <!-- Repeat for Career Path 2 and 3 -->
      </div>
    `;

    // Generate learning roadmap section with strict HTML structure
    const roadmapPrompt = `
      Create a detailed learning roadmap for the career paths with specific, verifiable resources.
      Consider their personal interests and background: ${answers.personal_interests}

      Include:
      1. Free online courses with actual links (Coursera, edX, etc.) that align with their interests
      2. Certification paths relevant to their goals
      3. Practical projects that combine career requirements with personal interests
      4. Internship search strategies focused on their preferred areas

      Format EXACTLY as follows:
      <div class="learning-roadmap">
        <h2 class="roadmap-title">Learning & Development Roadmap</h2>
        
        <div class="roadmap-section">
          <h3 class="section-title">Recommended Courses</h3>
          <div class="course-grid">
            <div class="course-item">
              <h4 class="course-name">[Course Name]</h4>
              <p class="course-provider">Provider: [Platform Name]</p>
              <p class="course-duration">Duration: [Time]</p>
              <a href="[Actual Course URL]" class="course-link" target="_blank">View Course</a>
            </div>
            <!-- Add 2-3 more courses -->
          </div>
        </div>

        <div class="roadmap-section">
          <h3 class="section-title">Certification Path</h3>
          <div class="cert-timeline">
            <div class="cert-item">
              <h4>[Certification Name]</h4>
              <p>[Requirements and Details]</p>
            </div>
            <!-- Add 2-3 more certifications -->
          </div>
        </div>

        <div class="roadmap-section">
          <h3 class="section-title">Practical Projects</h3>
          <ul class="project-list">
            <li>
              <h4>[Project Name]</h4>
              <p>[Project Description and Learning Outcomes]</p>
            </li>
            <!-- Add 2-3 more projects -->
          </ul>
        </div>

        <div class="roadmap-section">
          <h3 class="section-title">Internship Resources</h3>
          <ul class="internship-list">
            <li>
              <h4>[Platform/Company]</h4>
              <p>[Description and Application Tips]</p>
              <a href="[Resource URL]" target="_blank">Learn More</a>
            </li>
            <!-- Add 2-3 more resources -->
          </ul>
        </div>
      </div>
    `;

    // Generate sections in parallel
    const [careerPaths, roadmap] = await Promise.all([
      generateSection(careerPathsPrompt),
      generateSection(roadmapPrompt)
    ]);

    // Combine sections into final HTML with improved styling
    const htmlContent = `
      <html>
        <head>
          <style>
            @page {
              margin: 1cm;
              size: A4;
            }
            body {
              font-family: Arial, sans-serif;
              color: #333;
              line-height: 1.6;
              margin: 0;
              padding: 0;
            }
            .header {
              background: #2980b9;
              color: white;
              padding: 20px;
              text-align: center;
              margin-bottom: 30px;
            }
            .career-paths-container {
              padding: 0 20px;
            }
            .career-path {
              margin-bottom: 30px;
              padding: 20px;
              background: #f8f9fa;
              border-radius: 8px;
              page-break-inside: avoid;
            }
            .path-title {
              color: #2980b9;
              font-size: 24px;
              margin-bottom: 15px;
              border-bottom: 2px solid #2980b9;
              padding-bottom: 5px;
            }
            .path-details {
              margin-top: 15px;
            }
            .info-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 20px;
              margin-top: 20px;
            }
            .info-item {
              background: white;
              padding: 15px;
              border-radius: 5px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .info-item h4 {
              color: #2980b9;
              margin-top: 0;
              margin-bottom: 10px;
            }
            .learning-roadmap {
              padding: 20px;
              background: #f8f9fa;
              border-radius: 8px;
              margin: 20px;
              page-break-before: always;
            }
            .roadmap-title {
              color: #2980b9;
              font-size: 28px;
              margin-bottom: 25px;
              text-align: center;
            }
            .roadmap-section {
              margin-bottom: 30px;
              page-break-inside: avoid;
            }
            .section-title {
              color: #2980b9;
              font-size: 20px;
              margin-bottom: 15px;
              border-bottom: 1px solid #dee2e6;
              padding-bottom: 5px;
            }
            .course-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 20px;
            }
            .course-item {
              background: white;
              padding: 15px;
              border-radius: 5px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .course-name {
              color: #2980b9;
              margin: 0 0 10px 0;
            }
            .course-link {
              color: #2980b9;
              text-decoration: none;
            }
            .cert-timeline, .project-list, .internship-list {
              list-style-type: none;
              padding: 0;
            }
            .cert-item, .project-list li, .internship-list li {
              background: white;
              padding: 15px;
              border-radius: 5px;
              margin-bottom: 15px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            ul {
              margin: 0;
              padding-left: 20px;
            }
            li {
              margin-bottom: 5px;
            }
            a {
              color: #2980b9;
              text-decoration: none;
            }
            @media print {
              .header {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              .career-path, .learning-roadmap {
                break-inside: avoid;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Your Personalized Career Guide</h1>
          </div>
          ${careerPaths}
          ${roadmap}
        </body>
      </html>
    `;

    return { 
      success: true,
      htmlContent
    };
  } catch (error) {
    console.error("Career guide generation error:", error);
    throw new Error("Failed to generate career guide. Please try again.");
  }
}