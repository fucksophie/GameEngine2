import { Entity, Game, Tilemap } from "./classes";

const game = new Game(document.getElementById("hueuheuhe") as HTMLCanvasElement, 32);

const player = new Entity(game, "player1", "ffffff", 10, 10);

game.tileMap = new Tilemap("dark_forest.png", {
    width: 32,
    height: 32
});

new Entity(game, "enemy1", "000000", 15, 15, {
	ticking: {
		speed: 100,
		function: function (me: Entity) {
			let direction = {x: player.x-me.x > 0, y: player.y-me.y > 0}
			
			if(direction.x && direction.y) {
				me.moveTo(me.x + Math.floor(Math.random() * 2), me.y + Math.floor(Math.random() * 2));
			}
			if(!direction.x && direction.y) {
				me.moveTo(me.x - Math.floor(Math.random() * 2), me.y + Math.floor(Math.random() * 2));
			}
			if(direction.x && !direction.y) {
				me.moveTo(me.x + Math.floor(Math.random() * 2), me.y - Math.floor(Math.random() * 2));
			}
			if(!direction.x && !direction.y) {
				me.moveTo(me.x - Math.floor(Math.random() * 2), me.y - Math.floor(Math.random() * 2));
			}

		}
	}
})

player.addMoveHandler((key) => {
    switch (key) {
        case 'a':
        case 'ArrowLeft':
        player.moveTo(player.x - 1, player.y);
        break;
        case 'd':
        case 'ArrowRight':
        player.moveTo(player.x + 1, player.y);
        break;
        case 'w':
        case 'ArrowUp':
        player.moveTo(player.x, player.y - 1);
        break;
        case 's':
        case 'ArrowDown':

        player.moveTo(player.x, player.y + 1);
        break;
    }
})
