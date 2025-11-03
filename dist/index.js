"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.tsx
var src_exports = {};
__export(src_exports, {
  Background: () => Background_default,
  BackgroundClient: () => BackgroundClient,
  default: () => Background_default
});
module.exports = __toCommonJS(src_exports);

// src/Background.tsx
var import_react = require("react");

// src/Background.module.css
var _default = {};

// src/fragmentShader.ts
var DEFAULT_COLORS = [
  "#36B0AA",
  "#99CCFF",
  "#FF78B4",
  "#B4FF64",
  "#AF7AC5",
  "#FF7F6E",
  "#4B90D2",
  "#FCF46F",
  "#F4EE57",
  "#F2E863",
  "#F2CD60",
  "#FFFFFF",
  "#FF5A82",
  "#AAFFDC",
  "#FFA546"
];
var SHADER_MAX_COLOR_SLOTS = 32;
function createFragmentShaderSource(maxColors) {
  const clamped = Math.max(1, Math.min(SHADER_MAX_COLOR_SLOTS, Math.floor(maxColors)));
  return `#ifdef GL_ES
precision highp float;
#endif

#define PI 3.14159265359;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
uniform float u_xpos;
uniform float u_ypos;
uniform int u_paletteLength;
uniform vec3 u_palette[${clamped}];

vec3 mod289(vec3 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 mod289(vec4 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute(vec4 x) {
         return mod289(((x*34.0)+1.0)*x);
}

vec4 taylorInvSqrt(vec4 r)
{
    return 1.79284291400159 - 0.85373472095314 * r;
}

float snoise(vec3 v)
{ 
    const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
    const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

    vec3 i  = floor(v + dot(v, C.yyy) );
    vec3 x0 =   v - i + dot(i, C.xxx) ;

    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min( g.xyz, l.zxy );
    vec3 i2 = max( g.xyz, l.zxy );

    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;

    i = mod289(i); 
    vec4 p = permute( permute( permute( 
                         i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
                     + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
                     + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

    float n_ = 0.142857142857;
    vec3  ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_ );

    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4( x.xy, y.xy );
    vec4 b1 = vec4( x.zw, y.zw );

    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

    vec3 p0 = vec3(a0.xy,h.x);
    vec3 p1 = vec3(a0.zw,h.y);
    vec3 p2 = vec3(a1.xy,h.z);
    vec3 p3 = vec3(a1.zw,h.w);

    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                                                dot(p2,x2), dot(p3,x3) ) );
}

int clampToLength(int idx, int length) {
    int clampedIdx = idx;
    int maxIdx = length - 1;
    if (clampedIdx < 0) {
        clampedIdx = 0;
    }
    if (maxIdx < 0) {
        maxIdx = 0;
    }
    if (clampedIdx > maxIdx) {
        clampedIdx = maxIdx;
    }
    return clampedIdx;
}

vec3 paletteColor(int idx, int length) {
    int target = clampToLength(idx, length);
    vec3 selected = u_palette[0];
    for (int i = 0; i < ${clamped}; i++) {
        if (i < length && i == target) {
            selected = u_palette[i];
        }
    }
    return selected;
}

void main() {
    if (u_paletteLength < 1) {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
        return;
    }

    vec2 lt = vec2(gl_FragCoord.x + u_xpos, gl_FragCoord.y + u_ypos);
    vec2 st = lt.xy/u_resolution.xy;
    st.x *= u_resolution.x/u_resolution.y;
    st.xy *= 0.4;
    float r = snoise(vec3(st.x,st.y,u_time * 0.1));

    float r2 = snoise(vec3(st.x*1.5, st.y*1.5, u_time * 0.12));
    float r3 = snoise(vec3(st.x*0.8, st.y*0.8, u_time * 0.07));
    float mixNoise = mix(r, r2, 0.5) * 0.6 + r3 * 0.4;

    float normalizedNoise = clamp(mixNoise * 0.5 + 0.5, 0.0, 0.9999);
    int colorIndex = int(floor(normalizedNoise * float(u_paletteLength)));
    int safeIndex = clampToLength(colorIndex, u_paletteLength);
    vec3 color = paletteColor(safeIndex, u_paletteLength);

    float blend = smoothstep(-0.2, 0.6, snoise(vec3(st.x*2.0, st.y*2.0, u_time*0.2)));
    int accentIndex = clampToLength(u_paletteLength - 1, u_paletteLength);
    vec3 accent = mix(paletteColor(0, u_paletteLength), paletteColor(accentIndex, u_paletteLength), 0.5);
    color = mix(color, accent, blend * 0.25);

    gl_FragColor = vec4(color,1.0);
}
`;
}
var fragmentShader_default = createFragmentShaderSource;

