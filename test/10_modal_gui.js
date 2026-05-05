import { Main } from '../dist/main.js';
import { GUI, GUIPanel } from '../dist/gui.js';
import { Mien } from '../dist/mien.js';
import { Sim } from '../dist/sim.js';
import { SimObject, Part } from '../dist/simobject.js';
import { Polygon } from '../dist/polygon.js';

const bounds = 420;
let pulseValue = 0;

const mover = makeMover('modal-demo-mover', Mien.Magenta, { x: -260, y: -30 }, { x: 110, y: 65 });

const controlPanel = new GUIPanel({ x: 20, y: 20 }, 'vertical', { width: 240, height: 60 }, false);
controlPanel.addText(
  ['Modal Demo', 'Open Modal to pause sim.', 'While modal is open, pulse and drag should do nothing.'],
  'left'
);

const pauseGraph = controlPanel.addGraph(1);
pauseGraph.name = 'pause-state-graph';

const motionGraph = controlPanel.addGraph(0.2);
motionGraph.name = 'motion-graph';

const pulseGraph = controlPanel.addGraph(0);
pulseGraph.name = 'pulse-graph';

const resultGraph = controlPanel.addGraph(0.5);
resultGraph.name = 'result-graph';

const pauseButton = controlPanel.addButton(['Pause Simulation'], 'center', 'pause-sim', true, (data) => {
  const paused = Main.setPaused(Boolean(data.toggled));
  pauseGraph.graphValue = paused ? 0 : 1;
  console.log(paused ? 'Simulation paused manually.' : 'Simulation resumed manually.', {
    frame: Main.currentFrame,
    position: { ...mover.worldPosition }
  });
});
pauseButton.name = 'pause-button';

const pulseButton = controlPanel.addButton(['Pulse Background GUI'], 'center', 'pulse-gui', false, () => {
  pulseValue += 0.25;
  if (pulseValue > 1) pulseValue = 0;
  pulseGraph.graphValue = pulseValue;
  console.log('Background GUI pulse registered.', {
    paused: Main.pauseSim,
    modalActive: GUI.hasModal(),
    pulseValue,
    frame: Main.currentFrame
  });
});
pulseButton.name = 'pulse-button';

const modalButton = controlPanel.addButton(['Open Modal'], 'center', 'open-modal', false, () => {
  openModal();
});
modalButton.name = 'open-modal-button';

Main.creatorsFunction = () => {
  keepInBounds(mover);
  motionGraph.graphValue = (mover.worldPosition.x + bounds) / (bounds * 2);
};

Main.run(60);

function openModal() {
//Make the model panel...
  const modalPanel = new GUIPanel({ x: 320, y: 120 }, 'vertical', { width: 260, height: 60 }, false, false);
  modalPanel.addText(['Modal Active', 'Simulation is paused.', 'Choose a value to close.'], 'left');

  //What makes these buttons special "modal return buttons" is that they  have been saddled up 
  // will a callback to GUI.. resolveModal, which will clean up the modal situation and allow normaly to resume.

  const resumeButton = modalPanel.addButton(['Return Resume'], 'center', 'resume', false, () => {
    GUI.resolveModal('apples');
  });
  resumeButton.name = 'modal-resume-button';

  const holdButton = modalPanel.addButton(['Return Hold'], 'center', 'hold', false, () => {
    GUI.resolveModal('banasas');//<--                    This value
  });
  holdButton.name = 'modal-hold-button';

  //The call back here (with the GUI.showModal() method) will have the value assign 
  ///above when one of them is pressed..
  GUI.showModal(modalPanel, (value) => {
    pauseGraph.graphValue = Main.pauseSim ? 0 : 1;
    resultGraph.graphValue = value === 'apples' ? 1 : 0.2; //<--is the value used to compare here..
    console.log('Modal resolved.', {
      value,
      pausedAfterResolve: Main.pauseSim,
      frame: Main.currentFrame,
      position: { ...mover.worldPosition }
    });
  });
  //And this run code that kept running like modal was never shown..
  pauseGraph.graphValue = 0;
  console.log('Modal opened.', {
    pausedBeforeModal: pauseButton.button?.toggled ?? false,
    frame: Main.currentFrame,
    position: { ...mover.worldPosition }
  });
}

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