/*		#TO-DO#
○ Orbit math:
    ▶ p"x = cos(theta) * (px-ox) - sin(theta) * (py-oy) + ox
    ▶ p"y = sin(theta) * (px-ox) + cos(theta) * (py-oy) + oy

• Delaunay, Polygon, Circumcircles
• Configuration export and import?
• Add text input toggleable over sliders
• Click for explode
  > Toggle stir and explodej
• Keyboard shortcuts

    ▼ Bottom configuration section
• Rainbow or Monochrome option for dots
• Asymmetric, bilateral, tetralateral
• Gravity → Nucleus

⚠ Fix on iOS -> debug with fiddle I guess
*/

//Graphics and structural globals
mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
canvas = document.getElementById("canv");
context = null;
dots = [];

//slider-related globals
//stars = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? 25 : 50;
stars=25;
maxDiv = -5.5;
maxDist = Math.sqrt(Math.pow(window.innerWidth, 2) + Math.pow(window.innerHeight, 2)) / maxDiv;
maxRadius = maxDist * Math.sqrt(3) / 3;
speed = 0.1;
thick = 3.5;
//lines = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? 3 : 5;
lines = 5;
G = 2.5;
nfo = { E: null,  time: 0,  e: null };

//checkbox bool globals
teleport = false; gravity = false; tether = false; bg = false; opaque = true; points=true; trail=0; rainbow=true; mode="l";

//fps diagnostic globals
frames = 0; fps = 0; lastSecond = new Date();

//Initialize
function init() {
  context = canvas.getContext("2d");
  canvas.height = window.innerHeight;
  canvas.width = window.innerWidth;
  context.lineWidth = thick;
  maxDist = -1*Math.sqrt(Math.pow(window.innerWidth, 2) + Math.pow(window.innerHeight, 2)) / maxDiv;
  maxRadius = maxDist * Math.sqrt(3) / 3;
  screen.orientation.lock('landscape');
  document.getElementsByTagName("BODY")[0].style.fontSize = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? "0.25em !important" : "1em !important";
  nfo.E = document.getElementById("nfo");

  for (let e of document.getElementsByTagName("INPUT")) {
    if (e.type == "range") {
      e.value = window[e.id];
      if (e.id == "G") document.getElementById("G").disabled = !gravity;
    }

    else if (e.type == "checkbox") {
      e.checked = window[e.id] ? window[e.id].toString() : "";
      if (e.id == "trail") e.checked = true;
    }
  }

  for (var i = 0; i < stars; i++) dots.push(new Dot(i));
  setInterval(loop, 1000 / 60);
  showLabel(document.getElementsByTagName("SELECT")[0]);
}

document.addEventListener("orientationchange", function(event){
    switch(window.orientation)
    {
        case -90: case 90:
            /* Device is in landscape mode */
            var top = document.getElementById("bottom").style.top;
            document.getElementById("aboutdiv").style.bottom = top;
            document.getElementById("screen").style.bottom = top;
            break;
        default:
        document.getElementById("aboutdiv").style.bottom = "0";
        document.getElementById("screen").style.bottom = '0';
    }
});

canvas.onmouseup = function(e){
  if (gravity) mouse = { x: e.clientX, y: e.clientY };
  else {
    dots.push(new Dot(dots.length));
    dots[dots.length-1].x = e.clientX;
    dots[dots.length-1].y = e.clientY;
    stars = dots.length;
    var e = document.getElementById("stars");
    e.value = window[e.id];
    }
};

function sliderUpdate(e) {
  if (e.id == "speed") {
    for (let d of dots) {
      d.vx *= e.value / speed;
      d.vy *= e.value / speed;
    }
  }
  window[e.id] = e.value;
  if (e.id == "maxDiv") {
    maxDist = -1*Math.sqrt(Math.pow(window.innerWidth, 2) + Math.pow(window.innerHeight, 2)) / maxDiv;
    maxRadius = maxDist * Math.sqrt(3) / 3;
  }

  if (e.id == "thick") context.lineWidth = thick;

  if (stars < dots.length) {
    dots = dots.slice(0, stars);
  } else if (stars > dots.length)
  for (var i = dots.length; i < stars; i++) dots.push(new Dot(i));
  showLabel(e);
}

