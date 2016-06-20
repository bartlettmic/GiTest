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
▲ Make sure checkbox speedbug is fixed on merge
▲ Make sure slider functional is kept on merge
*/

  mousePos = { x: window.innerWidth / 2, y: window.innerHeight / 2 },
  canvas = document.createElement('canvas'),
  context = canvas.getContext('2d'),
  dots = [],
  //FPS = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? 30 : 60,
  stars = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? 25 : 50,
  //minDistance = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? 75 : 100,
  minDiv = 11.5,
  minDistance = Math.sqrt(Math.pow(window.innerWidth, 2) + Math.pow(window.innerHeight, 2)) / minDiv,
  speed = 0.25,
  thick = 3.5,
  //lines = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? 3 : 5,
  lines = 10,
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

    if (e.target.id == 'minDiv') minDistance = Math.sqrt(Math.pow(window.innerWidth, 2) + Math.pow(window.innerHeight, 2)) / minDiv;

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
})


//Loop function
! function loop() {
    // update screen size
	frames++;
	if (new Date()-date >= 1000) {
		date = new Date();
		fps = frames;
		frames = 0;
	}

    if (window.innerWidth != canvas.width || window.innerHeight != canvas.height) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      minDistance = Math.sqrt(Math.pow(window.innerWidth, 2) + Math.pow(window.innerHeight, 2)) / minDiv;
    }

    context.clearRect(0, 0, canvas.width, canvas.height);

    context.font = '10px sans-serif';
	  context.fillStyle="white";
	  context.fillText(fps+" FPS",5,window.innerHeight-5);

    for (var i = 0; i < dots.length; i++) dots[i].update();
	  for (var i = 0; i < dots.length; i++) dots[i].ids.clear();
    for (var i = 0; i < dots.length; i++) dots[i].render(context);
    setTimeout(loop, 0);
}();


//Dot class constructor
function Dot(ID) {
  this.pos = {
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight
  };
  this.vel = {
    x: Math.random() * speed * (Math.round(Math.random()) ? 1 : -1),
    y: 0
  };
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

//Check proximity of other Dots
Dot.prototype.friends = function() {

};

Dot.prototype.render = function(c) {
    //c.save();
    //c.globalCompositeOperation = 'soft-light';
    //c.globalCompositeOperation = 'lighten';

    for (var i = 0; i < dots.length; i++) {
      if (lines > 0 && this.ids.size >= lines) break;
      if (this.id==i || dots[i].ids.has(this.id)) continue;
      var distance = Math.sqrt(Math.pow(this.pos.x - dots[i].pos.x, 2) + Math.pow(this.pos.y - dots[i].pos.y, 2));
      if (distance > minDistance) continue;

      this.ids.add(i);
      dots[i].ids.add(this.id);

      var grd = c.createLinearGradient(this.pos.x, this.pos.y, dots[i].pos.x, dots[i].pos.y),
      s1 = "rgba(" + this.r + "," + this.g + "," + this.b + "," + 1.1 * (1 - (distance / minDistance)) + ")",
      s2 = 'rgba(' + dots[i].r + ',' + dots[i].g + ',' + dots[i].b + ',' + 1.1 * (1 - (distance / minDistance)) + ')';

      grd.addColorStop(0, s1);
      grd.addColorStop(1, s2);

        //c.beginPath();
        //c.arc(this.pos.x, this.pos.y, thick / 2, 0, 2 * Math.PI);
        //c.fillStyle = s1;
        //c.fill();

        //c.beginPath();
        //c.arc(dots[d].pos.x, dots[d].pos.y, thick / 2, 0, 2 * Math.PI);
        //c.fillStyle = s2;
        //c.fill();

        if (showDots) {
          c.beginPath();
          c.arc((this.pos.x + dots[i].pos.x)/2, (this.pos.y + dots[i].pos.y)/2, distance/2, 0, 2 * Math.PI);
          c.fillStyle = grd;
          c.fill()
        } else {
          c.beginPath();
          c.moveTo(this.pos.x, this.pos.y);
          c.lineTo(dots[i].pos.x, dots[i].pos.y);
          c.lineWidth = thick;
          c.lineCap = "round";
          c.strokeStyle = grd;
          c.stroke();
        }
      }
	//c.restore();
};
