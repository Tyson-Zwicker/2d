import Main from '../engine/main.js';
import Button from '../engine/button.js';
import Events from '../engine/events.js';
import Game from '../engine/game.js';
import GameObject from '../engine/gameobject.js';
import GUIElement from '../engine/guielement.js'
import GUIPanel from '../engine/guipanel.js';
import Part from '../engine/part.js';
import Polygon from '../engine/polygon.js';
import Mien from '../engine/mien.js';

import StarSystem from '../rules/starsystem.js';


StarSystem.Starter();

Main.creatorsFunction = () => {
  
}
Main.run(100);

