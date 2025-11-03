"use client";
import React from 'react';
import Background from './Background';

export default function BackgroundClient({ colors }: { colors?: string[] }) {
  return <Background colors={colors} />;
}
