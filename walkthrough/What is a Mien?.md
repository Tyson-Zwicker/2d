
Definition: Appearance/Aspect/Disposition (16th century, derived from French "mine"). 

All objects that appear on the screen must have a color defined for their border, background and text, as well as font information (name and size) and borderWidth.   In addition, all of that may change several times depending on the state/mood of the object being drawn.  Miens simplify all of this.

**Properties **

* bgColor: used to fill the polygons.
* borderColor: used to draw the lines that define the polygon sides.
* textColor: color to draw text
* borderWidth: width to draw the lines around polygons
* fontName: font name
* fontSize: font size (in pixels or css "px" units which are supposed to the same.)

All colors are expressed hexidecimal.  In this document 16-bit color will be used, but you can use 32-bit color if you choose.

16 Bit: `#RGB`
32 Bit: `#RRGGBB`

or if you choose to include opacity (0 ( is transparent, 1 cannot be seen through):

16 Bit: `#RGBA`
32 Bit: `#RRGGBBAA`

Where A is the opacity.

Anything the engine does that involves being represented on screen will have mien as a parameter somwhere.  Luckily they are very simple to use. 


To create your own Mien, just give it a name:

```javascript
 let myMien = new Mien ('foo');
```

Using it requires calling on a "mood" property (the built-in ones are called *normal, hovered, pressed, dimmed* and *highlighted*, and then specifc property you want.

Examples:

```javascript
gfxContext.fillStyle = myMien.normal.bgColor;
gfxContext.font = `${myMien.highlighted.fontSize}px ${myMien.highlighted.fontName}`;
gfxContext.lineWidth = myMien.hovered.borderWidth;
gfxContext.fillRect (5,5,100,50);
```

A Mien can be customized using these methods:

* setFont  (fontName, fontSize, mood)
* SetColors (backgroundColor, BorderColor, TextColor, mood)
* SetBorderWidth (borderWidth, mood)

When making a custom Mien, you don't have to specify every mood, just the ones you expect to use (a lot of the time all you need is "normal").  Moods you don't customize will still use the defaults.
if mood is ommited it assumed to refer to the default "normal" mood.

```javascript
let name = "Arial";
let size = 14;
let mood = "normal" //or "angry" or anything you need.
setFont (name, size, mood)
let bg = '#f000'; //You don't need to include opacity 
let border ='#0f00'; //and you can use 32-bit (#rrrggbbb)
let text ='#00f0'; //if you like.
setColors (bg, border, text, mood)
let width = 2;
setBorderWidtgh (width, mood)
```

If you just need basic colors, there are several built-in Miens:

```javascript
Mien.Red
Mien.Blue
Mien.Cyan
Mien.Gray
Mien.Green
Mien.Magenta
Mien.Yellow
Mien.Transparent
```

All come with the standard set of default moods built in.

Each time a built-in Mien is requested, it is returned as an instance, so you can customize it for your own use without affecting the built-in one.
