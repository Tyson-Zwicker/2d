import { Main } from '../dist/main.js';
import { Sim } from '../dist/sim.js';
import { SimObject, Part } from '../dist/simobject.js';
import { Polygon } from '../dist/polygon.js';
import { Mien } from '../dist/mien.js';
import { View, Camera } from '../dist/view.js';
import { Color } from '../dist/color.js';
import { Effects } from '../dist/effects.js';
import { RadialEffect } from '../dist/radial-effect.js';

// Configuration
const ELASTICITY = 0.0; // Perfectly inelastic for merging
const ARENA_SIZE = 5000;
const NUM_OBJECTS_PER_TYPE = 700;
const OBJECT_RADIUS = 5; // All objects have same radius
const MAX_VELOCITY = 100;
const GRAVITY_CONSTANT = 1200; // Gravitational attraction strength

// 7 types with different initial masses (same radius = different densities)
const TYPES = [
  { color: new Color(255, 0, 0), mass: 1 },      // Red - density 1
  { color: new Color(255, 127, 0), mass: 1 },    // Orange - density 1
  { color: new Color(255, 255, 0), mass: 1 },    // Yellow - density 1
  { color: new Color(0, 255, 0), mass: 1 },      // Green - density 1
  { color: new Color(0, 127, 255), mass: 1 },    // Cyan - density 1
  { color: new Color(0, 0, 255), mass: 1 },      // Blue - density 1
  { color: new Color(127, 0, 255), mass: 1 }     // Purple - density 1
];

Camera.x = 0;
Camera.y = 0;
Camera.zoom = 1.5;

let objects = [];
let nextId = 0;

// Create initial objects
for (let typeIdx = 0; typeIdx < TYPES.length; typeIdx++) {
  const type = TYPES[typeIdx];
  for (let i = 0; i < NUM_OBJECTS_PER_TYPE; i++) {
    createObject(type.mass, type.color);
  }
}

function createObject(mass, color) {
  const id = nextId++;
  const obj = new SimObject(`ball${id}`, 'always', mass);
  
  // Create visual representation
  new Part(`body${id}`, Polygon.regular(8, OBJECT_RADIUS, color.toMien())).addTo(obj, { x: 0, y: 0 }, 0);
  obj.finalize();
  obj.collides = true;
  obj.radius = OBJECT_RADIUS;
  obj.mergedMass = mass; // Track actual mass for color calculation
  obj.baseColor = color;
  
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
  return obj;
}

function getColorForDensity(density) {
  // Map density to color spectrum
  // Density 1 = original colors, higher density = shift towards white/bright
  const baseHue = (density - 1) % 7; // Cycle through types
  const intensity = Math.min(255, 100 + density * 20); // Brighter as density increases
  
  // Create color based on density
  const hue = (baseHue / 7) * 360; // 0-360 degrees
  const saturation = Math.max(0.3, 1 - (density - 1) * 0.05); // Less saturated as density increases
  const lightness = Math.min(0.8, 0.5 + (density - 1) * 0.02); // Lighter as density increases
  
  // Convert HSL to RGB
  const c = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = lightness - c / 2;
  
  let r, g, b;
  if (hue < 60) {
    [r, g, b] = [c, x, 0];
  } else if (hue < 120) {
    [r, g, b] = [x, c, 0];
  } else if (hue < 180) {
    [r, g, b] = [0, c, x];
  } else if (hue < 240) {
    [r, g, b] = [0, x, c];
  } else if (hue < 300) {
    [r, g, b] = [x, 0, c];
  } else {
    [r, g, b] = [c, 0, x];
  }
  
  return new Color(
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255)
  );
}

// Track objects to remove and add
let objectsToRemove = new Set();
let objectsToAdd = [];

