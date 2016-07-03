/*		#TO-DO#
• Gravity
• Orbit? We have the math!
    ▶ p'x = cos(theta) * (px-ox) - sin(theta) * (py-oy) + ox
    ▶ p'y = sin(theta) * (px-ox) + cos(theta) * (py-oy) + oy
• Text feedback for sliders → hovering JS text?
• Click to add dot (increase max value)
• Voronoi, Deluanay, Polygon, Circumcircles
• Configuration export and import?
    ▼ Bottom configuration section
• Rainbow or Monochrome option for dots

⚠ Fix on iOS
*/

//Graphics and structural globals
var mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 },
canvas = document.createElement('canvas'),
context = canvas.getContext('2d'),
dots = [],

//slider-related globals
stars = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? 25 : 50,
maxDiv = -11.5,
maxDist = Math.sqrt(Math.pow(window.innerWidth, 2) + Math.pow(window.innerHeight, 2)) / maxDiv,
maxRadius = maxDist * Math.sqrt(3) / 3,
speed = 0.25,
thick = 3.5,
lines = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? 3 : 5,
G = 200,

//checkbox bool globals
gravity = false, tether = false, bg = false, opaque = true, trail=false, rainbow=true, mode="l",

//fps diagnostic globals
frames = 0, fps = 0, date = new Date();


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
  context.lineWidth = thick;
});

//update mouse position
$(document).mousemove(function(e) { mouse = { x: e.clientX, y: e.clientY	}; });

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

    if (e.target.id == 'thick') context.lineWidth = thick;

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
    if (e.target.id == 'gravity' && !gravity) {
      for (let d of dots) {
        d.vel.x = Math.random() * speed * (Math.round(Math.random()) ? 1 : -1);
        d.vel.y = Math.sqrt(Math.pow(speed, 2) - Math.pow(d.vel.x, 2)) * (Math.round(Math.random()) ? 1 : -1)
      }
    }
    $('body').css("background", bg ? "white" : "black");
    $('a:link').css("color", bg ? "black" : "white");
    $("#opaque + label").css("color", bg ? "black" : "white");
    if (trail) {
      $('#bottom').css('background', bg ? "white" : "black");
      $('aside').css('background', bg ? "white" : "black");
      $('a').css('background', bg ? "white" : "black");
    }
    else{
      $('#bottom').css('background', 'transparent');
      $('aside').css('background', 'transparent');
      $('a').css('background', 'transparent');
     }
    console.log(e.target.id + " -> " + window[e.target.id]);
  });

  $('a').hover(function(e) { $('#'+e.target.id).css('color','#f80'); }, function(e) { $('#'+e.target.id).css("color",bg ? "black" : "white"); });

  $('#screenshot').click(function(e) {
    if (!opaque) window.open(canvas.toDataURL());
    else {
      var canvas2=document.createElement("canvas"); canvas2.width=canvas.width; canvas2.height=canvas.height;
      var ctx2=canvas2.getContext("2d")
      ctx2.putImageData(context.getImageData(0,0,canvas.width,canvas.height), 0, 0);
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = bg ? "white" : "black";
      context.fillRect(0, 0, canvas.width, canvas.height);
      //context.putImageData(saveCanv, 0, 0);
      context.drawImage(canvas2,0,0);
      window.open(canvas.toDataURL());
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(canvas2,0,0);
    }
  });

  $('select').change(function(e) {
    mode = e.target.value;
    context.lineWidth = thick;
    mode == "r" ? context.lineCap = "round" : context.lineCap = "square";
    if ("tacqs".indexOf(mode) > -1 ) {
      //context.globalCompositeOperation = 'lighten';
      document.getElementById("thick").disabled = true;
    }
    else {
      //context.globalCompositeOperation = 'source-over';
      document.getElementById("thick").disabled = false;
    }
    console.log(e.target.id + " -> " + window[e.target.id]);
  });
})

//Loop function
! function loop() {
  frames++;
  if (new Date()-date >= 1000) {
    date = new Date();
    fps = frames;
    frames = 0;
    //console.log(Math.random()*100+"   "+fps);
  }

  // update screen size
  if (window.innerWidth != canvas.width || window.innerHeight != canvas.height) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    context.lineWidth = thick;
    maxDist = -1*Math.sqrt(Math.pow(window.innerWidth, 2) + Math.pow(window.innerHeight, 2)) / maxDiv;
    maxRadius = maxDist * Math.sqrt(3) / 3;
  }

  if (!trail) context.clearRect(0, 0, canvas.width, canvas.height);
  else {
    context.save();
    context.globalAlpha = 0.025;
    context.globalCompositeOperation='destination-out';
    context.fillStyle= '#FFF';
    context.fillRect(0,0,canvas.width, canvas.height);
    context.restore();
  }

  for (var i = 0; i < dots.length; i++) dots[i].update();
  for (var i = 0; i < dots.length; i++) dots[i].ids.clear();
  render(context);

  context.font = '10px sans-serif';
  context.fillStyle=bg ? "black" : "white";
  context.fillText(fps+" Hz",5,window.innerHeight-5);

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
  if ((this.r+this.g+this.b)/3 < 50) this.r=255, this.g=64, this.b = 0;
}

  //Update Dot's position
