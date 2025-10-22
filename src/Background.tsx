"use client";
import React, { useEffect, useRef } from 'react';
import styles from './Background.module.css';

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

    const fragmentShaderSource = `#ifdef GL_ES\nprecision highp float;\n#endif\n\n#define PI 3.14159265359;\n\nuniform vec2 u_resolution;\nuniform vec2 u_mouse;\nuniform float u_time;\nuniform float u_xpos;\nuniform float u_ypos;\n\nvec3 mod289(vec3 x) {\n    return x - floor(x * (1.0 / 289.0)) * 289.0;\n}\n\nvec4 mod289(vec4 x) {\n    return x - floor(x * (1.0 / 289.0)) * 289.0;\n}\n\nvec4 permute(vec4 x) {\n         return mod289(((x*34.0)+1.0)*x);\n}\n\nvec4 taylorInvSqrt(vec4 r)\n{\n    return 1.79284291400159 - 0.85373472095314 * r;\n}\n\nfloat snoise(vec3 v)\n    { \n    const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;\n    const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);\n\n    vec3 i  = floor(v + dot(v, C.yyy) );\n    vec3 x0 =   v - i + dot(i, C.xxx) ;\n\n    vec3 g = step(x0.yzx, x0.xyz);\n    vec3 l = 1.0 - g;\n    vec3 i1 = min( g.xyz, l.zxy );\n    vec3 i2 = max( g.xyz, l.zxy );\n\n    vec3 x1 = x0 - i1 + C.xxx;\n    vec3 x2 = x0 - i2 + C.yyy;\n    vec3 x3 = x0 - D.yyy;\n\n    i = mod289(i); \n    vec4 p = permute( permute( permute( \n                         i.z + vec4(0.0, i1.z, i2.z, 1.0 ))\n                     + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) \n                     + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));\n\n    float n_ = 0.142857142857;\n    vec3  ns = n_ * D.wyz - D.xzx;\n\n    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);\n\n    vec4 x_ = floor(j * ns.z);\n    vec4 y_ = floor(j - 7.0 * x_ );\n\n    vec4 x = x_ *ns.x + ns.yyyy;\n    vec4 y = y_ *ns.x + ns.yyyy;\n    vec4 h = 1.0 - abs(x) - abs(y);\n\n    vec4 b0 = vec4( x.xy, y.xy );\n    vec4 b1 = vec4( x.zw, y.zw );\n\n    vec4 s0 = floor(b0)*2.0 + 1.0;\n    vec4 s1 = floor(b1)*2.0 + 1.0;\n    vec4 sh = -step(h, vec4(0.0));\n\n    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;\n    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;\n\n    vec3 p0 = vec3(a0.xy,h.x);\n    vec3 p1 = vec3(a0.zw,h.y);\n    vec3 p2 = vec3(a1.xy,h.z);\n    vec3 p3 = vec3(a1.zw,h.w);\n\n    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));\n    p0 *= norm.x;\n    p1 *= norm.y;\n    p2 *= norm.z;\n    p3 *= norm.w;\n\n    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);\n    m = m * m;\n    return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), \n                                                                dot(p2,x2), dot(p3,x3) ) );\n    }\n\n    void main() {\n        vec3 color1 = vec3(75.0/255.0,144.0/255.0,210.0/255.0);\n        vec3 color2 = vec3(252.0/255.0,244.0/255.0,111.0/255.0);\n        vec3 color3 = vec3(244.0/255.0,238.0/255.0,87.0/255.0);\n        vec3 color4 = vec3(242.0/255.0,232.0/255.0,99.0/255.0);\n        vec3 color5 = vec3(242.0/255.0,205.0/255.0,96.0/255.0);\n        vec3 color6 = vec3(255.0/255.0,255.0/255.0,255.0/255.0);\n        vec2 lt = vec2(gl_FragCoord.x + u_xpos, gl_FragCoord.y + u_ypos);\n        vec2 st = lt.xy/u_resolution.xy;\n        st.x *= u_resolution.x/u_resolution.y;\n        vec3 color = vec3(0.0);\n        vec2 pos = vec2(st*0.6);\n        float DF = 0.0;\n        float a = 0.0;\n        vec2 vel = vec2(u_time*.1);\n        st.xy *= 0.4;\n        float r = snoise(vec3(st.x,st.y,u_time * 0.1));\n    \t  \n    \tif(r > 0.60){\n    \t\tcolor = color5;\n    \t} else if(r > 0.20){\n    \t\tcolor = color4;\n    \t} else if(r > -0.20){\n    \t\tcolor = color3;\n    \t} else if(r > -0.60){\n    \t\tcolor = color2;\n    \t} else if(r > -2.0){\n    \t\tcolor = color1;\n    \t}\n    \t  \n    \n    \tgl_FragColor = vec4(color,1.0);\n    }\n    `;

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
