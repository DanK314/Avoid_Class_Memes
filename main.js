const canvas = document.getElementById('Main');
const ctx = canvas.getContext('2d');
const SW = canvas.width;
const SH = canvas.height;
const FPS = 120;
const GroundY = SH - 30;
const Gravity = 0.5;
const ObjectColor = "#68c0f7FF";

function Rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

class Player {
    constructor(x, y, w, h, hp) {
        this.x = x;
        this.y = y;
        this.yVelocity = 0;
        this.w = w;
        this.h = h;
        this.hp = hp;
    }
    update() {
        this.y += this.yVelocity;
        if (this.y + this.h < GroundY) {
            this.yVelocity += Gravity;
        } else {
            this.y = GroundY - this.h;
            this.yVelocity = 0;
        }
        if (this.x + this.w > SW) {
            this.x = SW - this.w;
        }
        if (this.x < 0) {
            this.x = 0;
        }
    }
    move(dx, dy) {
        this.x += dx;
        this.y += dy;
    }
    draw(ctx) {
        ctx.fillStyle = "#68c0f7FF";
        ctx.fillRect(this.x, this.y, this.w, this.h);
    }
    jump() {
        if (this.y + this.h >= GroundY) {
            this.yVelocity -= 15;
        }
    }
}

class ObstacleE {
    constructor(Image) {
        this.x = -200;
        this.y = GroundY - 200;
        this.w = 200;
        this.h = 200;
        this.Activate = false;
        this.Ready = 0;
        this.way = 1;
        this.Image = Image;
    }
    update() {
        if (this.Activate) {
            if (this.Ready >= 100) {
                if (this.x < 200 && this.way === 1) {
                    this.x += 5;
                } else {
                    this.way = -1;
                    this.x -= 5;
                }
                if (this.way === -1 && this.x <= -200) {
                    this.way = 1;
                    this.Activate = false;
                    this.Ready = 0;
                }
            } else {
                this.Ready++;
            }
        }
    }
    draw(ctx) {
        if (this.Activate) {
            if (this.Ready >= 100) {
                if (this.Image && this.Image.complete) {
                    ctx.drawImage(this.Image, this.x, this.y, this.w, this.h);
                }
            } else {
                ctx.fillStyle = "#68c0f7CC";
                ctx.fillRect(0, GroundY - this.h, this.w, this.h);
            }
        }
    }
    check(P) {
        return (this.x < P.x + P.w && this.x + this.w > P.x && this.y < P.y + P.h && this.y + this.h > P.y);
    }
}

class ObstacleYeah{
    constructor(image){
        this.w = 50;
        this.h = 50;
        this.x = Rand(0,SW-this.w);
        this.y = -10;
        this.dy = 0;
        
        this.Image = image;
    }
    update(){
        this.y += this.dy;
        if(this.dy < 7){
            this.dy += 0.1;
        }
    }
    draw(ctx){
        ctx.drawImage(this.Image, this.x, this.y, this.w, this.h);
    }
    check(P) {
        return (this.x < P.x + P.w && this.x + this.w > P.x && this.y < P.y + P.h && this.y + this.h > P.y);
    }
}
class ObstacleYeahManager{
    constructor(A,B,C){
        this.i = [];
        this.image = [A,B,C];
        this.Activate = false;
        this.c = 0;
        this.timer = 0;
    }
    update() {
        if (this.Activate) {
            if(this.c <= 30){
                if(this.timer >= 30){
                    this.i.push(new ObstacleYeah(this.image[this.c < 3 ? this.c : 2]));
                    this.c += 1;
                    this.timer = 0;
                }
                this.timer++
            }else{
                this.Activate = false;
                this.c = 0
            }
        }
        for (let Obj of this.i) {
            Obj.update();
            if (Obj.y > SH) {
                Obj = null;
            }
        }
    }
    draw(ctx){
        for (let obstacle of this.i) {
            obstacle.draw(ctx);
        }
    }
    check(P) {
        for (let obstacle of this.i) {
            if (obstacle.check(P)) {
                return true;
            }
        }
        return false;
    }
}
class ObstacleDuKaTi{
    constructor(i1,i2,i3){
        this.w = 200;
        this.h = 200;
        this.I = [i1,i2,i3];
        this.x = [0,(SW/2)-(this.w/2),SW-this.w];
        this.y = [-300,-300,-300];
        this.dy = [0,0,0];
        this.Activate = false;
        this.Move = [false,false,false];
        this.timer = 0;
    }
    draw(ctx){
        for(let i of [0,1,2]){
            ctx.drawImage(this.I[i],this.x[i],this.y[i],this.w,this.h);
        }
    }
    update(){
        if(this.Activate){
            for(let i of [0,1,2]){
                if(this.Move[i]){
                    if(this.y[i] <= GroundY - this.h){
                        this.y[i] += this.dy[i];
                        this.dy[i] += 0.1;
                    }else{
                        this.y[i] = GroundY - this.h;
                        this.dy[i] = 0
                    }
                }
            }
            if(this.timer >= 0){
                this.Move[0] = true;
            }
            if (this.timer >= 50) {
                this.Move[1] = true;
            }
            if (this.timer >= 100){
                this.Move[2] = true;
            }
            if(this.timer >= 500){
                this.x = [0,(SW/2)-(this.w/2),SW-this.w];
                this.y = [-300,-300,-300];
                this.dy = [0,0,0];
                this.Activate = false;
                this.Move = [false,false,false];
                this.timer = 0
            }
            this.timer++;
        }
    }
    check(P){
        return(
            (this.x[0] < P.x + P.w
                && this.x[0] + this.w > P.x
                && this.y[0] < P.y + P.h
                && this.y[0] + this.h > P.y
            )
            ||
            (this.x[1] < P.x + P.w
                && this.x[1] + this.w > P.x
                && this.y[1] < P.y + P.h
                && this.y[1] + this.h > P.y
            )
            ||
            (this.x[2] < P.x + P.w
                && this.x[2] + this.w > P.x
                && this.y[2] < P.y + P.h
                && this.y[2] + this.h > P.y
            )
        );
    }
}
let player;
let RP = false;
let LP = false;
let Scene = 0;
let Obstacles = [];
let tick = 0;