Main.creatorsFunction = () => {
  const halfSize = ARENA_SIZE / 2;
  const gfx = View.context;
  
  // Apply gravitational attraction between all objects
  for (let i = 0; i < objects.length; i++) {
    const obj1 = objects[i];
    for (let j = i + 1; j < objects.length; j++) {
      const obj2 = objects[j];
      
      // Calculate distance between objects
      const dx = obj2.worldPosition.x - obj1.worldPosition.x;
      const dy = obj2.worldPosition.y - obj1.worldPosition.y;
      const distSq = dx * dx + dy * dy;
      const dist = Math.sqrt(distSq);
      
      // Avoid division by zero and extremely strong forces
      if (dist < OBJECT_RADIUS * 2) continue;
      
      // Calculate gravitational force: F = G * m1 * m2 / r^2
      const force = GRAVITY_CONSTANT * obj1.mass * obj2.mass / distSq;
      
      // Calculate force components
      const fx = force * (dx / dist);
      const fy = force * (dy / dist);
      
      // Apply force to both objects (Newton's third law)
      // F = ma, so a = F/m
      const dt = 1 / 60; // Assuming 60 FPS
      obj1.velocity.x += fx / obj1.mass * dt;
      obj1.velocity.y += fy / obj1.mass * dt;
      obj2.velocity.x -= fx / obj2.mass * dt;
      obj2.velocity.y -= fy / obj2.mass * dt;
    }
  }
  
  // Detect overlapping objects and merge them
  objectsToRemove = new Set();
  objectsToAdd = [];
  const processedPairs = new Set();
  
  // Check all pairs of objects for overlap
  for (let i = 0; i < objects.length; i++) {
    const obj1 = objects[i];
    
    // Skip if already marked for removal
    if (objectsToRemove.has(obj1)) continue;
    
    for (let j = i + 1; j < objects.length; j++) {
      const obj2 = objects[j];
      
      // Skip if already marked for removal
      if (objectsToRemove.has(obj2)) continue;
      
      // Calculate distance between objects
      const dx = obj2.worldPosition.x - obj1.worldPosition.x;
      const dy = obj2.worldPosition.y - obj1.worldPosition.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      // Check if objects are overlapping or touching
      if (dist < obj1.radius + obj2.radius) {
        // Create unique pair key
        const pairKey = [obj1.name, obj2.name].sort().join('|');
        if (processedPairs.has(pairKey)) continue;
        processedPairs.add(pairKey);
        
        // Merge the two objects
        const newMass = obj1.mergedMass + obj2.mergedMass;
        const density = newMass; // Since radius is constant, density = mass
        
        // Calculate merged position (center of mass)
        const totalMass = obj1.mass + obj2.mass;
        const newX = (obj1.worldPosition.x * obj1.mass + obj2.worldPosition.x * obj2.mass) / totalMass;
        const newY = (obj1.worldPosition.y * obj1.mass + obj2.worldPosition.y * obj2.mass) / totalMass;
        
        // Calculate merged velocity (conservation of momentum)
        const newVx = (obj1.velocity.x * obj1.mass + obj2.velocity.x * obj2.mass) / totalMass;
        const newVy = (obj1.velocity.y * obj1.mass + obj2.velocity.y * obj2.mass) / totalMass;
        
        // Get color for new density
        const newColor = getColorForDensity(density);
        
        // Create new merged object (but don't add to Sim yet)
        const id = nextId++;
        const mergedObj = new SimObject(`merged${id}`, 'always', totalMass);
        new Part(`mergedBody${id}`, Polygon.regular(8, OBJECT_RADIUS, newColor.toMien()))
          .addTo(mergedObj, { x: 0, y: 0 }, 0);
        mergedObj.finalize();
        mergedObj.collides = true;
        mergedObj.radius = OBJECT_RADIUS;
        mergedObj.mergedMass = newMass;
        mergedObj.baseColor = newColor;
        
        // Store initial position and velocity
        mergedObj.initialPos = { x: newX, y: newY };
        mergedObj.initialVel = { x: newVx, y: newVy };
        
        // Create radial effect at merge position
        Effects.addForeground(
          new RadialEffect(
            { x: newX, y: newY },
            OBJECT_RADIUS * 0.5,
            OBJECT_RADIUS * 2.5,
            newColor.toEffectColor(), 
            3,
            2
          )
        );
        
        objectsToAdd.push(mergedObj);
        objectsToRemove.add(obj1);
        objectsToRemove.add(obj2);
      }
    }
  }
  
  // First, remove old objects from our tracking array
  for (const obj of objectsToRemove) {
    const idx = objects.indexOf(obj);
    if (idx > -1) {
      objects.splice(idx, 1);
    }
  }
  
  // Then remove from Sim
  for (const obj of objectsToRemove) {
    Sim.remove(obj.name);
  }
  
  // Add new merged objects to tracking array
  for (const obj of objectsToAdd) {
    objects.push(obj);
  }
  
  // Finally, add new merged objects to Sim with their initial positions/velocities
  for (const obj of objectsToAdd) {
    Sim.add(obj, obj.initialPos, 0);
    obj.velocity.x = obj.initialVel.x;
    obj.velocity.y = obj.initialVel.y;
  }
  
  // Display info
  gfx.fillStyle = '#fff';
  gfx.font = '16px monospace';
  gfx.fillText(`Objects: ${objects.length}`, 10, 25);
  gfx.fillText(`Merges this frame: ${processedPairs.size}`, 10, 50);
  
  // Count objects by density ranges
  const densityCounts = {};
  for (const obj of objects) {
    const d = Math.floor(obj.mergedMass);
    densityCounts[d] = (densityCounts[d] || 0) + 1;
  }
  
  let y = 75;
  const sortedDensities = Object.keys(densityCounts).sort((a, b) => a - b);
  for (const density of sortedDensities.slice(0, 10)) { // Show first 10
    gfx.fillText(`Density ${density}: ${densityCounts[density]}`, 10, y);
    y += 25;
  }
};

Main.run(60);
