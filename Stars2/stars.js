/*		#TO-DO#
• Gravity
• Text feedback for sliders – hovering JS text?
• Click to add dot (increase max value)
▲ Make sure checkbox speedbug is fixed on merge
▲ Make sure slider functionality is kept on merge

▲▲▲▲▲▲▲ Preserve maxDiv flip from Triangles

*/

  mousePos = { x: window.innerWidth / 2, y: window.innerHeight / 2 },
  canvas = document.createElement('canvas'),
  context = canvas.getContext('2d'),
  dots = [],
  //FPS = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? 30 : 60,
  stars = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? 25 : 50,
  //maxDist = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? 75 : 100,
  maxDiv = -4,
  maxDist = Math.sqrt(Math.pow(window.innerWidth, 2) + Math.pow(window.innerHeight, 2)) / maxDiv,
  maxRadius = maxDist * Math.sqrt(3) / 3,
  speed = 0.25,
  thick = 3.5,
  //lines = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? 3 : 5,
  lines = 10,
  G = 200,
  gravity = false,
  //showDots = false,
  tether = false,
  mode="s",

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
  //e.preventDefault();
  mousePos = { x: e.clientX, y: e.clientY	};
});

//Slider and checkbox updates
$(function() {
  $('input[type="range"]').on("input change",function(e) {
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
    if (e.target.id == 'tether') {
      if (tether) for (let d of dots) { d.vel.x *= 2; d.vel.y *= 2; }
      else for (let d of dots) { d.vel.x /= 2; d.vel.y /= 2; }
  }
  });

  $('select').change(function(e) {
    //console.log(this.options[this.selectedIndex].text+" : "+e.target.value)
      mode = e.target.value;
      console.log(mode);
      mode == "r" ? context.lineCap = "round" : context.lineCap = "square";
      mode == "t" || mode == "a" ? context.globalCompositeOperation = 'screen' : context.globalCompositeOperation = 'source-over';
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
    console.log(Math.random()*100+"   "+fps);
	}

    if (window.innerWidth != canvas.width || window.innerHeight != canvas.height) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      maxDist = -1*Math.sqrt(Math.pow(window.innerWidth, 2) + Math.pow(window.innerHeight, 2)) / maxDiv;
      maxRadius = maxDist * Math.sqrt(3) / 3;
    }

    context.clearRect(0, 0, canvas.width, canvas.height);

    context.font = '10px sans-serif';
	  context.fillStyle="white";
	  context.fillText(fps+" Hz",5,window.innerHeight-5);

    for (var i = 0; i < dots.length; i++) dots[i].update();
	  for (var i = 0; i < dots.length; i++) dots[i].ids.clear();
    //for (var i = 0; i < dots.length; i++) dots[i].render(context);
    render(context);
    setTimeout(loop, 0);
}();

//Dot class constructor
function Dot(ID) {
  this.pos = {
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight
  };
  this.vel = {
    x: Math.random() * speed * (Math.round(Math.random()) ? 1 : -1), y: 0 };
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
  } else {
    this.pos.x += this.vel.x;
    this.pos.y += this.vel.y;
  }
  if (this.pos.x <= 0) this.vel.x *= (this.vel.x > 0 ? 1 : -1);
  if (this.pos.x >= window.innerWidth) { this.vel.x *= (this.vel.x < 0 ? 1 : -1); this.pos.x = window.innerWidth; }
  if (this.pos.y <= 0) this.vel.y *= (this.vel.y > 0 ? 1 : -1);
  if (this.pos.y >= window.innerHeight) { this.vel.y *= (this.vel.y < 0 ? 1 : -1); this.pos.y = window.innerHeight; }
};

