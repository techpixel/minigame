import kaplay from "kaplay";

const k = kaplay({
    pixelDensity: 0.75
});

k.loadRoot("./"); // A good idea for Itch.io publishing later
k.loadSprite("bean", "sprites/bean.png");
k.loadSprite("cart", "sprites/tutorial_cart.png");
k.loadSprite("flag", "sprites/hackclub.png");
k.loadSprite("minigame", "sprites/minigame.png");

k.loadSprite("blue_cloud_bg", "sprites/blue_cloud_bg.png");
k.loadSprite("steps", "sprites/steps.png");

k.loadShaderURL("crt", null, `shaders/crt.frag`);
k.loadShaderURL("static", null, `shaders/static.frag`);
k.loadShaderURL("rainbow", null, `shaders/rainbow.frag`);

k.loadFont("jersey", "fonts/Jersey10-Regular.ttf");

k.setLayers(["bg", "game", "ui"], "game");

export { k };