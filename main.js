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

let player;
let RP = false;
let LP = false;
let Scene = 0;
let Obstacles = [];
let tick = 0;

// 이미지와 사운드 배열 및 로드 상태
const Images = [new Image()];
const Sounds = [new Audio()];
let imagesLoadedCount = 0;
let soundsLoadedCount = 0;
const totalImages = Images.length;
const totalSounds = Sounds.length;

function reset() {
    player = new Player(SW / 2, 0, 30, 30);
    RP = false;
    LP = false;
    Scene = 1;
    Obstacles = [new ObstacleE(Images[0])];
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
        tick++;
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
            let obs = Obstacles[Rand(0, Obstacles.length - 1)];
            obs.Activate = true;
            obs.Ready = 0;
            // 사운드 재생
            Sounds[0].currentTime = 0;
            Sounds[0].play();
        }
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
    for (let i = 0; i < Images.length; i++) {
        Images[i].onload = () => {
            imagesLoadedCount++;
            checkAllLoaded();
        };
        Images[i].onerror = () => {
            console.error(`Failed to load image: ${Images[i].src}`);
        };
        Images[i].src = 'E.png';  // 이미지 경로
    }

    for (let i = 0; i < Sounds.length; i++) {
        Sounds[i].addEventListener('canplaythrough', () => {
            soundsLoadedCount++;
            checkAllLoaded();
        }, { once: true });
        Sounds[i].addEventListener('error', () => {
            console.error(`Failed to load sound: ${Sounds[i].src}`);
        });
        Sounds[i].src = 'ESound.mp3';  // 사운드 경로
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
                case 'ArrowUp':
                    player.jump();
                    break;
                case 'ArrowRight':
                    RP = true;
                    break;
                case 'ArrowLeft':
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
            if (e.key === 'ArrowRight') {
                RP = false;
            }
            if (e.key === 'ArrowLeft') {
                LP = false;
            }
        }
    });

    setInterval(mainloop, 1000 / FPS);
}

loadImagesAndSounds();
