import React from "react";
import { Button } from "./ui/button";
import {
  PenBox,
  LayoutDashboard,
  FileText,
  GraduationCap,
  ChevronDown,
  StarsIcon,
} from "lucide-react";
import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import { checkUser } from "@/lib/checkUser";

export default async function Header() {
  try {
    const user = await checkUser();
    // For now, we'll show all features to authenticated users
    const isSubscribed = !!user;

    return (
      <header className="fixed top-0 w-full border-b bg-background/80 backdrop-blur-md z-50 supports-[backdrop-filter]:bg-background/60">
        <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/">
            <Image
              src={"/logo.png"}
              alt="THUNAI Logo"
              width={200}
              height={60}
              className="h-12 py-1 w-auto object-contain"
            />
          </Link>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2 md:space-x-4">
            <SignedIn>
              {/* Show pricing link if not subscribed */}
              {!isSubscribed && (
                <Link href="/pricing">
                  <Button variant="outline">Pricing</Button>
                </Link>
              )}

              {/* Show growth tools and industry insights if subscribed */}
              {isSubscribed && (
                <>
                  <Link href="/onboarding">
                    <Button
                      variant="outline"
                      className="hidden md:inline-flex items-center gap-2"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Industry Insights
                    </Button>
                    <Button variant="ghost" className="md:hidden w-10 h-10 p-0">
                      <LayoutDashboard className="h-4 w-4" />
                    </Button>
                  </Link>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button className="flex items-center gap-2">
                        <StarsIcon className="h-4 w-4" />
                        <span className="hidden md:block">Growth Tools</span>
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem asChild>
                        <Link href="/resume" className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Build Resume
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/ai-cover-letter" className="flex items-center gap-2">
                          <PenBox className="h-4 w-4" />
                          Cover Letter
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/interview" className="flex items-center gap-2">
                          <GraduationCap className="h-4 w-4" />
                          Interview Prep
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}

              {/* Always show support for signed-in users */}
              <a
                href="mailto:thestbcompany@gmail.com"
                className="inline-flex items-center px-4 py-2 border border-blue-500 rounded-md text-sm font-medium text-blue-400 hover:bg-blue-500/10 transition-colors duration-200"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5 mr-2" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                  />
                </svg>
                Support
              </a>
            </SignedIn>

            <SignedOut>
              {/* Show pricing and support for signed-out users */}
              <Link href="/pricing">
                <Button variant="outline">Pricing</Button>
              </Link>
              <a
                href="mailto:thestbcompany@gmail.com"
                className="inline-flex items-center px-4 py-2 border border-blue-500 rounded-md text-sm font-medium text-blue-400 hover:bg-blue-500/10 transition-colors duration-200"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5 mr-2" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                  />
                </svg>
                Support
              </a>
              <SignInButton>
                <Button variant="outline">Sign In</Button>
              </SignInButton>
            </SignedOut>

            <SignedIn>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-10 h-10",
                    userButtonPopoverCard: "shadow-xl",
                    userPreviewMainIdentifier: "font-semibold",
                  },
                }}
                afterSignOutUrl="/"
              />
            </SignedIn>
          </div>
        </nav>
      </header>
    );
  } catch (error) {
    console.error("Error in Header:", error);
    // Return a simplified header without user-specific content
    return (
      <header className="fixed top-0 w-full border-b bg-background/80 backdrop-blur-md z-50 supports-[backdrop-filter]:bg-background/60">
        <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/">
            <Image
              src={"/logo.png"}
              alt="THUNAI Logo"
              width={200}
              height={60}
              className="h-12 py-1 w-auto object-contain"
            />
          </Link>
          <div className="flex items-center space-x-2 md:space-x-4">
            <Link href="/pricing">
              Pricing
            </Link>
            <SignInButton>
              <Button variant="outline">Sign In</Button>
            </SignInButton>
          </div>
        </nav>
      </header>
    );
  }
}
