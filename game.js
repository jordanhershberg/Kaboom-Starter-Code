// Initialize the Kaboom context.
kaboom({
    width: 800,
    height: 600,
    background: [0, 100, 200],
});

// Set the global gravity value for all physics objects.
setGravity(800);

// --- Load Assets ---
// For Day 1, we only need the player's sprite.
loadSprite("apple", "https://kaboomjs.com/sprites/apple.png");
//Enemy Sprite
loadSprite("enemy","https://kaboomjs.com/sprites/gigagantrum.png");


// --- Main Game Scene ---
scene("main", () => {

    // --- The Level Design ---
    const levelLayout = [
        "                    ",
        "                    ",
        "    =         =     ",
        "                    ",
        "  =       =      =  ",
        "                    ",
        "====================",
    ];

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
            ],
        }
    };

    addLevel(levelLayout, levelConf);

    // --- The Player Character ---
    const player = add([
        sprite("apple"),
        pos(100, 100),
        area({ scale: 0.7 }),
        body(),
        "player",
    ]);

//The Enemy Patrol
    function patrol(){
        return{
            id:"patrol",
            require: ["pos","area"],
            dir: -1,
            update(){
                this.move(60 * this.dir, 0);    
            },
            //This next even will flip direction if the enemy collides with something
            add(){
                this.onCollide((Object, col) =>{
                    if (col.isLeft() || col.isRight()){
                        this.dir = -this.dir;
                    }
                 });
                },
            };
        }

    // Add enemy to the scene
    const enemy = add([
        sprite("enemy"),
        pos(600,200), //Start position for the enemy
        area(),
        body(),
        patrol(), //Use the patrol function we just defined
        "enemy"
    ]);



    // --- Player Controls & Interactions ---
    onKeyDown("left", () => {
        player.move(-200, 0);
    });

    onKeyDown("right", () => {
        player.move(200, 0);
    });

    onKeyPress("space", () => {
        if (player.isGrounded()) {
            player.jump(650);
        }
    });

        //Collision Detection
    player.onCollide("enemy",(enemy,col) =>{
        if (col.isBottom()){
            destroy(enemy);
            player.jump(300);
        }
        else {
            destroy(player);
            go("lose")
        }
    });

});

//--Game Over Scene
scene("lose", () => {
    add([
        text("Game Over"),
        pos(center()),
        anchor("center"),
    ]);
});


// Start the game
go("main");


