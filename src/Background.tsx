"use client";
import React, { useEffect, useRef } from 'react';

export type BackgroundProps = {
  enabled?: boolean;
  zIndex?: number;
  pointerEvents?: 'none' | 'auto';
};

const containerStyle = (zIndex: number | undefined, pointerEvents: 'none' | 'auto' = 'none') => ({
  position: 'fixed' as const,
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  zIndex: zIndex ?? -1,
  pointerEvents,
});

const Background: React.FC<BackgroundProps> = ({ enabled = true, zIndex = -1, pointerEvents = 'none' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    if (!enabled) return;
    if (typeof window === 'undefined') return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const glRaw = (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;
    if (!glRaw) {
      // WebGL not available; do nothing
      return;
    }
    const gl = glRaw;

    const vertexShaderSource = `attribute vec2 a_position;\nvoid main() {\n  gl_Position = vec4(a_position, 0, 1);\n}`;

    // simplified fragment shader derived from original file
    const fragmentShaderSource = `#ifdef GL_ES\nprecision highp float;\n#endif\n\nuniform vec2 u_resolution;\nuniform float u_time;\nvoid main(){\n  vec2 st = gl_FragCoord.xy / u_resolution.xy;\n  vec3 color = vec3(0.1 + 0.9 * sin(u_time + st.xyx + vec3(0.0,2.0,4.0)));\n  gl_FragColor = vec4(color,1.0);\n}`;

    function compileShader(localGl: WebGLRenderingContext, type: number, source: string) {
      const shader = localGl.createShader(type);
      if (!shader) throw new Error('Unable to create shader');
      localGl.shaderSource(shader, source);
      localGl.compileShader(shader);
      if (!localGl.getShaderParameter(shader, localGl.COMPILE_STATUS)) {
        const info = localGl.getShaderInfoLog(shader);
        localGl.deleteShader(shader);
        throw new Error('Could not compile shader:\n' + info);
      }
      return shader;
    }

    const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    const program = gl.createProgram();
    if (!program) throw new Error('Unable to create program');
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const info = gl.getProgramInfoLog(program);
      gl.deleteProgram(program);
      throw new Error('Failed to link program:\n' + info);
    }

    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0]),
      gl.STATIC_DRAW
    );

    const positionLocation = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const locationOfResolution = gl.getUniformLocation(program, 'u_resolution');
    const locationOfTime = gl.getUniformLocation(program, 'u_time');

    function resizeCanvas() {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
      if (locationOfResolution) gl.uniform2f(locationOfResolution, canvas.width, canvas.height);
    }

    window.addEventListener('resize', resizeCanvas);

    resizeCanvas();

    function render() {
      const now = Date.now();
      const currentTime = (now - startTimeRef.current) / 1000;
      if (locationOfTime) gl.uniform1f(locationOfTime, currentTime);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      rafRef.current = requestAnimationFrame(render);
    }

    rafRef.current = requestAnimationFrame(render);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resizeCanvas);
      try {
        if (program) {
          gl.deleteProgram(program);
        }
        if (vertexShader) gl.deleteShader(vertexShader);
        if (fragmentShader) gl.deleteShader(fragmentShader);
        if (buffer) gl.deleteBuffer(buffer);
      } catch (e) {
        // ignore cleanup errors
      }
    };
  }, [enabled]);

  return (
    <canvas
      ref={canvasRef}
      style={containerStyle(zIndex, pointerEvents)}
    />
  );
};

export default Background;
