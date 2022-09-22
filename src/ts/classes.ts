/*
need to start making asset support..
https://adamatomic.itch.io/jawbreaker
https://datagoblin.itch.io/monogram
https://ppeldo.itch.io/2d-pixel-art-game-spellmagic-fx
https://vnitti.itch.io/taiga-asset-pack
*/
interface Tileinfo {
	width: number
	height: number
}
export class Tilemap { // all tileinfo and tilemap shit is new and probably doesn't work 
	tileSettings: Tileinfo = {width: 8, height: 8};
	file: string;

	colorMap: Record<string, ImageData> = [] as unknown as Record<string, ImageData>; // idk how to fix thtis lmfao
	
	colorToTile(color: string): ImageData|undefined {
		if(this.colorMap?.[color]) return this.colorMap[color];
		return;
	}

	constructor(file: string, tileSettings: Tileinfo = {width: 8, height: 8}) {
		this.tileSettings = tileSettings
		this.file = file;

		const canvas = document.createElement("canvas");
		const ctx = canvas.getContext("2d")!;
		const img = new Image();

		img.addEventListener('load', () => {
			canvas.width = img.width;
			canvas.height = img.height;
			const rows = canvas.width / this.tileSettings.width;
			const cols = canvas.height / this.tileSettings.height;
			
			ctx.drawImage(img, 0, 0);
			let x = 0;
			for(let r = 0; r < rows; r++) {
				for(let c = 0; c < cols; c++) {
					x++;
					this.colorMap[x.toString().padStart(6, "0")] = ctx.getImageData(c * this.tileSettings.width, r * this.tileSettings.height, this.tileSettings.height, this.tileSettings.width);
	
				}	
			}
		}, false);

		img.src = this.file; 
	}

}
export class Game {
	canvas: HTMLCanvasElement;
	ctx: CanvasRenderingContext2D;
	mapLayer: Map<string, string> = new Map<string, string>();
	entities: Map<string, Entity> = new Map<string, Entity>();
	
	tileMap: Tilemap | undefined; // NEW

	pixelSize: number;
	
	colorAlgo(x: number, y: number) {
		return (((x+y)%2==0) ? ((Math.floor(Math.random() * 20) < 10) ? "006400" : "008000") : "008000");
	}

	coordinatesToPixel(x: number): number {
		return this.pixelSize * Math.floor(x);
	} 
	
	constructor(canvas: HTMLCanvasElement, pixelSize = 30) {
		this.canvas = canvas;
		this.ctx = this.canvas.getContext("2d")!;
		
		this.canvas.width = innerWidth;
		this.canvas.height = innerHeight;
		this.pixelSize = pixelSize;

		window.requestAnimationFrame(() => {this.draw()});
		
		window.addEventListener('keydown', e => this.entities.forEach(x => x.moveHandlers.forEach(y => y(e.key))))

		for(let x = 0; x < canvas.width; x+=this.pixelSize) {
			for(let y = 0; y < canvas.height; y+=this.pixelSize) {				
				this.mapLayer.set(x+","+y, this.colorAlgo(x, y));
			}
		}

	}
	
	draw() {
		this.canvas.width = innerWidth;
		this.canvas.height = innerHeight;
		
		for(let x = 0; x < this.canvas.width; x+=this.pixelSize) {
			for(let y = 0; y < this.canvas.height; y+=this.pixelSize) {
				let color = this.mapLayer.get(x+","+y);
				let entity = [...this.entities.values()].find(b => b.canvasX == x && b.canvasY == y);
				
				if(entity) color = entity.color;
				if(color) {
					// ALL NEW 
					if(this.tileMap) {
						let tile = this.tileMap.colorToTile(color);
						if(tile) {
							this.ctx.putImageData(tile, x, y);
							continue;
						}
					}
					// ALL NEW 
					this.ctx.fillStyle = "#" + color;
					this.ctx.fillRect(x, y, this.pixelSize, this.pixelSize);
				} else {
					this.mapLayer.set(x+","+y, this.colorAlgo(x, y));
				}
			}
		}

		window.requestAnimationFrame(() => {this.draw()});
	}
}

export class Entity {
	private game: Game;
    private readonly settings: {
        ticking: {
            function: Function;
            speed: number;
        }
    } | undefined;
	color: string;
    x: number;
    y: number;
    lastX: number;
    lastY: number;
    canvasX: number;
    canvasY: number;
	name: string;
	moveHandlers: Function[] = [];

	constructor(game: Game, name: string, color: string, x: number, y: number, settings:  {
        ticking: {
            function: Function;
            speed: number;
        }
    } | undefined = undefined) {
		console.log("✨ new entity created:", name, this)
		this.game = game;
		this.color = color;
		this.settings = settings;
		this.name = name;
		
		this.moveTo(x,y);

		if(this.settings?.ticking?.function && this.settings?.ticking?.speed) {
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
		let canvasX = this.game.pixelSize*Math.floor(x);
		let canvasY = this.game.pixelSize*Math.floor(y);
		
		if([...this.game.entities.values()].find(b => 
			b.canvasX == canvasX && 
			b.canvasY == canvasY)
		) return;

		if((canvasX > this.game.canvas.width || canvasX < 0) ||
			(canvasY > this.game.canvas.height || canvasY < 0)) return;
		
		this.x = x;
		this.y = y;
		
		this.lastX = x;
		this.lastY = y;
		this.canvasX = canvasX;
		this.canvasY = canvasY;
	}
}