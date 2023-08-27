const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = 700;
canvas.height = 450;

const images = [
    "jinbei",
    "brook",
    "franky",
    "robin",
    "nami", 
    "sanji", 
    "chopper", 
    "zoro", 
    "ussop", 
    "luffy", 
];
const X = [180, 80, 380, 20, 50, 150, 330, 430, 550, 250];

let imagesLoaded = [];
// create new images and wait to load all
images.forEach((src, i) => {
    const image = new Image();
    image.src = `./img/${src}.png`;
    image.setAttribute('x', X[i]);

    image.addEventListener('load', () => {
        imagesLoaded.push(image);
        if( imagesLoaded.length == images.length ) {
            loaded();
        }
    });
});

class Particle {
    constructor(effect, x, y, color) {
        this.effect = effect;
        this.x = x;
        this.y = y;
        this.originY = this.y;
        this.originX = this.x;
        this.color = color;
        this.size = this.effect.size;
        this.selected = this.effect.selected;
        this.directionX = Math.max(2, Math.random() * 10);
        // this.directionX = (Math.random() * 20) - 10;
        this.directionY = Math.max(5, Math.random() * 10);
        this.opacity = 1;
    }
    update() {
        if( ! this.selected ) return;
        if( this.opacity <= 0 ) return;

        if( this.y < this.effect.cy + this.effect.hy + (Math.random() * 50) ) {
            // add fading effect
            let dx = this.x - this.originX;
            let dy = this.y - this.originY;
            let distance = Math.hypot(dx, dy);
            this.opacity = 1 - (0.009 * distance);

            this.y -= this.directionY;
            this.x += this.directionX;
        } 
    }
    draw() {
        if( this.opacity <= 0 ) return;
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color; 
        ctx.fillRect(this.x, this.y, this.size, this.size);
        ctx.restore();
    }
}

class Effect {
    constructor(image, width, height, selected, x) {
        this.width = width;
        this.height = height;
        this.image = image;
        this.selected = selected;
        this.particles = [];
        this.size = 2;
        this.x = x;
        this.y = this.height - this.image.height;
        this.hy = null;
        this.cy = 0;
        this.start = false;
        this.finished = false;

        this.init();
    }
    init() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(this.image, this.x, this.y);
        if( ! this.selected ) return;
        const pixel = ctx.getImageData(0, 0, this.width, this.height).data;
        for( let y = 0; y < this.height; y += this.size ) {
            for( let x = 0; x < this.width; x += this.size ) {
                const index = (y * this.width + x) * 4;
                const red = pixel[index];
                const green = pixel[index+1];
                const blue = pixel[index+2];
                const alpha = pixel[index+3];
                const color = `rgb(${red}, ${green}, ${blue})`;

                if( alpha > 0 ) {
                    this.particles.push(new Particle(this, x, y, color));
                    if( ! this.hy ) {
                        this.hy = y;
                    }
                }
            }
        }
    }
    update() {
        this.particles.forEach(p=>p.update());
        if( this.cy > (this.height * 0.5) || ! this.selected ) {
            this.finished = true;
        }
    }
    draw() {
        if( this.start ) {
            this.particles.forEach(p=>p.draw());
        }
        if( ! this.selected || ! this.start ) {
            ctx.drawImage(this.image, this.x, this.y);
        }
    }
}

const effects = [];

function loaded() {
    // shuffle images
    const keys = Object.keys(imagesLoaded);
    let = randomKeys = [...keys].sort(() => 0.5 - Math.random());
    // get half
    randomKeys = [...randomKeys].slice(0, Math.floor(randomKeys.length/2));

    // add images to canvas
    imagesLoaded.forEach((image, i) => {
        let x = image.getAttribute('x');
        const effect = new Effect(image, canvas.width, canvas.height, randomKeys.includes(i.toString()), x);
        effects.push(effect);
    });

    animate();
}
let start = false;
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    effects.forEach((e, i) => {
        // e.cy += Math.max(10, Math.random() * 20) + (i * 50);
        const p = i == 0 ? true : effects[i-1].finished;
        if( start && p ) {
            // e.cy = (i * -(p*0.5)) + c;
            e.cy += Math.max(10, Math.random() * 10);
            e.start = true;
            e.update();
        }
        e.draw();
    });
    requestAnimationFrame(animate);
}
const snap = document.querySelector('.snap');
snap.addEventListener('click', () => {
    snap.src = "./img/thanos-gauntlet-1.gif";
    setTimeout(() => {
        start = true;
        snap.src = "./img/thanos-gauntlet-0.png";
    }, 3000)
});
