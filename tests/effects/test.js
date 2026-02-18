import Main from '../../main.js';
import Effects from '../../effects.js';
import LineEffect from '../../lineeffect.js';
import RadialEffect from '../../radialeffect.js';
import ParticleEffect from '../../particleeffect.js';
import Rnd from '../../rnd.js';
import Keyboard from '../../keyboard.js';
//TODO: Play with particles

Keyboard.setKeyFunction(' ', () => { Main.continue = false; });
Main.creatorsFunction = () => {

  //let effect = new LineEffect(point0, point1, color, thickness, duration);
  //Effects.addForeground(effect);
  let effect;
  let bounds = { x0: -1000, y0: -500, x1: 1000, y1: 500 }
  if (Effects.foreground.length < 10) {
    let type = Rnd.bool();
    let point0 = Rnd.point(bounds);
    let point1 = Rnd.point(bounds);
    let color = Rnd.color(13);
    let thickness = Rnd.int(1, 10);
    let duration = Rnd.float(0.1, 0.7);
    if (type) {
      let initialRadius = Rnd.int(5, 50);
      let expansionRate = Rnd.int(2, 10)*5;
      effect = new RadialEffect(point0, initialRadius, expansionRate, color, thickness, duration);
    } else {
      effect = new LineEffect(point0, point1, color, thickness, duration);
    }
    Effects.addForeground(effect);
  }
}

Main.run(60);
