uniform float u_time;

vec4 frag(vec2 pos, vec2 uv, vec4 color, sampler2D tex) {
    vec4 c = def_frag();

    // if not white, return original color
    if (c.r < 0.9 || c.g < 0.9 || c.b < 0.9) {
        return c;
    }

    // add a rainbow effect based on time and uv.x
    float angle = atan(uv.y - 0.5, uv.x - 0.5) + 3.14159; // 0 to 2pi
    angle /= 6.28318;
    angle *= 600.0;

    float r = 0.5 + 0.5 * sin(u_time + angle);
    float g = 0.5 + 0.5 * sin(u_time + angle + 2.0);
    float b = 0.5 + 0.5 * sin(u_time + angle + 4.0);

    c.r *= r;
    c.g *= g;
    c.b *= b;

    return c;
}