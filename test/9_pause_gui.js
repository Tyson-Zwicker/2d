import { Main } from '../dist/main.js';
import { GUIPanel } from '../dist/gui.js';
import { Mien } from '../dist/mien.js';
import { Sim } from '../dist/sim.js';
import { SimObject, Part } from '../dist/simobject.js';
import { Polygon } from '../dist/polygon.js';

const bounds = 420;
let pulseValue = 0;

const mover = makeMover('pause-demo-mover', Mien.Cyan, { x: -260, y: 0 }, { x: 120, y: 75 });

const controlPanel = new GUIPanel({ x: 20, y: 20 }, 'vertical', { width: 220, height: 60 }, false);
controlPanel.addText(['Pause Demo', 'Toggle pause, then press Pulse.', 'The triangle should freeze while paused.'], 'left');

const pauseGraph = controlPanel.addGraph(1);
pauseGraph.name = 'pause-state-graph';

const motionGraph = controlPanel.addGraph(0.2);
motionGraph.name = 'motion-graph';

const pulseGraph = controlPanel.addGraph(0);
pulseGraph.name = 'pulse-graph';

const pauseButton = controlPanel.addButton(['Pause Simulation'], 'center', 'pause-sim', true, (data) => {
  const paused = Main.setPaused(Boolean(data.toggled));
  pauseGraph.graphValue = paused ? 0 : 1;
  console.log(paused ? 'Simulation paused.' : 'Simulation resumed.', {
    frame: Main.currentFrame,
    position: { ...mover.worldPosition }
  });
});
pauseButton.name = 'pause-button';

const pulseButton = controlPanel.addButton(['Pulse GUI'], 'center', 'pulse-gui', false, () => {
  pulseValue += 0.25;
  if (pulseValue > 1) pulseValue = 0;
  pulseGraph.graphValue = pulseValue;
  console.log('GUI pulse registered.', {
    paused: Main.pauseSim,
    pulseValue,
    frame: Main.currentFrame
  });
});
pulseButton.name = 'pulse-button';

Main.creatorsFunction = () => {
  keepInBounds(mover);
  motionGraph.graphValue = (mover.worldPosition.x + bounds) / (bounds * 2);
};

Main.run(60);

function makeMover(name, mien, startPos, velocity) {
  const obj = new SimObject(name, 'always');
  const body = new Part(name + '-body', Polygon.regular(3, 48, mien));
  body.addTo(obj, { x: 0, y: 0 }, 0);
  obj.velocity = velocity;
  obj.spin = 120;
  obj.finalize();
  Sim.add(obj, startPos, 0);
  return obj;
}

function keepInBounds(obj) {
  if (obj.worldPosition.x > bounds || obj.worldPosition.x < -bounds) {
    obj.velocity.x *= -1;
  }
  if (obj.worldPosition.y > bounds || obj.worldPosition.y < -bounds) {
    obj.velocity.y *= -1;
  }
}