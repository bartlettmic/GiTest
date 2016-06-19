    mousePos = { x: window.innerWidth / 2, y: window.innerHeight / 2 },
    canvas = document.createElement('canvas'),
    context = canvas.getContext('2d'),
    A = new Dot(0),
    B = new Dot(0),
    C = new Dot(0);
    maxDist=800;
    dots = [A, B, C];
    center = { x: 0, y: 0, A: 0, B: 0, C: 0, AB: 0, BC: 0, CA:0 };
    

//Initialize
$(document).ready(function() {
    document.getElementById('canvas').appendChild(canvas);
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    A.r=255; A.g=0; A.b=0;    B.r=0; B.g=255; B.b=0;    C.r=0; C.g=0; C.b=255;  
    //A.pos.x=721; A.pos.y=57;    B.pos.x=1290; B.pos.y=500;    C.pos.x=254; C.pos.y=500;
    Render(context);
});

//update mouse position
$(document).mousemove(function(e) {
    e.preventDefault();
    mousePos = { x: e.clientX, y: e.clientY	};
});

//Mouse click
$(document).click(function(e) {
	var closest = window.innerWidth + window.innerHeight, index = 0;
	for (var i = 0; i < dots.length; i++) {		
		var distance = Math.sqrt(Math.pow(dots[i].pos.x - mousePos.x, 2) + Math.pow(dots[i].pos.y - mousePos.y, 2));
		if (distance < closest) {
			closest = distance; index = i;
        }
    }
    dots[index].pos.x = mousePos.x;
    dots[index].pos.y = mousePos.y;
    if (window.innerWidth != canvas.width || window.innerHeight != canvas.height) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        //maxDist = Math.sqrt(Math.pow(window.innerWidth, 2) + Math.pow(window.innerHeight, 2)) / maxDiv;
    }

    context.clearRect(0, 0, canvas.width, canvas.height);
    
    Render(context);
});

/*
! function foo(){
	conole.log("shit"); 
	setTimeout(foo, 0); 
}();
*/

//Equilateralize
$(document).dblclick(function(e) {
    var closest = window.innerWidth + window.innerHeight, index = 0;
    for (var i = 0; i < dots.length; i++) {     
        var distance = Math.sqrt(Math.pow(dots[i].pos.x - mousePos.x, 2) + Math.pow(dots[i].pos.y - mousePos.y, 2));
        if (distance < closest) {
            closest = distance; index = i;
        }
    }
    dots[index].pos.x = mousePos.x;
    dots[index].pos.y = mousePos.y;
    //C.pos.x = mousePos.x;
    //C.pos.y = mousePos.y;
    var index2 = 0; while(index2 == index) index2++;

    var dist1 = Math.sqrt(Math.pow(dots[index2].pos.x-dots[index].pos.x, 2)+Math.pow(dots[index2].pos.y-dots[index].pos.y, 2));    
    if (dist1 > maxDist) dist1 = maxDist-1;
    dots[index2].pos.x = Math.round( dots[index].pos.x + (dots[index].pos.x >= dots[index2].pos.x ? -dist1 : dist1));
    dots[index2].pos.y = dots[index].pos.y;
    
    var index3 = 0; while(index3 == index || index3 == index2) index3++;    

    dots[index3].pos.x = Math.round((dots[index2].pos.x+dots[index].pos.x)/2);
    dots[index3].pos.y = Math.round(dots[index2].pos.y-(dist1*Math.sqrt(3)/2));    
    context.clearRect(0, 0, canvas.width, canvas.height);    
    Render(context);
});    


//Dot class constructor
function Dot(ID) {
    this.pos = { x: Math.round(Math.random() * window.innerWidth), y: Math.round(Math.random() * window.innerHeight) };
    //this.vel = { x: Math.random() * speed * (Math.round(Math.random()) ? 1 : -1), y: 0 };
    //this.vel.y = Math.sqrt(Math.pow(speed, 2) - Math.pow(this.vel.x, 2)) * (Math.round(Math.random()) ? 1 : -1)
    this.r = Math.round(Math.random() * 255);
    this.g = Math.round(Math.random() * 255);
    this.b = Math.round(Math.random() * 255);
    this.id = ID;
    this.ids = new Map();
}

