import "phaser";
// import "./socketController";
import { Player } from "./GameObjects/OtherPlayer";

var config = {
  type: Phaser.AUTO,
  parent: "phaser-example",
  width: screen.width,
  height: screen.height,
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

var socket = io();

var game = new Phaser.Game(config);

var x = 400;
var y = 150;
var move = 0;
var id = socket.id;
var initialOtherPlayers = [];
var otherPlayers;
var player;
var myPlayer;

function preload() {
  this.load.image("logo", "assets/logo.png");
  this.load.spritesheet("nothing", "assets/knight/idle.png", {
    frameWidth: 42,
    frameHeight: 42,
    endFrame: 4
  });
  fetch("/initialize")
    .then(function(response) {
      return response.json();
    })
    .then(function(players) {
      initialOtherPlayers = players;
    });
}

function create() {
  this.anims.create({
    key: "idle",
    frames: this.anims.generateFrameNumbers("nothing", { start: 0, end: 3 }),
    frameRate: 2,
    repeat: -1
  });

  // Initialize Player
  player = this.add.group({
    classType: Player,
    maxSize: 1
  });
  myPlayer = player.get();
  console.log("id: " + id);
  if (myPlayer) {
    myPlayer.play("idle");
    myPlayer.setInitialPosition(x, y, id);
  }
  socket.emit("create player", { x: x, y: y, id: id });

  // Initialize Other Players
  otherPlayers = this.add.group({
    classType: Player,
    maxSize: 100
  });

  initialOtherPlayers.forEach(player => {
    if (player.id !== id) {
      var otherPlayer = otherPlayers.get();
      if (otherPlayer) {
        console.log(otherPlayer);
        otherPlayer.anims.play("idle");
        otherPlayer.setInitialPosition(player.x, player.y, player.id);
      }
    }
  });

  // Bind movement keys
  this.input.keyboard.on("keydown_W", function(event) {
    y -= 10;
    myPlayer.setNewPosition(x, y);
    socket.emit("move player", { x: x, y: y, id: id });
  });

  this.input.keyboard.on("keydown_A", function(event) {
    x -= 10;
    myPlayer.setNewPosition(x, y);
    socket.emit("move player", { x: x, y: y, id: id });
  });

  this.input.keyboard.on("keydown_S", function(event) {
    y += 10;
    myPlayer.setNewPosition(x, y);
    socket.emit("move player", { x: x, y: y, id: id });
  });

  this.input.keyboard.on("keydown_D", function(event) {
    x += 10;
    myPlayer.setNewPosition(x, y);
    socket.emit("move player", { x: x, y: y, id: id });
  });
}

function update(time, delta) {
  move += delta;
  if (move > 6) {
    myPlayer.setNewPosition(x, y);
    move = 0;
  }
}

socket.on("connect", function() {
  id = socket.id;
});

socket.on("create player", function(player) {
  console.log("creating player");
  if (player.id !== id) {
    var otherPlayer = otherPlayers.get();
    if (otherPlayer) {
      console.log(otherPlayer);
      otherPlayer.anims.play("idle");
      otherPlayer.setInitialPosition(player.x, player.y, player.id);
    }
  }
});

socket.on("delete player", function(deletedPlayerID) {
  console.log("deleting player");
  if (deletedPlayerID !== id) {
    var thisOne = otherPlayers.getChildren().find(function(element) {
      return element.id === deletedPlayerID;
    });

    thisOne.destroy();
  }
});

socket.on("update", function(player) {
  if (player.id !== id) {
    var thisOne = otherPlayers.getChildren().find(function(element) {
      return element.id === player.id;
    });

    thisOne.setNewPosition(player.x, player.y);
  }
});
