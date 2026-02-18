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
  let bounds = { x0: -300, y0: -300, x1: 300, y1: 300 }
  if (Effects.foreground.length + Effects.background.length < 10000) {
    for (let i = 0; i < Rnd.int (2,20)*40; i++) {
      //console.log(Effects.foreground.length + Effects.background.length);
      let b = Rnd.bool();
      let point = Rnd.point(bounds);
      let color = '#00f'
      if (!b) color = '#07f';
      let thickness = 1;
      let duration = 1;
      let initialRadius = 1;
      let expansionRate = 10 * Rnd.int(1, 6);
      effect = new RadialEffect(point, initialRadius, expansionRate, color, thickness, duration);
      if (b) {
        Effects.addForeground(effect);
      } else {
        Effects.addBackground(effect);
      }
    }
  }
}

Main.run(30);
