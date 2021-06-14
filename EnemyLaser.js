class EnemyLaser extends Phaser.GameObjects.Sprite{
    constructor(scene, shipX, shipY){
        let x = shipX;
        let y = shipY+25;

        super(scene, x, y, "rBulletS");
        scene.add.existing(this);

        scene.physics.world.enableBody(this);
        this.body.velocity.y = 800;

        scene.eLasers.add(this);
    }

    update(){
        if(this.y > 800){
            this.destroy();
        }
    }
}