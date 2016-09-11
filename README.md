### Nebula:

Try it out: http://rawgit.com/bartlettmic/Topaz/master/index.html

**Nebula** is a personal project developed for fun, but also to get introduced and acclimated with HTML, CSS, and JavaScript, and their interactions with one another. I would describe it as a "particle playground," wherein several points simply drift in free space, and visuals are generated based on their proximity to one another.

Instructions on how to use the interface and the function of all components follow.

***
#### Sliders
<center>![sliders](http://i.imgur.com/tt5bM3d.png)</center>
These allow users to manually adjust attributes about how the points are rendered. Hovering over or changing a slider will display the attribute it is changing, along with the current value. Here is a list of the attributes and an expounding of their function:
* `population`&mdash; Directly represents the number of point objects being rendered each frame.
* `max connection length`&mdash; Larger values = points farther away from each other will interact. Represents the largest linear distance (in pixels) between two points where a visual will be drawn.
* `speed`&mdash; The speed (in pixels/frame) that each pixel will move (`viscosity` and `gravity` will interfere with this value).
* `line thickness`&mdash; In visual modes which are not filled-in (e.g. Lines, Annuli, Boxes, etc), this represents how many pixels thick the lines are drawn.