// src/Background.tsx
var import_jsx_runtime = require("react/jsx-runtime");
var HEX_COLOR_REGEX = /^#?(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
function parseHexColorToFloats(value) {
  const trimmed = value.trim();
  if (!trimmed)
    return null;
  const normalized = trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
  if (!HEX_COLOR_REGEX.test(normalized))
    return null;
  let hex = normalized.slice(1);
  if (hex.length === 3) {
    hex = hex.split("").map((char) => char + char).join("");
  }
  const intVal = parseInt(hex, 16);
  const r = (intVal >> 16 & 255) / 255;
  const g = (intVal >> 8 & 255) / 255;
  const b = (intVal & 255) / 255;
  return [r, g, b];
}
function buildPaletteBuffer(primary, fallback, capacity) {
  const size = Math.max(1, capacity);
  const buffer = new Float32Array(size * 3);
  const fillFrom = (source) => {
    let filled = 0;
    for (const color of source) {
      const parsed = parseHexColorToFloats(color);
      if (!parsed)
        continue;
      buffer[filled * 3] = parsed[0];
      buffer[filled * 3 + 1] = parsed[1];
      buffer[filled * 3 + 2] = parsed[2];
      filled += 1;
      if (filled >= size)
        break;
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
var RESERVED_FRAGMENT_UNIFORMS = 6;
var Background = ({ colors }) => {
  const canvasRef = (0, import_react.useRef)(null);
  const rafRef = (0, import_react.useRef)(null);
  const startTimeRef = (0, import_react.useRef)(Date.now());
  (0, import_react.useEffect)(() => {
    if (typeof window === "undefined")
      return;
    const canvas = canvasRef.current;
    if (!canvas)
      return;
    startTimeRef.current = Date.now();
    const glRaw = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (!glRaw) {
      console.warn("WebGL not supported");
      return;
    }
    const gl = glRaw;
    const maxFragmentUniformVectors = gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS);
    const paletteCapacity = Math.max(
      1,
      Math.min(SHADER_MAX_COLOR_SLOTS, maxFragmentUniformVectors - RESERVED_FRAGMENT_UNIFORMS)
    );
    const fragmentShaderSource = fragmentShader_default(paletteCapacity);
    const vertexShaderSource = `attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0, 1);
}`;
    function compileShader(localGl, type, source) {
      const shader = localGl.createShader(type);
      if (!shader)
        throw new Error("Unable to create shader");
      localGl.shaderSource(shader, source);
      localGl.compileShader(shader);
      if (!localGl.getShaderParameter(shader, localGl.COMPILE_STATUS)) {
        const info = localGl.getShaderInfoLog(shader);
        localGl.deleteShader(shader);
        throw new Error("Could not compile shader:\n" + info);
      }
      return shader;
    }
    const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    const program = gl.createProgram();
    if (!program)
      throw new Error("Unable to create program");
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const info = gl.getProgramInfoLog(program);
      gl.deleteProgram(program);
      throw new Error("Failed to link program:\n" + info);
    }
    gl.useProgram(program);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );
    const positionLocation = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    const locationOfResolution = gl.getUniformLocation(program, "u_resolution");
    const locationOfTime = gl.getUniformLocation(program, "u_time");
    const locationOfMouse = gl.getUniformLocation(program, "u_mouse");
    const locationOfXpos = gl.getUniformLocation(program, "u_xpos");
    const locationOfYpos = gl.getUniformLocation(program, "u_ypos");
    const locationOfPalette = gl.getUniformLocation(program, "u_palette[0]");
    const locationOfPaletteLength = gl.getUniformLocation(program, "u_paletteLength");
    const mouse = [0, 0];
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
      if (!canvas)
        return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
      if (locationOfResolution)
        gl.uniform2f(locationOfResolution, canvas.width, canvas.height);
    }
    function onMouseMove(e) {
      mouse[0] = e.clientX;
      mouse[1] = e.clientY;
    }
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();
    function render() {
      const now = Date.now();
      const currentTime = (now - startTimeRef.current) / 1e3;
      if (locationOfTime)
        gl.uniform1f(locationOfTime, currentTime);
      if (locationOfMouse)
        gl.uniform2f(locationOfMouse, mouse[0], mouse[1]);
      if (locationOfXpos)
        gl.uniform1f(locationOfXpos, mouse[0]);
      if (locationOfYpos)
        gl.uniform1f(locationOfYpos, mouse[1]);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      rafRef.current = requestAnimationFrame(render);
    }
    rafRef.current = requestAnimationFrame(render);
    return () => {
      if (rafRef.current)
        cancelAnimationFrame(rafRef.current);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", resizeCanvas);
      try {
        if (program) {
          gl.deleteProgram(program);
        }
        if (vertexShader)
          gl.deleteShader(vertexShader);
        if (fragmentShader)
          gl.deleteShader(fragmentShader);
        if (buffer)
          gl.deleteBuffer(buffer);
      } catch (e) {
      }
    };
  }, [colors]);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", { ref: canvasRef, className: _default.canvas });
};
var Background_default = Background;

// src/BackgroundClient.tsx
var import_jsx_runtime2 = require("react/jsx-runtime");
function BackgroundClient() {
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Background_default, {});
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Background,
  BackgroundClient
});
