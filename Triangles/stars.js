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
    FPS = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? 30 : 60,
    stars = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? 25 : 50,
    maxDiv = -11.5,
    maxDist = -1*Math.sqrt(Math.pow(window.innerWidth, 2) + Math.pow(window.innerHeight, 2)) / maxDiv,
    maxRadius = maxDist * Math.sqrt(3) / 3,
    speed = 0.25,
    thick = 3.5,
    //lines = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? 3 : 5,
    lines = 10,
    G = 200,
    gravity = false,
    showDots = false,
    tether = false;

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
    setInterval(loop, 1000 / FPS);
    console.log(new Date().getTime());
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
function loop() {
    // update screen size
    if (window.innerWidth != canvas.width || window.innerHeight != canvas.height) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        maxDist = -1*Math.sqrt(Math.pow(window.innerWidth, 2) + Math.pow(window.innerHeight, 2)) / maxDiv;
    }
    context.clearRect(0, 0, canvas.width, canvas.height);
    for (var i = 0; i < dots.length; i++) dots[i].update();
    for (var i = 0; i < dots.length; i++) dots[i].ids.clear();
    Render(context);
}


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

function Render(c) {
    for (var x=0; x<dots.length; x++) {
        if (lines > 0 && dots[x].ids.size > lines) continue;
        for (var y=x+1; y<dots.length; y++) {
            if (lines > 0 && dots[y].ids.size > lines) continue;
            if (Math.sqrt(Math.pow(dots[x].pos.x - dots[y].pos.x, 2) + Math.pow(dots[x].pos.y - dots[y].pos.y, 2)) > maxDist) continue;
            for (var z=y+1; z<dots.length; z++) {
                
                if (lines > 0 && dots[z].ids.size > lines) continue;
                if (Math.sqrt(Math.pow(dots[z].pos.x - dots[y].pos.x, 2) + Math.pow(dots[z].pos.y - dots[y].pos.y, 2)) > maxDist || Math.sqrt(Math.pow(dots[z].pos.x - dots[x].pos.x, 2) + Math.pow(dots[z].pos.y - dots[x].pos.y, 2)) > maxDist) {
                    // var grd = c.createLinearGradient(dots[x].pos.x, dots[x].pos.y, dots[x].pos.x, dots[y].pos.y),                                
                    //     alpha = 1-(Math.sqrt(Math.pow(dots[x].pos.x - dots[y].pos.x, 2) + Math.pow(dots[x].pos.y - dots[y].pos.y, 2))/maxDist),
                        
                    //     cC = "rgba(" + dots[x].r + "," + dots[x].g + "," + dots[x].b + "," + alpha + ")",
                    //     cB = "rgba(" + dots[y].r + "," + dots[y].g + "," + dots[y].b + "," + alpha + ")";                

                    // grd.addColorStop(0, cC); grd.addColorStop(1, cB);                            
                    // c.beginPath(); c.moveTo(dots[x].pos.x, dots[x].pos.y); 
                    // c.lineTo(dots[y].pos.x, dots[y].pos.y);        
                    // c.strokeStyle = grd; c.lineWidth=1; c.stroke();   
                    // c.closePath();
                    continue;
                }
                dots[x].ids.add(dots[y].id); dots[x].ids.add(dots[z].id); 
                dots[y].ids.add(dots[z].id); dots[y].ids.add(dots[x].id); 
                dots[z].ids.add(dots[x].id); dots[z].ids.add(dots[y].id); 

                center = { x: (dots[x].pos.x + dots[y].pos.x + dots[z].pos.x) / 3, y: (dots[x].pos.y + dots[y].pos.y + dots[z].pos.y) / 3, A:0, B:0, C:0 };
                center.A = Math.sqrt(Math.pow(dots[x].pos.x - center.x, 2) + Math.pow(dots[x].pos.y - center.y, 2));
                if (center.A > maxRadius) continue;
                center.B = Math.sqrt(Math.pow(dots[y].pos.x - center.x, 2) + Math.pow(dots[y].pos.y - center.y, 2));
                if (center.B > maxRadius) continue;
                center.C = Math.sqrt(Math.pow(dots[z].pos.x - center.x, 2) + Math.pow(dots[z].pos.y - center.y, 2));
                if (center.C > maxRadius) continue;
                       
                var AB = { x: (dots[x].pos.x + dots[y].pos.x) / 2, y: (dots[x].pos.y + dots[y].pos.y) / 2 },
                    BC = { x: (dots[y].pos.x + dots[z].pos.x) / 2, y: (dots[y].pos.y + dots[z].pos.y) / 2 },
                    CA = { x: (dots[z].pos.x + dots[x].pos.x) / 2, y: (dots[z].pos.y + dots[x].pos.y) / 2 },                

                    gA = c.createLinearGradient(dots[x].pos.x, dots[x].pos.y, BC.x, BC.y),
                    gB = c.createLinearGradient(dots[y].pos.x, dots[y].pos.y, CA.x, CA.y),
                    gC = c.createLinearGradient(dots[z].pos.x, dots[z].pos.y, AB.x, AB.y),

                    alphaA = 1-(center.A/maxRadius),
                    alphaB = 1-(center.B/maxRadius),        
                    alphaC = 1-(center.C/maxRadius);        

                if (alphaA > .5) alphaA *= (alphaA-.5)+1;            
                if (alphaB > .5) alphaB *= (alphaB-.5)+1;            
                if (alphaC > .5) alphaC *= (alphaC-.5)+1;     

                //console.log("X: "+dots[x].id+", Y: "+dots[y].id+", Z: "+dots[z].id);

                // var index=0, minalph = 3;
                // if (alphaA < minalph) { minalph = alphaA; index = dots[x].id;}
                // if (alphaB < minalph) { minalph = alphaB; index = dots[y].id;}
                // if (alphaC < minalph) { minalph = alphaC; index = dots[z].id;}

                // if (index != dots[x].id) alphaA *= minalph;
                // if (index != dots[y].id) alphaB *= minalph;
                // if (index != dots[z].id) alphaC *= minalph;

                alphaA *= Math.min(alphaA, alphaB, alphaC);
                alphaC *= Math.min(alphaA, alphaB, alphaC);                       
                alphaB *= Math.min(alphaA, alphaB, alphaC);

                // alphaA *= alphaB*alphaC;                
                // alphaB *= alphaA*alphaC;
                // alphaC *= alphaA*alphaB;

                var cA = "rgba(" + dots[x].r + "," + dots[x].g + "," + dots[x].b + "," + alphaA + ")",
                    cB = "rgba(" + dots[y].r + "," + dots[y].g + "," + dots[y].b + "," + alphaB + ")",
                    cC = "rgba(" + dots[z].r + "," + dots[z].g + "," + dots[z].b + "," + alphaC + ")",
                    c0 = "rgba(0,0,0,0)";

                    c0 = "rgba(0,0,0,0)";                

                gA.addColorStop(0, cA);
                gA.addColorStop(1, c0);
                gB.addColorStop(0, cB);
                gB.addColorStop(1, c0);
                gC.addColorStop(0, cC);
                gC.addColorStop(1, c0);

                c.beginPath();
                c.moveTo(dots[x].pos.x, dots[x].pos.y);

                c.lineTo(dots[y].pos.x, dots[y].pos.y);
                c.lineTo(dots[z].pos.x, dots[z].pos.y);

                // c.quadraticCurveTo(center.x, center.y, dots[y].pos.x, dots[y].pos.y);
                // c.quadraticCurveTo(center.x, center.y, dots[z].pos.x, dots[z].pos.y);
                // c.quadraticCurveTo(center.x, center.y, dots[x].pos.x, dots[x].pos.y);

                //c.globalCompositeOperation = 'screen';
                c.globalCompositeOperation = 'lighten';
                c.fillStyle = gA;
                c.fill();

                c.fillStyle = gB;
                c.fill();

                c.fillStyle = gC;
                c.fill();
                c.globalCompositeOperation = 'source-over';
            }
        }
    }
};