### Nebula:

Try it out: http://rawgit.com/bartlettmic/Topaz/master/index.html

**Nebula** is a personal project developed for fun, but also to get introduced and acclimated with HTML, CSS, and JavaScript, and their interactions with one another. I would describe it as a "particle playground," wherein several points simply drift in free space, and visuals are generated based on their proximity to one another.

Instructions on how to use the interface and the function of all components follow.

***
### Sliders
<center>![sliders](http://i.imgur.com/tt5bM3d.png)</center>
These allow users to manually adjust attributes about how the points are rendered. Hovering over or changing a slider will display the attribute it is changing, along with the current value. Here is a list of the attributes and an expounding of their function:

* `population`&mdash; Directly represents the number of point objects being rendered each frame.
* `max connection length`&mdash; Larger values = points farther away from each other will interact. Represents the largest linear distance (in pixels) between two points where a visual will be drawn.
* `speed`&mdash; The speed (in pixels/frame) that each pixel will move (`viscosity` and `gravity` will interfere with this value).
* `line thickness`&mdash; In visual modes which are not filled-in (e.g. Lines, Annuli, Boxes, etc), this represents how many pixels thick the lines are drawn. **This slider will disable itself on visuals it doesn't apply to.**
* `connections per point`&mdash; The maximum amount of interactions with other points a given point will render before the checking the next point. Lower values conserve performance, but make animation jumpy. Turn the slider all the way for infinite connections.
* `gravity`&mdash; **Disabled by default.** Toggling `gravity` in the bottom bar will enable this slider. Represents the gravitational strength around the set gravity point. (Equivalent to *Gm*<sub>1</sub>*m*<sub>2</sub> from Newtonian gravitational force.)

***
### Toggleables

![toggleables](http://i.imgur.com/se5zE9U.png)

These are simply checkboxes in disguise, each word can be clicked to change something or perform a function. If a word is gray or orange, that means the mode is either on (orange) or off (gray). If it is white, that means it toggles between several states or performs a function.

* `screenshot` will open an image of the current canvas (minus the interface) in a new tab, so you can share it easily without all the clutter.
* `transparent` can be toggled to `opaque`. This changes whether the canvas background (solid black or white block) is rendered with the image when you click `screenshot`. If it is set to `transparent` when `screenshot` is clicked, then only the points and their visuals will be in the image.
* `gravity` causes points to gravitate around a selected point. **Click in the canvas while** `gravity` **is active to change the gravitation point.** Default gravitation point is in the center of the screen. The `gravity` slider (right-most slider) will become enabled when this mode is on, and will influence the strength of gravitation.
* `viscosity` causes points which are close enough to create a visual to also stick together a little bit, creating the illusion of elasticity.
* `edge-bounce` or `edge-loop` determines how dots behave near the edges of the window. `edge-bounce` causes them to reflect the opposite direction (i.e. bounce off). `edge-loop` causes the point to teleport to the opposite side of the screen (i.e. loop around).
* `black` or `white` toggles the respective color of the background window.
* `clear` causes the canvas to be cleared before each new frame is drawn. `trails` causes the canvas to slowly fade to transparency, creating a trailing effect. `paint` never clears the canvas, so anything drawn is there until something gets drawn on top of it.
* `points` toggles the display of the all the points being rendered. **On by default.**
* `rainbow` is not yet implemented. This will toggle between all the points to be the same color&mdash;which will be user-specified&mdash;or all random colors as they are now.
* `about` simply links to this page, have to put instructions somewhere!

***

### Visual Modes
<center>![sliders](http://i.imgur.com/Nnm41CQ.png)</center>

These are the titles given to the different visual rendering algorithms. Changing this dropdown will change how the interactions between points will display.
Here is a list of the modes and how they render:<br><br><br><br>

<center>
**Lines (square)** ![square lines](http://i.imgur.com/UyAyiap.png)
</center>
<center>
<br>Draws a line with square endings between each pair of points, basic stuff. This mode was the starting point from which **Nebula** expanded from.
</center>

<br>
<center>**Lines (rounded)** ![round lines](http://i.imgur.com/yWhpLjA.png)</center>
</center>
<center>
<br>Draws a line with circular endings between each pair of points. Worse performance than square ends, but usually unnoticeable.
</center>

<br>
<center>**Circles** ![circles](http://i.imgur.com/6xdnLIp.png)</center>
</center>
<center>
<br>Draws a circle which is tangent with the two points, centered on the midpoint between them.</center>

<br>
<center>**Annuli** ![annuli](http://i.imgur.com/deGD2Rd.png)</center>
</center>
<center>
<br>Draws an annulus which is coincident with the two points, centered on the midpoint between them.</center>

<br>
<center>**Squares** ![squares](http://i.imgur.com/CgynT4O.png)</center>
</center>
<center>
<br>Draws a square whose diagonal is co-linear with the two points.</center>

<br>
<center>**Boxes** ![boxes](http://i.imgur.com/qRWW1gA.png)</center>
</center>
<center>
<br>Draws a hollow square whose diagonal is co-linear with the two points.</center>

<br>
<center>**Glitches** ![glitches](http://i.imgur.com/M8smjVt.png)</center>
</center>
<center>
<br>Draws a rectangle whose diagonal is co-linear with the two points, and is parallel to the screen.</center>

<br>
<center>**Cells** ![cells](http://i.imgur.com/Ax7FmSm.png)</center>
</center>
<center>
<br>Draws a hollow rectangle whose diagonal is co-linear with the two points, and is parallel to the screen.</center>

<br>
<center>**Triangles** ![triangles](http://i.imgur.com/uqR00Bs.png)</center>
</center>
<center>
<br>
Draws a triangle between 3 points which are close enough together (i.e. their distance from the center point are less than or equal to those of an equilateral triangle whose side lengths are the maximum distance).
</center>

<br>
<center>**Arrowheads** ![arrowheads](http://i.imgur.com/I9Cds8A.png)</center>
</center>
<center>
<br>Uses the same proximity algorithm as the Triangles visual, but draws a quadratic curve using the center point as a handle as opposed to a straight line. Very poor performance in higher populations.</center>

<br>
<center>**Circumcircles** ![circumcircles](http://i.imgur.com/kXBCUPU.png)</center>
</center>
<center>
<br>Uses the same proximity algorithm as the Triangles visual, but draws a circle which is tangent to the three points.</center>

<br>
<center>**Feverdream**

![feverdream](http://i.imgur.com/XF7VdyG.png)</center>
</center>
<center>
<br>Draws a gradient between each point and the center-point of all points. I recommend toggling `clear` to `trails` for a swanky effect.</center>

<br>
<center>**Delaunay** ![delaunay](http://i.imgur.com/r4pEJ6Z.png)</center>
</center>
<center>
<br>Generates a Delaunay triangulation between all points.</center>

<br>
<center>**Voronoi**

![voronoi](http://i.imgur.com/nmIgxAl.png)</center>
</center>
<center>
<br>Generates a Voronoi diagram using all points as seeds.</center>

---
### Fun Recommendations
Naturally having stared at this application for several hours and testing every new feature, I've stumbled upon some pretty unique combinations. Feel free to try them for yourself!

* Hallucinations (visual: **Feverdream**, `clear` set to `trails`, `points` off)
![hallucination](http://i.imgur.com/enb6Qux.png)

* Solar System (visual: **None**, `clear` set to `trails` or `paint`, `gravity` on, `points` on)
![particle collide](http://i.imgur.com/Eo5jWB0.png)  

* 3D Tubes (visual: Anything hollow, `clear` set to `trails` or `paint`)
![tubes](http://i.imgur.com/mFxEbMv.png)

* Picasso (visual: **Voronoi**, `clear` set to `trails` or `paint`, `points` off)
![picasso](http://i.imgur.com/9tx9Hsj.png)

* Seizure Weave (visual: **Cells**, `clear` set to `trails` or `paint`, `population` high, `speed` high, `line thickness` low)
![weave](http://i.imgur.com/bcZ0xWI.png)

* Spider Web Trip (visual: **Arrowheads**, `connections per point` set to 1, `population` sort of high)
**THIS IS VERY SLOW**
![stuff](http://i.imgur.com/boyev1w.png)
