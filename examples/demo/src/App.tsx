import React from 'react'
import { BackgroundClient as Background } from '../../../src';

export default function App() {
  return (
    <div>
      <Background />
      <div style={{ position: 'relative', zIndex: 1, padding: 24 }}>
        <h1>paint-background demo</h1>
        <p>This page demonstrates the paint-background library rendered behind content.</p>
      </div>
    </div>
  )
}
