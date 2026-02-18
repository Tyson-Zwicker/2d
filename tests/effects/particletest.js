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
  let debug = true;
  //let effect = new LineEffect(point0, point1, color, thickness, duration);
  //Effects.addForeground(effect);

  let bounds = { x0: -300, y0: -300, x1: 300, y1: 300 }
  let point = Rnd.point(bounds);
  let color = '#00f'
  let angle = 0;
  let angleSpan = 360;
  let velMin = 1;
  let velMax = 10;
  let thickness = 1;
  let groupSize = 10;
  let durMin = 1;
  let durMax = 3;


  if (Effects.foreground.length + Effects.background.length < 1000) {
    let particles = ParticleEffect.generateGroup(point, angle, angleSpan, velMin, velMax, thickness, color, groupSize, durMin, durMax);
    Effects.addBackground(particles);
  }
}

Main.run(30);
