import Main from '../../main.js';
import Effects from '../../effects.js';
import LineEffect from '../../lineeffect.js';
import RadialEffect from '../../radialeffect.js';
import ParticleEffect from '../../particleeffect.js';
import Rnd from '../../rnd.js';
import Keyboard from '../../keyboard.js';

Keyboard.setKeyFunction(' ', () => { Main.continue = false; });
let point = { x: 0, y: 0 };
let color = '#fff'
let angle = 0;
let angleSpan = 10;
let velMin = 5;
let velMax = 60;
let thickness = 2;
let groupSize = 30;
let durMin = 1;
let durMax = 6;
Main.creatorsFunction = () => {
  if (Effects.background.length + Effects.foreground.length < 1000) {
    let particles = ParticleEffect.generateGroup(point, angle, angleSpan, velMin, velMax, thickness, color, groupSize, durMin, durMax);
    Effects.addBackground(particles);
  }
}
Main.run(100);
