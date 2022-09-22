interface Tileinfo {
  width: number;
  height: number;
}

interface EntitySettings {
  ticking: {
    function: Function;
    speed: number;
  };
}

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

export class Tilemap {
  tileSettings: Tileinfo = { width: 8, height: 8 };
  file: string;

  colorMap: Record<string, HTMLImageElement> = {};

  colorToTile(color: string): HTMLImageElement | undefined {
    if (this.colorMap?.[color]) return this.colorMap[color];
    return;
  }

  constructor(file: string, tileSettings: Tileinfo = { width: 8, height: 8 }) {
    this.tileSettings = tileSettings;
    this.file = file;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    const img = new Image();

    img.addEventListener("load", () => {
      canvas.width = img.width;
      canvas.height = img.height;
      const rows = canvas.width / this.tileSettings.width;
      const cols = canvas.height / this.tileSettings.height;
      let num = 0;

      ctx.drawImage(img, 0, 0);

      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
          num++;

          let imageDataCANVAS = document.createElement("canvas"); // THESE VARIABLE NAMES SUCK
          let imageDataCTX = imageDataCANVAS.getContext("2d")!;
          imageDataCANVAS.width = this.tileSettings.width;
          imageDataCANVAS.height = this.tileSettings.height;
          imageDataCTX.putImageData(
            ctx.getImageData(
              r * this.tileSettings.width,
              c * this.tileSettings.height,
              this.tileSettings.width,
              this.tileSettings.height,
            ),
            0,
            0,
          );

          let imageDataImg = new Image();
          imageDataImg.src = imageDataCANVAS.toDataURL();

          this.colorMap[num.toString().padStart(6, "0")] = imageDataImg;
        }
      }
    }, false);

    img.src = this.file;
  }
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
    let colors: string[] = [
      ((x + y) % 2 == 0)
        ? ((Math.floor(Math.random() * 20) < 10)
          ? this.settings.ground.second
          : this.settings.ground.main)
        : this.settings.ground.main,
    ]; // VERY UGLY

    this.settings.flowers.flowers.forEach((x) => {
      if (Math.random() >= 0.95) {
        colors.push(x);
      }
    });

    if (colors.length >= 2) return colors; // kinda ugly
    this.settings.flowers.mushrooms.forEach((x) => {
      if (Math.random() >= 0.96) {
        colors.push(x);
      }
    });

    if (colors.length >= 2) return colors;
    this.settings.flowers.unique.forEach((x) => {
      if (Math.random() >= 0.99) {
        colors.push(x);
      }
    });

    return colors;
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

        let colors: [Tilemap, string[]][] = [];

        if (!this.mapLayer.get(x + "," + y)) {
          this.mapLayer.set(x + "," + y, this.colorAlgo(x, y));
          continue;
        }

        colors.push([this.tileMap, this.mapLayer.get(x + "," + y)!]);

        colors.forEach((element) => {
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

  moveTo(x: number, y: number) {
    if (
      [...this.game.entities.values()].find((b) =>
        b.cX == x &&
        b.cY == y
      )
    ) return;

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
