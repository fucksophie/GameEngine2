import { Entity } from "./Entity";
import { Tilemap } from "./Tilemap";

interface GameSettings {
  ground: {
    main: string;
    second: string;
  };
  flowers: {
    flowers: string[];
    mushrooms: string[];
    unique: string[];
  };
  pixelSize: number;
}

export class Game {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  mapLayer: Map<string, string[]> = new Map<string, string[]>();
  entities: Map<string, Entity> = new Map<string, Entity>();
  tileMap: Tilemap | undefined;
  settings: GameSettings;
  debug = localStorage.getItem("isDebug?") || false;

  colorAlgo(x: number, y: number) {
    let types: string[] = [
      ((x + y) % 2 == 0)
        ? ((Math.floor(Math.random() * 20) < 10)
          ? this.settings.ground.second
          : this.settings.ground.main)
        : this.settings.ground.main,
    ]; // VERY UGLY

    this.settings.flowers.flowers.forEach((x) => {
      if (Math.random() >= 0.95) {
        types.push(x);
      }
    });

    if (types.length >= 2) return types; // kinda ugly
    this.settings.flowers.mushrooms.forEach((x) => {
      if (Math.random() >= 0.96) {
        types.push(x);
      }
    });

    if (types.length >= 2) return types;
    this.settings.flowers.unique.forEach((x) => {
      if (Math.random() >= 0.99) {
        types.push(x);
      }
    });

    return types;
  }

  coordinatesToPixel(x: number): number {
    return this.settings.pixelSize * Math.floor(x);
  }

  constructor(canvas: HTMLCanvasElement, settings: GameSettings = {
    ground: {
      main: "000146",
      second: "000145",
    },
    flowers: {
      flowers: ["000062", "000061", "000060"],
      mushrooms: ["000032"],
      unique: ["000038"],
    },
    pixelSize: 30,
  }) {
    this.canvas = canvas;
    this.ctx = this.canvas.getContext("2d")!;
    this.canvas.width = innerWidth;
    this.canvas.height = innerHeight;
    this.settings = settings;

    window.requestAnimationFrame(() => {
      this.draw();
    });

    document.body.addEventListener("keydown", (e) => {
      if (e.repeat) return;
      this.entities.forEach((x) =>
        x.moveHandlers.forEach((y) => y(e.key, true))
      );
    });

    document.body.addEventListener("keyup", (e) => {
      this.entities.forEach((x) =>
        x.moveHandlers.forEach((y) => y(e.key, false))
      );
    });

    window.addEventListener("keydown", (e) => {
      switch (e.key) {
        case "ContextMenu":
          if (e.preventDefault) e.preventDefault();
          if (localStorage.getItem("isDebug?")) {
            localStorage.removeItem("isDebug?");
          } else {
            localStorage.setItem("isDebug?", "true");
          }
          window.location.reload();
          break;
      }
    });
    
    for (let x = 0; x < canvas.width; x += this.settings.pixelSize) {
      for (let y = 0; y < canvas.height; y += this.settings.pixelSize) {
        this.mapLayer.set(x + "," + y, this.colorAlgo(x, y));
      }
    }
  }

  draw() {
    this.canvas.width = innerWidth;
    this.canvas.height = innerHeight;
    let total = 0;

    for (let x = 0; x < this.canvas.width; x += this.settings.pixelSize) {
      for (let y = 0; y < this.canvas.height; y += this.settings.pixelSize) {
        total++;
        if (!this.tileMap) {
          this.ctx.fillStyle = "#" + this.mapLayer.get(x + "," + y);
          this.ctx.fillRect(
            x,
            y,
            this.settings.pixelSize,
            this.settings.pixelSize,
          );
          continue;
        }

        let types: [Tilemap, string[]][] = [];

        if (!this.mapLayer.get(x + "," + y)) {
          this.mapLayer.set(x + "," + y, this.colorAlgo(x, y));
          continue;
        }

        types.push([this.tileMap, this.mapLayer.get(x + "," + y)!]);

        types.forEach((element) => {
          element[1].forEach((currcolor) => {
            let tile = element[0].colorToTile(currcolor);

            if (this.debug) {
              tile = element[0].colorToTile(total.toString().padStart(6, "0"));
            }

            if (tile) {
              this.ctx.drawImage(tile, x, y);

              if (this.debug) {
                this.ctx.fillStyle = "#ffffff";
                this.ctx.font = "15px Arial";

                this.ctx.fillText(total.toString(), x + 2, y + 15);
              }
            }
          });
        });
      }
    }

    this.entities.forEach((e, i) => {
      if (e.tileMap) {
        const xd = e.tileMap.colorToTile(e.color);
        if (xd) {
          this.ctx.drawImage(xd, e.cX, e.cY);
        }
      } else {
        this.ctx.fillStyle = "#" + e.color;
        this.ctx.fillRect(
          e.cX,
          e.cY,
          this.settings.pixelSize,
          this.settings.pixelSize,
        );
        return;
      }
    });

    window.requestAnimationFrame(() => {
      this.draw();
    });
  }
}