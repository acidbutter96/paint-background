// Exported fragment shader string with a broader paint-like palette
const fragmentShader = `#ifdef GL_ES
precision highp float;
#endif

#define PI 3.14159265359;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
uniform float u_xpos;
uniform float u_ypos;

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

    void main() {
        // Expanded "paint" palette
        vec3 teal        = vec3(54.0/255.0, 176.0/255.0, 170.0/255.0);
        vec3 lightBlue   = vec3(153.0/255.0, 204.0/255.0, 255.0/255.0);
        vec3 pink        = vec3(255.0/255.0, 120.0/255.0, 180.0/255.0);
        vec3 lime        = vec3(180.0/255.0, 255.0/255.0, 100.0/255.0);
        vec3 purple      = vec3(175.0/255.0, 122.0/255.0, 197.0/255.0);
        vec3 coral       = vec3(255.0/255.0, 127.0/255.0, 110.0/255.0);
        vec3 deepBlue    = vec3(75.0/255.0,144.0/255.0,210.0/255.0);
        vec3 yellowSoft  = vec3(252.0/255.0,244.0/255.0,111.0/255.0);
        vec3 paleYellow  = vec3(244.0/255.0,238.0/255.0,87.0/255.0);
        vec3 warmYellow  = vec3(242.0/255.0,232.0/255.0,99.0/255.0);
        vec3 amber       = vec3(242.0/255.0,205.0/255.0,96.0/255.0);
        vec3 whiteColor  = vec3(1.0,1.0,1.0);

        vec2 lt = vec2(gl_FragCoord.x + u_xpos, gl_FragCoord.y + u_ypos);
        vec2 st = lt.xy/u_resolution.xy;
        st.x *= u_resolution.x/u_resolution.y;
        vec3 color = vec3(0.0);
        vec2 pos = vec2(st*0.6);
        float DF = 0.0;
        float a = 0.0;
        vec2 vel = vec2(u_time*.1);
        st.xy *= 0.4;
        float r = snoise(vec3(st.x,st.y,u_time * 0.1));

        float r2 = snoise(vec3(st.x*1.5, st.y*1.5, u_time * 0.12));
        float r3 = snoise(vec3(st.x*0.8, st.y*0.8, u_time * 0.07));
        float mixNoise = mix(r, r2, 0.5) * 0.6 + r3 * 0.4;

        if (mixNoise > 0.65) {
            color = pink;
        } else if (mixNoise > 0.40) {
            color = lightBlue;
        } else if (mixNoise > 0.15) {
            color = lime;
        } else if (mixNoise > -0.10) {
            color = coral;
        } else if (mixNoise > -0.40) {
            color = teal;
        } else if (mixNoise > -0.75) {
            color = purple;
        } else if (mixNoise > -1.2) {
            color = deepBlue;
        } else if (mixNoise > -1.6) {
            color = amber;
        } else {
            color = whiteColor;
        }

        float blend = smoothstep(-0.2, 0.6, snoise(vec3(st.x*2.0, st.y*2.0, u_time*0.2)));
        color = mix(color, warmYellow * 0.6 + paleYellow * 0.4, blend * 0.25);

        gl_FragColor = vec4(color,1.0);
    }
    `;

export default fragmentShader;