//Dot.prototype.render = function(c) {
function render(c) {
  for (var j = 0; j < dots.length; j++) {
    if (lines > 0 && dots[j].ids.size >= lines) continue;
    for (var i = j+1; i < dots.length; i++) {
      if (dots[j].id==i || dots[i].ids.has(dots[j].id)) continue;
      var distance = Math.sqrt(Math.pow(dots[j].pos.x - dots[i].pos.x, 2) + Math.pow(dots[j].pos.y - dots[i].pos.y, 2));
      if (distance > maxDist) continue;
      dots[j].ids.add(i);
      dots[i].ids.add(dots[j].id);

      if (mode == "s" || mode == "r" || mode == "c") {
        var grd = c.createLinearGradient(dots[j].pos.x, dots[j].pos.y, dots[i].pos.x, dots[i].pos.y),
        s1 = "rgba(" + dots[j].r + "," + dots[j].g + "," + dots[j].b + "," + 1.1 * (1 - (distance / maxDist)) + ")",
        s2 = 'rgba(' + dots[i].r + ',' + dots[i].g + ',' + dots[i].b + ',' + 1.1 * (1 - (distance / maxDist)) + ')';

        grd.addColorStop(0, s1);
        grd.addColorStop(1, s2);

        if (mode == "c") {
          c.beginPath();
          c.arc((dots[j].pos.x + dots[i].pos.x)/2, (dots[j].pos.y + dots[i].pos.y)/2, distance/2, 0, 2 * Math.PI);
          c.fillStyle = grd;
          c.fill()
        }
        else {
          c.beginPath();
          c.moveTo(dots[j].pos.x, dots[j].pos.y);
          c.lineTo(dots[i].pos.x, dots[i].pos.y);
          c.lineWidth = thick;
          c.strokeStyle = grd;
          c.stroke();
        }
      }

      else if (mode == 't' | mode == 'a') {
          for (var z=i+1; z<dots.length; z++) {
            if (lines > 0 && dots[z].ids.size > lines) continue;
            if (Math.sqrt(Math.pow(dots[z].pos.x - dots[i].pos.x, 2) + Math.pow(dots[z].pos.y - dots[i].pos.y, 2)) > maxDist || Math.sqrt(Math.pow(dots[z].pos.x - dots[j].pos.x, 2) + Math.pow(dots[z].pos.y - dots[j].pos.y, 2)) > maxDist) continue;

            center = { x: (dots[j].pos.x + dots[i].pos.x + dots[z].pos.x) / 3, y: (dots[j].pos.y + dots[i].pos.y + dots[z].pos.y) / 3, A:this.x, B:0, C:0 };

            center.A = Math.sqrt(Math.pow(dots[j].pos.x - center.x, 2) + Math.pow(dots[j].pos.y - center.y, 2));
            if (center.A > maxRadius) continue;
            center.B = Math.sqrt(Math.pow(dots[i].pos.x - center.x, 2) + Math.pow(dots[i].pos.y - center.y, 2));
            if (center.B > maxRadius) continue;
            center.C = Math.sqrt(Math.pow(dots[z].pos.x - center.x, 2) + Math.pow(dots[z].pos.y - center.y, 2));
            if (center.C > maxRadius) continue;

            var AB = { x: (dots[j].pos.x + dots[i].pos.x) / 2, y: (dots[j].pos.y + dots[i].pos.y) / 2 },
                BC = { x: (dots[i].pos.x + dots[z].pos.x) / 2, y: (dots[i].pos.y + dots[z].pos.y) / 2 },
                CA = { x: (dots[z].pos.x + dots[j].pos.x) / 2, y: (dots[z].pos.y + dots[j].pos.y) / 2 },

                gA = c.createLinearGradient(dots[j].pos.x, dots[j].pos.y, BC.x, BC.y),
                gB = c.createLinearGradient(dots[i].pos.x, dots[i].pos.y, CA.x, CA.y),
                gC = c.createLinearGradient(dots[z].pos.x, dots[z].pos.y, AB.x, AB.y),

                alphaA = 1-(center.A/maxRadius),
                alphaB = 1-(center.B/maxRadius),
                alphaC = 1-(center.C/maxRadius);

            if (alphaA > .5) alphaA *= (alphaA-.5)+1;
            if (alphaB > .5) alphaB *= (alphaB-.5)+1;
            if (alphaC > .5) alphaC *= (alphaC-.5)+1;

            alphaA *= Math.min(alphaA, alphaB, alphaC);
            alphaC *= Math.min(alphaA, alphaB, alphaC);
            alphaB *= Math.min(alphaA, alphaB, alphaC);

            var cA = "rgba(" + dots[j].r + "," + dots[j].g + "," + dots[j].b + "," + alphaA + ")",
                cB = "rgba(" + dots[i].r + "," + dots[i].g + "," + dots[i].b + "," + alphaB + ")",
                cC = "rgba(" + dots[z].r + "," + dots[z].g + "," + dots[z].b + "," + alphaC + ")",
                c0 = "rgba(0,0,0,0)";

            gA.addColorStop(0, cA);
            gA.addColorStop(1, c0);
            gB.addColorStop(0, cB);
            gB.addColorStop(1, c0);
            gC.addColorStop(0, cC);
            gC.addColorStop(1, c0);

            c.beginPath();
            c.moveTo(dots[j].pos.x, dots[j].pos.y);

            if (mode == 't') {
              c.lineTo(dots[i].pos.x, dots[i].pos.y);
              c.lineTo(dots[z].pos.x, dots[z].pos.y);
            }

            else {
              c.quadraticCurveTo(center.x, center.y, dots[i].pos.x, dots[i].pos.y);
              c.quadraticCurveTo(center.x, center.y, dots[z].pos.x, dots[z].pos.y);
              c.quadraticCurveTo(center.x, center.y, dots[j].pos.x, dots[j].pos.y);
            }

            c.fillStyle = gA; c.fill(); c.fillStyle = gB; c.fill(); c.fillStyle = gC; c.fill();
          }
        }
      }
    }
  }
