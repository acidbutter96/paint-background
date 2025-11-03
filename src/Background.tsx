"use client";
import React, { useEffect, useRef } from 'react';
import styles from './Background.module.css';
import createFragmentShaderSource, { DEFAULT_COLORS, SHADER_MAX_COLOR_SLOTS } from './fragmentShader';

type BackgroundProps = {
  colors?: string[];
};

const HEX_COLOR_REGEX = /^#?(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

function parseHexColorToFloats(value: string): [number, number, number] | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const normalized = trimmed.startsWith('#') ? trimmed : `#${trimmed}`;
  if (!HEX_COLOR_REGEX.test(normalized)) return null;
  let hex = normalized.slice(1);
  if (hex.length === 3) {
    hex = hex.split('').map((char) => char + char).join('');
  }
  const intVal = parseInt(hex, 16);
  const r = ((intVal >> 16) & 255) / 255;
  const g = ((intVal >> 8) & 255) / 255;
  const b = (intVal & 255) / 255;
  return [r, g, b];
}

function buildPaletteBuffer(primary: string[], fallback: string[], capacity: number) {
  const size = Math.max(1, capacity);
  const buffer = new Float32Array(size * 3);

  const fillFrom = (source: string[]) => {
    let filled = 0;
    for (const color of source) {
      const parsed = parseHexColorToFloats(color);
      if (!parsed) continue;
      buffer[filled * 3] = parsed[0];
      buffer[filled * 3 + 1] = parsed[1];
      buffer[filled * 3 + 2] = parsed[2];
      filled += 1;
      if (filled >= size) break;
    }
    return filled;
  };

  let used = fillFrom(primary);

  if (used === 0) {
    buffer.fill(0);
    used = fillFrom(fallback);
  }

  if (used === 0) {
    buffer[0] = 1;
    buffer[1] = 1;
    buffer[2] = 1;
    used = 1;
  }

  return { buffer, length: Math.min(used, size) };
}

const RESERVED_FRAGMENT_UNIFORMS = 6;

const Background: React.FC<BackgroundProps> = ({ colors }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    startTimeRef.current = Date.now();

    const glRaw = (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;
    if (!glRaw) {
      console.warn('WebGL not supported');
      return;
    }
    const gl = glRaw;

    const maxFragmentUniformVectors = gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS) as number;
    const paletteCapacity = Math.max(
      1,
      Math.min(SHADER_MAX_COLOR_SLOTS, maxFragmentUniformVectors - RESERVED_FRAGMENT_UNIFORMS)
    );
    const fragmentShaderSource = createFragmentShaderSource(paletteCapacity);

    const vertexShaderSource = `attribute vec2 a_position;\nvoid main() {\n  gl_Position = vec4(a_position, 0, 1);\n}`;

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
    const locationOfMouse = gl.getUniformLocation(program, 'u_mouse');
    const locationOfXpos = gl.getUniformLocation(program, 'u_xpos');
    const locationOfYpos = gl.getUniformLocation(program, 'u_ypos');
    const locationOfPalette = gl.getUniformLocation(program, 'u_palette[0]');
    const locationOfPaletteLength = gl.getUniformLocation(program, 'u_paletteLength');

    const mouse: [number, number] = [0, 0];
    const paletteSource = Array.isArray(colors) && colors.length > 0 ? colors : DEFAULT_COLORS;
    const { buffer: paletteBuffer, length: paletteLength } = buildPaletteBuffer(
      paletteSource,
      DEFAULT_COLORS,
      paletteCapacity
    );

    if (locationOfPalette && paletteBuffer.length) {
      gl.uniform3fv(locationOfPalette, paletteBuffer);
    }
    if (locationOfPaletteLength) {
      gl.uniform1i(locationOfPaletteLength, paletteLength);
    }

    function resizeCanvas() {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
      if (locationOfResolution) gl.uniform2f(locationOfResolution, canvas.width, canvas.height);
    }

    function onMouseMove(e: MouseEvent) {
      mouse[0] = e.clientX;
      mouse[1] = e.clientY;
    }

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('resize', resizeCanvas);

    resizeCanvas();

    function render() {
      const now = Date.now();
      const currentTime = (now - startTimeRef.current) / 1000;
      if (locationOfTime) gl.uniform1f(locationOfTime, currentTime);
      if (locationOfMouse) gl.uniform2f(locationOfMouse, mouse[0], mouse[1]);
      if (locationOfXpos) gl.uniform1f(locationOfXpos, mouse[0]);
      if (locationOfYpos) gl.uniform1f(locationOfYpos, mouse[1]);

      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      rafRef.current = requestAnimationFrame(render);
    }

    rafRef.current = requestAnimationFrame(render);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener('mousemove', onMouseMove);
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
  }, [colors]);

  return <canvas ref={canvasRef} className={styles.canvas} />;
};

export default Background;
