"use client";
import React, { useEffect, useRef } from 'react';
import styles from './Background.module.css';
import fragmentShaderSource from './fragmentShader';

const Background: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const glRaw = (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;
    if (!glRaw) {
      console.warn('WebGL not supported');
      return;
    }
    const gl = glRaw;

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

    const mouse: [number, number] = [0, 0];

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
  }, []);

  return <canvas ref={canvasRef} className={styles.canvas} />;
};

export default Background;