function checkboxUpdate(e) {
  console.log(e.id+" > "+window[e.value]);
  if (e.id == "trail") {
    if (e.readOnly) {
      e.checked=e.readOnly=false;
    }
    else if (!e.checked) {
      e.readOnly=e.indeterminate=true;
    }
    if (e.indeterminate) trail = -1; //trails
    else if (e.checked) trail = 0; //clear
    else trail = 1; //canvas
  }
  else window[e.value] = e.checked;
  if (e.id == "tether") {
    if (tether) for (let d of dots) { d.vx *= 2; d.vy *= 2; }
    else for (let d of dots) { d.vx /= 2; d.vy /= 2; }
  }
  if (e.id == "gravity") {
    if (!gravity) {
      for (let d of dots) {
        var velocity = Math.sqrt(Math.pow(d.vx, 2) + Math.pow(d.vy, 2));
        d.vx *= speed/velocity;
        d.vy *= speed/velocity;
      }
    }
    else {
      showLabel(document.getElementById('G'));
    }
  }
  document.getElementById("G").disabled = !gravity;
  document.body.style.backgroundColor = bg ? "white" : "black";
  document.getElementById("nfo").style.color = bg ? "black" : "white";

  let as = document.getElementsByTagName("A");
  for (let a of  as) a.style.color = bg ? "black" : "white";

  let labels = [document.getElementById("opaque"), document.getElementById("trail"), document.getElementById("teleport")];
  for (let i=0; i < labels.length; i++) {
      labels[i].nextSibling.nextSibling.style.color = bg ? "black" : "white";
  }

  let UIs = [document.getElementById("bottom"), document.getElementsByTagName("ASIDE")[0], document.getElementById("aboutdiv"), document.getElementById("screen") ];
  for (let ui of UIs) ui.style.background = "vf".indexOf(mode) > -1 || trail ? (bg ? "white" : "black") : "transparent";
}

function dropdownUpdate(e) {
    mode = e.value;
    context.lineWidth = thick;
    mode == "r" ? context.lineCap = "round" : context.lineCap = "square";
    if ("taocqs".indexOf(mode) > -1 ) {
      //context.globalCompositeOperation = "lighten";
      document.getElementById("thick").disabled = true;
    }
    else {
      //context.globalCompositeOperation = "source-over";
      document.getElementById("thick").disabled = false;
    }
    let UIs = [document.getElementById("bottom"), document.getElementsByTagName("ASIDE")[0], document.getElementById("aboutdiv"), document.getElementById("screen") ];
    for (let ui of UIs) ui.style.background = "vf".indexOf(mode) > -1 || trail ? (bg ? "white" : "black") : "transparent";
}

function renderScreenshot() {
  if (!opaque) window.open(canvas.toDataURL());
  else {
    var canvas2=document.createElement("canvas"); canvas2.width=canvas.width; canvas2.height=canvas.height;
    var ctx2=canvas2.getContext("2d")
    ctx2.putImageData(context.getImageData(0,0,canvas.width,canvas.height), 0, 0);
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = bg ? "white" : "black";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(canvas2,0,0);
    window.open(canvas.toDataURL());
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(canvas2,0,0);
  }
}

function showLabel(e) {
  var rect = e.getBoundingClientRect();
  switch (e.id) {
    case "stars":
      nfo.E.innerHTML = "population: "+e.value;
      break;
    case "maxDiv":
      nfo.E.innerHTML = "max connection length: "+Math.round(maxDist);
      break;
    case "speed":
      nfo.E.innerHTML = "speed: "+Number(e.value).toFixed(2);
      break;
    case "thick":
      nfo.E.innerHTML = "line thickness: "+Number(e.value).toFixed(1);
      break;
    case "lines":
      nfo.E.innerHTML = "connections per point: "+(e.value==25 ? "&infin;" : e.value);
      break;
    case "G":
      nfo.E.innerHTML = "gravity strength: "+e.value;
      break;
    default:
    nfo.E.innerHTML = e.id+" = "+e.value;
  }
  if (e.tagName == "SELECT") nfo.E.innerHTML = "<b>For instructions on how to use this application, please click 'about' in the bottom right corner."
  nfo.E.style.maxWidth = String(rect.width)+"px";
  nfo.E.style.minWidth = String(rect.width)+"px";
  nfo.E.style.left = String(rect.left)+'px';
  nfo.E.style.top = String(rect.bottom)+'px';
  nfo.time = new Date();
  nfo.e = e;
  nfo.E.style.opacity = 1;
  var id = setInterval(fadeLabel, 5);
  var blink = false;
  function fadeLabel() {
    var date = new Date();
    if (nfo.e.tagName == "SELECT")  {
      if (date - nfo.time <= 1250) {
        if (blink) { nfo.E.style.opacity = 0; blink = !blink; }
        else { nfo.E.style.opacity = 1; blink = !blink; }
      }
      else nfo.E.style.opacity = 1;
      if (date - nfo.time >= 10000) {
        nfo.E.innerHTML = "";
        nfo.time = 0;
        clearInterval(id);
      }
    }
    else{
      if (date - nfo.time >= 1500) {
        nfo.E.innerHTML = "";
        nfo.time = 0;
        clearInterval(id);
      } else {
        nfo.E.style.opacity = 1 - (date - nfo.time - 500)/1000;
      }
    }
  }
}

