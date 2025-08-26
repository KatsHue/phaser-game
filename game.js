class StartScene extends Phaser.Scene {
  constructor() {
    super("StartScene");
  }

  preload() {
    this.load.image("sky", "assets/sky.jpg");
  }

  create() {
    let bg = this.add.image(0, 0, "sky").setOrigin(0, 0);
    let scaleX = this.sys.game.config.width / bg.width;
    let scaleY = this.sys.game.config.height / bg.height;
    bg.setScale(Math.max(scaleX, scaleY));

    this.add
      .text(
        this.sys.game.config.width / 2,
        this.sys.game.config.height / 2 - 100,
        "Lluvia de Estrellas",
        { fontSize: "50px", fill: "#fff", fontFamily: "Margarine" }
      )
      .setOrigin(0.5);

    let startButton = this.add
      .text(
        this.sys.game.config.width / 2,
        this.sys.game.config.height / 2,
        "Iniciar Juego",
        {
          fontSize: "25px",
          fontFamily: "Margarine",
          fill: "rgba(238, 238, 236, 1)",
          backgroundColor: "#5760e4ff",
        }
      )
      .setOrigin(0.5)
      .setPadding(20)
      .setInteractive();

    startButton.on("pointerdown", () => {
      this.scene.start("GameScene");
    });
  }
}

class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");
  }

  preload() {
    this.load.image("sky", "assets/sky.jpg");
    this.load.image("basket", "assets/basket.png");
    this.load.image("star", "assets/star.png");
    this.load.image("bomb", "assets/bomb.png");
  }

  create() {
    let bg = this.add.image(0, 0, "sky").setOrigin(0, 0);
    let scaleX = this.sys.game.config.width / bg.width;
    let scaleY = this.sys.game.config.height / bg.height;
    bg.setScale(Math.max(scaleX, scaleY));

    this.player = this.physics.add
      .sprite(
        this.sys.game.config.width / 2,
        this.sys.game.config.height - 50,
        "basket"
      )
      .setScale(0.35);
    this.player.setCollideWorldBounds(true);

    //  ESTRELLAS
    this.stars = this.physics.add.group({
      key: "star",
      repeat: 5,
      setXY: { x: 12, y: 0, stepX: 120 },
    });

    this.stars.children.iterate((star) => {
      star.setVelocityY(Phaser.Math.Between(100, 200));
    });

    //BOMBAS
    this.bombs = this.physics.add.group();

    this.time.addEvent({
      delay: 2000,
      callback: () => {
        let bomb = this.bombs.create(
          Phaser.Math.Between(50, this.sys.game.config.width - 50),
          0,
          "bomb"
        );
        bomb.setVelocityY(Phaser.Math.Between(150, 250));
        bomb.setScale(0.15);
      },
      loop: true,
    });

    // PUNTAJE
    this.score = 0;
    this.scoreText = this.add.text(16, 16, "Puntaje: 0", {
      fontSize: "32px",
      fontFamily: "Margarine",
      fill: "#ffffffff",
    });

    // VIDAS
    this.lives = 5;
    this.livesText = this.add.text(16, 60, "Vidas: 5", {
      fontSize: "28px",
      fontFamily: "Margarine",
      fill: "#b6b5ecff",
    });

    // COLISIONES
    this.physics.add.overlap(
      this.player,
      this.stars,
      this.catchStar,
      null,
      this
    );

    this.physics.add.overlap(this.player, this.bombs, this.hitBomb, null, this);

    this.input.on("pointermove", (pointer) => {
      this.player.x = pointer.x;
    });

    window.addEventListener("resize", () => {
      this.scale.resize(window.innerWidth, window.innerHeight);
      let scaleX = this.sys.game.config.width / bg.width;
      let scaleY = this.sys.game.config.height / bg.height;
      bg.setScale(Math.max(scaleX, scaleY));
    });
  }

  update() {
    this.stars.children.iterate((star) => {
      if (star.y > this.sys.game.config.height) {
        star.y = 0;
        star.x = Phaser.Math.Between(50, this.sys.game.config.width - 50);
        star.setVelocityY(Phaser.Math.Between(100, 200));
      }
    });

    let bombs = this.bombs.getChildren();
    for (let i = bombs.length - 1; i >= 0; i--) {
      if (bombs[i].y > this.sys.game.config.height) {
        bombs[i].destroy();
      }
    }
  }

  catchStar(player, star) {
    star.y = 0;
    star.x = Phaser.Math.Between(50, this.sys.game.config.width - 50);
    star.setVelocityY(Phaser.Math.Between(100, 200));
    this.score += 10;
    this.scoreText.setText("Puntaje: " + this.score);
  }

  hitBomb(player, bomb) {
    player.setTint(0xff0000);
    bomb.destroy();
    this.lives--;
    this.livesText.setText("Vidas: " + this.lives);

    this.time.delayedCall(500, () => {
      player.clearTint();
    });

    if (this.lives <= 0) {
      this.scene.restart();
      alert("¡Juego Terminado!");
    }
  }
}

const config = {
  type: Phaser.AUTO,
  parent: "game",
  physics: {
    default: "arcade",
    arcade: { gravity: { y: 0 }, debug: false },
  },
  scene: [StartScene, GameScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: window.innerWidth,
    height: window.innerHeight,
  },
};

new Phaser.Game(config);
