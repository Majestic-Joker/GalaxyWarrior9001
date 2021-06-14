class BossA extends AI {
    constructor(scene, obj) {
        super(scene, obj, () => { });
        this.change(this.moveDown);
        this.strafing = false;
        this.lastShot = 0;
        this.shotTimeout = 1000;
        this.bullets = 25;
    }

    moveDown() {
        this.obj.setVelocity(0, .25 * this.scene.plySpd);
        // Check if we should change states
        if ((this.scene.player.y - this.obj.y) < 400) {
            this.change(this.strafe);
        }
    }

    moveUp() {
        this.obj.setVelocity(0, -.25*this.scene.plySpd);
        if((this.scene.player.y-this.obj.y) > 500) {
            this.bullets = Math.floor(Math.random()*75+25);
            this.change(this.moveDown);
        }
    }

    strafe() {
        // If this state just started, go right
        if (!this.strafing) {
            this.strafing = true;
            // Go right
            this.obj.setVelocity(.25 * this.scene.plySpd, 0);
        }

        // If on the left side of the screen, go right
        if (this.obj.x < 100) {
            this.obj.setVelocity(.25 * this.scene.plySpd, 0);
        }
        // If on the right side of the screen, go left
        else if (this.obj.x > 350) {
            this.obj.setVelocity(-.25 * this.scene.plySpd, 0);
        }

        // Check if we should shoot
        if (this.now() > this.lastShot + this.shotTimeout) {
            this.scene.shootLaserEnemy(this.obj);
            this.lastShot = this.now();
            this.bullets--;
        }

        // If out of bullets, change state
        if (this.bullets <= 0) {
            this.strafing = false;
            this.change(this.moveUp);
        }
    }

    now() {
        return new Date().getTime();
    }
}