"use client";
import dynamic from 'next/dynamic';
import React from 'react';
// Import the Background component directly (it's already a client-friendly component)
const Background = dynamic(() => import('./Background'), { ssr: false });

export default function BackgroundClient() {
  return <Background />;
}
