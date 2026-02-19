import Main from '../../main.js';
import Effects from '../../effects.js';
import LineEffect from '../../lineeffect.js';
import RadialEffect from '../../radialeffect.js';
import CircleEffect from '../../circleeffect.js';
import Rnd from '../../rnd.js';
import Keyboard from '../../keyboard.js';
Keyboard.setKeyFunction(' ', () => { Main.continue = false; });
Main.creatorsFunction = () => {
  let effect;
  let bounds = { x0: -1000, y0: -500, x1: 1000, y1: 500 }
  if (Effects.foreground.length < 10) {
    let b = Rnd.bool();
    let type = Rnd.int(0, 3);
    let point0 =  Rnd.point(bounds);;//Rnd.point(bounds);
    let point1 = Rnd.point(bounds);
    let color = Rnd.color(13);
    let thickness = Rnd.int(1, 10);
    let duration = Rnd.float(.3, 1);
    let initialRadius = Rnd.int(5, 50);
    let expansionRate = Rnd.int(2, 10) * 5;
    if (type === 0) {
      effect = new RadialEffect(point0, initialRadius, expansionRate, color, thickness, duration);
    } else if (type === 1) {
      effect = new LineEffect(point0, point1, color, thickness, duration);
    } else {
      effect = new CircleEffect(point0, initialRadius, expansionRate, color, duration, 0, 360);
    }
    if (b) {
      Effects.addForeground(effect);
    }else {
      Effects.addBackground(effect);
    }
  }
}

Main.run(100);
