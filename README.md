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
* `connections per point`&mdash; The maximum amount of interactions with other points a given point will render before the checking the next point. Lower values conserve performance, but make animation jumpy.
* `gravity`&mdash; **Disabled by default.** Toggling `gravity` in the bottom bar will enable this slider. Represents the gravitational strength around the set gravity point. (Equivalent to *Gm*<sub>1</sub>*m*<sub>2</sub> from Newtonian gravitational force.)

***

### Visual Modes
<center>![sliders](http://i.imgur.com/Nnm41CQ.png)</center>

These are the titles given to the different visual rendering algorithms. Changing this dropdown will change how the interactions between points will display.
Here is a list of the modes and how they render:
<center>
**Lines (square)** ![square lines](http://i.imgur.com/XcINP6b.png)
</center>
<center>
Draws a line with square endings between each pair of points, basic stuff. This mode was the starting point from which **Nebula** expanded from.
</center>

<br>
<center>**Lines (rounded)** ![round lines](http://i.imgur.com/yWhpLjA.png)</center>
</center>
<center>
Draws a line with circular endings between each pair of points. Worse performance than square ends, but usually unnoticeable.
</center>

<br>
<center>**Circles** ![circles](http://i.imgur.com/6xdnLIp.png)</center>
</center>
<center>
Draws a circle which is tangent with the two points, centered on the midpoint between them.</center>

<br>
<center>**Annuli** ![annuli](http://i.imgur.com/ONXtZXF.png)</center>
</center>
<center>
Draws an annulus which is coincident with the two points, centered on the midpoint between them.</center>

<br>
<center>**Squares** ![squares](http://i.imgur.com/CgynT4O.png)</center>
</center>
<center>
Draws a square whose diagonal is co-linear with the two points.</center>

<br>
<center>**Boxes** ![boxes](http://i.imgur.com/qRWW1gA.png)</center>
</center>
<center>
Draws a hollow square whose diagonal is co-linear with the two points.</center>

<br>
<center>**Glitches** ![boxes](http://i.imgur.com/M8smjVt.png)</center>
</center>
<center>
Draws a rectangle whose diagonal is co-linear with the two points, and is parallel to the screen.</center>

<br>
<center>**Cells** ![boxes](http://i.imgur.com/Ax7FmSm.png)</center>
</center>
<center>
Draws a hollow rectangle whose diagonal is co-linear with the two points, and is parallel to the screen.</center>