function resizeScreen() {
  if (nfo.time) {
    //var nfo = document.getElementById("nfo");
    var rect = nfo.e.getBoundingClientRect();
    nfo.E.style.maxWidth = String(rect.width)+"px";
    nfo.E.style.minWidth = String(rect.width)+"px";
    nfo.E.style.left = String(rect.left)+'px';
    nfo.E.style.top = String(rect.bottom)+'px';
  }
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  context.lineWidth = thick;
  maxDist = -1*Math.sqrt(Math.pow(window.innerWidth, 2) + Math.pow(window.innerHeight, 2)) / maxDiv;
  maxRadius = maxDist * Math.sqrt(3) / 3;
  mode == "r" ? context.lineCap = "round" : context.lineCap = "square";
}

//Loop function
function loop() {
  frames++;
  var date = new Date();
  if (date - lastSecond >= 1000) {
    lastSecond =  date
    fps = frames;
    frames = 0;
    //console.log(Math.random()*100+"   "+fps);
  }

  if (!trail) context.clearRect(0, 0, canvas.width, canvas.height);
  else if (trail < 0) {
    context.save();
    context.globalAlpha = 0.025;
    context.globalCompositeOperation="destination-out";
    context.fillStyle= "#FFF";
    context.fillRect(0,0,canvas.width, canvas.height);
    context.restore();
    if (frames%8==0) {
      var lastImage = context.getImageData(0,0,canvas.width,canvas.height);
      for (var i=3; i < lastImage.data.length; i += 4) if (lastImage.data[i] < 30) lastImage.data[i]=0;
      context.putImageData(lastImage,0,0);
      lastImage = null;
      delete lastImage;
    }
  }

  for (var i = 0; i < dots.length; i++) dots[i].update();
  for (var i = 0; i < dots.length; i++) dots[i].ids.clear();
  if (mode == 'v' || mode == 'd') { init_delaunay(); vrender(context); }
  else if (mode == 'f') frender(context);
  else if (mode != "0") render(context);

  if (points) for (var j = 0; j < dots.length; j++) {
      context.beginPath();
      context.arc(dots[j].x, dots[j].y, 1, 0, 2 * Math.PI);
      context.fillStyle = bg ? "black" : "white";
      context.fill();
      context.closePath();
  }

  context.font = "10px sans-serif";
  context.fillStyle=bg ? "black" : "white";
  context.fillText(fps+" Hz",5,window.innerHeight-25);

  //setTimeout(loop, 0);
}

//Dot class constructor
function Dot(ID) {
  this.x = Math.random() * window.innerWidth;
  this.y = Math.random() * window.innerHeight;
  this.vx = Math.random() * speed * (Math.round(Math.random()) ? 1 : -1);
  this.vy = Math.sqrt(Math.pow(speed, 2) - Math.pow(this.vx, 2)) * (Math.round(Math.random()) ? 1 : -1)
  this.r = Math.round(Math.random() * 255);
  this.g = Math.round(Math.random() * 255);
  this.b = Math.round(Math.random() * 255);
  this.id = ID;
  this.ids = new Set();
  //if ((this.r+this.g+this.b)/3 < 50) this.r=0, this.g=0, this.b = 0;
  //if ((this.r+this.g+this.b)/3 > 200) this.r=255, this.g=255, this.b = 255;
  this.is_infinity = false;
  //this.payload = {"velocity":0, "painted":false};
  this.painted = false;
}

//Dot update
Dot.prototype.update = function() {
  if (gravity) {
    var distance = Math.sqrt(Math.pow(mouse.x - this.x, 2) + Math.pow(mouse.y - this.y, 2));
    if (distance >= 1) {
      this.vx += G/Math.pow(distance,2)*(mouse.x - this.x);
      this.vy += G/Math.pow(distance,2)*(mouse.y - this.y);
    }
  }
  var X = this.vx, Y = this.vy;
  if (tether && this.ids.size > 0) {
    for (let d of this.ids) { if (!dots[d]) break; X += dots[d].vx; Y += dots[d].vy; }
    X /= (this.ids.size + 1); Y /= (this.ids.size + 1);
    X = (3*X + this.vx) / 4;
    Y = (3*Y + this.vy) / 4;
  }

  this.x += X; this.y += Y;
  if (teleport) {
    ported = false;
    if (this.x >= window.innerWidth) {
      this.x = 1;
      ported = true;
    }
    else if (this.x <= 0) {
       this.x = window.innerWidth;
       ported = true;
    }
    if (this.y >= window.innerHeight) {
      this.y = 1;
      ported = true;
    }
    else if (this.y <= 1) {
      this.y = window.innerHeight;
      ported = true;
    }
    if (ported) {
      var velocity = Math.sqrt(Math.pow(this.vx, 2) + Math.pow(this.vy, 2));
      this.vx *= speed/velocity;
      this.vy *= speed/velocity;
    }
  }
  else {
    if (this.x <= 0) this.vx = Math.abs(this.vx);
    if (this.x >= window.innerWidth) { this.vx *= (this.vx < 0 ? 1 : -1); this.x = window.innerWidth; }
    if (this.y <= 0) this.vy = Math.abs(this.vy);
    if (this.y >= window.innerHeight) { this.vy *= (this.vy < 0 ? 1 : -1); this.y = window.innerHeight; }
  }
};

