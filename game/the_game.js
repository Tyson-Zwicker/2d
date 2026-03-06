import Main from '../engine/main.js';
import Button from '../engine/button.js';
import Events from '../engine/events.js';
import Game from '../engine/game.js';
import GameObject from '../engine/gameobject.js';
import GUI from '../engine/gui.js';
import GUIElement from '../engine/guielement.js'
import GUIPanel from '../engine/guipanel.js';
import Part from '../engine/part.js';
import Polygon from '../engine/polygon.js';
import Mien from '../engine/mien.js';

import StarSystem from '../rules/starsystem.js';


const starterStar = StarSystem.Starter();
let infoPanelConstraint = {
  min: { width: 50, height: 50 }, max: { width: 250, height: 100 }
} 
let planetInfoPanel = new GUIPanel(undefined, 'horizontal', infoPanelConstraint);
let planetInfoElement = GUIElement.addText (planetInfoPanel,'zones:4 population:7');
planetInfoPanel.anchor = starterStar.gameObject;

Main.creatorsFunction = () => {
  starterStar.interface.animate();
}
Main.run(100);

