"use server";

import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { jsPDF } from "jspdf";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export async function generateCareerPDF(answers) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Generate career insights using Gemini AI
  const prompt = `
    Based on the following personality and career preferences, provide a detailed career roadmap:
    
    Work Preference: ${answers.work_preference}
    Task Preference: ${answers.task_preference}
    Learning Style: ${answers.learning_style}
    Social Interaction: ${answers.social_interaction}
    Job Motivation: ${answers.job_motivation}
    Risk Preference: ${answers.risk_preference}
    Pressure Handling: ${answers.pressure_handling}
    Work Environment: ${answers.work_environment}

    Please provide a response in the following JSON format:
    {
      "career_paths": [
        {
          "title": "Career Path Name",
          "description": "Brief description",
          "required_skills": ["skill1", "skill2"],
          "free_courses": [
            {
              "title": "Course Name",
              "platform": "Platform Name",
              "url": "Course URL",
              "level": "Beginner/Intermediate/Advanced"
            }
          ],
          "internship_opportunities": [
            {
              "title": "Internship Title",
              "company": "Company Name",
              "description": "Brief description",
              "requirements": ["req1", "req2"]
            }
          ]
        }
      ],
      "learning_roadmap": {
        "short_term": ["goal1", "goal2"],
        "medium_term": ["goal1", "goal2"],
        "long_term": ["goal1", "goal2"]
      }
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();
    const insights = JSON.parse(cleanedText);

    // Create PDF
    const doc = new jsPDF();
    let yPos = 20;

    // Add content to PDF
    doc.setFontSize(20);
    doc.text("Your Personalized Career Guide", 105, yPos, { align: "center" });
    yPos += 20;

    // Career Paths
    doc.setFontSize(16);
    doc.text("Recommended Career Paths", 20, yPos);
    yPos += 15;

    insights.career_paths.forEach((path) => {
      doc.setFontSize(14);
      doc.text(path.title, 20, yPos);
      yPos += 10;

      doc.setFontSize(12);
      const descriptionLines = doc.splitTextToSize(path.description, 170);
      doc.text(descriptionLines, 20, yPos);
      yPos += descriptionLines.length * 7 + 10;

      // Required Skills
      doc.setFontSize(12);
      doc.text("Required Skills:", 20, yPos);
      yPos += 10;
      path.required_skills.forEach((skill) => {
        doc.text(`• ${skill}`, 30, yPos);
        yPos += 7;
      });
      yPos += 5;

      // Free Courses
      doc.setFontSize(12);
      doc.text("Recommended Free Courses:", 20, yPos);
      yPos += 10;
      path.free_courses.forEach((course) => {
        doc.text(`${course.title} (${course.level})`, 30, yPos);
        yPos += 7;
        doc.text(`Platform: ${course.platform}`, 30, yPos);
        yPos += 7;
        doc.text(`URL: ${course.url}`, 30, yPos);
        yPos += 7;
      });
      yPos += 5;

      // Internship Opportunities
      doc.setFontSize(12);
      doc.text("Internship Opportunities:", 20, yPos);
      yPos += 10;
      path.internship_opportunities.forEach((internship) => {
        doc.text(internship.title, 30, yPos);
        yPos += 7;
        doc.text(`Company: ${internship.company}`, 30, yPos);
        yPos += 7;
        const descriptionLines = doc.splitTextToSize(internship.description, 170);
        doc.text(descriptionLines, 30, yPos);
        yPos += descriptionLines.length * 7 + 7;
        doc.text("Requirements:", 30, yPos);
        yPos += 7;
        internship.requirements.forEach((req) => {
          doc.text(`• ${req}`, 40, yPos);
          yPos += 7;
        });
      });
      yPos += 10;
    });

    // Learning Roadmap
    doc.setFontSize(16);
    doc.text("Learning Roadmap", 20, yPos);
    yPos += 15;

    Object.entries(insights.learning_roadmap).forEach(([period, goals]) => {
      doc.setFontSize(14);
      doc.text(period.charAt(0).toUpperCase() + period.slice(1) + " Goals:", 20, yPos);
      yPos += 10;
      doc.setFontSize(12);
      goals.forEach((goal) => {
        doc.text(`• ${goal}`, 30, yPos);
        yPos += 7;
      });
      yPos += 5;
    });

    // Convert PDF to buffer and then to base64
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
    const base64PDF = pdfBuffer.toString('base64');

    return { 
      success: true,
      pdfBuffer: base64PDF
    };
  } catch (error) {
    console.error("Error generating career PDF:", error);
    throw new Error("Failed to generate career guide");
  }
}