// 이미지와 사운드 배열 및 로드 상태
const Images = [new Image(),new Image(),new Image(),new Image(),new Image(),new Image(),new Image];
const Sounds = [new Audio(),new Audio(),new Audio()];
let imagesLoadedCount = 0;
let soundsLoadedCount = 0;
const totalImages = Images.length;
const totalSounds = Sounds.length;

function reset() {
    player = new Player(SW / 2, 0, 30, 30);
    RP = false;
    LP = false;
    Scene = 0;
    Obstacles = [
        new ObstacleE(Images[0]),
        new ObstacleYeahManager(Images[1],Images[2],Images[3]),
        new ObstacleDuKaTi(Images[4],Images[5],Images[6])
    ];
    tick = 0;
}

function mainloop() {
    if (Scene === 0) {
        ctx.fillStyle = "#000F";
        ctx.fillRect(0, 0, SW, SH);
        ctx.fillStyle = ObjectColor;
        ctx.font = '40px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText("Avoid Class Memes", (SW / 2), 50);
        ctx.font = '20px Arial';
        ctx.fillText("Press Enter to Start", (SW / 2), SH - 50);
    } else if (Scene === 1) {
        
        ctx.fillStyle = "#000F";
        ctx.fillRect(0, 0, SW, SH);
        if (RP) {
            player.move(5, 0);
        }
        if (LP) {
            player.move(-5, 0);
        }
        player.update();
        player.draw(ctx);

        for (let Obstacle of Obstacles) {
            Obstacle.update();
            Obstacle.draw(ctx);
            if (Obstacle.check(player)) {
                Scene = 2;
            }
        }

        ctx.fillStyle = ObjectColor;
        ctx.fillRect(0, GroundY, SW, 1);

        if (tick % 1000 === 0) {
            let obs = Rand(0, Obstacles.length - 1);
            Obstacles[obs].Activate = true;
            Obstacles[obs].Ready = 0;
            // 사운드 재생
            Sounds[obs].currentTime = 0;
            Sounds[obs].play();
        }
        tick++;
    } else {
        ctx.fillStyle = "#000F";
        ctx.fillRect(0, 0, SW, SH);
        ctx.fillStyle = ObjectColor;
        ctx.font = '40px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText("Game Over...", (SW / 2), 50);
        ctx.font = '20px Arial';
        ctx.fillText("Press R to Restart", (SW / 2), SH - 50);
    }
}

function loadImagesAndSounds() {
    Images[0].src = 'E.png';
    Images[1].src = 'Yeah!1.png';
    Images[2].src = 'Yeah!2.png';
    Images[3].src = 'Yeah!3.png';
    Images[4].src = 'DuKaTi1.png';
    Images[5].src = 'DuKaTi2.png';
    Images[6].src = 'DuKaTi3.png';

    for (let i = 0; i < Images.length; i++) {
        Images[i].onload = () => {
            imagesLoadedCount++;
            checkAllLoaded();
        };
        Images[i].onerror = () => {
            console.error(`Failed to load image: ${Images[i].src}`);
        };
    }
    
    Sounds[0].src = 'ESound.mp3';
    Sounds[1].src = 'Yeah.mp3';
    Sounds[2].src = 'DuCaTi.mp3'

    for (let i = 0; i < Sounds.length; i++) {
        Sounds[i].addEventListener('canplaythrough', () => {
            soundsLoadedCount++;
            checkAllLoaded();
        }, { once: true });
        Sounds[i].addEventListener('error', () => {
            console.error(`Failed to load sound: ${Sounds[i].src}`);
        });
        Sounds[i].load();
    }
}

function checkAllLoaded() {
    if (imagesLoadedCount === totalImages && soundsLoadedCount === totalSounds) {
        startMainLoop();
    }
}

function startMainLoop() {
    reset();

    window.addEventListener('keydown', e => {
        if (Scene === 0) {
            if (e.key === 'Enter') {
                reset();
                Scene = 1;
            }
        } else if (Scene === 1) {
            switch (e.key) {
                case 'ArrowUp': case 'W': case 'w':
                    player.jump();
                    break;
                case 'ArrowRight': case 'D': case 'd':
                    RP = true;
                    break;
                case 'ArrowLeft': case 'A': case 'a':
                    LP = true;
                    break;
            }
        } else {
            if (e.key.toLowerCase() === 'r') {
                Scene = 0;
            }
        }
    });

    window.addEventListener('keyup', e => {
        if (Scene === 1) {
            if (e.key === 'ArrowRight' || e.key.toLowerCase() === "d") {
                RP = false;
            }
            if (e.key === 'ArrowLeft' || e.key.toLowerCase() === "a") {
                LP = false;
            }
        }
    });

    setInterval(mainloop, 1000 / FPS);
}

loadImagesAndSounds();
