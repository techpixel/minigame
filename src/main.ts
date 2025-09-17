import kaplay from "kaplay";
// import "kaplay/global"; // uncomment if you want to use without the k. prefix

const k = kaplay({
    pixelDensity: 0.75
});

k.loadRoot("./"); // A good idea for Itch.io publishing later
k.loadSprite("bean", "sprites/bean.png");
k.loadSprite("cart", "sprites/tutorial_cart.png");
k.loadSprite("flag", "sprites/hackclub.png");
k.loadSprite("minigame", "sprites/minigame.png");

k.loadShaderURL("crt", null, `shaders/crt.frag`);
k.loadShaderURL("static", null, `shaders/static.frag`);
k.loadShaderURL("rainbow", null, `shaders/rainbow.frag`);

k.setLayers(["bg", "game", "ui"], "game");


const bgShader = {
    u_strength: 0.9,
}
const bg = k.add([
    k.uvquad(k.width(), k.height()),
    k.color(0, 0, 0),
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

const logo = k.add([
    k.sprite("minigame"),
    k.pos(k.width() / 2, k.height() / 2),
    k.scale(5),
    k.anchor("center"),

    k.shader("rainbow", () => {
        return {
            u_time: k.time() * 2,
        };
    }),

    k.layer("ui"),
    k.stay()
]);

const flag = k.add([
    k.sprite("flag"),
    k.pos(100, -10),
    k.scale(0.25),
    k.anchor("topleft"),
    k.rotate(-90),
    k.area(),

    k.layer("ui"),
    k.stay()
]);

const scoreLabel = k.add([
    k.text("Score: 0", { size: 32 }),
    k.pos(20, k.height() - 40),
    k.color(255, 255, 255),

    k.layer("ui"),
    k.stay(),
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

k.tween(
    flag.angle,
    0,
    1,
    (v) => (flag.angle = v),
    k.easings.easeOutBack
);

const sections = 4;
const sectionHeight = k.height() / sections;
const sectionWidth = 250; //helper for positioning

for (let i = 0; i < sections; i++) {
    const x = k.add([
        k.pos(k.width() + sectionWidth / 2, i * sectionHeight),
        k.sprite("cart", {
            height: sectionHeight,
        }),
        k.anchor("topright"),
        k.area(),

        k.layer("ui"),
        k.stay()
    ]);

    x.onHover(() => {
        k.tween(
            x.pos.x,
            x.pos.x - 90,
            0.2,
            (v) => (x.pos.x = v),
            k.easings.easeOutCubic
        );
    });
    x.onHoverEnd(() => {
        k.tween(
            x.pos.x,
            k.width() + 125,
            0.2,
            (v) => (x.pos.x = v),
            k.easings.easeOutCubic
        );
    });
}

k.usePostEffect("crt", {
    u_flatness: 3.5,
    u_scanline_height: 1.0,
    u_screen_height: 1.0,
});

let score = 0;

let scenes = ["pong", "dash", "spacefight", "flappy", "pushup"];
let lastScene = "";
k.scene("static", () => {
    bgShader.u_strength = 0.9;
    bg.color = k.rgb(0, 0, 0);

    // create a new list of scenes excluding the last scene
    let availableScenes = scenes.filter(s => s !== lastScene);

    k.wait(1.5).then(() => {
        lastScene = availableScenes[k.randi(0, availableScenes.length)];
        k.go(lastScene);
    });
});

k.scene("pong", () => {
    bgShader.u_strength = 0.25;
    bg.color = k.rgb(8, 8, 114);

    k.setGravity(1600 * k.randi(0, 1)); // randomize gravity for fun

    const TOP_BOUND = 0;
    const BOTTOM_BOUND = k.height();
    const LEFT_BOUND = 0;
    const RIGHT_BOUND = k.width() - sectionWidth / 2;

    // add paddle
    const paddle = k.add([
        k.rect(20, 150),
        k.color(255, 255, 255),
        k.pos(50, k.height() / 2 - 75),
        k.anchor("topleft"),
        k.area(),
        k.body({ isStatic: true }),

        k.layer("game"),
        "paddle"
    ]);

    // add ball
    const ball = k.add([
        k.rect(20, 20),
        k.color(255, 255, 255),
        k.pos(k.width() / 2, k.height() / 2),
        k.anchor("center"),
        k.area(),
        k.body(),

        k.layer("game"),
    ]);

    // ball movement
    let speed = 750;

    let angle = k.rand(Math.PI * 3 / 4, Math.PI * 5 / 4);

    ball.vel.x = Math.cos(angle) * speed;
    ball.vel.y = Math.sin(angle) * speed;

    // ball collision with paddle
    ball.onCollide("paddle", (obj, collision) => {
        score += 10;
        scoreLabel.text = `Score: ${score}`;
        ball.vel.x = -ball.vel.x * 1.2;
        ball.vel.y = ball.vel.y * 1.2;
    });

    // add wasd
    k.onKeyDown("w", () => {
        paddle.pos.y -= 20;
    });
    k.onKeyDown("s", () => {
        paddle.pos.y += 20;
    });

    // constrain paddle to screen
    k.onUpdate(() => {
        if (paddle.pos.y < 0) {
            paddle.pos.y = 0;
        }
        if (paddle.pos.y + paddle.height > k.height()) {
            paddle.pos.y = k.height() - paddle.height;
        }

        // bounce ball off top and bottom and right
        if (ball.pos.y < TOP_BOUND || ball.pos.y > BOTTOM_BOUND) {
            ball.vel.y = -ball.vel.y;
            ball.vel.x *= 1.01;
        }
        if (ball.pos.x > RIGHT_BOUND) {
            ball.vel.x = -ball.vel.x;
        }

        // bounce ball if it hits right side of paddle
        ball.onCollide("paddle", (col) => {
            if (ball.pos.x < paddle.pos.x + paddle.width) {
                ball.vel.x = -ball.vel.x;
            }
        });

        // reset ball if it goes off left side
        if (ball.pos.x < LEFT_BOUND) {
            //gameover
            k.go("static");
        }
    });

    k.wait(10).then(() => {
        k.go("static");
    });
});

k.scene("dash", () => {
    bgShader.u_strength = 0.1;
    bg.color = k.rgb(63, 92, 255);

    k.setGravity(1600);

    const floor = k.add([
        k.rect(k.width(), 100),
        k.color(0, 0, 0),
        k.pos(0, k.height() - 100),
        k.anchor("topleft"),

        k.area(),
        k.body({ isStatic: true }),

        k.layer("game"),
    ]);

    const player = k.add([
        k.rect(50, 50),
        k.color(255, 255, 255),
        k.pos(200, k.height() - 101),
        k.anchor("bot"),

        k.area(),
        k.body(),

        k.layer("game"),
    ]);

    // add wasd
    const JUMP_FORCE = 800;

    k.onKeyPress("w", () => {
        if (player.isGrounded()) {
            player.jump(JUMP_FORCE);
        }
    });

    k.onUpdate(() => {
        //randomly spawn obstacles
        if (Math.random() < 0.02) {
            const obstacle = k.add([
                k.polygon([
                    k.vec2(0, -50),
                    k.vec2(50, 50),
                    k.vec2(-50, 50),
                ]),

                k.color(0, 0, 0),

                k.pos(k.width(), k.height() - 101),
                k.anchor("bot"),

                k.area(),
                k.body({
                    isStatic: true,
                }),

                k.layer("game"),
                "obstacle"
            ]);
        }

        // move obstacles to the left
        k.get("obstacle").forEach((o) => {
            o.pos.x -= 10;

            // destroy if off screen
            if (o.pos.x < 0) {
                score++; // increase score for dodging
                scoreLabel.text = `Score: ${score}`;
                k.destroy(o);
                return;
            }

            // if the player passes the obstacle, increase score
            if (!o.passed && o.pos.x < player.pos.x) {
                score++;
                scoreLabel.text = `Score: ${score}`;
                o.passed = true;
            }

            // if the player collides with the obstacle, end the game
            player.onCollide("obstacle", (obj, collision) => {
                k.go("static");
            });
        });
    });

    k.wait(10).then(() => {
        k.go("static");
    });
})

k.scene("spacefight", () => {
    bgShader.u_strength = 0.3;
    bg.color = k.rgb(0, 0, 0);

    // spacefight game here
    const player = k.add([
        k.rect(50, 20),
        k.color(0, 255, 0),
        k.pos(200, k.height() / 2),
        k.anchor("center"),

        k.area(),
        k.body({ isStatic: true }),

        k.layer("game"),
    ]);

    // add wasd
    k.onKeyDown("w", () => {
        player.pos.y -= 10;
    });
    k.onKeyDown("s", () => {
        player.pos.y += 10;
    });
    k.onKeyDown("a", () => {
        player.pos.x -= 10;
    });
    k.onKeyDown("d", () => {
        player.pos.x += 10;
    });

    const RIGHT_BOUND = k.width() - sectionWidth / 2;
    k.onUpdate(() => {
        // constrain player to screen

        if (player.pos.y < 0) {
            player.pos.y = 0;
        }
        if (player.pos.y > k.height()) {
            player.pos.y = k.height();
        }
        if (player.pos.x < 0) {
            player.pos.x = 0;
        }
        if (player.pos.x > RIGHT_BOUND) {
            player.pos.x = RIGHT_BOUND;
        }

        // fire bullets

        if (k.time() % 0.2 < 0.02) {
            k.add([
                k.rect(10, 4),
                k.color(255, 0, 0),
                k.pos(player.pos.x + 25, player.pos.y),
                k.anchor("center"),

                k.area(),

                k.layer("game"),

                "bullet",
            ]);
        }


        k.get("bullet").forEach((b) => {
            b.pos.x += 15;
            if (b.pos.x > RIGHT_BOUND) {
                k.destroy(b);
            }
        });

        // randomly spawn enemies
        if (Math.random() < 0.02) {
            const enemy = k.add([
                k.rect(40, 40),
                k.color(255, 0, 0),
                k.pos(k.width(), k.rand(0, k.height())),
                k.anchor("center"),

                k.area(),

                k.layer("game"),
                "enemy"
            ]);
        }

        // move enemies to the left
        k.get("enemy").forEach((e) => {
            e.pos.x -= 5;

            // destroy if off screen
            if (e.pos.x < 0) {
                k.destroy(e);
                return;
            }

            // if the player collides with the enemy, end the game
            player.onCollide("enemy", (obj, collision) => {
                k.go("static");
            });
        });
    });

    // if a bullet collides with the enemy, destroy both
    k.onCollide("bullet", "enemy", (bullet, enemy, collision) => {
        score += 5;
        scoreLabel.text = `Score: ${score}`;
        k.destroy(bullet);
        k.destroy(enemy);
    });

    k.wait(10).then(() => {
        k.go("static");
    });
});

k.scene("flappy", () => {
    bgShader.u_strength = 0.1;
    bg.color = k.rgb(135, 206, 235);

    k.setGravity(800);
    const TOP_BOUND = 0;
    const BOTTOM_BOUND = k.height();
    const LEFT_BOUND = 0;
    const RIGHT_BOUND = k.width() - sectionWidth / 2;

    // add player
    const player = k.add([
        k.rect(40, 30),
        k.color(255, 255, 0),
        k.pos(100, k.height() / 2),
        k.anchor("center"),
        k.area(),
        k.body(),

        k.layer("game"),
    ]);

    // add jump on space
    const JUMP_FORCE = 400;
    k.onKeyPress("w", () => {
        player.vel.y = -JUMP_FORCE;
    });

    // constrain player to screen
    const gapHeight = 200;
    const pipeWidth = 80;
    const pipeX = k.width();
    let pipeTimeout = 0;
    k.onUpdate(() => {
        if (player.pos.y < TOP_BOUND) {
            player.pos.y = TOP_BOUND;
            player.vel.y = 0;
        }
        if (player.pos.y > BOTTOM_BOUND) {
            player.pos.y = BOTTOM_BOUND;
            player.vel.y = 0;
        }
        if (player.pos.x < LEFT_BOUND) {
            player.pos.x = LEFT_BOUND;
            player.vel.x = 0;
        }
        if (player.pos.x > RIGHT_BOUND) {
            player.pos.x = RIGHT_BOUND;
            player.vel.x = 0;
        }

        // spawn pipes
        if (k.rand(0, 1) < 0.02 && pipeTimeout <= 0) {
            const gapY = k.rand(100, k.height() - 100 - gapHeight);

            pipeTimeout = 60; // wait before spawning another pipe to prevent overlap

            const topPipe = k.add([
                k.rect(pipeWidth, gapY),
                k.color(0, 255, 0),
                k.pos(pipeX, 0),
                k.anchor("topleft"),
                k.area(),
                k.body({ isStatic: true }),

                k.layer("game"),

                "pipe"
            ]);

            const bottomPipe = k.add([
                k.rect(pipeWidth, k.height() - gapY - gapHeight),
                k.color(0, 255, 0),
                k.pos(pipeX, gapY + gapHeight),
                k.anchor("topleft"),
                k.area(),
                k.body({ isStatic: true }),

                k.layer("game"),

                "pipe"
            ]);
        } else {
            pipeTimeout--;
        }

        // move pipes to the left
        k.get("pipe").forEach((p) => {
            p.pos.x -= 5;

            // score player for passing pipe
            if (!p.passed && p.pos.x < player.pos.x) {
                score += 5;
                scoreLabel.text = `Score: ${score}`;
                p.passed = true;
            }

            // destroy if off screen
            if (p.pos.x < -pipeWidth) {
                k.destroy(p);
            }

            // if the player collides with the pipe, end the game
            player.onCollide("pipe", (obj, collision) => {
                k.go("static");
            });
        });
    });

    k.wait(10).then(() => {
        k.go("static");
    });
});

k.scene("pushup", () => {
    bgShader.u_strength = 0.1;
    bg.color = k.rgb(201, 110, 6);

    k.setGravity(0);

    // pushup game here
    const player = k.add([
        k.rect(40, 30),
        k.color(255, 255, 255),
        k.pos(k.width() / 2, (k.height() - 300)),
        k.anchor("center"),
        k.area(),
        k.body(),

        k.layer("game"),
    ]);

    k.onKeyDown("w", () => {
        player.pos.y -= 10;
    });
    k.onKeyDown("s", () => {
        player.pos.y += 10;
    });
    k.onKeyDown("a", () => {
        player.pos.x -= 10;
    });
    k.onKeyDown("d", () => {
        player.pos.x += 10;
    });

    const TOP_BOUND = 0;
    const BOTTOM_BOUND = k.height();
    const LEFT_BOUND = 0;
    const RIGHT_BOUND = k.width() - sectionWidth / 2;

    const barWidth = k.width();
    const barHeight = 60;
    const barGap = 200;
    let barTimeout = 0;

    k.onUpdate(() => {
        // constrain player to screen
        if (player.pos.y < TOP_BOUND) {
            player.pos.y = TOP_BOUND;
        }
        if (player.pos.y > BOTTOM_BOUND) {
            player.pos.y = BOTTOM_BOUND;
            //gameover
            k.go("static");
        }
        if (player.pos.x < LEFT_BOUND) {
            player.pos.x = LEFT_BOUND;
        }
        if (player.pos.x > RIGHT_BOUND) {
            player.pos.x = RIGHT_BOUND;
        }

        if (barTimeout <= 0) {
            barTimeout = 30; // wait before spawning another bar to prevent overlap
            const offset = k.rand(-300, 300);

            const leftBar = k.add([
                k.rect(barWidth / 2 - barGap + offset, barHeight),
                k.color(0, 0, 0),
                k.pos(0, -barHeight),
                k.anchor("botleft"),
                k.area(),
                k.body({ isStatic: true }),
                
                k.layer("game"),
                "bar"
            ]);
            
            const rightBar = k.add([
                k.rect(barWidth / 2 - barGap / 2, barHeight),
                k.color(0, 0, 255),
                k.pos(barWidth / 2 + barGap * 4 + offset, -barHeight),
                k.anchor("botright"),
                k.area(),
                k.body({ isStatic: true }),
                
                k.layer("game"),
                "bar"
            ]);
        } else {
            barTimeout--;
        }

        // move bars down
        k.get("bar").forEach((b) => {
            b.pos.y += 10;
            
            // score player for passing bar
            if (!b.passed && b.pos.y + barHeight < player.pos.y) {
                score += 2;
                scoreLabel.text = `Score: ${score}`;
                b.passed = true;
            }
            
            // destroy if off screen
            if (b.pos.y < -barHeight) {
                k.destroy(b);
            }
        });
    });

    k.wait(10).then(() => {
        k.go("static");
    });
});

k.go("static");