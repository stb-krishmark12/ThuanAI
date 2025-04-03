"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { SignInButton, useAuth } from "@clerk/nextjs";

const HeroSection = () => {
  const containerRef = useRef(null);
  const [isIframeLoaded, setIsIframeLoaded] = useState(false);
  const [iframeError, setIframeError] = useState(false);
  const { isSignedIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const scrollThreshold = 100;

      if (containerRef.current) {
        if (scrollPosition > scrollThreshold) {
          containerRef.current.classList.add("scrolled");
        } else {
          containerRef.current.classList.remove("scrolled");
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fallback image component
  const FallbackImage = () => (
    <Image
      src="/banner.jpeg"
      width={1280}
      height={720}
      alt="Dashboard Preview"
      className="rounded-lg shadow-2xl border mx-auto h-full object-cover"
      priority
    />
  );

  const handleIframeLoad = () => {
    setIsIframeLoaded(true);
  };

  const handleIframeError = () => {
    console.error("Spline iframe failed to load");
    setIframeError(true);
  };

  const handleClickGetStarted = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const res = await fetch("/api/user/isonboarded");
      const data = await res.json();

      if (data.onboarded) {
        window.location.href = "/dashboard";
      } else {
        window.location.href = "/onboarding";
      }
    } catch (error) {
      console.error("Error checking onboarding status:", error);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <section className="w-full pt-36 md:pt-48 pb-10">
      <div className="space-y-6 text-center">
        <div className="space-y-6 mx-auto">
          <h1 className="text-5xl font-bold md:text-6xl lg:text-7xl xl:text-8xl gradient-title animate-gradient">
            Smarter Moves,
            <br />
            Bigger Wins
          </h1>
          <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl">
            Boost your career with personalized coaching, interview prep, and AI-driven job success tools.
          </p>
        </div>
        <div className="flex justify-center space-x-4">
          {isSignedIn ? (
            <Button size="lg" className="px-8" onClick={handleClickGetStarted}>
              {isLoading ? "Loading..." : "Get Started"}
            </Button>
          ) : (
            <SignInButton mode="modal">
              <Button size="lg" className="px-8">
                Get Started
              </Button>
            </SignInButton>
          )}
        </div>
        <div className="hero-image-wrapper mt-5 md:mt-0 h-[500px]">
          <div ref={containerRef} className="hero-image w-full h-full relative">
            {!isIframeLoaded && !iframeError && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted rounded-lg z-10">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading 3D scene...</p>
                </div>
              </div>
            )}

            {iframeError ? (
              <FallbackImage />
            ) : (
              <iframe
                src="https://my.spline.design/nexbotrobotcharacterconcept-518e3e5b851573e0ecfe3ba15f52736c/"
                frameBorder="0"
                width="100%"
                height="100%"
                className="rounded-lg shadow-2xl border mx-auto"
                onLoad={handleIframeLoad}
                onError={handleIframeError}
                title="AI Robot 3D Scene"
                loading="lazy"
              ></iframe>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
