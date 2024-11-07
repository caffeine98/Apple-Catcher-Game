import './style.css'
import Phaser, { Physics } from 'phaser'

const sizes = {
  width: 500,
  height: 500
}

const speedDown = 300

const gameStartDiv = document.querySelector("#gameStartDiv")
const gameEndDiv = document.querySelector("#gameEndDiv")
const gameStartButton = document.querySelector("#gameStartButton")
const gameEndScoreSpan = document.querySelector("#gameEndScoreSpan")

class GameScene extends Phaser.Scene{
  constructor() {
    super("scene-game")
    this.player
    this.cursor
    this.playerSpeed = speedDown + 50
    this.target
    this.points = 0
    this.textScore
    this.textTime
    this.timedEvent
    this.remainingTime
    this.gamePlayTime = 30000
    this.coinMusic
    this.bgMusic
    this.emitter
  }

  preload() {
    this.load.image("bg", "/assets/bg.png")
    this.load.image("basket", "/assets/basket.png")
    this.load.image("apple", "/assets/apple.png")
    this.load.audio("coin", "/assets/coin.mp3")
    this.load.audio("bgMusic", "/assets/bgMusic.mp3")
  }
  create() {
    this.scene.pause("scene-game")

    this.add.image(0, 0, "bg").setOrigin(0,0)
    this.player = this.physics.add.image(0, sizes.height - 100, "basket").setOrigin(0,0)
    this.player.setImmovable(true)
    this.player.body.allowGravity = false
    this.player.setCollideWorldBounds(true)
    this.player.setSize(90, 15).setOffset(5, 35)

    this.cursor = this.input.keyboard.createCursorKeys()

    this.target = this.physics.add.image(this.getRandomX(), 0, "apple").setOrigin(0,0)
    this.target.setMaxVelocity(speedDown)

    this.physics.add.overlap(this.target, this.player, this.targetHit, null, this)

    this.textScore = this.add.text(sizes.width - 120, 10, "Score: 0", {
      font:"25px Arial",
      fill:"#000000"
    })

    this.textTime = this.add.text(12, 10, "Time remaining: 0", {
      font:"25px Arial",
      fill:"#000000"
    })

    this.timedEvent = this.time.delayedCall(this.gamePlayTime, this.gameOver,[], this)

    this.coinMusic = this.sound.add("coin")
    this.bgMusic = this.sound.add("bgMusic")
    //this.bgMusic.play()

    this.emitter = this.add.particles(0, 0, "money", {
      speed: 100,
      gravityY: speedDown - 200,
      scale: 0.09,
      duration: 100,
      emitting: false
    })
    this.emitter.startFollow(this.player, this.player.width / 2, this.player.height / 2, true)
  }
  update() {
    this.remainingTime = this.timedEvent.getRemainingSeconds()
    this.textTime.setText(`Remaining time: ${Math.round(this.remainingTime).toString()}`)

    if (this.target.y >= sizes.height) {
      this.target.setY(0)
      this.target.setX(this.getRandomX())
    }

    const {left, right, shift} = this.cursor

    if (shift.isDown){
      this.playerSpeed = 500
    }
    else{
      this.playerSpeed = 300
    }

    if (left.isDown) {
      this.player.setVelocityX(-this.playerSpeed)
    }
    else if (right.isDown) {
      this.player.setVelocityX(this.playerSpeed)
    }
    else{
      this.player.setVelocityX(0)
    }
  }

  getRandomX() {
    return Math.floor(Math.random() * (sizes.width - 40))
  }

  targetHit() {
    this.target.setY(0)
    this.target.setX(this.getRandomX())
    this.points++
    this.textScore.setText(`Score: ${this.points}`)
    this.coinMusic.play()
    this.emitter.start()
  }

  gameOver() {
    this.bgMusic.stop()
    this.sys.game.destroy(true)
    gameEndDiv.style.display = "flex"
    gameEndScoreSpan.textContent = this.points
  }
}

const config = {
  type:Phaser.WEBGL,
  width:sizes.width,
  height:sizes.height,
  canvas:gameCanvas,
  physics:{
    default: "arcade",
    arcade: {
      gravity:{y:speedDown},
      debug: true
    }
  },
  scene:[GameScene]
}

const game = new Phaser.Game(config)

gameStartButton.addEventListener("click", ()=>{
  gameStartDiv.style.display = "none"
  game.scene.resume("scene-game")
})

