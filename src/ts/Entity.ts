import { Game } from "./Game";
import { Tilemap } from "./Tilemap";

interface EntitySettings {
    ticking: {
      function: Function;
      speed: number;
    };
}

export class Entity {
    private game: Game;
    private readonly settings: EntitySettings | undefined;
    color: string;
    cX: number;
    cY: number;
    name: string;
    tileMap: Tilemap | undefined;
    moveHandlers: Function[] = [];
  
    constructor(
      game: Game,
      name: string,
      color: string,
      x: number,
      y: number,
      settings: EntitySettings | undefined = undefined,
    ) {
      if (game.debug) return; // no entities in debug mode
  
      console.log("✨ new entity created:", name, this);
      this.game = game;
      this.color = color;
      this.settings = settings;
      this.name = name;
  
      this.moveTo(x, y);
  
      if (this.settings?.ticking?.function && this.settings?.ticking?.speed) {
        setInterval(() => {
          this.settings?.ticking.function(this);
        }, this.settings.ticking.speed);
      }
  
      this.game.entities.set(this.name, this);
    }
  
    addMoveHandler(func: Function) {
      this.moveHandlers.push(func);
    }
  
    isColliding(): Entity|undefined {
      return [...this.game.entities.values()].find((b) => {
        if(b == this) return;
        return (
          b.cX < this.cX + this.game.settings.pixelSize+3 &&
          b.cX + this.game.settings.pixelSize+3 > this.cX &&
          b.cY < this.cY + this.game.settings.pixelSize+3 &&
          this.game.settings.pixelSize+3 + b.cY > this.cY
        );
      }
      );
    }

    moveTo(x: number, y: number) {
      if (
        (x > this.game.canvas.width || x < 0) ||
        (y > this.game.canvas.height || y < 0)
      ) {
        return;
      }
      this.cX = x;
      this.cY = y;
    }
  }
  