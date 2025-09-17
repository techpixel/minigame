uniform float u_time;
uniform float u_strength;

vec4 frag(vec2 pos, vec2 uv, vec4 color, sampler2D tex) {
    vec4 NoiseColor = vec4(0.0, 0.0, 0.0, 0.0);

    float noise = (fract(sin(dot(uv.xy * (u_time), vec2(12.9898,78.233))) * 43758.5453) - 0.5) * 2.0; 
    
    color.rgba += (noise + NoiseColor) * u_strength / 1.5;

    return vec4(color.rgb, 1.0);
}