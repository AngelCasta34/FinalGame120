class Load extends Phaser.Scene {
    constructor() {
        super("loadScene");
    }

    preload() {
        this.load.setPath("./assets/");

        // Load characters spritesheet
        this.load.atlas("platformer_characters", "tilemap-characters-packed.png", "tilemap-characters-packed.json");

        // Load tilemap information
        this.load.image("tilemap_tiles", "tilemap_packed.png");                        
        this.load.tilemapTiledJSON("platformer-level-1", "platformer-level-1.tmj");
        this.load.tilemapTiledJSON("platformer-level-2", "platformer-level-2.tmj");     

        // Load the tilemap as a spritesheet
        this.load.spritesheet("tilemap_sheet", "tilemap_packed.png", {
            frameWidth: 9,
            frameHeight: 9
        });

        this.load.multiatlas("kenny-particles", "kenny-particles.json");

        // Sound effects
        this.load.audio("sfx-key", "forceField_000.ogg");
        this.load.audio("sfx-bullet", "drop_004.ogg")

        // Background music
        this.load.audio("bgm", "menu-music-251877.mp3");

        // Bullet image for mouse shooting
        this.load.image("bullet", "ballBlue_09.png");

        //Key image for scoreboard purposes
        this.load.image("key", "tile_0066.png");
    }

    create() {
        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNames('platformer_characters', {
                prefix: "tile_",
                start: 0,
                end: 1,
                suffix: ".png",
                zeroPad: 4
            }),
            frameRate: 15,
            repeat: -1
        });

        this.anims.create({
            key: 'idle',
            defaultTextureKey: "platformer_characters",
            frames: [
                { frame: "tile_0000.png" }
            ],
            repeat: -1
        });

        this.anims.create({
            key: 'jump',
            defaultTextureKey: "platformer_characters",
            frames: [
                { frame: "tile_0001.png" }
            ],
        });

        this.scene.start("startMenu");
    }

    // Never get here since a new scene is started in create()
    update() {}
}

window.Load = Load;