function render(c) {
  for (var j = 0; j < dots.length; j++) {
    if (lines < 25 && dots[j].ids.size >= lines) continue;
    //if (gravity && Math.sqrt(Math.pow(mouse.x - dots[j].x, 2) + Math.pow(mouse.y - dots[j].y, 2)) <= maxDist*1.5) continue;
    for (var i = j+1; i < dots.length; i++) {
      if (dots[j].id==i || dots[i].ids.has(dots[j].id)) continue;
      var distance = Math.sqrt(Math.pow(dots[j].x - dots[i].x, 2) + Math.pow(dots[j].y - dots[i].y, 2));
      if (distance > maxDist) continue;
      dots[j].ids.add(i);
      dots[i].ids.add(j);

      if (mode != "t" && mode != "a" && mode != "oc") {
        var grd = c.createLinearGradient(dots[j].x, dots[j].y, dots[i].x, dots[i].y),
        s1 = "rgba(" + dots[j].r + "," + dots[j].g + "," + dots[j].b + "," + (1 - (distance / maxDist)) + ")",
        s2 = "rgba(" + dots[i].r + "," + dots[i].g + "," + dots[i].b + "," + (1 - (distance / maxDist)) + ")";

        grd.addColorStop(0, s1);
        grd.addColorStop(1, s2);

        if (mode.charAt(0) == "c") {
          c.beginPath();
          c.arc((dots[j].x + dots[i].x)/2, (dots[j].y + dots[i].y)/2, distance/2, 0, 2 * Math.PI);
          if (mode == "c") { c.fillStyle = grd; c.fill(); }
          else { c.strokeStyle = grd; c.stroke();}
        }
        else if (mode.charAt(0) == "q") {
          var center = { x: (dots[j].x + dots[i].x)/2, y: (dots[j].y + dots[i].y)/2 };
          c.beginPath();
          c.moveTo(dots[j].x, dots[j].y);
          c.lineTo(-(dots[j].y-center.y) + center.x, (dots[j].x-center.x) + center.y);
          c.lineTo(dots[i].x, dots[i].y);
          c.lineTo((dots[j].y-center.y) + center.x, -(dots[j].x-center.x) + center.y);
          if (mode == "q") { c.fillStyle = grd; c.fill(); }
          else { c.lineTo(dots[j].x, dots[j].y); c.strokeStyle = grd; c.stroke();}
        }
        else if (mode.charAt(0) == "s") {
          c.beginPath();
          c.moveTo(dots[j].x, dots[j].y);
          c.lineTo(dots[i].x, dots[j].y);
          c.lineTo(dots[i].x, dots[i].y);
          c.lineTo(dots[j].x, dots[i].y);
          if (mode == "s") { c.fillStyle = grd; c.fill(); }
          else { c.lineTo(dots[j].x, dots[j].y); c.strokeStyle = grd; c.stroke();}
        }
        else {
          c.beginPath();
          c.moveTo(dots[j].x, dots[j].y);
          c.lineTo(dots[i].x, dots[i].y);
          c.strokeStyle = grd;
          c.stroke();
        }
      }

      else {
        for (var z=i+1; z<dots.length; z++) {
          if (lines < 25 && dots[z].ids.size > lines) continue;
          if (Math.sqrt(Math.pow(dots[z].x - dots[i].x, 2) + Math.pow(dots[z].y - dots[i].y, 2)) > maxDist || Math.sqrt(Math.pow(dots[z].x - dots[j].x, 2) + Math.pow(dots[z].y - dots[j].y, 2)) > maxDist) continue;

          var center = { x: (dots[j].x + dots[i].x + dots[z].x) / 3, y: (dots[j].y + dots[i].y + dots[z].y) / 3, A:this.x, B:0, C:0 };

          center.A = Math.sqrt(Math.pow(dots[j].x - center.x, 2) + Math.pow(dots[j].y - center.y, 2));
          if (center.A > maxRadius) continue;
          center.B = Math.sqrt(Math.pow(dots[i].x - center.x, 2) + Math.pow(dots[i].y - center.y, 2));
          if (center.B > maxRadius) continue;
          center.C = Math.sqrt(Math.pow(dots[z].x - center.x, 2) + Math.pow(dots[z].y - center.y, 2));
          if (center.C > maxRadius) continue;

          var AB = { x: (dots[j].x + dots[i].x) / 2, y: (dots[j].y + dots[i].y) / 2 },
          BC = { x: (dots[i].x + dots[z].x) / 2, y: (dots[i].y + dots[z].y) / 2 },
          CA = { x: (dots[z].x + dots[j].x) / 2, y: (dots[z].y + dots[j].y) / 2 },

          gA = c.createLinearGradient(dots[j].x, dots[j].y, BC.x, BC.y),
          gB = c.createLinearGradient(dots[i].x, dots[i].y, CA.x, CA.y),
          gC = c.createLinearGradient(dots[z].x, dots[z].y, AB.x, AB.y),

          alphaA = 1-Math.pow(center.A/maxRadius, 2),
          alphaB = 1-Math.pow(center.B/maxRadius, 2),
          alphaC = 1-Math.pow(center.C/maxRadius, 2);

          // if (alphaA > 0.5) alphaA *= (alphaA-0.5)+1;
          // if (alphaB > 0.5) alphaB *= (alphaB-0.5)+1;
          // if (alphaC > 0.5) alphaC *= (alphaC-0.5)+1;

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
          cA0 = "rgba(" + dots[j].r + "," + dots[j].g + "," + dots[j].b + ",0)",
          cB0 = "rgba(" + dots[i].r + "," + dots[i].g + "," + dots[i].b + ",0)",
          cC0 = "rgba(" + dots[z].r + "," + dots[z].g + "," + dots[z].b + ",0)";

          gA.addColorStop(0, cA);
          gA.addColorStop(1, cA0);
          gB.addColorStop(0, cB);
          gB.addColorStop(1, cB0);
          gC.addColorStop(0, cC);
          gC.addColorStop(1, cC0);

          c.beginPath();
          c.moveTo(dots[j].x, dots[j].y);

          if (mode == "t") {
            c.lineTo(dots[i].x, dots[i].y);
            c.lineTo(dots[z].x, dots[z].y);
          }
          else if (mode == "oc") {
            var DD = 2*(dots[j].x*(dots[i].y-dots[z].y)+dots[i].x*(dots[z].y-dots[j].y)+dots[z].x*(dots[j].y-dots[i].y)),
            circumcenter = { x: ((Math.pow(dots[j].x, 2)+Math.pow(dots[j].y, 2))*(dots[i].y-dots[z].y) + (Math.pow(dots[i].x, 2)+Math.pow(dots[i].y, 2))*(dots[z].y-dots[j].y) + (Math.pow(dots[z].x, 2)+Math.pow(dots[z].y, 2))*(dots[j].y-dots[i].y))/DD,
               y: ((Math.pow(dots[j].x, 2)+Math.pow(dots[j].y, 2))*(dots[z].x-dots[i].x) + (Math.pow(dots[i].x, 2)+Math.pow(dots[i].y, 2))*(dots[j].x-dots[z].x) + (Math.pow(dots[z].x, 2)+Math.pow(dots[z].y, 2))*(dots[i].x-dots[j].x))/DD,
               radius: 0 };
            circumcenter.radius = Math.sqrt(Math.pow(circumcenter.x-dots[j].x, 2) + Math.pow(circumcenter.y-dots[j].y, 2));
            if (circumcenter.radius > maxDist) continue;
            c.arc(circumcenter.x, circumcenter.y, circumcenter.radius, 0, 2 * Math.PI);
          }
          else {
            c.quadraticCurveTo(center.x, center.y, dots[i].x, dots[i].y);
            c.quadraticCurveTo(center.x, center.y, dots[z].x, dots[z].y);
            c.quadraticCurveTo(center.x, center.y, dots[j].x, dots[j].y);
          }

          c.fillStyle = gA; c.fill(); c.fillStyle = gB; c.fill(); c.fillStyle = gC; c.fill();
        }
      }
    }
  }
}

