import { Main } from '../dist/main.js';
import { Sim } from '../dist/sim.js';
import { SimObject, Part } from '../dist/simobject.js';
import { Polygon } from '../dist/polygon.js';
import { Mien } from '../dist/mien.js';
import { View, Camera } from '../dist/view.js';
import { Vec } from '../dist/geometry.js';

// Configuration
const ELASTICITY = 0.8; // 0=perfectly inelastic, 1=perfectly elastic
const ARENA_SIZE = 600; // Confined space size
const NUM_OBJECTS = 15;
const MAX_VELOCITY = 150;

// Create confined arena walls
Camera.x = 0;
Camera.y = 0;
Camera.zoom = 1.5;

// Create bouncing objects with different masses
const objects = [];
const colors = [
  Mien.Red, Mien.Orange, Mien.Yellow, Mien.Green, 
  Mien.Cyan, Mien.Blue, Mien.Magenta, Mien.White
];

for (let i = 0; i < NUM_OBJECTS; i++) {
  const mass = 0.5 + Math.random() * 3; // Mass between 0.5 and 3.5
  const radius = 10 + mass * 8; // Larger mass = larger visual size
  const obj = new SimObject(`ball${i}`, 'always', mass);
  
  const color = colors[i % colors.length];
  new Part(`body${i}`, Polygon.regular(8, radius, color)).addTo(obj, { x: 0, y: 0 }, 0);
  obj.finalize();
  obj.collides = true;
  obj.radius = radius;
  
  // Random position within arena
  const x = (Math.random() - 0.5) * ARENA_SIZE * 0.8;
  const y = (Math.random() - 0.5) * ARENA_SIZE * 0.8;
  
  // Random velocity
  const vx = (Math.random() - 0.5) * MAX_VELOCITY;
  const vy = (Math.random() - 0.5) * MAX_VELOCITY;
  
  Sim.add(obj, { x, y }, 0);
  obj.velocity.x = vx;
  obj.velocity.y = vy;
  
  objects.push(obj);
}

// Main update function
Main.creatorsFunction = () => {
  // Draw arena boundary
  const halfSize = ARENA_SIZE / 2;
  const gfx = View.context;
  
  // Convert world coords to screen coords
  const topLeft = View.worldToScreen(-halfSize, -halfSize);
  const bottomRight = View.worldToScreen(halfSize, halfSize);
  const width = bottomRight.x - topLeft.x;
  const height = bottomRight.y - topLeft.y;
  
  gfx.strokeStyle = '#888';
  gfx.lineWidth = 3;
  gfx.beginPath();
  gfx.rect(topLeft.x, topLeft.y, width, height);
  gfx.stroke();
  gfx.closePath();
  
  // Handle wall collisions
  for (const obj of objects) {
    const pos = obj.worldPosition;
    const vel = obj.velocity;
    const r = obj.radius;
    
    // Bounce off walls
    if (pos.x - r < -halfSize) {
      obj.worldPosition.x = -halfSize + r;
      obj.velocity.x = Math.abs(vel.x) * ELASTICITY;
    } else if (pos.x + r > halfSize) {
      obj.worldPosition.x = halfSize - r;
      obj.velocity.x = -Math.abs(vel.x) * ELASTICITY;
    }
    
    if (pos.y - r < -halfSize) {
      obj.worldPosition.y = -halfSize + r;
      obj.velocity.y = Math.abs(vel.y) * ELASTICITY;
    } else if (pos.y + r > halfSize) {
      obj.worldPosition.y = halfSize - r;
      obj.velocity.y = -Math.abs(vel.y) * ELASTICITY;
    }
  }
  
  // Handle object-to-object collisions
  for (let i = 0; i < objects.length; i++) {
    for (let j = i + 1; j < objects.length; j++) {
      const objA = objects[i];
      const objB = objects[j];
      
      // Check if objects are colliding
      const dx = objB.worldPosition.x - objA.worldPosition.x;
      const dy = objB.worldPosition.y - objA.worldPosition.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const minDist = objA.radius + objB.radius;
      
      if (distance < minDist) {
        // Apply collision response
        const response = Vec.collisionResponse(objA, objB, ELASTICITY);
        
        // Update velocities
        objA.velocity.x = response.velocityA.x;
        objA.velocity.y = response.velocityA.y;
        objB.velocity.x = response.velocityB.x;
        objB.velocity.y = response.velocityB.y;
        
        // Apply position corrections to separate objects
        objA.worldPosition.x += response.correctionA.x;
        objA.worldPosition.y += response.correctionA.y;
        objB.worldPosition.x += response.correctionB.x;
        objB.worldPosition.y += response.correctionB.y;
      }
    }
  }
  
  // Display info
  gfx.fillStyle = '#fff';
  gfx.font = '14px monospace';
  gfx.fillText(`Objects: ${NUM_OBJECTS}`, 10, 20);
  gfx.fillText(`Elasticity: ${ELASTICITY}`, 10, 40);
  gfx.fillText(`Arena: ${ARENA_SIZE}x${ARENA_SIZE}`, 10, 60);
  
  // Calculate total momentum and kinetic energy for display
  let totalMomentumX = 0;
  let totalMomentumY = 0;
  let totalKE = 0;
  for (const obj of objects) {
    totalMomentumX += obj.velocity.x * obj.mass;
    totalMomentumY += obj.velocity.y * obj.mass;
    const speed = Math.sqrt(obj.velocity.x ** 2 + obj.velocity.y ** 2);
    totalKE += 0.5 * obj.mass * speed * speed;
  }
  const totalMomentum = Math.sqrt(totalMomentumX ** 2 + totalMomentumY ** 2);
  
  gfx.fillText(`Momentum: ${totalMomentum.toFixed(1)}`, 10, 80);
  gfx.fillText(`Kinetic Energy: ${totalKE.toFixed(1)}`, 10, 100);
};

Main.run(60);
