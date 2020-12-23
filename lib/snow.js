import { SessionManager } from './Session.js';

const sm = new SessionManager();

export class Snow {
    active = sm.getBoolean("snow.active");
    canvas = document.getElementById("snow");
    ctx = this.canvas.getContext("2d");
    timer = null;
    snows = [];

    constructor(){
        this.canvas = document.getElementById("snow");

        this.ctx = this.canvas.getContext("2d");
        let ctx = this.ctx
        ctx.canvas.height = window.innerHeight;
        ctx.canvas.width = window.innerWidth;

        window.onresize = (ev) => {
            ctx.canvas.height = window.innerHeight;
            ctx.canvas.width = window.innerWidth;
        }

        ctx.webkitImageSmoothingEnabled = false;
        ctx.imageSmoothingEnabled = false;

        for (let i = 0; i < 100; i++) {
            this.snows.push(new SnowPoint());
        }

        if(this.active)
            this.start();
    }

    start(){
        if(this.timer)
            clearInterval(this.timer);
        this.timer = setInterval(this.update.bind(this), 20);
    }

    toggle(btn){
        btn.disabled = true;
        this.active = !this.active;
        if(this.active){
            this.start();
            btn.innerText = "Schnee deaktivieren";
        }
        else {
            clearInterval(this.timer);
            this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
            btn.innerText = "Schnee aktivieren";
        }
        sm.set("snow.active", this.active);
        btn.disabled = false;
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
    }
}

class SnowPoint {
    startPos = { x: getRandomInt(window.innerWidth), y: getRandomInt(window.innerHeight) - window.innerHeight + 10 };
    pos = { x: 0, y: 0 };
    move = 10 + getRandomInt(50);
    speed = 1 + getRandomInt(4);
    adj = getRandomInt(window.innerHeight);
    size = 1 + getRandomInt(4)

    debug = document.getElementById("debug");

    constructor(){
        this.pos = {...this.startPos};
    }

    draw(ctx){
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.size, 0, 2 * Math.PI);
        ctx.fillStyle = "white";
        ctx.fill();
    }

    update(deltaTime){
        if(this.pos.y > window.innerHeight){
            this.startPos = { x: getRandomInt(window.innerWidth), y: getRandomInt(window.innerHeight) - window.innerHeight + 10 }
            this.pos.y = this.startPos.y;
            this.pos.x = this.startPos.x;
            this.size = 1 + getRandomInt(4);
        }else{
            this.pos.y += this.speed;
            this.pos.x = (Math.sin((this.pos.y + this.adj) * 0.01) * (this.move)) + this.startPos.x;
        }
    }
}

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}
  

export class Soundboard{
    active = sm.getBoolean("soundboard.active");
    audio = new Audio("./lib/sounds/Jingle_Bells.mp3");
    promise = null;

    constructor(){
        this.audio.loop = true;
        window.onload = () => {
            if(this.active){
                this.play();
            }
        }
    }

    play(){
        this.promise = this.audio.play();
        if(this.promise){
            this.promise.catch(function(error) { console.error(error); });
        }
    }

    pause(){
        this.promise = this.audio.pause();
        if(this.promise){
            this.promise.catch(function(error) { console.error(error); });
        }
    }

    toggle(btn){
        btn.disabled = true;
        this.active = !this.active;
        if(this.active){
            this.play();
            btn.innerText = "Musik deaktivieren";
        }
        else{
            this.pause();
            btn.innerText = "Musik aktivieren";
        }
        sm.set("soundboard.active", this.active);
        btn.disabled = false;
    }
}