function frender(c) {
  var avgx =0, avgy = 0;
  for (var i=0; i<dots.length; i++) {
    avgx += dots[i].x;
    avgy += dots[i].y;
  }
  avgx /= dots.length;
  avgy /= dots.length;
  // var avgx = canvas.width/2,
  //     avgy = canvas.height/2;
  //c.globalCompositeOperation = 'luminosity';
  c.globalCompositeOperation = 'destination-over';
  for (var i=0; i<dots.length; i++) {
    var grd = c.createLinearGradient(dots[i].x, dots[i].y, avgx, avgy);
    var distance = Math.sqrt(Math.pow(dots[i].x-avgx, 2) + Math.pow(dots[i].y-avgy, 2));
    //var grd = c.createRadialGradient(dots[i].x, dots[i].y, distance/2, dots[i].x, dots[i].y, distance);
    s1 = "rgba(" + dots[i].r + "," + dots[i].g + "," + dots[i].b + ",0.5)";
    s2 = "rgba(" + dots[i].r + "," + dots[i].g + "," + dots[i].b + ",0.1)";

    grd.addColorStop(0, s1);
    grd.addColorStop(1, s2);

    c.fillStyle = grd;
    c.fillRect(0,0,canvas.width,canvas.height);
  }
  c.globalCompositeOperation = 'source-over';
}

