  /*		#TO-DO#
  • Gravity
  • Dropdown for different rendering
    ► round or square ends
    ► circles
    ► triangles
    ► ????
  • Text feedback for sliders – hovering JS text?
  • Click to add dot (increase max value)
  • Fade triangles better
  • Make sure checkbox speedbug is fixed on merge
  */

var mousePos = { x: window.innerWidth / 2, y: window.innerHeight / 2 },
    canvas = document.createElement('canvas'),
    context = canvas.getContext('2d'),
    dots = [],
    //FPS = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? 30 : 60,
    //stars = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? 25 : 50,
    stars = 270,
    maxDiv = -19,
    maxDist = -1*Math.sqrt(Math.pow(window.innerWidth, 2) + Math.pow(window.innerHeight, 2)) / maxDiv,
    maxRadius = maxDist * Math.sqrt(3) / 3,
    speed = 2.25,
    thick = 3.5,
    //lines = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? 3 : 5,
    lines = 0,
    G = 200,
    gravity = false,
    showDots = false,
    tether = false,

    frames = 0,
    fps = 0,
    date = new Date();

//Initialize
$(document).ready(function() {
    document.getElementById('canvas').appendChild(canvas);
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    $('input[type="range"]').each(function(i) {
        this.value = window[this.id];
    });
    $('input[type="checkbox"]').each(function(i) {
        this.checked = window[this.id] ? window[this.id].toString() : "";
    });
    for (var i = 0; i < stars; i++) dots.push(new Dot(i));
    //setInterval(loop, 1000 / FPS);
});

//update mouse position
$(document).mousemove(function(e) {
    e.preventDefault();
    mousePos = { x: e.clientX, y: e.clientY };
});

//Slider and checkbox updates
$(function() {
    $('input[type="range"]').change(function(e) {
        if (e.target.id == 'speed') {
            for (let d of dots) {
                d.vel.x *= e.target.value / speed;
                d.vel.y *= e.target.value / speed;
            }
        }

        window[e.target.id] = e.target.value;
        console.log(e.target.id + " -> " + e.target.value);

        if (e.target.id == 'maxDiv') {
            maxDist = -1*Math.sqrt(Math.pow(window.innerWidth, 2) + Math.pow(window.innerHeight, 2)) / maxDiv;
            maxRadius = maxDist * Math.sqrt(3) / 3;
        }

        if (stars < dots.length) {
            dots = dots.slice(0, stars);
        } else if (stars > dots.length)
            for (var i = dots.length; i < stars; i++) dots.push(new Dot(i));
    });

    $('input[type="checkbox"]').change(function(e) {
        window[e.target.value] = e.target.checked;
        if (tether) for (let d of dots) { d.vel.x *= 2; d.vel.y *= 2; }
        else for (let d of dots) { d.vel.x /= 2;  d.vel.y /= 2; }
    });
})


//Loop function
! function loop() {
    // update screen size
    frames++;
    if (new Date()-date >= 1000) {
        date = new Date();
        fps = frames;
        frames = 0;
        console.log("   "+Math.random()*100+"   "+fps);
    }

    if (window.innerWidth != canvas.width || window.innerHeight != canvas.height) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      maxDistance = Math.sqrt(Math.pow(window.innerWidth, 2) + Math.pow(window.innerHeight, 2)) / maxDiv;
    }

    context.clearRect(0, 0, canvas.width, canvas.height);

    context.font = '10px sans-serif';
    context.fillStyle="white";
    context.fillText(fps+" FPS",5,window.innerHeight-5);

    for (var i = 0; i < dots.length; i++) dots[i].update();
    for (var i = 0; i < dots.length; i++) dots[i].friend();
    Render(context);
    setTimeout(loop, 0);
}();

//Dot class constructor
function Dot(ID) {
    this.pos = { x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight };
    this.vel = { x: Math.random() * speed * (Math.round(Math.random()) ? 1 : -1), y: 0 };
    //this.vel.y = Math.random() * speed * (Math.round(Math.random()) ? 1 : -1);
    this.vel.y = Math.sqrt(Math.pow(speed, 2) - Math.pow(this.vel.x, 2)) * (Math.round(Math.random()) ? 1 : -1)
    this.r = Math.round(Math.random() * 255);
    this.g = Math.round(Math.random() * 255);
    this.b = Math.round(Math.random() * 255);
    this.id = ID;
    this.ids = new Set();
}

