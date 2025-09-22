import { k } from "./kaplay";

export const bgShader = {
    u_strength: 0.0,
}

export const bg = k.add([
    k.uvquad(k.width(), k.height()),
    k.color(`#c4f7ff`),
    k.pos(0, 0),
    k.anchor("topleft"),
    k.z(-1),
    k.shader("static", () => {
        return {
            u_time: k.time() * 0.1,
            ...bgShader
        };
    }),

    k.layer("bg"),
    k.stay()
]);

export const logo = k.add([
    k.sprite("minigame"),
    k.pos(k.width() / 2, k.height() / 2 - 140),
    k.scale(8),
    k.anchor("bot"),

    k.shader("rainbow", () => {
        return {
            u_time: k.time() * 2,
        };
    }),

    k.layer("ui"),
    k.stay()
]);

export const flag = k.add([
    k.sprite("flag"),
    k.pos(100, -10),
    k.scale(0.25),
    k.anchor("topleft"),
    k.rotate(-90),
    k.area(),

    k.layer("ui"),
    k.stay()
]);

flag.onHover(() => {
    k.setCursor("pointer");
});
flag.onHoverEnd(() => {
    k.setCursor("default");
});

flag.onClick(() => {
    // wave the flag
    k.tween(
        flag.angle,
        5,
        0.5,
        (v) => (flag.angle = v),
        k.easings.easeOutBack
    ).then(() => {
        k.tween(
            flag.angle,
            0,
            0.5,
            (v) => (flag.angle = v),
            k.easings.easeOutBack
        );
    });
});

let selected = 0;
let carts = [];
let sections = [
    "default",
    "tutorial",
    "tutorial",
    "tutorial"
];
const sectionsCount = 4;
const sectionHeight = k.height() / sectionsCount;
export const sectionWidth = 250; //helper for positioning

const defaultX = k.width() + sectionWidth / 2;
const hoveredX = -40;
const selectedX = k.width() + sectionWidth / 2 - 60;

for (let i = 0; i < sectionsCount; i++) {
    const cart = k.add([
        k.pos(defaultX, i * sectionHeight),
        k.sprite("cart", {
            height: sectionHeight,
        }),
        k.anchor("topright"),
        k.area(),

        k.z(5),

        k.layer("ui"),
        k.stay(),
        
        "cart"
    ]);

    if (selected == i) {
        cart.pos.x = selectedX;
        cart.tag("selected");
    }

    carts.push(cart);

    cart.onHover(async () => {
        if (selected == i) return;

        k.setCursor("pointer");

        k.tween(
            cart.pos.x,
            (selected == i ? selectedX : defaultX) + hoveredX,
            0.2,
            (v) => (cart.pos.x = v),
            k.easings.easeOutCubic
        );
    });
    cart.onHoverEnd(async () => {
        await k.tween(
            cart.pos.x,
            (selected == i ? selectedX : defaultX),
            0.2,
            (v) => (cart.pos.x = v),
            k.easings.easeOutCubic
        );

        const result = carts.every((c) => {
            return !c.isHovering();
        });
        if (result) {
            k.setCursor("default");
        }
    });
    cart.onClick(() => {
        if (selected == i) return;
        carts[selected].untag("selected");
        
        selected = i;

        cart.tag("selected");

        carts.forEach(async (c, idx) => {
            // await k.tween(
            //     c.pos.x,
            //     defaultX,
            //     0.5,
            //     (v) => (c.pos.x = v),
            //     k.easings.easeOutCubic
            // );
            c.pos.x = (idx == selected ? selectedX : defaultX);
        });

        // switch scene
        k.go(sections[i]);
    });
}



k.usePostEffect("crt", {
    u_flatness: 3.5,
    u_scanline_height: 1.0,
    u_screen_height: 1.0,
});


k.scene("default", () => {
    k.tween(
        flag.angle,
        0,
        1,
        (v) => (flag.rotateTo(v)),
        k.easings.easeOutBack
    );

    const clouds_bg = k.add([
        k.sprite("blue_cloud_bg"),
        k.pos(k.width() / 2, k.height() + 200),
        k.anchor("bot"),
        k.scale(10),
        k.z(-0.5),
        k.rotate(0),

        k.layer("bg"),
    ]);

    k.tween(
        clouds_bg.pos.y,
        k.height() + 40,
        2,
        (v) => (clouds_bg.pos.y = v),
        k.easings.easeOutCubic
    ).then(() => {
        let i = 0;
        clouds_bg.onUpdate(() => {
            // ambient rotation
            clouds_bg.angle = Math.sin(i * 0.1);
            i += 0.1;
        });
    });

    const caption = k.add([
        k.text("make a minigame. earn prizes.", {
            size: 72,
            font: "jersey",
            width: k.width(),
            align: "center",
            transform: (idx, ch) => {
                return {
                    angle: 0,
                    pos: k.vec2(
                        0,
                        -4 * Math.sin(k.time() * 2 + idx * 0.5)
                    ),
                }
            }
        }),
        k.pos(k.width() / 2, k.height() / 2 - 120),
        k.anchor("top"),
        k.color("#000000"),

        k.layer("ui"),
    ]);

    const steps = k.add([
        k.sprite("steps"),
        k.pos(k.width() / 2, k.height() / 2 - 40),
        k.anchor("top"),
        k.scale(0.5),

        k.layer("ui"),
        k.area(),
        k.rotate(0),
    ]);

    const caption_anchor = caption.pos.clone();
    caption.onMouseMove((pos, delta) => {
        //parallax effect
        const center = caption_anchor;

        const xOffset = -(pos.x - center.x) / center.x;
        const yOffset = -(pos.y - center.y) / center.y;

        k.tween(
            caption.pos,
            k.vec2(
                center.x + xOffset * 10,
                center.y + yOffset * 10
            ),
            0.5,
            (v) => (caption.pos = v),
            k.easings.easeOutCubic
        );
    });

    const logo_anchor = logo.pos.clone();
    logo.onMouseMove((pos, delta) => {
        //parallax effect
        const center = logo_anchor;

        const xOffset = -(pos.x - center.x) / center.x;
        const yOffset = -(pos.y - center.y) / center.y;

        k.tween(
            logo.pos,
            k.vec2(
                center.x + xOffset * 10,
                center.y + yOffset * 10
            ),
            0.5,
            (v) => (logo.pos = v),
            k.easings.easeOutCubic
        );
    });

    const steps_anchor = steps.pos.clone();
    steps.onMouseMove((pos, delta) => {
        //parallax effect
        const center = steps_anchor;

        const xOffset = -(pos.x - center.x) / center.x;
        const yOffset = -(pos.y - center.y) / center.y;

        k.tween(
            steps.pos,
            k.vec2(
                center.x + xOffset * 20,
                center.y + yOffset * 20
            ),
            0.5,
            (v) => (steps.pos = v),
            k.easings.easeOutCubic
        );
    })

    // steps.onHoverEnd(() => {
    //     k.tween(
    //         steps.scale.x,
    //         0.5,
    //         0.2,
    //         (v) => (steps.scale.x = v),
    //         k.easings.easeOutCubic
    //     );
    //     k.tween(
    //         steps.scale.y,
    //         0.5,
    //         0.2,
    //         (v) => (steps.scale.y = v),
    //         k.easings.easeOutCubic
    //     );
    //     k.setCursor("default");
    // });
});

k.scene("tutorial", () => {

});

k.go("default");