function vrender(c) {
  // c.strokeStyle = bg ? "black" : "white";
  for (let d of dots) insert (d);
  edges.forEach(function(an_edge){
    var org = an_edge.org();
    var right = an_edge.right();
    var dest = an_edge.dest();
    var left = an_edge.left();
    if (mode == 'v') {
      // c.globalCompositeOperation = "lighter";
      if(!org.is_infinity && right!=null && left!=null) { draw_triangle(org, right, left); }
      if(!dest.is_infinity && right!=null && left!=null) { draw_triangle(dest, left, right); }
      // c.globalCompositeOperation = "source-over";
    }
    else if (mode == 'd') {
      if (!an_edge.is_infinite_edge()){
        if(left.painted==false && !an_edge.onext().is_infinite_edge()) {
          del_triangle(org, dest, an_edge.onext().dest());
          left.painted=true;
        }
        if(right && right.painted==false && !an_edge.oprev().is_infinite_edge()) {
          del_triangle(org, dest, an_edge.oprev().dest());
          right.painted=true;
        }
        draw_line(org, dest, 2);
      }
      //if (mode == 'v') if(!an_edge.is_infinite_edge()) draw_line(right, left, 2);
      //if (right) draw_line(right, left, 2);
    }
  });
}

function draw_line(fro, to) {
  context.strokeStyle = !bg ? "black" : "white";
  context.beginPath();
  context.moveTo(fro.x, fro.y);
  context.lineTo(to.x, to.y);
  context.closePath();
  context.stroke();
}

function constrain(min, num, max) {
  if (num < min) return min;
  if (num > max) return max;
  return num;
}

function draw_triangle(v0, v1, v2) {
  //var midx = (constrain(0, v1.x, canvas.width) + constrain(0, v2.x, canvas.width))/2, midy = (constrain(0, v1.y, canvas.height) + constrain(0, v2.y, canvas.height))/2;
  //var midx = constrain(0, (v1.x + v2.x)/2, canvas.width), midy = constrain(0, (v1.y + v2.y)/2, canvas.height);
  var midx = (v1.x + v2.x)/2, midy = (v1.y + v2.y)/2;
  var grd = context.createLinearGradient(v0.x, v0.y, constrain(0, midx, canvas.width), constrain(0, midy, canvas.height)),
  s1 = "rgba(" + v0.r + "," + v0.g + "," + v0.b + ",1)";
  s2 = "rgba(" + v0.r + "," + v0.g + "," + v0.b + ",0.5)";

  grd.addColorStop(1, s1);
  grd.addColorStop(0, s2);

  //var grd = "rgba(" + v0.r + "," + v0.g + "," + v0.b + ",1)";

  context.fillStyle = grd;
  context.beginPath();
  context.moveTo(v0.x, v0.y);
  context.lineTo(v1.x, v1.y);
  context.lineTo(v2.x, v2.y);
  context.lineTo(v0.x, v0.y);
  context.closePath();
  context.fill();
  //context.beginPath();
  //context.arc()
}

function del_triangle(v0, v1, v2) {
  var midx = (v0.x+v1.x+v2.x)/3, midy = (v0.y+v1.y+v2.y)/3;
  var x01 = (v0.x + v1.x)/2, y01 = (v0.y + v1.y)/2,
  x12 = (v1.x + v2.x)/2, y12 = (v2.y + v1.y)/2,
  x20 = (v0.x + v2.x)/2, y20 = (v2.y + v0.y)/2,
  // grd0 = context.createLinearGradient(v0.x, v0.y, x12, y12),
  // grd1 = context.createLinearGradient(v0.x, v0.y, x20, y20),
  // grd2 = context.createLinearGradient(v0.x, v0.y, x01, y01),
  grd0 = context.createLinearGradient(v0.x, v0.y, x12, y12),
  grd1 = context.createLinearGradient(v1.x, v1.y, x20, y20),
  grd2 = context.createLinearGradient(v2.x, v2.y, x01, y01),
  c01 = "rgba(" + v0.r + "," + v0.g + "," + v0.b + ",1)",
  c00 = "rgba(" + v0.r + "," + v0.g + "," + v0.b + ",0)",
  c11 = "rgba(" + v1.r + "," + v1.g + "," + v1.b + ",1)",
  c10 = "rgba(" + v1.r + "," + v1.g + "," + v1.b + ",0)",
  c21 = "rgba(" + v2.r + "," + v2.g + "," + v2.b + ",1)",
  c20 = "rgba(" + v2.r + "," + v2.g + "," + v2.b + ",0)";

  grd0.addColorStop(0, c01);
  grd0.addColorStop(1, c00);
  grd1.addColorStop(1, c11);
  grd1.addColorStop(0, c10);
  grd2.addColorStop(0, c21);
  grd2.addColorStop(1, c20);

  context.beginPath();
  context.moveTo(v0.x, v0.y);
  context.lineTo(v1.x, v1.y);
  context.lineTo(v2.x, v2.y);
  context.lineTo(v0.x, v0.y);
  context.closePath();
  context.fillStyle = grd0;
  context.fill();
  context.fillStyle = grd1;
  context.fill();
  context.fillStyle = grd2;
  context.fill();
  context.closePath();

  // context.beginPath();
  // context.moveTo(v0.x, v0.y);
  // context.lineTo(x12, y12);
  // context.closePath();
  // context.strokeStyle = grd0;
  // context.stroke();
  // context.closePath();
  //
  // context.beginPath();
  // context.moveTo(v1.x, v1.y);
  // context.lineTo(x20, y20);
  // context.closePath();
  // context.strokeStyle = grd1;
  // context.stroke();
  // context.closePath();
  //
  // context.beginPath();
  // context.moveTo(v2.x, v2.y);
  // context.lineTo(x01, y01);
  // context.closePath();
  // context.strokeStyle = grd2;
  // context.stroke();
  // context.closePath();

  // context.beginPath();
  // context.arc(v0.x, v0.y, Math.random()*15, 0, 2 * Math.PI);
  // context.fillStyle = c01
  // context.fill();
  // context.closePath();
  //
  // context.beginPath();
  // context.arc(v1.x, v1.y, Math.random()*15, 0, 2 * Math.PI);
  // context.fillStyle = c11
  // context.fill();
  // context.closePath();
  //
  // context.beginPath();
  // context.arc(v2.x, v2.y, Math.random()*15, 0, 2 * Math.PI);
  // context.fillStyle = c21
  // context.fill();
  // context.closePath();
}