//Update Dot's position
Dot.prototype.update = function() {
    if (tether && this.ids.size > 0) {
        X = this.vel.x, Y = this.vel.y;
        for (let d of this.ids) {
            if (!dots[d]) break;
            X += dots[d].vel.x;
            Y += dots[d].vel.y;
        }
        X /= (this.ids.size + 1);
        Y /= (this.ids.size + 1);
        this.pos.x += (4 * X + this.vel.x) / 5;
        this.pos.y += (4 * Y + this.vel.y) / 5;
    }
    else { this.pos.x += this.vel.x; this.pos.y += this.vel.y; }

    if (this.pos.x <= 0) this.vel.x *= (this.vel.x > 0 ? 1 : -1);
    if (this.pos.x >= window.innerWidth) { this.vel.x *= (this.vel.x < 0 ? 1 : -1); this.pos.x = window.innerWidth; }
    if (this.pos.y <= 0) this.vel.y *= (this.vel.y > 0 ? 1 : -1);
    if (this.pos.y >= window.innerHeight) { this.vel.y *= (this.vel.y < 0 ? 1 : -1);  this.pos.y = window.innerHeight; }
};

Dot.prototype.friend = function() {
   this.ids.clear();
    for (var i = 0; i < dots.length; i++) {
        if (lines > 0 && this.ids.size >= lines) break;
        if (this.id == i || dots[i].ids.has(this.id)) continue;
        var distance = Math.sqrt(Math.pow(this.pos.x - dots[i].pos.x, 2) + Math.pow(this.pos.y - dots[i].pos.y, 2));
        if (distance <= maxDist) { this.ids.add(i); dots[i].ids.add(this.id); }
        //this.ids.set(i, distance);
        //dots[i].ids.set(this.id, distance);
    }
};

