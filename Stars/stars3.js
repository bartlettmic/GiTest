var SCREEN_WIDTH = window.innerWidth,
  SCREEN_HEIGHT = window.innerHeight,
  mousePos = {
    x: SCREEN_WIDTH/2,
    y: SCREEN_HEIGHT/2
  },

  // create canvas
  canvas = document.createElement('canvas'),
  context = canvas.getContext('2d'),
  dots = [],
  FPS = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? 30 : 60,
  stars = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? 100 : 300,
  lines = 3;
  minDistance = 50,
  speed = 5,
  thick = 2.5,
  G = 500;

// init
$(document).ready(function() {
  document.body.appendChild(canvas);
  canvas.width = SCREEN_WIDTH;
  canvas.height = SCREEN_HEIGHT;
  setInterval(loop, 1000 / FPS);
  for (var i = 0; i < stars; i++) {
    dots.push(new Dot(i));
  }
});

//update mouse position
$(document).mousemove(function(e) {
 e.preventDefault();
 mousePos = {
   x: e.clientX,
   y: e.clientY
 };
});

function loop() {
  // update screen size    
  if (SCREEN_WIDTH != window.innerWidth) {
    canvas.width = SCREEN_WIDTH = window.innerWidth;
  }
  if (SCREEN_HEIGHT != window.innerHeight) {
    canvas.height = SCREEN_HEIGHT = window.innerHeight;
  }

  context.clearRect(0, 0, canvas.width, canvas.height);

  for (var i = 0; i < stars; i++) {
    dots[i].update();
    dots[i].render(context);
  }
  for (var i = 0; i < stars; i++) dots[i].ids.clear();
}

function Dot(ID) {
  this.pos = {
    x: Math.random() * SCREEN_WIDTH,
    y: Math.random() * SCREEN_HEIGHT
  };
  this.vel = {
    x: Math.random() * speed * (Math.round(Math.random()) ? 1 : -1),
    //y: Math.random() * speed * (Math.round(Math.random()) ? 1 : -1)
    y: 0
  };
  this.vel.y = Math.sqrt(Math.pow(speed, 2) - Math.pow(this.vel.x, 2)) * (Math.round(Math.random()) ? 1 : -1)
  this.r = Math.round(Math.random() * 255);
  this.g = Math.round(Math.random() * 255);
  this.b = Math.round(Math.random() * 255);
  this.id = ID;
  this.ids = new Set();
}

Dot.prototype.update = function() {
  // update position based on speed
  var distance = Math.sqrt(Math.pow(this.pos.x - mousePos.x, 2) + Math.pow(this.pos.y - mousePos.y, 2)), 
      X = this.vel.x, 
      Y = this.vel.y,
      Gx=0, 
      Gy=0;
   
   if (distance <= minDistance) {
     this.pos.x -= this.vel.x*(1-(distance / minDistance))*speed;
     this.pos.y -= this.vel.y*(1-(distance / minDistance))*speed;
   }   
   else {
       Gx = distance == 0 ? 0 : G/Math.pow(distance,2)*(this.pos.x - mousePos.x),
       Gy = distance == 0 ? 0 : G/Math.pow(distance,2)*(this.pos.y - mousePos.y);
     }
   

    for (let d of this.ids) {
      X += dots[d].vel.x;
      Y += dots[d].vel.y;
    }  
   X /= (this.ids.size+1);
   Y /= (this.ids.size+1);    
   this.vel.x = X;
   this.vel.y = Y;
   this.pos.x += X-Gx
   this.pos.y += Y-Gy
  
  //this.vel.x -= Gx;
  //this.vel.y -= Gy;
  if (this.pos.x <= 0 || this.pos.x >= SCREEN_WIDTH) this.vel.x *= -1;
  if (this.pos.y <= 0 || this.pos.y >= SCREEN_HEIGHT) this.vel.y *= -1;
};

Dot.prototype.render = function(c) {
  //c.save();

  //c.globalCompositeOperation = 'lighter';
  c.globalCompositeOperation = 'lighten';
  //c.globalCompositeOperation = 'soft-light';

  var x = this.pos.x,
    y = this.pos.y;


  for (var i = 0; i < stars; i++) {
    if (this.ids.size > lines) break;
    if (i == this.id || dots[i].ids.has(this.id) || this.ids.has(i)) continue;
    var x2 = dots[i].pos.x,
      y2 = dots[i].pos.y,
      distance = Math.sqrt(Math.pow(x - x2, 2) + Math.pow(y - y2, 2));
    if (distance > minDistance) continue;    
    
    if (this.ids.has(dots[i].ids) || dots[i].ids.has(this.ids)) {
      this.ids.add(i);
      dots[i].ids.add(this.id);
      continue;
    }

    var grd = c.createLinearGradient(x, y, x2, y2),
      s1 = "rgba(" + this.r + "," + this.g + "," + this.b + "," + (1 - (distance / minDistance)) + ")",
      s2 = 'rgba(' + dots[i].r + ',' + dots[i].g + ',' + dots[i].b + ',' + (1 - (distance / minDistance)) + ')';        

    grd.addColorStop(0, s1);
    grd.addColorStop(1, s2);

    //c.beginPath();
    //c.arc(x, y, thick / 2, 0, 2 * Math.PI);
    //c.fillStyle = s1;
    //c.fill();

    //c.beginPath();
    //c.arc(x2, y2, thick / 2, 0, 2 * Math.PI);
    //c.fillStyle = s2;
    //c.fill();

    c.beginPath();
    c.moveTo(x, y);
    c.lineTo(x2, y2);
    c.lineWidth = thick;
    c.strokeStyle = grd;
    //c.strokeStyle = 'rgba(255,64,0,'+(1 - (distance / minDistance))+')';
    c.stroke();

    //c.restore();    
    this.ids.add(i);
    dots[i].ids.add(this.id);
  }
};
