// Main framewor
function Topaz(data) {
  for (var key in data) this[key] = data[key];
  if(this.title) document.title = this.title;
  if(!this.ratio) this.ratio = 1;
  if(!this.fps) this.fps = 60;
  if(!this.target) this.target = 'body';
  this.height = $(this.target).height();
  if(this.full) this.width = $(this.target).width();
  else this.width = this.height*this.ratio;
  this.canvas = $('<canvas>');
  this.canvas.attr('width',this.width);
  this.canvas.attr('height',this.height);
  this.cv = this.canvas[0].getContext('2d');
  this.cv.translate(this.width/2,this.height/2);
  this.cv.globalCompositeOperation = 'source-over';
  if(this.nearestNeighbor) {
    this.cv.imageSmoothingEnabled = false;
    this.cv.mozImageSmoothingEnabled = false;
    this.cv.webkitImageSmoothingEnabled = false;
  }
  this.mobs = new Array();
  this.key = new Array();
  this.sprites = {};
  this.sleep = 1000/this.fps;
}
Topaz.prototype.init = function() {
  var game = this;
  $(document).on({ keydown:function(e){ game.key[e.keyCode] = true; }, keyup:function(e){ game.key[e.keyCode] = false; } });
  this.id = setInterval(function(){ game.update(); game.draw(); }, this.sleep);
  if(this.start) this.start();
  $(this.target).html(this.canvas);
}
Topaz.prototype.update = function() {
  if(this.main) this.main();
  var clean = false;
  for(var mob of this.mobs){
    if(mob.update) mob.update(this);
    if(mob.die) clean = true;
  }
  while(clean) {
    clean = false;
    for(var i in this.mobs) {
      if(this.mobs[i].die) {
        this.mobs.splice(i,1);
        clean = true;
        break;
      }
    }
  }
}
Topaz.prototype.draw = function() {
  this.cv.clearRect(-this.width/2,-this.height/2,this.width,this.height);
  for(var i in this.mobs) this.mobs[i].draw(this);
}
Topaz.prototype.addMob = function(mob) { return this.mobs.push(mob) - 1; }
Topaz.prototype.addSprite = function(key,src) {
  var img = new Image();
  img.src = src;
  this.sprites[key] = img;
}
Topaz.prototype.unitXYtoPixelXY = function(xy) { return new XY(xy.x*this.height,xy.y*this.height); }
Topaz.prototype.unittoPixels = function(unit) { return unit*this.height }
// Topaz.prototype.pixelstoUnits = function(pixels) { return pixels/this.height-.5; }
// Mob!
function Mob(data) {
  this.setData(data);
  if(!this.position) this.position = new XY(0,0);
  if(!this.size) this.size = new XY(0,0);
}
Mob.prototype.setData = function(data) {
  for (var key in data) this[key] = data[key];
  return this;
}
Mob.prototype.draw = function(game) {
  var cv = game.cv;
  var unit = game.height;
  if(this.color) cv.fillStyle = this.color;
  else cv.fillStyle = "black";
  if(this.sprite)
    cv.drawImage(game.sprites[this.sprite],this.position.x*unit-this.size.x*unit/2,this.position.y*unit-this.size.y*unit/2,this.size.x*unit,this.size.y*unit);
  else
    cv.fillRect(this.position.x*unit-this.size.x*unit/2,this.position.y*unit-this.size.y*unit/2,this.size.x*unit,this.size.y*unit);
}
// XY!
function XY(x,y) { this.x = x; this.y = y; }
XY.prototype.getArray = function() { return [this.x,this.y]; }
XY.prototype.toString = function(){ return "("+this.x+","+this.y+")"; }
XY.prototype.add = function(xy) { this.x += xy.x; this.y += xy.y; return this; }
XY.prototype.sub = function(xy) { this.x -= xy.x; this.y -= xy.y; return this;}
XY.prototype.div = function(xy) { this.x = this.x/xy.x; this.y = this.y/xy.y; return this; }
