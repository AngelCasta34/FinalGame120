class Level1 extends Phaser.Scene {
    constructor() {
        super("platformerScene1");
    }

    init() {
        this.ACCELERATION      = 100;
        this.DRAG              = 5000;
        this.physics.world.gravity.y = 300;
        this.JUMP_VELOCITY     = -150;
        this.PARTICLE_VELOCITY = 10;
        this.SCALE             = 5;

        // Bullet speed (px/s)
        this.BULLET_SPEED      = 200;

        // Number of bees per wave
        this.BEES_PER_WAVE     = 6;
    }

    create() {
        // 1) TILEMAP + GROUND
        const TILE_W = 9, TILE_H = 9;
        this.map = this.add.tilemap("platformer-level-1", TILE_W, TILE_H, 45, 25);
        this.tileset = this.map.addTilesetImage("kenny_tilemap_packed", "tilemap_tiles");
        this.groundLayer = this.map.createLayer("Ground-n-Platforms", this.tileset, 0, 0);
        this.groundLayer.setCollisionByProperty({ collides: true });
        this.triggerLayer = this.map.createLayer("Triggers", this.tileset, 0, 0);
        this.triggerLayer.setCollisionByProperty({ collides: true });

        // 2) Keys
        this.keyGroup = this.physics.add.staticGroup();
        const keyObjects = this.map.getObjectLayer("Objects").objects
            .filter(o => o.name === "key" && o.gid);
        const firstGid = this.map.tilesets[0].firstgid;

        // Track total number of keys and how many collected
        this.totalKeys = keyObjects.length;
        this.keyCount  = 0;

        keyObjects.forEach(o => {
            const frameIndex = o.gid - firstGid;
            const key = this.keyGroup.create(
                o.x + TILE_W / 2,
                o.y,
                "tilemap_sheet",
                frameIndex
            );
            key.setOrigin(0.5, 1);
        });

        // 3) PLAY BACKGROUND MUSIC
        if (!bgm) {
            bgm = this.sound.add("bgm", { volume: 0.5, loop: true });
            bgm.play();
        }

        // 4) Hidden Tiles
        //Create Hidden Platforms
        // Blue Vine and Platforms
        this.growBlue = this.groundLayer.filterTiles((tile) => {
            if (tile.properties.grow == "blue") {
                return true;
            } else {
                return false;
            }
        });
        // set to invisible -- switch will control visibility
        for (let tile of this.growBlue) {
            tile.visible = false;
        }
        //Yellow Tree path
        this.growYellow = this.groundLayer.filterTiles((tile) => {
            if (tile.properties.grow == "yellow") {
                return true;
            } else {
                return false;
            }
        });
        // set to invisible -- switch will control visibility
        for (let tile of this.growYellow) {
            tile.visible = false;
        }
        //Pink Tree path
        this.growPink = this.groundLayer.filterTiles((tile) => {
            if (tile.properties.grow == "pink") {
                return true;
            } else {
                return false;
            }
        });
        // set to invisible -- switch will control visibility
        for (let tile of this.growPink) {
            tile.visible = false;
        }

        // 5) PLAYER
        let spawn = this.map.findObject("Objects", o => o.name === "Spawn");
        this.my = { sprite: {}, vfx: {} };
        this.my.sprite.player = this.physics.add
            .sprite(spawn.x, spawn.y, "platformer_characters", "tile_0000.png")
            .setOrigin(0.5, 1)
            .setScale(0.5)
            .setCollideWorldBounds(true);
    

        // 6) Collision & overlap
        // Checks to for conditions under which collision detection won't run
        let collisionProcess = (obj1, obj2) => {

            // Invisible tiles don't affect the player or bullets
            if (!obj2.visible) {
                return false;
            }

            return true;

        }

        // Handles player collisions based on tile property values
        let propertyCollider = (obj1, obj2) => {

            // Handle intersection with dangerous tiles
            if (obj2.properties.hazard) {
                // Collided with a danger tile, handle collision
                playerScore = 0;
                this.scene.restart();
            }

        }
        //Handles bullet colisions with ground
        let propertyColliderDestroy  = (obj1, obj2) => {

            // Handle intersection with ground tiles
            if(obj2.visible){
                obj1.destroy();
            }

        }
        // Handles bullet collisions with triggers based on tile property values
        let propertyColliderTriggers = (obj1, obj2) => {
            // Handle intersection with trigger tiles

            //Hit blue trigger
            if (obj2.properties.hitBlue) {
                obj1.destroy(); //Destroy Bullet
                obj2.visible = false;   //Hide trigger

                //Make Blue tiles visible
                for (let tile of this.growBlue) {
                    tile.visible = true;
                }
            }

            //Hit red trigger
            if (obj2.properties.hitRed) {
                obj1.destroy(); //Destroy Bullet
                obj2.visible = false;   //Hide trigger
                
                //Create Coins when a trigger is hit
                this.coinGroup = this.physics.add.staticGroup();
                const coinObjects = this.map.getObjectLayer("Objects").objects.filter(o => o.name === "coin" && o.gid);
                coinObjects.forEach(o => {
                    const frameIndex = o.gid - firstGid;
                    this.coinGroup.create(
                        o.x + TILE_W / 2,
                        o.y,
                        "tilemap_sheet",
                        frameIndex
                    )
                    .setOrigin(0.5, 1);
                });

                let totalCoins = coinObjects.length;
                let coinCount = 0;
                
                //Coin overlap is here so that it actually works for hidden objects
                this.physics.add.overlap(
                    this.my.sprite.player,
                    this.coinGroup,
                    (player, coin) => {
                        coin.destroy();
                        this.sound.play("sfx-key");
                        playerScore += 10;
                        coinCount++;
                        if(coinCount >= totalCoins){
                            playerScore += 50;
                        }
                    }
                );
            }

            //Hit black trigger
            if (obj2.properties.hitBlack) {
                obj1.destroy(); //Destroy Bullet
                obj2.visible = false;   //Hide trigger

                //Make Yellow and Pink tiles visible
                for (let tile of this.growYellow) {
                    tile.visible = true;
                }
                for (let tile of this.growPink) {
                    tile.visible = true;
                }
            }

        }
        
        //Player and ground colider
        this.physics.add.collider(this.my.sprite.player, this.groundLayer, propertyCollider, collisionProcess);
        //Key overlap
        this.physics.add.overlap(
            this.my.sprite.player,
            this.keyGroup,
            (player, key) => {
                key.destroy();
                this.sound.play("sfx-key");
                this.keyCount++;
            }
        );

        // 7) INPUT
        this.aKey     = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.dKey     = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.rKey     = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
        this.fKey     = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
        this.input.keyboard.on('keydown-F', () => {
            this.physics.world.drawDebug = !this.physics.world.drawDebug;
            this.physics.world.debugGraphic.clear();
        });

        // 8) WALK VFX
        this.my.vfx.walking = this.add.particles(0, 0, "kenny-particles", {
            frame:    ['smoke_03', 'smoke_09'],
            scale:    { start: 0.015, end: 0.05 },
            lifespan: 350,
            alpha:    { start: 1, end: 0.1 },
        }).stop();

        // 9) EXIT OBJECTS
        this.exitGroup = this.physics.add.staticGroup();
        const exitObjects = this.map.getObjectLayer("Objects").objects
            .filter(o => o.name === "Exit" && o.gid);
        exitObjects.forEach(o => {
            const frameIndex = o.gid - firstGid;
            this.exitGroup.create(
                o.x + TILE_W / 2,
                o.y,
                "tilemap_sheet",
                frameIndex
            )
            .setOrigin(0.5, 1);
        });

        // Only allow exit overlap if all keys collected
        const p = this.my.sprite.player;
        this.physics.add.overlap(
            p,
            this.exitGroup,
            () => {
                if (this.keyCount >= this.totalKeys) {
                    this.scene.start("platformerScene2");
                }
            }
        );

        // 10) BULLET GROUP 
        this.bulletGroup = this.physics.add.group({
            allowGravity: false,
            collideWorldBounds: false
        });

        // Destroy bullet when it hits the ground
        this.physics.add.collider(this.bulletGroup, this.groundLayer, propertyColliderDestroy, collisionProcess);

        //Collision with Bullet and Environment
        this.physics.add.collider(this.bulletGroup, this.triggerLayer, propertyColliderTriggers, collisionProcess);

        // On mouse click, fire a bullet toward that point
        this.input.on('pointerdown', pointer => {
            const player  = this.my.sprite.player;
            const startX  = player.x;
            const startY  = player.y - player.displayHeight / 2;
            const targetX = pointer.worldX;
            const targetY = pointer.worldY;

            // Spawn bullet at player’s position
            const bullet = this.bulletGroup.create(startX, startY, 'bullet')
                .setScale(0.3)
                .setDepth(1);

            // Compute direction vector
            const dx = targetX - startX;
            const dy = targetY - startY;
            const mag = Math.sqrt(dx*dx + dy*dy);

            // Normalize and apply speed
            const velX = (dx / mag) * this.BULLET_SPEED;
            const velY = (dy / mag) * this.BULLET_SPEED;

            bullet.body.setVelocity(velX, velY);

            // Destroy bullet once it leaves world bounds
            bullet.body.setCollideWorldBounds(true);
            bullet.body.onWorldBounds = true;
            this.physics.world.on('worldbounds', body => {
                if (body.gameObject === bullet) {
                    bullet.destroy();
                }
            });
        });

        // 11) CAMERA
        this.cameras.main
            .setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels)
            .startFollow(this.my.sprite.player, true, 0.25, 0.25)
            .setDeadzone(50, 50)
            .setZoom(this.SCALE);

        // 12) HUD elements
        //Create Score Text
        this.scoreBoard = this.add.text(this.my.sprite.player.x, this.my.sprite.player.y+5, 'Score: ' + playerScore,
            { 
               fontFamily: 'Indie Flower',
               fontSize: '12px',
            }).setOrigin(0.5);

        this.keyTracker = this.add.text(this.my.sprite.player.x, this.my.sprite.player.y+15, this.keyCount + '/' + this.totalKeys,
            { 
               fontFamily: 'Indie Flower',
               fontSize: '12px',
            }).setOrigin(0.5);
        my.sprite.keyIcon = this.add.sprite(this.my.sprite.player.x-15, this.my.sprite.player.y+15, "key");
        my.sprite.keyIcon.setScale(1);
    }

    update() {
        const p   = this.my.sprite.player;
        const vfx = this.my.vfx.walking;

        // left/right movement
        if (this.aKey.isDown) {
            p.setAccelerationX(-this.ACCELERATION);
            p.resetFlip();
            p.anims.play('walk', true);
            vfx.startFollow(p, (p.displayWidth / 2) - 5, p.displayHeight / 2 - 5);
            vfx.setParticleSpeed(this.PARTICLE_VELOCITY, 0);
            if (p.body.blocked.down) vfx.start();

        } else if (this.dKey.isDown) {
            p.setAccelerationX(this.ACCELERATION);
            p.setFlip(true, false);
            p.anims.play('walk', true);
            vfx.startFollow(p, (-p.displayWidth / 2) + 5, p.displayHeight / 2 - 5);
            vfx.setParticleSpeed(-this.PARTICLE_VELOCITY, 0);
            if (p.body.blocked.down) vfx.start();

        } else {
            p.setAccelerationX(0);
            p.setDragX(this.DRAG);
            p.anims.play('idle');
            vfx.stop();
        }

        // jump
        if (!p.body.blocked.down) p.anims.play('jump');
        if (p.body.blocked.down && Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            p.body.setVelocityY(this.JUMP_VELOCITY);
        }

        //Update HUD elements
        //Score
        this.scoreBoard.x = p.x;
        this.scoreBoard.y = p.y+5;
        this.scoreBoard.setText('Score: ' + playerScore);

        //Keys
        this.keyTracker.x = p.x;
        this.keyTracker.y = p.y+15;
        this.keyTracker.setText(this.keyCount + '/' + this.totalKeys);
        my.sprite.keyIcon.x = p.x-15;
        my.sprite.keyIcon.y = p.y+15;

        // restart current scene
        if (Phaser.Input.Keyboard.JustDown(this.rKey)) this.scene.restart();
    }
}

window.Platformer = Platformer;