function Render(c) {

      
    center.x = (A.pos.x + B.pos.x + C.pos.x) / 3;
    center.y = (A.pos.y + B.pos.y + C.pos.y) / 3;
    center.A = Math.sqrt(Math.pow(A.pos.x - center.x, 2) + Math.pow(A.pos.y - center.y, 2));
    center.B = Math.sqrt(Math.pow(B.pos.x - center.x, 2) + Math.pow(B.pos.y - center.y, 2));
    center.C = Math.sqrt(Math.pow(C.pos.x - center.x, 2) + Math.pow(C.pos.y - center.y, 2));

    var DD = 2*(A.pos.x*(B.pos.y-C.pos.y)+B.pos.x*(C.pos.y-A.pos.y)+C.pos.x*(A.pos.y-B.pos.y)),
    circumcenter = { x: ((Math.pow(A.pos.x, 2)+Math.pow(A.pos.y, 2))*(B.pos.y-C.pos.y) + (Math.pow(B.pos.x, 2)+Math.pow(B.pos.y, 2))*(C.pos.y-A.pos.y) + (Math.pow(C.pos.x, 2)+Math.pow(C.pos.y, 2))*(A.pos.y-B.pos.y))/DD,
       y: ((Math.pow(A.pos.x, 2)+Math.pow(A.pos.y, 2))*(C.pos.x-B.pos.x) + (Math.pow(B.pos.x, 2)+Math.pow(B.pos.y, 2))*(A.pos.x-C.pos.x) + (Math.pow(C.pos.x, 2)+Math.pow(C.pos.y, 2))*(B.pos.x-A.pos.x))/DD,
       radius: 0 };
       circumcenter.radius = Math.sqrt(Math.pow(circumcenter.x-A.pos.x, 2) + Math.pow(circumcenter.y-A.pos.y, 2));


    var maxRadius = (Math.sqrt(3)/3)*(maxDist);  
    var area = Math.abs((A.pos.x * (B.pos.y - C.pos.y) + B.pos.x * (C.pos.y - A.pos.y) + C.pos.x * (A.pos.y - B.pos.y)) / 2),

    AB = { x: (A.pos.x + B.pos.x) / 2, y: (A.pos.y + B.pos.y) / 2, dist: Math.sqrt(Math.pow(A.pos.x-B.pos.x, 2) + Math.pow(A.pos.y-B.pos.y, 2)) },

    BC = { x: (B.pos.x + C.pos.x) / 2, y: (B.pos.y + C.pos.y) / 2, dist: Math.sqrt(Math.pow(C.pos.x-B.pos.x, 2) + Math.pow(C.pos.y-B.pos.y, 2)) },

    CA = { x: (C.pos.x + A.pos.x) / 2, y: (C.pos.y + A.pos.y) / 2, dist: Math.sqrt(Math.pow(A.pos.x-C.pos.x, 2) + Math.pow(A.pos.y-C.pos.y, 2)) },

    perimeter = AB.dist+BC.dist+CA.dist,

    Ac2 = { x: (A.pos.x + center.x) / 2, y: (A.pos.y + center.y) / 2, dist: center.A / 2 },
    Bc2 = { x: (B.pos.x + center.x) / 2, y: (B.pos.y + center.y) / 2, dist: center.B / 2 },
    Cc2 = { x: (C.pos.x + center.x) / 2, y: (C.pos.y + center.y) / 2, dist: center.C / 2 };


    if (center.A > maxRadius) {
        var grd = c.createLinearGradient(C.pos.x, C.pos.y, B.pos.x, B.pos.y),        
        //var grd = c.createRadialGradient(C.pos.x,C.pos.y,BC.dist/2,B.pos.x,B.pos.y,BC.dist/2);
        
        alpha = 1-(BC.dist/maxDist),
        
        cC = "rgba(" + C.r + "," + C.g + "," + C.b + "," + alpha + ")",
        cB = "rgba(" + B.r + "," + B.g + "," + B.b + "," + alpha + ")";                

        grd.addColorStop(0, cC); grd.addColorStop(1, cB);        

    / //A
    c.beginPath(); c.arc(A.pos.x, A.pos.y, 2.55, 0, 2 * Math.PI); c.fillStyle = "rgba(255,255,255,1)"; c.fill();

    //B
    c.beginPath(); c.arc(B.pos.x, B.pos.y, 2.55, 0, 2 * Math.PI); c.fillStyle = "rgba(255,255,255,1)"; c.fill();

    //C
    c.beginPath(); c.arc(C.pos.x, C.pos.y, 2.55, 0, 2 * Math.PI); c.fillStyle = "rgba(255,255,255,1)"; c.fill();

    //Line
    c.beginPath(); c.moveTo(C.pos.x, C.pos.y); 
    c.lineTo(B.pos.x, B.pos.y);        
    c.strokeStyle = grd; c.lineWidth=5; c.stroke();   

    } else if (center.B > maxRadius) {
        var grd = c.createLinearGradient(C.pos.x, C.pos.y, A.pos.x, A.pos.y),        
        //var grd = c.createRadialGradient(C.pos.x,C.pos.y,BC.dist/2,B.pos.x,B.pos.y,BC.dist/2);
        
        alpha = 1-(CA.dist/maxDist),
        
        cC = "rgba(" + C.r + "," + C.g + "," + C.b + "," + alpha + ")",
        cA = "rgba(" + A.r + "," + A.g + "," + A.b + "," + alpha + ")";                

        grd.addColorStop(0, cC); grd.addColorStop(1, cA);        

    / //A
    c.beginPath(); c.arc(A.pos.x, A.pos.y, 2.55, 0, 2 * Math.PI); c.fillStyle = "rgba(255,255,255,1)"; c.fill();

    //B
    c.beginPath(); c.arc(B.pos.x, B.pos.y, 2.55, 0, 2 * Math.PI); c.fillStyle = "rgba(255,255,255,1)"; c.fill();

    //C
    c.beginPath(); c.arc(C.pos.x, C.pos.y, 2.55, 0, 2 * Math.PI); c.fillStyle = "rgba(255,255,255,1)"; c.fill();

    //Line
    c.beginPath(); c.moveTo(C.pos.x, C.pos.y); 
    c.lineTo(A.pos.x, A.pos.y); 
    c.strokeStyle = grd; c.lineWidth=5; c.stroke();    

    } else if (center.C > maxRadius) {
        var grd = c.createLinearGradient(A.pos.x, A.pos.y, B.pos.x, B.pos.y),        
        //var grd = c.createRadialGradient(C.pos.x,C.pos.y,BC.dist/2,B.pos.x,B.pos.y,BC.dist/2);
        
        alpha = 1-(AB.dist/maxDist),
        
        cA = "rgba(" + A.r + "," + A.g + "," + A.b + "," + alpha + ")",
        cB = "rgba(" + B.r + "," + B.g + "," + B.b + "," + alpha + ")";                

        grd.addColorStop(0, cA); grd.addColorStop(1, cB);        

    / //A
    c.beginPath(); c.arc(A.pos.x, A.pos.y, 2.55, 0, 2 * Math.PI); c.fillStyle = "rgba(255,255,255,1)"; c.fill();

    //B
    c.beginPath(); c.arc(B.pos.x, B.pos.y, 2.55, 0, 2 * Math.PI); c.fillStyle = "rgba(255,255,255,1)"; c.fill();

    //C
    c.beginPath(); c.arc(C.pos.x, C.pos.y, 2.55, 0, 2 * Math.PI); c.fillStyle = "rgba(255,255,255,1)"; c.fill();

    //Line
    c.beginPath(); c.moveTo(A.pos.x, A.pos.y);    
    c.lineTo(B.pos.x, B.pos.y); 
    c.strokeStyle = grd; c.lineWidth=5; c.stroke();
} else {

    var gA = c.createLinearGradient(A.pos.x, A.pos.y, BC.x, BC.y),
        gB = c.createLinearGradient(B.pos.x, B.pos.y, CA.x, CA.y),
        gC = c.createLinearGradient(C.pos.x, C.pos.y, AB.x, AB.y),
        
        //alphaA = (1-(center.A/maxRadius))*Math.min((1-(CA.dist/maxDist)),(1-(AB.dist/maxDist))), 
        //alphaB = (1-(center.B/maxRadius))*Math.min((1-(BC.dist/maxDist)),(1-(AB.dist/maxDist))),        
        //alphaC = (1-(center.C/maxRadius))*Math.min((1-(CA.dist/maxDist)),(1-(BC.dist/maxDist)));

        alphaA = 1-(center.A/maxRadius),
        alphaB = 1-(center.B/maxRadius),        
        alphaC = 1-(center.C/maxRadius);        

        if (alphaA > .5) alphaA *= (alphaA-.5)+1;
        //else alphaA /= (alphaA)+1;        
        if (alphaB > .5) alphaB *= (alphaB-.5)+1;
        //else alphaB /= (alphaB)+1;
        if (alphaC > .5) alphaC *= (alphaC-.5)+1;
        //else alphaC /= (alphaC)+1;

        alphaA *= Math.min(alphaA, alphaB, alphaC);
        alphaB *= Math.min(alphaA, alphaB, alphaC);
        alphaC *= Math.min(alphaA, alphaB, alphaC);  

        // alphaA *= alphaB*alphaC;                
        // alphaB *= alphaA*alphaC;
        // alphaC *= alphaA*alphaB;      

        // alphaA = Math.min(alphaA, alphaB, alphaC);
        // alphaB = Math.min(alphaA, alphaB, alphaC);
        // alphaC = Math.min(alphaA, alphaB, alphaC);

        //alphaA *= (alphaA)+1;
        //alphaB *= (alphaB)+1;
        //alphaC *= (alphaC)+1;
                
        var cA = "rgba(" + A.r + "," + A.g + "," + A.b + "," + alphaA + ")",
        cB = "rgba(" + B.r + "," + B.g + "," + B.b + "," + alphaB + ")",
        cC = "rgba(" + C.r + "," + C.g + "," + C.b + "," + alphaC + ")",
        c0 = "rgba(0,0,0,0)";

        center.AB = Math.sqrt(Math.pow(center.x-AB.x, 2) + Math.pow(center.y-AB.y, 2));
        center.BC = Math.sqrt(Math.pow(center.x-BC.x, 2) + Math.pow(center.y-BC.y, 2));
        center.CA = Math.sqrt(Math.pow(center.x-CA.x, 2) + Math.pow(center.y-CA.y, 2));

        gA.addColorStop(0, cA); gA.addColorStop(1, c0);
        gB.addColorStop(0, cB); gB.addColorStop(1, c0);
        gC.addColorStop(0, cC); gC.addColorStop(1, c0);


    //A
    c.beginPath(); c.arc(A.pos.x, A.pos.y, 2.55, 0, 2 * Math.PI); c.fillStyle = "rgba(255,255,255,1)"; c.fill();

    //B
    c.beginPath(); c.arc(B.pos.x, B.pos.y, 2.55, 0, 2 * Math.PI); c.fillStyle = "rgba(255,255,255,1)"; c.fill();

    //C
    c.beginPath(); c.arc(C.pos.x, C.pos.y, 2.55, 0, 2 * Math.PI); c.fillStyle = "rgba(255,255,255,1)"; c.fill();

    //Solid Triangle
    c.beginPath();
    c.moveTo(A.pos.x, A.pos.y);

    c.lineTo(B.pos.x, B.pos.y);
    c.lineTo(C.pos.x, C.pos.y);
    c.lineTo(A.pos.x, A.pos.y);

    c.globalCompositeOperation = 'screen';
    c.fillStyle = gA; c.fill(); c.fillStyle = gB; c.fill(); c.fillStyle = gC; c.fill();
    c.globalCompositeOperation = 'source-over';

    c.beginPath();
    c.moveTo(A.pos.x, A.pos.y);
    //c.quadraticCurveTo(center.x, center.y, B.pos.x, B.pos.y);
    //c.quadraticCurveTo(center.x, center.y, C.pos.x, C.pos.y);
    //c.quadraticCurveTo(center.x, center.y, A.pos.x, A.pos.y);

    cA = "rgba(" + (255-A.r) + "," + (255-A.g) + "," + (255-A.b) + "," + alphaA + ")",
    cB = "rgba(" + (255-B.r) + "," + (255-B.g) + "," + (255-B.b) + "," + alphaB + ")",
    cC = "rgba(" + (255-C.r) + "," + (255-C.g) + "," + (255-C.b) + "," + alphaC + ")",

    gA.addColorStop(0, cA); gA.addColorStop(1, c0);
    gB.addColorStop(0, cB); gB.addColorStop(1, c0);
    gC.addColorStop(0, cC); gC.addColorStop(1, c0);

    //c.globalCompositeOperation = 'screen';
    c.fillStyle = gA; c.fill(); c.fillStyle = gB; c.fill(); c.fillStyle = gC; c.fill();
    //c.globalCompositeOperation = 'source-over';   

    //c.strokeStyle = gA; c.stroke(); c.strokeStyle = gB; c.stroke(); c.strokeStyle = gC; c.stroke(); 

    //AB → C
    c.beginPath(); c.moveTo(AB.x, AB.y); c.lineTo(C.pos.x, C.pos.y); c.lineWidth = 1; c.strokeStyle = "rgba(0,0,255,1)"; c.stroke();

    //BC → A
    c.beginPath(); c.moveTo(BC.x, BC.y); c.lineTo(A.pos.x, A.pos.y); c.lineWidth = 1; c.strokeStyle = "rgba(255,0,0,1)"; c.stroke();

    //CA → B
    c.beginPath(); c.moveTo(CA.x, CA.y); c.lineTo(B.pos.x, B.pos.y); c.lineWidth = 1; c.strokeStyle = "rgba(0,255,0,1)"; c.stroke();

    //AB
    c.beginPath(); c.arc(AB.x, AB.y, 2.55, 0, 2 * Math.PI); c.fillStyle = "rgba(255,255,255,1)"; c.fill(); 

    //CA 
    c.beginPath(); c.arc(CA.x, CA.y, 2.55, 0, 2 * Math.PI); c.fillStyle = "rgba(255,255,255,1)"; c.fill();

    //BC
    c.beginPath(); c.arc(BC.x, BC.y, 2.55, 0, 2 * Math.PI); c.fillStyle = "rgba(255,255,255,1)"; c.fill();

    //Center
    c.beginPath(); c.arc(center.x, center.y, 2.55, 0, 2 * Math.PI); c.fillStyle = "rgba(255,127,0,1)"; c.fill();

    //Ac2
    c.beginPath(); c.arc(Ac2.x, Ac2.y, 2.55, 0, 2 * Math.PI); c.fillStyle = "rgba(255,127,0,1)"; c.fill();

    //Bc2
    c.beginPath(); c.arc(Bc2.x, Bc2.y, 2.55, 0, 2 * Math.PI); c.fillStyle = "rgba(255,127,0,1)"; c.fill();

    //Cc2
    c.beginPath(); c.arc(Cc2.x, Cc2.y, 2.55, 0, 2 * Math.PI); c.fillStyle = "rgba(255,127,0,1)"; c.fill();

    //AB → BC, center
    //c.beginPath(); c.moveTo(AB.x, AB.y); c.quadraticCurveTo(center.x, center.y, BC.x, BC.y); c.lineWidth = 1; c.strokeStyle = "rgba(255,0,255,1)"; c.stroke();

    //AB → BC, B
    //c.beginPath(); c.moveTo(AB.x, AB.y); c.quadraticCurveTo(B.pos.x, B.pos.y, BC.x, BC.y); c.lineWidth = 1; c.strokeStyle = "rgba(255,0,255,1)"; c.stroke();

    //BC → CA, center
    //c.beginPath(); c.moveTo(BC.x, BC.y); c.quadraticCurveTo(center.x, center.y, CA.x, CA.y); c.lineWidth = 1; c.strokeStyle = "rgba(255,255,0,1)"; c.stroke();

    //BC → CA, C
    //c.beginPath(); c.moveTo(BC.x, BC.y); c.quadraticCurveTo(C.pos.x, C.pos.y, CA.x, CA.y); c.lineWidth = 1; c.strokeStyle = "rgba(255,255,0,1)"; c.stroke();

    //CA → AB. center
    //c.beginPath(); c.moveTo(CA.x, CA.y); c.quadraticCurveTo(center.x, center.y, AB.x, AB.y); c.lineWidth = 1; c.strokeStyle = "rgba(0,255,255,1)"; c.stroke();

    //CA → AB. A
    //c.beginPath(); c.moveTo(CA.x, CA.y); c.quadraticCurveTo(A.pos.x, A.pos.y, AB.x, AB.y); c.lineWidth = 1; c.strokeStyle = "rgba(0,255,255,1)"; c.stroke();
}
    
    //Circumcenter circle
    c.beginPath(); 
    c.arc(circumcenter.x, circumcenter.y, circumcenter.radius, 0, 2 * Math.PI); 
    c.strokeStyle = "slateGray"; c.lineWidth = 1; c.stroke();
   

    //Text informatics
    c.font = '20px sans-serif';
    var H = 25;
    var stringA = "A: ("+A.pos.x+", "+A.pos.y+")   ";
    c.fillStyle="red";
    c.fillText(stringA,5,H);

    var stringB = "B: ("+B.pos.x+", "+B.pos.y+")   ";
    c.fillStyle="green";
    c.fillText(stringB,140,H);

    var stringC = "C: ("+C.pos.x+", "+C.pos.y+")   ";
    c.fillStyle="blue";
    c.fillText(stringC,290,H);
    c.fillStyle="slateGray";
    H+=25;
    
    c.fillText("Area: "+area+"    Perimeter: "+Math.round(perimeter*100)/100,5,H);
    H+=30; 

    c.fillStyle="orange";
    c.fillText("•AB: ("+Math.round(AB.x)+", "+Math.round(AB.y)+")    Length: "+Math.round(AB.dist*100)/100,5,H);
    c.fillStyle="cyan";
    H+=20;
    c.fillText("•BC: ("+Math.round(BC.x)+", "+Math.round(BC.y)+")    Length: "+Math.round(BC.dist*100)/100,5,H);
    c.fillStyle="magenta";
    H+=20;
    c.fillText("•CA: ("+Math.round(CA.x)+", "+Math.round(CA.y)+")    Length: "+Math.round(CA.dist*100)/100,5,H);
    c.fillStyle="darkgoldenrod";
    H+=30;
    c.fillText("Centroid: ("+Math.round(center.x)+", "+Math.round(center.y)+")",5,H);
    H+=20;
    c.fillText("Altitude BC: "+Math.round(center.A*100)/100,5,H);
    H+=20;
    c.fillText("Altitude CA: "+Math.round(center.B*100)/100,5,H);
    H+=20;
    c.fillText("Altitude AB: "+Math.round(center.C*100)/100,5,H);
    c.fillStyle="orange";
    H+=30;
    c.fillText("Circumcenter: ("+Math.round(circumcenter.x)+", "+Math.round(circumcenter.y)+")",5,H);
    H+=20;
    c.fillText("Circumcircle radius: "+Math.round(100*circumcenter.radius)/100,5,H);
    H+=30;
    c.fillStyle="slateGray";
    var AP = (Math.round((area/perimeter)/((AB.dist+BC.dist+CA.dist)/3)*100000)/100000);
    c.fillText("Area/Perimeter: "+AP,5,H);
    H+=20;
    c.fillText("Ideal A/P Ratio: "+0.14434,5,H);
    H+=20;
    c.fillText("Deviation: "+Math.round(1000*Math.abs(AP-0.14434)/0.14434)/10+"%",5,H);
    H+=30;
    c.fillStyle="slateGray";
    c.fillText("Max radius: "+maxRadius,5,H);
    c.fillStyle="red";
    H+=20;
    c.fillText("A radius: "+Math.round(100*center.A)/100,5,H);
    c.fillStyle="green";
    H+=20;
    c.fillText("B radius: "+Math.round(100*center.B)/100,5,H);
    c.fillStyle="blue";
    H+=20;
    c.fillText("C radius: "+Math.round(100*center.C)/100,5,H);    
    c.fillStyle="red";
    H+=30;
    c.fillText("A alpha: "+Math.round(100*alphaA)/100,5,H);
    c.fillStyle="green";
    H+=20;
    c.fillText("B alpha: "+Math.round(100*alphaB)/100,5,H);
    c.fillStyle="blue";
    H+=20;
    c.fillText("C alpha: "+Math.round(100*alphaC)/100,5,H);
    c.fillStyle="slateGray";
    c.fillText("Double click to equilateralize",5,window.innerHeight-5);
}