Dot.prototype.update = function() {
    if (gravity) {
      var distance = Math.sqrt(Math.pow(mouse.x - this.pos.x, 2) + Math.pow(mouse.y - this.pos.y, 2));
      if (distance > maxDist) {
        this.vel.x -= (6.67408*Math.pow(10,-3))*G/Math.pow(distance,2)*(this.pos.x - mouse.x);
        this.vel.y -= (6.67408*Math.pow(10,-3))*G/Math.pow(distance,2)*(this.pos.y - mouse.y);
      }
    }
    var X = this.vel.x, Y = this.vel.y;
    if (tether && this.ids.size > 0) {
      for (let d of this.ids) { if (!dots[d]) break; X += dots[d].vel.x; Y += dots[d].vel.y; }
      X /= (this.ids.size + 1); Y /= (this.ids.size + 1);
      X = (3*X + this.vel.x) / 4;
      Y = (3*Y + this.vel.y) / 4;
    }

    this.pos.x += X; this.pos.y += Y;
    if (this.pos.x <= 0) this.vel.x = Math.abs(this.vel.x);
    if (this.pos.x >= window.innerWidth) { this.vel.x *= (this.vel.x < 0 ? 1 : -1); this.pos.x = window.innerWidth; }
    if (this.pos.y <= 0) this.vel.y = Math.abs(this.vel.y);
    if (this.pos.y >= window.innerHeight) { this.vel.y *= (this.vel.y < 0 ? 1 : -1); this.pos.y = window.innerHeight; }
};

function render(c) {
  for (var j = 0; j < dots.length; j++) {
    c.beginPath();
    c.arc(dots[j].pos.x, dots[j].pos.y, 1, 0, 2 * Math.PI);
    c.fillStyle = "white"; c.fill(); c.closePath();
    if (lines > 0 && dots[j].ids.size >= lines) continue;
    //if (gravity && Math.sqrt(Math.pow(mouse.x - dots[j].pos.x, 2) + Math.pow(mouse.y - dots[j].pos.y, 2)) <= maxDist*1.5) continue;
    for (var i = j+1; i < dots.length; i++) {
      if (dots[j].id==i || dots[i].ids.has(dots[j].id)) continue;
      var distance = Math.sqrt(Math.pow(dots[j].pos.x - dots[i].pos.x, 2) + Math.pow(dots[j].pos.y - dots[i].pos.y, 2));
      if (distance > maxDist) continue;
      dots[j].ids.add(i);
      dots[i].ids.add(dots[j].id);

      if (mode != 't' && mode != 'a') {
        var grd = c.createLinearGradient(dots[j].pos.x, dots[j].pos.y, dots[i].pos.x, dots[i].pos.y),
        s1 = "rgba(" + dots[j].r + "," + dots[j].g + "," + dots[j].b + "," + 1.1 * (1 - (distance / maxDist)) + ")",
        s2 = 'rgba(' + dots[i].r + ',' + dots[i].g + ',' + dots[i].b + ',' + 1.1 * (1 - (distance / maxDist)) + ')';

        grd.addColorStop(0, s1);
        grd.addColorStop(1, s2);

        if (mode.charAt(0) == 'c') {
          c.beginPath();
          c.arc((dots[j].pos.x + dots[i].pos.x)/2, (dots[j].pos.y + dots[i].pos.y)/2, distance/2, 0, 2 * Math.PI);
          if (mode == 'c') { c.fillStyle = grd; c.fill(); }
          else { c.strokeStyle = grd; c.stroke();}
        }
        else if (mode.charAt(0) == 'q') {
          var center = { x: (dots[j].pos.x + dots[i].pos.x)/2, y: (dots[j].pos.y + dots[i].pos.y)/2 };
          c.beginPath();
          c.moveTo(dots[j].pos.x, dots[j].pos.y);
          c.lineTo(-(dots[j].pos.y-center.y) + center.x, (dots[j].pos.x-center.x) + center.y);
          c.lineTo(dots[i].pos.x, dots[i].pos.y);
          c.lineTo((dots[j].pos.y-center.y) + center.x, -(dots[j].pos.x-center.x) + center.y);
          if (mode == 'q') { c.fillStyle = grd; c.fill(); }
          else { c.lineTo(dots[j].pos.x, dots[j].pos.y); c.strokeStyle = grd; c.stroke();}
        }
        else if (mode.charAt(0) == 's') {
          c.beginPath();
          c.moveTo(dots[j].pos.x, dots[j].pos.y);
          c.lineTo(dots[i].pos.x, dots[j].pos.y);
          c.lineTo(dots[i].pos.x, dots[i].pos.y);
          c.lineTo(dots[j].pos.x, dots[i].pos.y);
          if (mode == 's') { c.fillStyle = grd; c.fill(); }
          else { c.lineTo(dots[j].pos.x, dots[j].pos.y); c.strokeStyle = grd; c.stroke();}
        }
        else {
          c.beginPath();
          c.moveTo(dots[j].pos.x, dots[j].pos.y);
          c.lineTo(dots[i].pos.x, dots[i].pos.y);
          c.strokeStyle = grd;
          c.stroke();
        }
      }

      else {
        for (var z=i+1; z<dots.length; z++) {
          if (lines > 0 && dots[z].ids.size > lines) continue;
          if (Math.sqrt(Math.pow(dots[z].pos.x - dots[i].pos.x, 2) + Math.pow(dots[z].pos.y - dots[i].pos.y, 2)) > maxDist || Math.sqrt(Math.pow(dots[z].pos.x - dots[j].pos.x, 2) + Math.pow(dots[z].pos.y - dots[j].pos.y, 2)) > maxDist) continue;

          var center = { x: (dots[j].pos.x + dots[i].pos.x + dots[z].pos.x) / 3, y: (dots[j].pos.y + dots[i].pos.y + dots[z].pos.y) / 3, A:this.x, B:0, C:0 };

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

          var min = Math.min(alphaA, alphaB, alphaC);
          // if (alphaA != min) alphaA *= min;
          // if (alphaC != min) alphaC *= min;
          // if (alphaB != min) alphaB *= min;
          alphaA *= min;
          alphaB *= min;
          alphaC *= min;

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