Dot.prototype.equals = function(v) { return this.x == v.x && this.y == v.y; }

function in_circle(v0, v1, v2, v3) {
  var circle_test = (v2.x - v1.x) * (v3.y - v1.y) * (v0.x*v0.x + v0.y*v0.y - v1.x*v1.x - v1.y*v1.y)
  + (v3.x - v1.x) * (v0.y - v1.y) * (v2.x*v2.x + v2.y*v2.y - v1.x*v1.x - v1.y*v1.y)
  + (v0.x - v1.x) * (v2.y - v1.y) * (v3.x*v3.x + v3.y*v3.y - v1.x*v1.x - v1.y*v1.y)
  - (v2.x - v1.x) * (v0.y - v1.y) * (v3.x*v3.x + v3.y*v3.y - v1.x*v1.x - v1.y*v1.y)
  - (v3.x - v1.x) * (v2.y - v1.y) * (v0.x*v0.x + v0.y*v0.y - v1.x*v1.x - v1.y*v1.y)
  - (v0.x - v1.x) * (v3.y - v1.y) * (v2.x*v2.x + v2.y*v2.y - v1.x*v1.x - v1.y*v1.y);
  return circle_test >= 0.0;
}

function area(v0, v1, v2) { return (v1.x - v0.x)*(v2.y - v0.y) - (v2.x - v0.x)*(v1.y - v0.y); }
function is_right_of(v0, v1, v2) { return area(v0, v1, v2) > 0.0; }

var edge = null;
var edges = [];
var circumcenters = [];
var infinite_vertices=[new Dot(-1), new Dot(-1), new Dot(-1)];
infinite_vertices[0].x = 0.0, infinite_vertices[0].y = -5000.0;
infinite_vertices[1].x = -10000.0, infinite_vertices[1].y = 5000.0;
infinite_vertices[2].x = 10000.0, infinite_vertices[2].y = 5000.0;
function init_delaunay(){
  edges.forEach(function(qe){ delete_quadedge(qe); });
  edges.length=0;
  circumcenters.forEach(function(cc){ delete cc; });
  circumcenters.length=0;
  infinite_vertices.forEach(function(vertex){ vertex.is_infinity = true; });
  edges[0] = make_quadedge();
  edges[2] = make_quadedge();
  edges[0].set_org_dest(infinite_vertices[1], infinite_vertices[2]);
  edges[2].set_org_dest(infinite_vertices[1], infinite_vertices[0]);
  edges[0].splice(edges[2]);
  edges[2] = edges[2].sym();
  edges[1] = connect(edges[0], edges[2]);
  edge = edges[0];
}

function disconnect_edge(e) {
  e.splice(e.oprev());
  e.sym().splice(e.sym().oprev());
}

function circumcenter(v0, v1, v2) {
  var denominator = (v1.y - v2.y)*(v1.x - v0.x) - (v1.y - v0.y)*(v1.x - v2.x);
  var num0 = ((v0.x + v1.x)*(v1.x - v0.x))/2.0 + ((v1.y - v0.y)*(v0.y + v1.y))/2.0;
  var num1 = ((v1.x + v2.x)*(v1.x - v2.x))/2.0 + ((v1.y - v2.y)*(v1.y + v2.y))/2.0;
  var x = (num0*(v1.y - v2.y) - num1*(v1.y - v0.y))/denominator;
  var y = (num1*(v1.x - v0.x) - num0*(v1.x - v2.x))/denominator;
  var c = new Dot(-1);
  c.x = x, c.y = y;
  circumcenters.push(c);
  return c;
}

