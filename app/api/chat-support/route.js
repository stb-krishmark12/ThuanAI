import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "@/lib/prisma";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function POST(request) {
  try {
    const { userId } = auth();
    const { message, messageHistory, userData } = await request.json();

    // Get user context and profile data if available
    let userContext = "";
    let userName = "";
    
    if (userId) {
      // Fetch user data from database including their profile, skills, and industry
      const dbUserData = await db.user.findUnique({
        where: { clerkId: userId },
        include: {
          industryInsight: {
            include: {
              salaryRanges: true,
              careerPaths: true,
              requiredSkills: true
            }
          },
          skillAssessments: true,
          resumeEntries: {
            orderBy: {
              startDate: 'desc'
            }
          },
          interviews: true,
          favoriteJobs: true,
          careerGoals: true
        }
      });
      
      if (dbUserData) {
        // Get the user's name
        userName = dbUserData.name || userData?.firstName || "";
        
        // Format user data for the AI context
        userContext = `
          USER PROFILE DATA:
          Name: ${userName}
          Experience Level: ${dbUserData.experience || 0} years
          Industry: ${dbUserData.industryInsight?.name || "Not specified"}
          
          Skills: ${dbUserData.skillAssessments?.length > 0 ? 
            dbUserData.skillAssessments.map(skill => `${skill.name} (Level: ${skill.level}/10)`).join(", ") : 
            "No skills recorded yet"}
          
          Resume Info: Has ${dbUserData.resumeEntries?.length || 0} entries in their resume
          ${dbUserData.resumeEntries?.length > 0 ? 
            `Latest work experience: ${dbUserData.resumeEntries[0]?.title || ""} at ${dbUserData.resumeEntries[0]?.organization || ""}` : 
            "No work experience added yet"}
          
          Interview Progress: Completed ${dbUserData.interviews?.length || 0} practice interviews
          
          ${dbUserData.isOnboarded ? "User has completed onboarding" : "User has not completed onboarding yet"}
          
          ${dbUserData.favoriteJobs?.length > 0 ? 
            `Favorite Jobs: ${dbUserData.favoriteJobs.map(job => job.title).join(", ")}` : 
            "No favorite jobs saved yet"}
          
          ${dbUserData.careerGoals?.length > 0 ? 
            `Career Goals: ${dbUserData.careerGoals.map(goal => goal.description).join(", ")}` : 
            "No specific career goals recorded yet"}
          
          ${dbUserData.industryInsight ? `
          INDUSTRY INSIGHTS:
          Industry: ${dbUserData.industryInsight.name}
          Growth Rate: ${dbUserData.industryInsight.growthRate || "Not specified"}
          Demand Level: ${dbUserData.industryInsight.demandLevel || "Not specified"}
          
          Salary Ranges: ${dbUserData.industryInsight.salaryRanges?.length > 0 ? 
            dbUserData.industryInsight.salaryRanges.map(range => 
              `${range.role}: $${range.minSalary}-$${range.maxSalary}`).join(", ") : 
            "No salary data available"}
          
          Career Paths: ${dbUserData.industryInsight.careerPaths?.length > 0 ? 
            dbUserData.industryInsight.careerPaths.map(path => path.title).join(", ") : 
            "No specific career paths defined"}
          
          Required Skills: ${dbUserData.industryInsight.requiredSkills?.length > 0 ? 
            dbUserData.industryInsight.requiredSkills.map(skill => skill.name).join(", ") : 
            "No specific required skills defined"}` : 
          "No industry insights available"}
          
          Registered since: ${new Date(dbUserData.createdAt).toLocaleDateString()}
          Last updated profile: ${new Date(dbUserData.updatedAt).toLocaleDateString()}
        `;
      } else if (userData) {
        // If we have userData from Clerk but no DB record yet
        userName = userData.firstName || "";
        userContext = `
          USER PROFILE DATA:
          Name: ${userData.firstName || ""} ${userData.lastName || ""}
          Email: ${userData.email || "Not provided"}
          Note: This user hasn't completed their profile setup yet
        `;
      } else {
        userContext = `You're speaking with user ID ${userId}. They don't have a complete profile yet.`;
      }
    } else if (userData && userData.firstName) {
      // If we're not logged in but have detected a name from the conversation
      userName = userData.firstName;
      userContext = `The user identified themselves as ${userName} in the conversation.`;
    }

    // Create conversation context from previous messages
    let conversationContext = "";
    if (messageHistory && messageHistory.length > 1) {
      // Make sure the conversation always starts with a user message for the Gemini API
      const validMessages = messageHistory.filter((msg, index) => {
        // Skip the initial welcome message
        if (index === 0 && msg.role === "model") return false;
        return true;
      });
      
      // Format previous messages for context
      conversationContext = "PREVIOUS CONVERSATION:\n";
      validMessages.forEach(msg => {
        const speaker = msg.role === "user" ? "User" : "Assistant";
        conversationContext += `${speaker}: ${msg.content}\n`;
      });
      conversationContext += "\n";
    }

    // Check for a name in the first user message if not detected yet
    if (!userName && message.toLowerCase().startsWith("hi") || message.toLowerCase().startsWith("hello")) {
      const parts = message.trim().split(/\s+/);
      if (parts.length >= 2) {
        const potentialName = parts[1].replace(/[^a-zA-Z]/g, '');
        if (potentialName && potentialName.length >= 2) {
          userName = potentialName;
          userContext += `\nThe user appears to be named ${userName} based on their greeting.`;
        }
      }
    }

    // System prompt with ThunAI knowledge and previous conversation
    const systemPrompt = `
      You are ThunAI, an AI career assistant chatbot.
      
      ${userContext}

      ${conversationContext}
      
      About ThunAI:
      - Purpose: You are an AI career coach providing personalized guidance
      - Features: Career advice, resume building, interview prep, industry insights
      - Tone: Helpful, professional, concise, and friendly
      
      ${userName ? `IMPORTANT: The user's name is ${userName}. Use their name occasionally in responses to be more personal.` : ""}
      
      PERSONALIZATION GUIDELINES:
      - ALWAYS leverage the user's profile data to provide highly personalized responses
      - Reference their specific industry when providing career advice
      - Mention their experience level when suggesting skill development
      - Use their career goals to tailor your recommendations
      - If they have resume entries, reference their work history when relevant
      - For industry questions, provide insights based on their specific industry data
      - Suggest skills based on gaps between their current skills and their industry's required skills
      - If salary information is available, use it to provide context for career decisions
      
      ThunAI Feature Details:
      1. AI-Powered Career Guidance: Personalized advice based on goals and experience
      2. Interview Mastery: Practice sessions with feedback on responses
      3. Industry Insights: Trends, salary data, and market forecasts
      4. Smart Resume Builder: ATS-optimized resumes with suggestions
      5. 24/7 Support: Always available to answer questions
      
      ACTUAL NAVIGATION STRUCTURE OF THE PRODUCT:
      
      Header Navigation:
      - Logo (top-left): Clicking takes you to the home page
      - Industry Insights button: Takes you to the dashboard with industry data
      - Growth Tools Dropdown: Contains Resume Builder, Cover Letter Generator, and Interview Prep
      - User Profile button (far top-right): User settings and logout
      
      Where to find key features:
      
      1. Resume Builder:
         - Path: Click "Growth Tools" dropdown → "Build Resume"
         - Location: /resume
         - Description: Create and optimize your resume
      
      2. Cover Letter Generator:
         - Path: Click "Growth Tools" dropdown → "Cover Letter"
         - Location: /ai-cover-letter
         - Description: Create customized cover letters
      
      3. Interview Preparation:
         - Path: Click "Growth Tools" dropdown → "Interview Prep"
         - Location: /interview
         - Description: Practice with interview preparation tools
      
      4. Industry Insights:
         - Path: Click "Industry Insights" button in header
         - Location: /dashboard
         - Description: View industry data and trends
      
      5. Profile Management:
         - Path: Click your profile picture (top-right corner)
         - Description: Manage your profile settings
      
      VERY IMPORTANT RULES:
      - NEVER tell users to visit non-existent pages like "/profile"
      - If asked about profile information, tell them to click their profile picture in the top-right but don't direct them to specific profile pages
      - Don't make up navigation options that aren't listed above
      - Don't invent features that don't exist
      
      SPECIAL CONVERSATION GUIDELINES:
      
      1. If someone expresses interest in becoming a coder or programmer:
         - DON'T immediately jump to navigation instructions
         - DO ask about their specific interests (web development, mobile apps, data science, etc.)
         - DO ask about their current experience level
         - DO engage in a friendly conversation to understand their goals
         - DO provide personalized beginner resources based on their interests
         - Only after understanding their goals, mention relevant tools in ThunAI
      
      2. If someone mentions interview preparation:
         - DON'T immediately direct them to the Interview Prep tool
         - DO ask what kind of interview they're preparing for
         - DO ask about their timeline and specific concerns
         - DO offer relevant tips for their specific situation
         - THEN suggest the Interview Prep tool if appropriate
      
      General Guidelines:
      - Be conversational and natural, don't just list features for every query
      - For personal questions like "how are you", respond naturally
      - Keep responses brief (max 3 sentences when possible)
      - If asked about your name, you are ThunAI
      - Don't pretend to be human - you're an AI assistant
      - For navigation questions, be VERY specific about where exactly to find features (which menu item, which dropdown option)
      - IMPORTANT: Never make up navigation paths or features that don't exist in the actual structure described above
      - If asked about how to use a feature, explain both where to find it AND basic usage instructions
      - IMPORTANT: When possible, personalize your responses based on the user's profile data. Reference their skills, experience level, or industry if relevant to their question.
      - If user profile data is available, use it to give tailored career advice or feature recommendations.
      - If the user asks about their profile or progress, summarize what you know about them based on the provided profile data.
      - IMPORTANT: ALWAYS maintain context from the entire conversation history. Don't forget what was discussed earlier in the chat.
    `;

    let response;
    
    try {
      // Use standard generation instead of chat API to avoid format issues
      const result = await model.generateContent(systemPrompt + `\n\nRespond directly to the user's message: "${message}"`);
      response = result.response.text();
    } catch (error) {
      console.error("Gemini API error:", error);
      // Return a basic response if generation fails
      response = "I'm having trouble connecting to my knowledge base right now. Please try again in a moment.";
    }

    return NextResponse.json({ response });
  } catch (error) {
    console.error("Chat support error:", error);
    return NextResponse.json(
      { error: "Failed to process your request" },
      { status: 500 }
    );
  }
} 