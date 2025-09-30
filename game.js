// Initialize the Kaboom context.
kaboom({
    width: 1100,
    height: 750,
    background: [0, 100, 200],
});

// Set the global gravity value for all physics objects.
setGravity(800);

// --- Load Assets ---
loadSprite("dino", "https://kaboomjs.com/sprites/dino.png");
loadSprite("enemy", "https://kaboomjs.com/sprites/gigagantrum.png");
loadSprite("egg", "https://kaboomjs.com/sprites/egg.png");
loadSprite("door", "https://kaboomjs.com/sprites/door.png");

// --- Define Custom Components ---
// By defining patrol() here, it's globally available and can be used by any scene.

function patrol() {
    return {
        id: "patrol",
        require: [ "pos", "area" ],
        dir: 1,
        add() {
            this.onCollide((obj, col) => {
                if (col.isLeft() || col.isRight()) {
                    this.dir = -this.dir;
                }
            });
        },
        update() {
            this.move(60 * this.dir, 0);
        },
    };
}


// --- Main Game Scene ---
scene("main", ({ level } = { level: 0 }) => {

    // Array of all level layouts
    const LEVELS = [
        [
            "   $           ^  D    ",
            "             $  =======",
            "     ==                ",
            " =       $  ==         ",
            "      ^        $       ",
            " $                     ",
            "=======================",
        ],
        [
            " $                     ",
            " =              =      ",
            "      ==    ========   ",
            "      =  ^^^   =       ",
            "      =$$$$$$$$=       ",
            "      =$$$$$$$$=  D    ",
            "====================   ",
        ]
    ];

    const currentLevel = level;

    // Configure what each symbol in the level layout means.
    const levelConf = {
        tileWidth: 47,
        tileHeight: 47,
        tiles: {
            " ": () => [],
            "=": () => [
                rect(47, 47),
                color(0, 200, 0),
                area(),
                body({ isStatic: true }),
                "platform",
            ],
            "$": () => [
                sprite("egg"),
                area(),
                "egg",
            ],
            "D": () => [
                sprite("door"),
                area(),
                "door",
            ],
            // This now correctly uses the globally-defined patrol() function.
            "^": () => [
                sprite("enemy"),
                area(),
                body(),
                patrol(),
                "enemy",
            ],
        }
    };

    addLevel(LEVELS[currentLevel], levelConf);

    // --- Score & UI ---
    let score= 0;
    const scoreLabel =add([
        text("egg SCORE:" + score),
        pos(24,24),
        fixed(),
    ])

    // --- The Player Character ---
    const player = add([
        sprite("dino"),
        pos(100, 100),
        area({ scale: 0.7 }),
        body(),
        timer(),
        "player",
    ]);

    // --- Player Controls & Interactions ---
    onKeyDown("left", () => { player.move(-200, 0); });
    onKeyDown("right", () => { player.move(200, 0); });
    onKeyPress("space", () => { if (player.isGrounded()) { player.jump(650); } });

    //--egg Collecting Logic--
    player.onCollide("egg", (egg) =>{
        destroy(egg);
        score+= 1000;
        scoreLabel.text = "egg SCORE: " + score;

    });

    player.onCollide("enemy", (enemy, col) => {
        if (col.isBottom()) {
            destroy(enemy);
            player.jump(300);
        } else {
            player.opacity = 0.5;
            wait(1, () => {
                player.onCollide("enemy", (enemy, col) => {
                if (col.isLeft() || col.isRight()) {
                go("lose");
                }
                });
            });
        }
    });  
    player.onCollide("door", () => {
    if (currentLevel + 1 < LEVELS.length) {
        go("main", { level: currentLevel + 1 });
    } else {
        go("win");
    }   
});
});



// --- Lose Scene ---
scene("lose", () => {
    add([ text("Game Over"), pos(center()), anchor("center") ]);
    wait(2, () => { go("main", { level: 0 }); });
});

// --- Win Scene ---
scene("win", () => {
    add([ text("You Win!"), pos(center()), anchor("center") ]);
    wait(2, () => { go("main", { level: 0 }); });
});


// Start the game
go("main");
