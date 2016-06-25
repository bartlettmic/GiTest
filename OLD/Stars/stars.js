// Start: 8:41
Function.prototype.inherits = function(parent) { this.prototype = new parent(); this.prototype.constructor = this; }

function Star() { this.velocity = new XY(0,0); }
Star.inherits(Mob);
Star.prototype.update = function(game) {
  this.drawn = false;
  this.position.add(this.velocity);
  if((this.position.y > .5) || (this.position.y < -.5)) this.velocity.y = -this.velocity.y //this.position.y = -this.position.y;
  if((this.position.x > game.ratio/2) || (this.position.x < -game.ratio/2)) this.velocity.x = -this.velocity.x //this.position.x = -this.position.x;
}
Star.prototype.draw = function(game) {
  this.drawn = true;
  var myPP = game.unitXYtoPixelXY(this.position);
  for(var star of game.mobs) {
    if(!star.drawn) {
      var starPP = game.unitXYtoPixelXY(star.position);
      var distance = Math.sqrt(Math.pow(starPP.x-myPP.x,2)+Math.pow(starPP.y-myPP.y,2));
      if(distance < game.minDistance) {
        var grd=game.cv.createLinearGradient(myPP.x,myPP.y,starPP.x,starPP.y);
        grd.addColorStop(0,'rgba('+this.red+','+this.blue+','+this.green+','+(1-(distance/game.minDistance))+')');
        grd.addColorStop(1,'rgba('+star.red+','+star.blue+','+star.green+','+(1-(distance/game.minDistance))+')');
        game.cv.strokeStyle = grd;//'rgba(255,255,255,'+(1-distance/game.minDistance)+')';
        game.cv.beginPath();
        game.cv.moveTo(myPP.x,myPP.y);
        game.cv.lineTo(starPP.x,starPP.y);
        game.cv.stroke();
        grd = null;
      }
    }
  }
}
$(function(){
  (new Topaz({
    title:"Stars",
    fps:60,
    full:true,
    starCount:300,
    minDistance:100,
    speed:0.01,
    start:function() {
      this.canvas.css('background-color','black');
      // this.canvas.css('cursor','none');
      this.ratio = this.width/this.height;
      this.cv.lineWidth = 3;
      this.cv.lineCap="round";
      // var game = this;
      // var cursor = this.addMob(new Star().setData({ red:255,green:255,blue:255, }));
      // $(document).on({mousemove:function(e){
      //   game.mobs[cursor].position = new XY((e.pageX/game.width-.5)*game.ratio,e.pageY/game.height-.5);
      // }});
      for(var i = 0; i<this.starCount; i++)
        this.addMob(new Star().setData({
          red:Math.floor(Math.random()*255), blue:Math.floor(Math.random()*255), green:Math.floor(Math.random()*255),
          position:new XY(Math.random()*this.ratio-this.ratio/2,Math.random()-.5),
          velocity:new XY((Math.random()-.5)*this.speed,(Math.random()-.5)*this.speed),
        }));
    }
  })).init();
});
