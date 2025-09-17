uniform float u_time;

vec4 frag(vec2 pos, vec2 uv, vec4 color, sampler2D tex) {
    vec4 c = def_frag();

    // if not white, return original color
    if (c.r < 0.9 || c.g < 0.9 || c.b < 0.9) {
        return c;
    }

    // add a rainbow effect based on time and uv.x
    // angled rainbow
    float angle = atan(uv.y, uv.x);
    float r = 0.5 + 0.5 * sin(u_time + angle * 100.0);
    float g = 0.5 + 0.5 * sin(u_time + angle * 100.0 + 2.0);
    float b = 0.5 + 0.5 * sin(u_time + angle * 100.0 + 4.0);

    c.r *= r;
    c.g *= g;
    c.b *= b;

    return c;
}