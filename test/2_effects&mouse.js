
import { View } from '../dist/view.js';
import { Main } from '../dist/main.js';
import { Sim } from '../dist/sim.js';
import { SimObject, Part } from '../dist/simobject.js';
import { Polygon } from '../dist/polygon.js';
import { Mien } from '../dist/mien.js';
import { CircleEffect } from '../dist/circle-effect.js';
import { ParticleEffect } from '../dist/particle-effect.js';
import { RadialEffect } from '../dist/radial-effect.js';
import { LineEffect } from '../dist/line-effect.js';
import { Effects } from '../dist/effects.js';

let lastSecond = 0;
let maxSimDistance = 350;

let redPoly = Polygon.regular(4, 50, Mien.Red);
let greenPoly = Polygon.regular(4, 50, Mien.Green);
let redPart = new Part('redpart', redPoly);
let greenPart = new Part('greenPart', greenPoly);

let redObj = new SimObject('red', 'always');
let greenObj = new SimObject('green', 'always');
redPart.addTo(redObj, { x: 0, y: 0 }, 0);
greenPart.addTo(greenObj, { x: 0, y: 0 }, 0);
redObj.velocity = {x:5*Math.random(),y:5*Math.random()};
greenObj.velocity = {x:-15*Math.random(),y:-15*Math.random()};
redObj.finalize();
greenObj.finalize();
Sim.add(redObj, { x: 50, y: 50 }, 0);
Sim.add(greenObj, { x: -50, y: -50 }, 0);
Main.creatorsFunction = () => {

  //particle generator
  let minVel = 25;
  let maxVel = 60;
  let minDur = 1;
  let maxDur = 4;
  let angleSpan = 90;
  let groupSize = 20;

  //radial effect
  let initialRadius = 5;
  let expansionRate = 20;
  let ringColor = '#09f';
  let thickness = 3;
  let durationInSeconds = 2;
  let startAngle = 0;
  let endAngle = 360;

  //circle effects
  let initialRadiusC = 5;
  let expansionRateC = 300;
  let durationInSecondsC = .3;
  let startAngleC = 0;
  let endAngleC = 360;
  
  //Put a particle generator in the middle of the screen.

  Effects.addBackground(ParticleEffect.generateGroup({ x: 0, y: -100 }, 90, angleSpan, minVel, maxVel, 2, '#f00', groupSize, minDur, maxDur));
  Effects.addBackground(ParticleEffect.generateGroup({ x: 100, y: 0 }, 180, angleSpan, minVel, maxVel, 2, '#ff0', groupSize, minDur, maxDur));
  Effects.addBackground(ParticleEffect.generateGroup({ x: -100, y: 0 }, 0, angleSpan, minVel, maxVel, 2, '#0f0', groupSize, minDur, maxDur));
  Effects.addBackground(ParticleEffect.generateGroup({ x: 0, y: 100 }, 270, angleSpan, minVel, maxVel, 2, '#00f', groupSize, minDur, maxDur));

  //When the mouse is clicked, generate a radial effect.

  // if (View.mouse.buttonDown === true) {
  let x = View.mouse.x;
  let y = View.mouse.y;
  Effects.addForeground(new RadialEffect(View.screenToWorld(x, y), initialRadius, expansionRate, ringColor, thickness, durationInSeconds, startAngle, endAngle));
  // }



  //Once per second, genate circleeffects in the screen corners.
  let now = Date.now();
  if (now > lastSecond + 500) {
    lastSecond = now;
    Effects.addBackground(new CircleEffect({ x: -maxSimDistance, y: -maxSimDistance }, initialRadiusC, expansionRateC, '#f7f', durationInSecondsC, startAngleC, endAngleC));
    Effects.addBackground(new CircleEffect({ x: -maxSimDistance, y: maxSimDistance }, initialRadiusC, expansionRateC, '#7f7', durationInSecondsC, startAngleC, endAngleC));
    Effects.addBackground(new CircleEffect({ x: maxSimDistance, y: -maxSimDistance }, initialRadiusC, expansionRateC, '#77f', durationInSecondsC, startAngleC, endAngleC));
    Effects.addBackground(new CircleEffect({ x: maxSimDistance, y: maxSimDistance }, initialRadiusC, expansionRateC, '#7ff', durationInSecondsC, startAngleC, endAngleC));

  }
  //Two polygons should bounce around the screen and interchange line effects between them every so often..
  if (Math.abs (redObj.worldPosition.x)>maxSimDistance){    
    redObj.worldPosition.x -= redObj.velocity.x;
    redObj.velocity.x *=-1;
  }    
  if (Math.abs (redObj.worldPosition.y)>maxSimDistance){
    redObj.worldPosition.y -= redObj.velocity.y;
    redObj.velocity.y *=-1;
  }    
  if (Math.abs (greenObj.worldPosition.x)>maxSimDistance){
    greenObj.worldPosition.x -= greenObj.velocity.x;
    greenObj.velocity.x *=-1;
  }    
  if (Math.abs (greenObj.worldPosition.y)>maxSimDistance){
    greenObj.worldPosition.y -= greenObj.velocity.y;
    greenObj.velocity.y *=-1;
  }    
  if (Math.random()<0.1){
    let r = redObj.worldPosition;
    let g = greenObj.worldPosition;
    Effects.addForeground (new LineEffect (r,g,'#fff',2,0.5));
  }
}

Main.run(60);