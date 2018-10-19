export const SocketController = function(socket) {
  this.socket = socket;
  this.initialize = (state) => {
    state.myPlayer.id = socket.id;
    this.socket.on("create player", function(player) {
      if (player.id !== state.myPlayer.id) {
        console.log('creating player', player.id);
        var otherPlayer = state.otherPlayers.get();
        if (otherPlayer) {
          otherPlayer.anims.play("idle");
          otherPlayer.setInitialPosition(player.x, player.y, player.id);
        }
      }
    });
  
    this.socket.on("delete player", function(deletedPlayerID) {
      if (deletedPlayerID !== state.id) {
        var thisOne = state.otherPlayers.getChildren().find(function(element) {
          return element.id === deletedPlayerID;
        });
        thisOne.destroy();
      }
    });

    this.socket.on("connect", function(initialData) {
      console.log('connected')
      state.id = socket.id;
    });
  
    this.socket.on("update", function(player) {
      var moving = false;
      if (player.id !== state.myPlayer.id) {
        var thisOne = state.otherPlayers.getChildren().find(function(element) {
          return element.id === player.id;
        });
        if (typeof thisOne !== "undefined") {
          if(thisOne.health<0){
            thisOne.setAnimation('death');
            return;
          }
          if (thisOne.x !== player.x || thisOne.y !== player.y) {
            thisOne.setPosition(player.x, player.y);
            moving = true;
          }
          if (player.attacking) {
            thisOne.setAnimation("slash");
            thisOne.attacking = true;
          } else if (player.blocking) {
            thisOne.setAnimation("block");
            thisOne.blocking = true;
          } else if (moving) {
            thisOne.attacking = false;
            thisOne.blocking = false;
            thisOne.setAnimation("walk");
          } else {
            thisOne.attacking = false;
            thisOne.blocking = false;
            thisOne.setAnimation("idle");
          }
  
          if (thisOne.flipState !== player.flipState) {
            thisOne.flipState = player.flipState;
            thisOne.toggleFlipX();
          }
        }
      }
    });
  
    this.socket.on("attack", function(player) {});
  }
}

// export const SocketListeners = function(socket, state) {
  
// };
