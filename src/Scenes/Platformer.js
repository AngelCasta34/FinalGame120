class Platformer extends Phaser.Scene {
    constructor() {
        super("platformerScene");
    }

    init() {
        this.ACCELERATION      = 100;
        this.DRAG              = 5000;
        this.physics.world.gravity.y = 150;
        this.JUMP_VELOCITY     = -150;
        this.PARTICLE_VELOCITY = 50;
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
        if (!this.bgm) {
            this.bgm = this.sound.add("bgm", { volume: 0.5, loop: true });
            this.bgm.play();
        }

        // 4) PLAYER
        const spawn = this.map.findObject("Objects", o => o.name === "Spawn");
        this.my = { sprite: {}, vfx: {} };
        this.my.sprite.player = this.physics.add
            .sprite(spawn.x, spawn.y, "platformer_characters", "tile_0000.png")
            .setOrigin(0.5, 1)
            .setScale(0.5)
            .setCollideWorldBounds(true);

        // Collide & overlap
        this.physics.add.collider(this.my.sprite.player, this.groundLayer);
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

        // 5) INPUT
        this.aKey     = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.dKey     = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.rKey     = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
        this.fKey     = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
        this.input.keyboard.on('keydown-F', () => {
            this.physics.world.drawDebug = !this.physics.world.drawDebug;
            this.physics.world.debugGraphic.clear();
        });

        // 6) WALK VFX
        this.my.vfx.walking = this.add.particles(0, 0, "kenny-particles", {
            frame:    ['smoke_03', 'smoke_09'],
            scale:    { start: 0.015, end: 0.05 },
            lifespan: 350,
            alpha:    { start: 1, end: 0.1 },
        }).stop();

        // 7) EXIT OBJECTS
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
                    this.scene.start("endScene");
                }
            }
        );
/*
        // 8) ENEMY BEES
        this.beeGroup = this.physics.add.group({
            allowGravity: false,
            collideWorldBounds: true,
            bounceX: 1
        });

        // Spawn the initial wave of bees
        this.spawnBees(TILE_W, TILE_H, spawn.y);

        // Collide bees with groundLayer so they remain at chosen y
        this.physics.add.collider(this.beeGroup, this.groundLayer);

        // Overlap player with bees → restart
        this.physics.add.overlap(
            p,
            this.beeGroup,
            () => this.scene.restart()
        );
*/
        // 9) BULLET GROUP 
        this.bulletGroup = this.physics.add.group({
            allowGravity: false,
            collideWorldBounds: false
        });

        // Destroy bullet when it hits the ground
        this.physics.add.collider(this.bulletGroup, this.groundLayer, bullet => {
            bullet.destroy();
        });

        // Destroy bee when hit by bullet, and destroy bullet
        this.physics.add.overlap(
            this.bulletGroup,
            this.beeGroup,
            (bullet, bee) => {
                bullet.destroy();
                bee.destroy();

                // If all bees are gone, spawn a fresh wave
                if (this.beeGroup.countActive(true) === 0) {
                    this.spawnBees(TILE_W, TILE_H, spawn.y);
                }
            }
        );

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

        // 10) CAMERA
        this.cameras.main
            .setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels)
            .startFollow(this.my.sprite.player, true, 0.25, 0.25)
            .setDeadzone(50, 50)
            .setZoom(this.SCALE);
    }
/*
    // Spawns a wave of bees at random positions
    spawnBees(TILE_W, TILE_H, spawnY) {
        const minY = TILE_H * 4;
        const maxY = spawnY - TILE_H * 2;

        for (let i = 0; i < this.BEES_PER_WAVE; i++) {
            const bx = Phaser.Math.Between(TILE_W, this.map.widthInPixels - TILE_W);
            const by = Phaser.Math.Between(minY, maxY);
            const bee = this.beeGroup.create(bx, by, 'platformer_characters', 'tile_0024.png')
                .setOrigin(0.5, 1)
                .setScale(0.5)
                .play('beeFly');
            bee.body.setVelocityX(Phaser.Math.Between(20, 40));
        }
    }
*/
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

        // restart current scene
        if (Phaser.Input.Keyboard.JustDown(this.rKey)) this.scene.restart();
    }
}

window.Platformer = Platformer;
