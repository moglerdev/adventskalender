
class Snow {
    canvas = document.getElementById("snow");
    ctx = this.canvas.getContext("2d");

    snows = [];

    constructor(){
        this.canvas = document.getElementById("snow");

        this.ctx = this.canvas.getContext("2d");
        let ctx = this.ctx
        ctx.canvas.height = window.innerHeight;
        ctx.canvas.width = window.innerWidth;
        ctx.webkitImageSmoothingEnabled = false;
        ctx.mozImageSmoothingEnabled = false;
        ctx.imageSmoothingEnabled = false;

        for (let i = 0; i < 10; i++) {
            this.snows.push(new SnowPoint());          
        };

        this.update();

        console.log(this.snows);
    }

    dt = new Date();
    update(){
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        let dt_n = (new Date()).getMilliseconds() - this.dt.getMilliseconds();
        Array.from(this.snows).forEach(x => {
            x.update(dt_n);
        });
        Array.from(this.snows).forEach(x => {
            x.draw(this.ctx);
        });
        setTimeout(this.update.bind(this), 22);
    }
}

class SnowPoint {
    pos = { x: getRandomInt(window.innerWidth), y: getRandomInt(100) - 100 };

    debug = document.getElementById("debug");

    constructor(pos){

    }

    draw(ctx){
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, 2, 0, 2 * Math.PI);
        ctx.fillStyle = "white";
        ctx.fill();
    }

    update(deltaTime){
        this.pos.y += 2
        if (this.pos.y > window.innerHeight) {
            this.pos.y = 0;
        }
        if (this.pos.x < -20 && this.pos.x > window.innerWidth) {
            this.pos.x = 100;
        }

        let pix = 2 * Math.PI * 0.001;
        let x = 200 * Math.sin(pix * (new Date().getTime() + this.pos.x) * 0.01)
        this.pos.x = x
        this.debug.innerText = this.pos.x
    }
}

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
  }
  