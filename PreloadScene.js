class PreloadScene extends Phaser.Scene {

    constructor(){
        super('PreloadScene');
    }

    preload(){
        //display the loading bar
        var progressBar = this.add.graphics();
        var progressBox = this.add.graphics();
        var width = this.cameras.main.width;
        var height = this.cameras.main.height;
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(50, 370, 350, 50);  
        
        var loadingText = this.make.text({
            x: width / 2,
            y: height / 2 - 50,
            text: 'Loading...',
            style: {
                font: '20px monospace',
                fill: '#ffffff'
            }
        });
        loadingText.setOrigin(0.5, 0.5);
            
        var percentText = this.make.text({
            x: width / 2,
            y: height / 2 - 5,
            text: '0%',
            style: {
                font: '18px monospace',
                fill: '#ffffff'
            }
        });
        percentText.setOrigin(0.5, 0.5);
            
        var assetText = this.make.text({
            x: width / 2,
            y: height / 2 + 50,
            text: '',
            style: {
                font: '18px monospace',
                fill: '#ffffff'
            }
        });
 
        assetText.setOrigin(0.5, 0.5);

        //load font
        this.loadFont("Excluded", "./assets/visual/fonts/Excluded.ttf");
        this.loadFont("Zen", "./assets/visual/fonts/ZenDots.ttf");

        //load music
        this.load.audio("Title", './assets/audio/bgm/Title.wav');
        this.load.audio("MainTheme", './assets/audio/bgm/MainTheme.wav');
        this.load.audio("MainTheme2", './assets/audio/bgm/MainTheme2.mp3');
        this.load.audio("BossTheme", './assets/audio/bgm/BossTheme.wav');
        this.load.audio("BossTheme2", './assets/audio/bgm/BossTheme2.wav');
        this.load.audio("Victory", './assets/audio/bgm/Victory.mp3');
        this.load.audio("Defeat", './assets/audio/bgm/Defeat.mp3');

        //load sfx
        this.load.audio("laser", "./assets/audio/sfx/laser.mp3");
        this.load.audio("laser2", "./assets/audio/sfx/laser2.wav");
        this.load.audio("bomb", "./assets/audio/sfx/bomb.mp3");
        this.load.audio("error", "./assets/audio/sfx/error.wav");
        this.load.audio("powerup", "./assets/audio/sfx/powerup.wav");
        this.load.audio("select", "./assets/audio/sfx/select.wav");
        this.load.audio("treasure", "./assets/audio/sfx/treasureEnemy.wav");

        //load graphics
        this.load.image('bg', './assets/visual/bg/pBG1.png');
        this.load.image('bg2', './assets/visual/bg/pBG2.png');
        this.load.image('logo', './assets/visual/logo.png');
        this.load.image('bBulletS', './assets/visual/bullets/blueS.png');
        this.load.image('bBulletL', './assets/visual/bullets/blueL.png');
        this.load.image('bBulletQ', './assets/visual/bullets/blueQ.png');
        this.load.image('rBulletS', './assets/visual/bullets/redS.png');
        this.load.image('rBulletL', './assets/visual/bullets/redL.png');
        this.load.image('rBulletQ', './assets/visual/bullets/redQ.png');
        

        //load ship sprites
        this.load.spritesheet('player', './assets/visual/ships/player.png', {
            frameWidth: 130,
            frameHeight: 130
        });
        this.load.spritesheet('explode', './assets/visual/boom/explosion.png', {
            frameWidth: 128,
            frameHeight: 128
        });
        this.load.spritesheet('explodeSmall', './assets/visual/boom/explosionSmall.png', {
            frameWidth: 32,
            frameHeight: 32
        });
        this.load.spritesheet('explode2', './assets/visual/boom/explosion2.png', {
            frameWidth: 32,
            frameHeight: 32
        });
        this.load.spritesheet('boss1', './assets/visual/ships/Boss2.png', {
            frameWidth: 220,
            frameHeight: 220
        });

        this.load.on('progress', function (percentage) {
            percentText.setText(parseInt(percentage * 100) + '%');
            progressBar.clear();
            progressBar.fillStyle(0x028bd1, 1);
            //50, 370, 350, 50
            progressBar.fillRect(60, 380, 330 * percentage, 30);
        });
        this.load.on('fileprogress', function (file){
            assetText.setText('Loading Asset: ' + file.key);
        });
        this.load.on('complete', function (){
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
            percentText.destroy();
            assetText.destroy();
        });

    }
    create(){
        //start the title scene
        this.scene.start("TitleScene");
    }

    /*updateBar(percentage){
        percentText.setText(parseInt(percentage * 100) + '%');
        progressBar.clear();
        progressBar.fillStyle(0xffffff, 1);
        progressBar.fillRect(250, 280, 300 * percentage, 30);
        console.log("P: " + percentage);
    }

    updateStatus(file){
        assetText.setText('Loading Asset: ' + file.key);
    }

    complete(){
        progressBar.destroy();
        progressBox.destroy();
        loadingText.destroy();
        percentText.destroy();
        assetText.destroy();
        console.log("COMPLETE!");
    }*/

    //Magic function I borrowed to load fonts without needing fancy css
    loadFont(name, url) {
        var newFont = new FontFace(name, `url(${url})`);
        newFont.load().then(function (loaded) {
            document.fonts.add(loaded);
        }).catch(function (error) {
            return error;
        });
    }


}