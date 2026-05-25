import { Main } from '../dist/main.js';
import { Camera, View } from '../dist/view.js';
import { GUIPanel } from '../dist/gui.js';
import { Ecosystem } from '../dist/ecosystem.js';

Camera.x = 0;
Camera.y = 0;
Camera.zoom = 0.42;

let activePreset = 'balanced';
const ecosystem = new Ecosystem(activePreset, {}, 'meadow');

const controlPanel = new GUIPanel({ x: 18, y: 18 }, 'vertical', { width: 250, height: 38 }, false);
controlPanel.addText([
  'Grass / Rabbit / Fox',
  'Predators hunt, rabbits graze, grass regrows.',
  'Use presets to push the ecosystem toward stability or collapse.'
], 'left');

const pauseButton = controlPanel.addButton(['Pause Simulation'], 'center', 'pause', true, (data) => {
  Main.setPaused(Boolean(data.toggled));
});
pauseButton.name = 'ecosystem-pause';

const resetButton = controlPanel.addButton(['Reset Current Preset'], 'center', 'reset', false, () => {
  ecosystem.reset(activePreset);
  syncPauseGraph();
});
resetButton.name = 'ecosystem-reset';

const balancedButton = controlPanel.addButton(['Preset: Balanced'], 'center', 'balanced', false, () => {
  activePreset = 'balanced';
  ecosystem.reset(activePreset);
});
balancedButton.name = 'preset-balanced';

const bloomButton = controlPanel.addButton(['Preset: Bloom'], 'center', 'bloom', false, () => {
  activePreset = 'bloom';
  ecosystem.reset(activePreset);
});
bloomButton.name = 'preset-bloom';

const leanButton = controlPanel.addButton(['Preset: Lean'], 'center', 'lean', false, () => {
  activePreset = 'lean';
  ecosystem.reset(activePreset);
});
leanButton.name = 'preset-lean';

const grassGraph = controlPanel.addGraph(0);
grassGraph.name = 'grass-graph';

const rabbitGraph = controlPanel.addGraph(0);
rabbitGraph.name = 'rabbit-graph';

const foxGraph = controlPanel.addGraph(0);
foxGraph.name = 'fox-graph';

const rabbitEnergyGraph = controlPanel.addGraph(0);
rabbitEnergyGraph.name = 'rabbit-energy-graph';

const foxEnergyGraph = controlPanel.addGraph(0);
foxEnergyGraph.name = 'fox-energy-graph';

const pauseGraph = controlPanel.addGraph(1);
pauseGraph.name = 'pause-graph';

Main.creatorsFunction = () => {
  ecosystem.update(Main.delta);
  const stats = ecosystem.getStats();

  syncPauseGraph();
  grassGraph.graphValue = stats.grassAvailable / ecosystem.tuning.maxGrass;
  rabbitGraph.graphValue = stats.rabbits / ecosystem.tuning.maxRabbits;
  foxGraph.graphValue = stats.foxes / ecosystem.tuning.maxFoxes;
  rabbitEnergyGraph.graphValue = stats.averageRabbitEnergy / ecosystem.tuning.rabbitMaxEnergy;
  foxEnergyGraph.graphValue = stats.averageFoxEnergy / ecosystem.tuning.foxMaxEnergy;

  drawArena(ecosystem.tuning.worldRadius);
  drawHud(stats);
};

Main.run(60);

function syncPauseGraph() {
  pauseGraph.graphValue = Main.pauseSim ? 0 : 1;
}

function drawArena(worldRadius) {
  const center = View.worldToScreen({ x: 0, y: 0 });
  const radius = worldRadius * Camera.zoom;
  const gfx = View.context;

  gfx.save();
  gfx.strokeStyle = '#355b35';
  gfx.lineWidth = 2;
  gfx.beginPath();
  gfx.arc(center.x, center.y, radius, 0, Math.PI * 2);
  gfx.stroke();
  gfx.restore();
}

function drawHud(stats) {
  const gfx = View.context;
  const left = View.canvas.width - 270;
  const top = 18;

  gfx.save();
  gfx.fillStyle = 'rgba(8, 18, 10, 0.82)';
  gfx.fillRect(left - 12, top - 10, 248, 218);

  gfx.fillStyle = '#d9f7d2';
  gfx.font = 'bold 16px monospace';
  gfx.fillText('Ecosystem', left, top + 8);

  gfx.font = '13px monospace';
  gfx.fillStyle = '#9ee09e';
  gfx.fillText(`Preset: ${activePreset}`, left, top + 34);
  gfx.fillText(`Grass ready: ${stats.grassAvailable} / ${ecosystem.tuning.maxGrass}`, left, top + 56);
  gfx.fillText(`Rabbits: ${stats.rabbits} / ${ecosystem.tuning.maxRabbits}`, left, top + 78);
  gfx.fillText(`Foxes: ${stats.foxes} / ${ecosystem.tuning.maxFoxes}`, left, top + 100);

  gfx.fillStyle = '#ffe39e';
  gfx.fillText(`Rabbit energy: ${stats.averageRabbitEnergy.toFixed(1)}`, left, top + 126);
  gfx.fillText(`Fox energy: ${stats.averageFoxEnergy.toFixed(1)}`, left, top + 148);

  gfx.fillStyle = '#f0c4a8';
  gfx.fillText(`Births ${stats.births}   Deaths ${stats.deaths}`, left, top + 170);
  gfx.fillText(`Grazes ${stats.grazes}   Hunts ${stats.hunts}`, left, top + 192);

  gfx.fillStyle = '#9cb0a0';
  gfx.fillText(`Elapsed ${stats.elapsedSeconds.toFixed(1)}s`, left, top + 214);
  gfx.restore();
}