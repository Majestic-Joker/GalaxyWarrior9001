class TitleScene extends Phaser.Scene {
    constructor() {
        super("TitleScene");
        this.scoresText = null;
        this.namesText = null;
        this.errorText = null;
        this.username = "";
        this.unError = "";
        // Firebase stuff
        firebase.initializeApp(firebaseConfig);
        //firebase.analytics();
        this.database = firebase.firestore();
        this.scoreTable = this.database.collection('highscores')
            .orderBy('score', 'desc')
            .limit(10);
        // HTML stuff
        this.nameInput = null;
        /** @type {HTMLInputElement} */
        this.element = null;

        this.bgm = null;
    }

    preload(){
        //set bgm
        this.bgm = this.sound.add("Title", {
            volume: .05,
            loop: true
        });
    }

    create() {
        //set images for title
        let bg = this.add.image(0, 0, 'bg');
        bg.setOrigin(0,0);

        let logo = this.add.image(225,30, 'logo');
        logo.setOrigin(0.5,0);

        //set SFX
        let selectSFX = this.sound.add("select", {
            volume: .05
        });
        let errorSFX = this.sound.add("error", {
            volume: .05
        });

        //play bgm
        this.bgm.play();
        
        let button = this.add.rectangle(225, 700, 340, 70, 0x028bd1, 0.3);
        button.setInteractive();
        button.on('pointerdown', () => {
            if(this.username.length > 0 && this.username.length < 8 && (this.username[0] != " " || this.username[8] != " ")){
                this.username = this.parseUsername();
                selectSFX.play();
                this.bgm.stop();
                this.scene.start('MainScene', {
                    username: this.username
                });
            }
            else{
                errorSFX.play();
                this.unError = "INVALID USERNAME!";
            }
        });
        this.add.text(225, 700, "PLAY!", {
            fontFamily: 'Zen',
            fontSize: '40px'
        }).setOrigin(0.5);

        // Text for the high score table
        this.scoresText = this.add.text(400, 600, "", {
            fontFamily: 'Zen',
            fontSize: '25px',
            align: 'right'
        }).setOrigin(1, 1);
        this.namesText = this.add.text(50, 600, "", {
            fontFamily: 'Zen',
            fontSize: '25px'
        }).setOrigin(0, 1);
        this.errorText = this.add.text(225,640, `${this.unError}`, {
            fontFamily: 'Zen',
            fontSize: '15px',
            color: "red"
        }).setOrigin(0.5);

        // Run our database query to get scores
        this.getAllScores();

        // Create an input element for username
        this.nameInput = this.add.dom(225, 600, 'input');
        this.nameInput.setScale(2);
        this.element = this.nameInput.node;
    }

    update() {
        this.username = this.element.value;
        this.errorText.setText(`${this.unError}`);
    }

    parseUsername(){
       let newUN;
        newUN = this.username[0].toUpperCase();
       for(let i = 1; i < this.username.length; i++){
           newUN += this.username[i].toLowerCase();
       }

       return newUN;
    }

    async getAllScores() {
        let snap = await this.scoreTable.get();
        snap.forEach(
            (docSnap) => {
                const data = docSnap.data();
                // const name = data.name;
                // const score = data.score;
                const { name, score } = data;
                let scoreString = `${score}`.padStart(7, '0');
                this.namesText.text += `${name}: \n`;
                this.scoresText.text += `${scoreString}\n`;
            }
        );
    }
}