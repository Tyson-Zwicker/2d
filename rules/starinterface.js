import Button from '../engine/button.js';
import Game from '../engine/game.js';
import GameObject from '../engine/gameobject.js';
import GUI from '../engine/gui.js';
import GUIPanel from '../engine/guipanel.js';
import GUIElement from '../engine/guielement.js';
import Mien from '../engine/mien.js';
import Part from '../engine/part.js'
import Polygon from '../engine/polygon.js';
import Effects from '../engine/effects.js';
import LineEffect from '../engine/lineeffect.js';
import ParticleEffect from '../engine/particleeffect.js';
import RadialEffect from '../engine/radialeffect.js';
import Vec from '../engine/vec.js';
import View from '../engine/view.js';
import Rnd from '../engine/rnd.js';
import GameState from './gamestate.js';

export default class StarInterface {
  static {
    this.StarMien = new Mien('star-yellow');
    this.StarMien.setColors('#ffb', '#ff0', '#fff', 'normal');
    this.StarMien.setColors('#fff', '#fff', '#000', 'hovered');
    this.StarMien.setColors('#f00', '#ff0', '#fff', 'pressed');

    this.TerranMien = new Mien('terran');
    this.TerranMien.setColors('#04a', '#500', '#fff', 'normal');
    this.TerranMien.setColors('#0af', '#79f', '#000', 'hovered');
    this.TerranMien.setColors('#006', '#fff', '#fff', 'pressed');

    this.RockyMien = new Mien('rocky');
    this.RockyMien.setColors('#666', '#999', '#fff', 'normal');
    this.RockyMien.setColors('#999', '#fff', '#000', 'hovered');
    this.RockyMien.setColors('#222', '#fff', '#fff', 'pressed');

    this.TundraMien = new Mien('tundra');
    this.TundraMien.setColors('#75f', '#fff', '#fff', 'normal');
    this.TundraMien.setColors('#fff', '#00f', '#000', 'hovered');
    this.TundraMien.setColors('#358', '#ff0', '#fff', 'pressed');

    this.GasMien = new Mien('gas');
    this.GasMien.setColors('#090', '#0c0', '#fff', 'normal');
    this.GasMien.setColors('#3f3', '#070', '#000', 'hovered');
    this.GasMien.setColors('#030', '#0f0', '#fff', 'pressed');
  }
  constructor(starSystem) {
    this.starSystem = starSystem;
    this.gameObject = this.#makeGameObjectFor(starSystem);
  }
  animate() {
    let minAngle = 0; let maxAngle = 360;
    let num = 20;
    let minStart = 40;
    let maxStart = 40;
    let minLength = 4;
    let maxLength = 8;
    let minDur = 0.1;
    let maxDur = 0.3;
    let color = '#fff';
    this.#animateCorona(num, minAngle, maxAngle, minStart, maxStart, minLength, maxLength, color, minDur, maxDur);
    num = 10;
    minStart = 44;
    maxStart = 47;
    minLength = 2;
    maxLength = 5;
    minDur = 0.2;
    maxDur = 0.4;
    color = '#ff0';
    this.#animateCorona(num, minAngle, maxAngle, minStart, maxStart, minLength, maxLength, color, minDur, maxDur);
    num = 5;
    minStart = 45;
    maxStart = 50;
    minLength = 2;
    maxLength = 12;
    minDur = 0.2;
    maxDur = 0.3;
    color = '#f90';
    this.#animateCorona(num, minAngle, maxAngle, minStart, maxStart, minLength, maxLength, color, minDur, maxDur);
  }
  #animateCorona(num, minAngle, maxAngle, minStart, maxStart, minLength, maxLength, color, minDur, maxDur) {
    for (let i = 0; i < num; i++) {
      let ray = Rnd.ray(this.gameObject.worldPosition, minAngle, maxAngle, minStart, maxStart, minLength, maxLength, minDur, maxDur)
      let lineEffect = new LineEffect(ray.p0, ray.p1, color, 2, Rnd.float(minDur, maxDur));
      Effects.addBackground(lineEffect);
    }
  }
  showInfoPanel() {
    let infoPanelConstraint = { width: 200, height: 50 };

    let infoPanel = new GUIPanel(undefined, 'horizontal', infoPanelConstraint);
    infoPanel.anchor = this.gameObject;
    this.infoPanel = infoPanel;
    GUIElement.addText(infoPanel, `Name: ${this.starSystem.name} zones:4 population:7`);//TODO: Msg text
    for (let planet of this.starSystem.planets) {
      GUIElement.addText(infoPanel, `Name: ${planet.name}`);      //TODO: Msg text
    }


  }
  hideInfoPanel() {
    GUI.removePanel(this.infoPanel);
    this.infoPanel = undefined;
  }
  getInfoPanelForStar(starSystem) {

  }
  getInfoPanelForPlanet(planet) {

  }
  #makeGameObjectFor(star) {
    let radius = 40;
    let obj = new GameObject(star.name, true);
    let starPart = new Part('Sol-0', Polygon.regular(21, radius, StarInterface.StarMien));
    starPart.addTo(obj, { x: 0, y: 0 });
    for (let i = 0; i < star.planets.length; i++) {
      let planet = new Part(star.name + '-' + i, Polygon.regular(12, 20, star.planets[i].mien));
      planet.addTo(starPart, { x: 250 + (i * 150), y: 0 });
    }

    let button = new Button('button-star-' + star.name, true,
      (data) => {
        let systemName = data.value.split('-')[2];//skip button and star...
        let starSystem = GameState.starSystems.get(systemName);
        if (data.toggled === true) {
          starSystem.interface.showInfoPanel();
        } else if (data.toggled === false) {
          starSystem.interface.hideInfoPanel();
        } else {
          throw new Error('toggle expected.');
        }
      }
    );
    starPart.button = button;
    button.gameObjectPart = starPart;
    obj.finalize();
    Game.add(obj, { x: 0, y: 0 }, 0);

    return obj;
  }
}
/*
When handling events, I receive data that tells the the owner is a GameObjectPart.
Great.. this gameObject belongs to a star, I want to toggle its panel
How do I find the starSystem? Given the gameObject.  
 
VALUE naming convention 'button-star-[NAMEOFSTAR]
The GAMESTATE must keep a map of Star Systems and game related stuff.

*/