function set_circumcenter(e, cc) {
  var cc = circumcenter(e.dest(), e.org(), e.onext().dest());
  circumcenters.push(cc);
  e.set_left(cc);
  e.lnext().set_left(cc);
  e.lprev().set_left(cc);
}

function delete_quadedge(q) { disconnect_edge(q); [q, q.rot, q.sym(), q.irot()].forEach( function(qq){ delete qq; }); }

function insert(vertex) {
  //if(!is_inside_cosmic_triangle(vertex)){ return; }
  try{
    locate(vertex);
  }
  catch(exception) {
    if(exception=="LocateException") { return; }
    alert(exception);
  }
  // if(edge.vertex_colinear(vertex)) {
  //   var tmp = edge.oprev();
  //   disconnect_edge(edge);
  //   delete_quadedge(edge);
  //   edge = tmp;
  // }
  var e2 = make_quadedge();
  edges.push(e2);
  var v1 = edge.org();
  e2.set_org_dest(v1, vertex);
  e2.splice(edge);
  do {
    var e2 = connect(edge, e2.sym());
    edges.push(e2);
    edge = e2.oprev();
  } while(edge.dest() != v1);
  while( true ) {
    var e3 = edge.oprev();
    if(edge.vertex_right_of(e3.dest()) && in_circle(vertex, edge.org(), e3.dest(), edge.dest())) {
      edge.swap();
      set_circumcenter(edge);
      edge = edge.oprev();
    }
    else {
      if(edge.org() == v1) {
          set_circumcenter(edge);
          return;
      }
      set_circumcenter(edge);
      edge = edge.onext().lprev();
    }
  }
}


function make_quadedge() {
  var rot_map = [1,2,3,0];
  var next_map = [0,3,2,1];
  var e =[new Edge(),new Edge(),new Edge(),new Edge()];
  for(var ie=0; ie<4; ie++){
    e[ie].rot=e[rot_map[ie]];
    e[ie].next=e[next_map[ie]];
  }
  return e[0];
}

function locate(v) {
  var search_iterations = 0;
  if(edge.vertex_right_of(v)){ edge = edge.sym(); }
  while( true ) {
    if(search_iterations++ > 1000 || v.equals(edge.org()) || v.equals(edge.dest())){ throw "LocateException"; }
    if(!edge.onext().vertex_right_of(v)) { edge = edge.onext(); continue; }
    if(!edge.dprev().vertex_right_of(v)) { edge = edge.dprev(); continue; }
    return edge;
  }
}

function connect(e0, e1) {
  var e2 = make_quadedge();
  e2.set_org_dest(e0.dest(), e1.org());
  e2.splice(e0.lnext());
  e2.sym().splice(e1);
  return e2;
}

function Edge() {
  this.data=null;
  this.next=null;
  this.rot=null;
}
Edge.prototype.splice = function(e) {
  var e_1 = this.next.rot;
  var e_2 = e.next.rot;
  var e_3 = this.next;
  this.next = e.next;
  e.next = e_3;
  var e_3 = e_1.next;
  e_1.next = e_2.next;
  e_2.next = e_3;
}
Edge.prototype.swap = function() {
  var e_0 = this.oprev();
  var e_1 = this.sym().oprev();
  this.splice(e_0);
  this.sym().splice(e_1);
  this.splice(e_0.lnext());
  this.sym().splice(e_1.lnext());
  this.set_org(e_0.dest());
  this.set_dest(e_1.dest());
}
Edge.prototype.sym = function() { return this.rot.rot; }
Edge.prototype.irot = function() { return this.rot.rot.rot; }
Edge.prototype.org = function() { return this.data; }
Edge.prototype.set_org = function(v) { this.data = v; }
Edge.prototype.right = function() { return this.rot.data; }
Edge.prototype.dest = function() { return this.rot.rot.data; }
Edge.prototype.set_dest = function(v) { this.rot.rot.data = v; }
Edge.prototype.left = function() { return this.rot.rot.rot.data; }
Edge.prototype.set_left = function(v) { this.rot.rot.rot.data = v; }
Edge.prototype.set_org_dest = function(o, d) { this.set_org(o); this.set_dest(d); }
Edge.prototype.onext = function() { return this.next; }
Edge.prototype.lnext = function() { return this.rot.rot.rot.next.rot; }
Edge.prototype.oprev = function() { return this.rot.next.rot; }
Edge.prototype.dprev = function() { return this.rot.rot.rot.next.rot.rot.rot; }
Edge.prototype.lprev = function() { return this.next.rot.rot; }
Edge.prototype.is_infinite_edge = function() { return this.org().is_infinity || this.dest().is_infinity; }
Edge.prototype.vertex_right_of = function(v) { return is_right_of(v, this.org(), this.dest()); }