function Render(c) {
    //console.log("Frame");
    for (let d of dots) {
        if (d.ids.size > 0) for (var x of d.ids) {
            if (d.ids.size > 0) for (var y of dots[x].ids) {
                // if (Math.sqrt(Math.pow(dots[y].pos.x - dots[x].pos.x, 2) + Math.pow(dots[y].pos.y - dots[x].pos.y, 2)) > maxDist || Math.sqrt(Math.pow(dots[y].pos.x - d.pos.x, 2) + Math.pow(dots[y].pos.y - d.pos.y, 2)) > maxDist) {
                //     // var grd = c.createLinearGradient(d.pos.x, d.pos.y, d.pos.x, dots[x].pos.y),
                //     //     alpha = 1-(Math.sqrt(Math.pow(d.pos.x - dots[x].pos.x, 2) + Math.pow(d.pos.y - dots[x].pos.y, 2))/maxDist),

                //     //     cC = "rgba(" + d.r + "," + d.g + "," + d.b + "," + alpha + ")",
                //     //     cB = "rgba(" + dots[x].r + "," + dots[x].g + "," + dots[x].b + "," + alpha + ")";

                //     // grd.addColorStop(0, cC); grd.addColorStop(1, cB);
                //     // c.beginPath(); c.moveTo(d.pos.x, d.pos.y);
                //     // c.lineTo(dots[x].pos.x, dots[x].pos.y);
                //     // c.strokeStyle = grd; c.lineWidth=1; c.stroke();
                //     // c.closePath();
                //     continue;
                // }

                var center = { x: (d.pos.x + dots[x].pos.x + dots[y].pos.x) / 3, y: (d.pos.y + dots[x].pos.y + dots[y].pos.y) / 3, A:0, B:0, C:0 };
                center.A = Math.sqrt(Math.pow(d.pos.x - center.x, 2) + Math.pow(d.pos.y - center.y, 2));
                if (center.A > maxRadius) continue;
                center.B = Math.sqrt(Math.pow(dots[x].pos.x - center.x, 2) + Math.pow(dots[x].pos.y - center.y, 2));
                if (center.B > maxRadius) continue;
                center.C = Math.sqrt(Math.pow(dots[y].pos.x - center.x, 2) + Math.pow(dots[y].pos.y - center.y, 2));
                if (center.C > maxRadius) continue;

                var AB = { x: (d.pos.x + dots[x].pos.x) / 2, y: (d.pos.y + dots[x].pos.y) / 2 },
                    BC = { x: (dots[x].pos.x + dots[y].pos.x) / 2, y: (dots[x].pos.y + dots[y].pos.y) / 2 },
                    CA = { x: (dots[y].pos.x + d.pos.x) / 2, y: (dots[y].pos.y + d.pos.y) / 2 },

                    gA = c.createLinearGradient(d.pos.x, d.pos.y, BC.x, BC.y),
                    gB = c.createLinearGradient(dots[x].pos.x, dots[x].pos.y, CA.x, CA.y),
                    gC = c.createLinearGradient(dots[y].pos.x, dots[y].pos.y, AB.x, AB.y),

                    alphaA = 1-(center.A/maxRadius),
                    alphaB = 1-(center.B/maxRadius),
                    alphaC = 1-(center.C/maxRadius);

                if (alphaA > .5) alphaA *= (alphaA-.5)+1;
                if (alphaB > .5) alphaB *= (alphaB-.5)+1;
                if (alphaC > .5) alphaC *= (alphaC-.5)+1;

                //console.log("X: "+d.id+", Y: "+dots[x].id+", Z: "+dots[y].id);

                // var index=0, minalph = 3;
                // if (alphaA < minalph) { minalph = alphaA; index = d.id;}
                // if (alphaB < minalph) { minalph = alphaB; index = dots[x].id;}
                // if (alphaC < minalph) { minalph = alphaC; index = dots[y].id;}

                // if (index != d.id) alphaA *= minalph;
                // if (index != dots[x].id) alphaB *= minalph;
                // if (index != dots[y].id) alphaC *= minalph;

                alphaA *= Math.min(alphaA, alphaB, alphaC);
                alphaC *= Math.min(alphaA, alphaB, alphaC);
                alphaB *= Math.min(alphaA, alphaB, alphaC);

                // alphaA *= alphaB*alphaC;
                // alphaB *= alphaA*alphaC;
                // alphaC *= alphaA*alphaB;

                var cA = "rgba(" + d.r + "," + d.g + "," + d.b + "," + alphaA + ")",
                    cB = "rgba(" + dots[x].r + "," + dots[x].g + "," + dots[x].b + "," + alphaB + ")",
                    cC = "rgba(" + dots[y].r + "," + dots[y].g + "," + dots[y].b + "," + alphaC + ")",
                    c0 = "rgba(0,0,0,0)";

                    c0 = "rgba(0,0,0,0)";

                gA.addColorStop(0, cA);
                gA.addColorStop(1, c0);
                gB.addColorStop(0, cB);
                gB.addColorStop(1, c0);
                gC.addColorStop(0, cC);
                gC.addColorStop(1, c0);

                c.beginPath();
                c.moveTo(d.pos.x, d.pos.y);

                c.lineTo(dots[x].pos.x, dots[x].pos.y);
                c.lineTo(dots[y].pos.x, dots[y].pos.y);

                // c.quadraticCurveTo(center.x, center.y, dots[x].pos.x, dots[x].pos.y);
                // c.quadraticCurveTo(center.x, center.y, dots[y].pos.x, dots[y].pos.y);
                // c.quadraticCurveTo(center.x, center.y, d.pos.x, d.pos.y);

                //c.globalCompositeOperation = 'screen';
                //c.globalCompositeOperation = 'lighten';
                c.fillStyle = gA;
                c.fill();

                c.fillStyle = gB;
                c.fill();

                c.fillStyle = gC;
                c.fill();
                //c.globalCompositeOperation = 'source-over';

                //dots[x].ids.delete(y);
                //d.ids.delete(x);
            }
        }
    }
};
