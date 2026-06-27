'use client';

import React from 'react';
import { SignIn } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import { FADE_UP, SPRING_DEFAULT } from '@/constants/motion';

export default function AdminLoginPage() {
  return (
    <div className="bg-mesh-gradient blueprint-grid min-h-screen flex items-center justify-center p-4 relative overflow-hidden select-none">
      {/* Glow ambient background elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-accent/5 blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-accent-glow/3 blur-3xl -z-10 pointer-events-none" />

      {/* Decorative Scan line */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-5 opacity-40">
        <div className="scan-line" />
      </div>

      <motion.div
        initial="initial"
        animate="animate"
        variants={FADE_UP}
        transition={SPRING_DEFAULT}
        className="w-full max-w-md flex flex-col items-center gap-4 z-10"
      >
        {/* Brand Header */}
        <div className="flex flex-col items-center gap-2 mb-4 text-center">
          <img 
            src="/logo.gif" 
            alt="WarishLabs Logo" 
            className="w-16 h-16 rounded-xl shadow-modal border border-border" 
          />
          <h1 className="text-xl font-extrabold text-white tracking-wide">
            WarishLabs Console
          </h1>
          <p className="text-text-tertiary text-xs">
            Super Administrative Access Gateway
          </p>
        </div>

        {/* Branded Clerk SignIn Component */}
        <SignIn
          path="/admin/login"
          fallbackRedirectUrl="/admin/dashboard"
          appearance={{
            elements: {
              card: "bg-bg-card border border-border shadow-modal rounded-xl text-white font-sans",
              headerTitle: "text-white font-extrabold text-lg tracking-tight",
              headerSubtitle: "text-text-secondary text-xs",
              socialButtonsBlockButton: "bg-bg-primary border border-border text-white hover:bg-bg-secondary hover:border-accent transition-all cursor-pointer font-semibold text-xs",
              formButtonPrimary: "bg-accent hover:bg-accent-hover text-white transition-all font-bold text-xs py-2 cursor-pointer shadow-accent",
              formFieldLabel: "text-text-secondary font-semibold text-xs",
              formFieldInput: "bg-bg-primary border border-border text-white focus:border-accent focus:ring-accent text-xs",
              footerActionText: "text-text-tertiary text-xs",
              footerActionLink: "text-accent hover:text-accent-hover font-bold text-xs",
              identityPreviewText: "text-white text-xs",
              identityPreviewEditButtonIcon: "text-accent",
              formFieldInputShowPasswordButton: "text-text-secondary hover:text-white",
              userButtonPopoverActionButton: "text-white",
              dividerLine: "bg-border/60",
              dividerText: "text-text-tertiary font-bold text-[10px]"
            }
          }}
        />

        <a href="/" className="text-text-tertiary hover:text-white text-xs transition-colors mt-6 font-semibold">
          ← Return to WarishLabs Home
        </a>
      </motion.div>
    </div>
  );
}
