import { Entity } from "./Entity";
import { Game } from "./Game";
import { Tilemap } from "./Tilemap";

let moving: Record<string, boolean> = {};

const game = new Game(document.getElementById("canvas") as HTMLCanvasElement);

const player = new Entity(game, "player1", "000001", 200, 200, {
  ticking: {
    function: () => { // add moving sprites (u have them saved somwehr robert.png)
      if (moving["w"]) {
        player.moveTo(player.cX, player.cY - 2);
        player.color = "000003";
        return;
      }
      if (moving["s"]) {
        player.moveTo(player.cX, player.cY + 2);
        player.color = "000001";
        return;
      }

      if (moving["a"]) {
        player.moveTo(player.cX - 2, player.cY);
        player.color = "000002";
        return;
      }

      if (moving["d"]) {
        player.moveTo(player.cX + 1, player.cY);
        player.color = "000004";
        return;
      }
    },
    speed: 10,
  },
});

game.tileMap = new Tilemap("dark_forest.png", {
  width: 32,
  height: 32,
});

player.tileMap = new Tilemap("playersprite.png", {
  width: 32,
  height: 32,
});

player.addMoveHandler((key, x) => {
  moving[key] = x;
});