class Laser extends Phaser.GameObjects.Sprite{
    constructor(scene){

        let x = scene.player.x;
        let y = scene.player.y-60;

        super(scene, x, y, "bBulletS");
        scene.add.existing(this);

        scene.physics.world.enableBody(this);
        this.body.velocity.y = - 1000;

        scene.lasers.add(this);
    }

    update(){
        if(this.y < 0){
            this.destroy();
        }
    }
}