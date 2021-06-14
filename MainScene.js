class MainScene extends Phaser.Scene {
    constructor() {
        super("MainScene");
        // Username, implement later
        this.username = "";

        //create BGM
        this.mainBGM = null;
        this.bossBGM = null;

        //Create SFX
        this.laserSFX = null;
        this.laserSFX2 = null;
        this.boomSFX = null;

        //create boss sfx
        this.bossSFX = null;
        this.winSFX = null;
        this.loseSFX = null;

        //create pBGs
        this.pBG1 = null;
        this.pBG2 = null;

        // Player object
        this.player = null;
        // Player Attributes
        this.playerLives = 3;
        this.playerHealth = 1;
        this.playerShield = 0;
        this.plySpd = 400;
        this.alive = true;
        // Joystick object
        this.joystick = null;
        // Shooting variables
        this.shooting = false;
        this.lastShot = 0;
        // Time between player shots in ms
        this.shotTimeout = 150;
        // Lists of stuff
        this.enemies = null;
        this.bosses = null;
        this.lasers = null;
        this.eLasers = null;
        // Timing of enemy spawns
        this.lastSpawned = 0;
        this.spawnTime = 3000;
        this.minSpawnTime = 800;
        // Progression Variables
        this.stage = 1;
        this.killCount = 0;
        this.goal = 25;
        // Variable to mark if the game is over
        this.gameOver = false;
        //Variable to mark boss battle
        this.boss = false;
        this.bossCreated = false;
        this.bossHP = 50;
        // Score counter
        this.score = 0;
        this.scoreText = null;
        // Life Counter
        this.lifeText = null;
        this.healthText = null;
        this.shieldText = null;

        // Firebase stuff
        this.database = firebase.firestore();
        this.scoreTable = this.database.collection('highscores');
    }

    init(data) {
        // Get the username from the title screen
        this.username = data.username;
    }

    //should be not needed
    preload() {
        // Loading enemy ships
        this.load.spritesheet('EnemyM', './assets/enemy-medium.png', {
            frameWidth: 32,
            frameHeight: 16
        });
    }

    create() {
        //set bgm
        this.mainBGM = this.sound.add("MainTheme", {
            volume: .05,
            loop: true
        });
        this.bossBGM = this.sound.add("BossTheme", {
            volume: .05,
            loop: true
        });
        
        //play bgm
        this.mainBGM.play();

        //set sfx
        this.laserSFX = this.sound.add("laser", {
            volume: .05
        });
        this.laserSFX2 = this.sound.add("laser2", {
            volume: .05
        });
        this.bossSFX = this.sound.add("treasure", {
            volume: .1
        });
        this.winSFX = this.sound.add("Victory", {
            volume: .1
        });
        this.loseSFX = this.sound.add("Defeat", {
            volume: .1
        });
        this.boomSFX = this.sound.add("bomb", {
            volume: .25
        });

        //set background
        this.pBG1 = this.add.tileSprite(225,0,450,800,"bg");
        this.pBG1.setOrigin(0.5,0);
        this.pBG2 = this.add.tileSprite(225,0,450,800,"bg2");
        this.pBG2.setOrigin(0.5,0);

        // Create the text for keeping track of score
        this.scoreText = this.add.text(440, 20, `${this.score}`, {
            fontFamily: 'Zen',
            fontSize: '40px'
        }).setOrigin(1,0.5);
        this.lifeText = this.add.text(225,750, `Lives: ${this.playerLives}`, {
            fontFamily: "Zen",
            fontSize: '20px',
        }).setOrigin(0.5);
        this.healthText = this.add.text(10, 20, `Health: ${this.playerHealth}`, {
            fontFamily: 'Zen',
            fontSize: '20px'
        }).setOrigin(0,0.5);
        this.shieldText = this.add.text(10, 40, `Shield: ${this.playerShield}`, {
            fontFamily: 'Zen',
            fontSize: '20px'
        }).setOrigin(0,0.5);

        // Create player object
        this.createPlayer();
        // A virtual joystick for moving the player
        this.joystick = new VirtualJoystick(this, 60, 740, 50);
        // Set up the shooting controls
        this.createShootingControls();
        // Fix laser collisions
        this.lasers = this.add.group();
        this.eLasers = this.add.group();
        this.enemies = this.physics.add.group();
        this.bosses = this.physics.add.group();
        //remove laser on collision
        this.physics.add.overlap(this.lasers, this.enemies, this.hitEnemy, null, this);
        this.physics.add.overlap(this.lasers, this.bosses, this.hitBoss, null, this);
        this.physics.add.overlap(this.eLasers, this.player, this.hitPlayer, null, this);
        this.physics.add.overlap(this.player, this.enemies, this.hitPlayer, null, this);
    }

    update() {
        // Update the text
        this.scoreText.setText(`${this.score}`);
        this.lifeText.setText(`Lives: ${this.playerLives}`);
        this.healthText.setText(`Health: ${this.playerHealth}`);
        this.shieldText.setText(`Shield: ${this.playerShield}`);
        // Handle player movement
        this.player.setVelocity(this.joystick.joyX() * this.plySpd, 0);

        // If the player is holding the button, shoot
        if (this.shooting && this.now() > this.lastShot + this.shotTimeout) {
            this.shootLaser();
            this.lastShot = this.now();
        }
        // Update Lasers out of bounds
        for(let l = 0; l < this.lasers.getChildren().length; l++){
            let laser = this.lasers.getChildren()[l];
            laser.update();
        }
        for(let el = 0; el < this.eLasers.getChildren().length; el++){
            let eLaser = this.eLasers.getChildren()[el];
            eLaser.update();
        }
        // Check for spawning enemies
        if (this.now() >= this.lastSpawned + this.spawnTime && !this.boss) {
            this.spawnEnemy();
        }
        // Control the enemy ships
        
        for (let e = 0; e < this.enemies.getChildren().length; e++) {
            let enemy = this.enemies.getChildren()[e];
            enemy.ai.update();
        }
        for (let b = 0; b < this.bosses.getChildren().length; b++) {
            let boss = this.bosses.getChildren()[b];
            boss.ai.update();
        }


        // End the game if necessary
        if (this.gameOver) {
            this.onGameOver();
        }

        if(this.killCount >= this.goal && !this.bossCreated)
        {
            if(this.mainBGM.isPlaying)
                this.mainBGM.stop();

            this.bossMode();
        }
        //scroll pBGs
        this.pBG1.tilePositionY -= 6;
        this.pBG2.tilePositionY -= 2;
    }

    createPlayer() {
        this.player = this.physics.add.sprite(225, 625, 'player');
        this.player.body.setSize(100,100,true);
        this.player.setScale(1);
        // Create aniamtions for the player
        this.generatePlayerAnimations();
        // Collide the player with world bounds
        this.player.setCollideWorldBounds(true);
        // Start the player in idle
        this.player.anims.play('idle');
    }

    hitPlayer(collided, player) {
        collided.destroy();
        let explodeX = player.x;
        let explodeY = player.y;
        this.playerHealth--;

        if(this.playerHealth <= 0){
            this.createExplosion(explodeX,explodeY,1);
            this.onPlayerExploded();
        }

    }

    createShootingControls() {
        // Handle shooting on desktop using spacebar
        this.input.keyboard.on('keydown-SPACE', () => {
            this.shooting = true;
        });
        this.input.keyboard.on('keyup-SPACE', () => {
            this.shooting = false;
        });
        // Create a button to shoot with on mobile
        let shootButton = this.add.circle(390, 740, 50, 0xFF0000, 0.4);
        shootButton.setInteractive();
        // When the player hits the button, start shooting
        shootButton.on('pointerdown', () => {
            this.shooting = true;
        });
        // If the player stops clicking, or moves the pointer out of the
        // button, stop shooting
        shootButton.on('pointerup', () => {
            this.shooting = false;
        });
        shootButton.on('pointerout', () => {
            this.shooting = false;
        });
    }

    createEnemy(name, x, y, bodyW, bodyH, scale, anim, type) {
        if(anim){
            let enemy = this.physics.add.sprite(x, y, name);
            enemy.setScale(scale);
            enemy.body.setSize(bodyW, bodyH, true,);
            // Idle animation
            enemy.anims.create({
                key: 'idle',
                frames: this.anims.generateFrameNumbers(name, {
                    start: 0,
                    end: 1
                }),
                frameRate: 8,
                repeat: -1
            });
        // Play idle by default
        enemy.anims.play('idle');
        // Attach an AI controller to this object
        enemy.ai = new type(this, enemy);
        this.enemies.add(enemy);
        }
        else{
            let enemy = this.physics.add.sprite(x, y, name);
            enemy.setScale(scale);
            enemy.body.setSize(bodyW, bodyH, true);
            // Attach an AI controller to this object
            enemy.ai = new type(this, enemy);
            this.enemies.add(enemy);
        }
        // Attach an AI controller to this object
        //enemy.ai = new type(this, enemy);
        // Add enemy to group of enemies
    }

    createBoss(name, x, y, bodyW, bodyH, scale, anim, aiType){
        let boss = this.physics.add.sprite(x, y, name);
        boss.setScale(scale);
        boss.body.setSize(bodyW, bodyH, true);
        // Attach an AI controller to this object
        boss.ai = new aiType(this, boss);
        this.bosses.add(boss);
    }

    hitBoss(laser, boss){
        laser.destroy();
        this.bossSFX.play();
        this.bossHP--;
        if(this.bossHP <= 0){
            let explodeX = boss.x;
            let explodeY = boss.y;
            this.createExplosion(explodeX,explodeY,3);
            this.bossBGM.stop();
            this.winSFX.play();
            this.score+=50;
            this.killCount = 0;
            this.bossHP = 50;
            this.boss = false;
            boss.destroy();
            this.bossCreated = false;
            this.mainBGM.play();
        }
    }

    hitEnemy(laser, enemy) {
        laser.destroy(); 
        let explodeX = enemy.x;
        let explodeY = enemy.y;
        this.createExplosion(explodeX,explodeY,1);
        this.score++;
        this.killCount++;
        enemy.destroy();
    }

    createExplosion(x, y, size) {
        // Creat the sprite object
        let explosion = this.add.sprite(x, y, 'explode');
        explosion.setScale(size);
        // Play the sound
        this.boomSFX.play();
        // Create the animation
        explosion.anims.create({
            // Name of the animation
            key: 'boom',
            // Generate all frame numbers between 0 and 7
            frames: this.anims.generateFrameNumbers('explode', {
                start: 0,
                end: 7
            }),
            // Animation should be slower than base game framerate
            frameRate: 8
        });
        // Run the animation
        explosion.anims.play('boom');
        // Create a callback for animation
        explosion.on('animationcomplete-boom', () => {
            explosion.destroy();
        });
    }

    generatePlayerAnimations() {
        // Create the idle animation
        this.player.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNumbers('player', {
                frames: [1, 4, 7, 10, 13]
            }),
            frameRate: 24,
            repeat: -1
        });
    }

    /**
     * @returns The current time as a ms timestamp
     */
    now() {
        return new Date().getTime();
    }

    /**
     * Runs during update() if the "gameOver" flag has been set.
     * Resets the game.
     */
    onGameOver() {
        // Save the score
        this.saveScore();
        // Reset timers for enemy spawn
        this.lastSpawned = 0;
        this.spawnTime = 5000;
        // Destroy all the stuff
        this.player.destroy();
        // Reset game over variable
        this.gameOver = false;
        // Reset score
        this.score = 0;
        this.killCount = 0;
        // stop bgm
        if(this.mainBGM.isPlaying)
            this.mainBGM.stop();
        
        if(this.bossBGM.isPlaying)
            this.bossBGM.stop();

        // Restart the game
        this.scene.start('TitleScene');
    }

    onPlayerExploded() {
        // The game will reset immediately when the player is done exploding.
        // Change this if you want multiple lives...
        this.playerLives--;
        this.player.setVisible(false);
        if(this.playerLives > 0){
            this.respawnPlayer();
        }
        else{
            this.loseSFX.play();
            this.gameOver = true;
        }
    }

    /**
     * Saves the player's score to the firestore database
     */
    async saveScore() {
        let result = await this.scoreTable.add({
            name: this.username,
            score: this.score
        });
        if (result) console.log("Score saved successfully!");
        else console.log("Score failed to save!");
    }

    /**
     * Spawns an enemy at a random location and sets spawn timer.
     * Different from createEnemy(), which only creates an enemy.
     */
    spawnEnemy() {
        // Pick a random x coordinate without set bounds
        // x will be between 25 and 425
        const x = (Math.random() * 400) + 25;
        // Creates the actual enemy object at the given position
        this.createEnemy('EnemyM', x, 50, 64, 64, 3, true, EnemyM);
        // Set the spawn timer and time between spawns
        this.lastSpawned = this.now();
        this.spawnTime *= .9;
        // Puts a hard limit on how small spawn time can get
        if (this.spawnTime < this.minSpawnTime) {
            this.spawnTime = this.minSpawnTime;
        }
    }

    //Respawn player to starting location.
    respawnPlayer(){
        this.playerHealth = 1;
        this.player.anims.play("idle");
        this.player.setX(225);
        this.player.setY(625);
        this.player.setVisible(true);
    }

    //creates a player/enemy laser and adds it to their specific group.
    shootLaser(){
        this.laserSFX.play();
        let laser = new Laser(this);
    }
    shootLaserEnemy(enemy){
        this.laserSFX2.play();
        let eLaser = new EnemyLaser(this, enemy.x,enemy.y);
    }

    bossMode(){
        //trigger boss event
        this.boss = true;

        //play boss music
        this.bossBGM.play();

        //create the boss
        this.createBoss('boss1',225,50,180,15,1,false,BossA);
        this.bossCreated = true;
    }
}