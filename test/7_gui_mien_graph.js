import { Main } from '../dist/main.js';
import { GUIPanel } from '../dist/gui.js';
import { Mien } from '../dist/mien.js';

// ============================================================================
// Panel 1: Per-Panel Mien Override (Red Mien for entire panel)
// ============================================================================
let redMien = Mien.Red;
let panel1 = new GUIPanel({ x: 10, y: 10 }, 'vertical', { width: 200, height: 50 }, false, true, redMien);
panel1.addText(['Per-Panel', 'Mien', '(Red)'], 'center');
panel1.addText(['All elements', 'inherit', 'red styling'], 'left');
panel1.addButton(['Button 1'], 'center', 'btn1', false, (data) => console.log('Red button clicked'));
panel1.addButton(['Button 2'], 'center', 'btn2', false, (data) => console.log('Red button clicked'));

// ============================================================================
// Panel 2: Per-Element Mien Override (mixed colors)
// ============================================================================
let panel2 = new GUIPanel({ x: 220, y: 10 }, 'vertical', { width: 200, height: 50 }, false, true);
panel2.addText(['Per-Element', 'Mien', 'Mixed'], 'center');
panel2.addText(['Default green'], 'left');  // Uses GUI.mien (Green)
panel2.addText(['This is Red'], 'left', Mien.Red);  // Override to Red
panel2.addButton(['Blue Button'], 'center', 'btn3', false, undefined, Mien.Blue);  // Override to Blue
panel2.addButton(['Yellow Button'], 'center', 'btn4', false, undefined, Mien.Yellow);  // Override to Yellow
panel2.addText(['Back to default'], 'left');  // Back to GUI.mien

// ============================================================================
// Panel 3: Bar Graph Elements - Various Values
// ============================================================================
let panel3 = new GUIPanel({ x: 430, y: 10 }, 'vertical', { width: 180, height: 50 }, false, true);
panel3.addText(['Bar Graphs', 'Default Mien'], 'center');
panel3.addText(['20%'], 'left');
panel3.addGraph(0.2);
panel3.addText(['50%'], 'left');
panel3.addGraph(0.5);
panel3.addText(['75%'], 'left');
panel3.addGraph(0.75);
panel3.addText(['100%'], 'left');
panel3.addGraph(1.0);
panel3.addText(['0%'], 'left');
panel3.addGraph(0.0);

// ============================================================================
// Panel 4: Graphs with Custom Panel Mien
// ============================================================================
let cyanMien = Mien.Cyan;
let panel4 = new GUIPanel({ x: 620, y: 10 }, 'vertical', { width: 180, height: 30 }, false, true, cyanMien);
panel4.addText(['Graphs with', 'Cyan Mien'], 'center');
panel4.addText(['CPU: 35%'], 'left');
panel4.addGraph(0.35);
panel4.addText(['Memory: 62%'], 'left');
panel4.addGraph(0.62);
panel4.addText(['Disk: 88%'], 'left');
panel4.addGraph(0.88);
panel4.addText(['Network: 45%'], 'left');
panel4.addGraph(0.45);

// ============================================================================
// Panel 5: Mixed Graphs & Text with Per-Element Mien
// ============================================================================
let panel5 = new GUIPanel({ x: 810, y: 10 }, 'vertical', { width: 200, height: 30 }, false, true);
panel5.addText(['Mixed Elements', 'With Custom Mien'], 'center');
panel5.addText(['Status Report'], 'center', Mien.Yellow);
panel5.addText(['Health:'], 'left');
panel5.addGraph(0.95, Mien.Green);  // Green graph
panel5.addText(['Damage:'], 'left');
panel5.addGraph(0.15, Mien.Red);  // Red graph
panel5.addText(['Power:'], 'left');
panel5.addGraph(0.72, Mien.Blue);  // Blue graph

// ============================================================================
// Panel 6: Horizontal Layout with Graphs
// ============================================================================
let panel6 = new GUIPanel({ x: 1020, y: 10 }, 'horizontal', { width: 30, height: 600 },false, true);
panel6.addText(['V1'], 'center');
panel6.addGraph(0.4, Mien.Magenta);
panel6.addText(['V2'], 'center');
panel6.addGraph(0.6, Mien.Cyan);
panel6.addText(['V3'], 'center');
panel6.addGraph(0.8, Mien.Yellow);

// ============================================================================
// Panel 7: Element Mien Overriding Panel Mien
// ============================================================================
let panel7 = new GUIPanel({ x: 10, y: 270 }, 'vertical', { width: 200, height: 280 }, false, true, Mien.Gray);
panel7.addText(['Panel: Gray', 'Elements: Mixed'], 'center');
panel7.addText(['Gray (inherits panel)'], 'left');  // Inherits Gray from panel
panel7.addGraph(0.4, Mien.Red);  // Red graph overrides panel Mien
panel7.addText(['Red text'], 'left', Mien.Red);  // Red text overrides panel Mien
panel7.addGraph(0.7, Mien.Green);  // Green graph overrides panel Mien
panel7.addButton(['Blue Button'], 'center', 'btn5', false, undefined, Mien.Blue);  // Blue button
panel7.addText(['Back to gray'], 'left');  // Inherits Gray from panel again

Main.creatorsFunction = () => {
  // Can add event handlers here if needed
};

Main.run(60);
