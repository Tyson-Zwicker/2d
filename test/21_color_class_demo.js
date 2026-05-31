import { Main } from '../dist/main.js';
import { View } from '../dist/view.js';
import { Effects } from '../dist/effects.js';
import { RadialEffect } from '../dist/radial-effect.js';
import { LineEffect } from '../dist/line-effect.js';
import { Color } from '../dist/color.js';

// Demonstrate Color class usage with effect classes

// Create colors using different methods
const redFromRGB = Color.fromRGB(255, 0, 0);
const greenFromFloat = Color.fromRGBFloat(0.0, 1.0, 0.0);
const blueFromHex = Color.fromHex('#00f');
const cyanFromHex6 = Color.fromHex('#00ffff');
const magentaWithAlpha = Color.fromHex('#f0fa');  // 4-digit hex with alpha

// For direct canvas rendering (non-effects)
const directRenderColor = redFromRGB.toRGB();      // "rgb(255, 0, 0)"
const directRenderAlpha = magentaWithAlpha.toRGBA(); // "rgba(255, 0, 255, 0.667)"

// For effect classes (IMPORTANT: use toEffectColor() or toHexShort())
const effectColorRed = redFromRGB.toEffectColor();     // "#f00" (3-digit)
const effectColorGreen = greenFromFloat.toEffectColor(); // "#0f0" (3-digit)
const effectColorBlue = blueFromHex.toEffectColor();   // "#00f" (3-digit)

// WARNING: Don't use toHex() with effects (creates 7-char format)
// const badEffectColor = cyanFromHex6.toHex(); // "#00ffff" - will become "#00ffffX" with appended opacity

Main.creatorsFunction = () => {
  // Generate effects using the Color class
  const centerPoint = { x: 0, y: 0 };
  
  // Red circle using Color class
  Effects.addForeground(
    new RadialEffect(centerPoint, 50, 100, effectColorRed, 2, 1.5)
  );
  
  // Green circle offset
  Effects.addForeground(
    new RadialEffect({ x: 200, y: 0 }, 50, 100, effectColorGreen, 2, 1.5)
  );
  
  // Blue circle offset
  Effects.addForeground(
    new RadialEffect({ x: -200, y: 0 }, 50, 100, effectColorBlue, 2, 1.5)
  );
  
  // Line between points using Color class
  const yellowColor = Color.fromRGB(255, 255, 0).toEffectColor();
  Effects.addForeground(
    new LineEffect({ x: -300, y: 0 }, { x: 300, y: 0 }, yellowColor, 3, 0.05)
  );
  
  // Display color information
  const gfx = View.context;
  gfx.fillStyle = '#ffffff';
  gfx.font = 'bold 20px monospace';
  gfx.fillText('Color Class Demo', 20, 35);
  
  gfx.font = '14px monospace';
  gfx.fillStyle = '#aaaaaa';
  let y = 65;
  gfx.fillText('Color creation methods:', 20, y);
  y += 20;
  gfx.fillText('- Color.fromRGB(255, 0, 0)', 40, y);
  y += 20;
  gfx.fillText('- Color.fromRGBFloat(0.0, 1.0, 0.0)', 40, y);
  y += 20;
  gfx.fillText('- Color.fromHex("#00f")', 40, y);
  y += 30;
  gfx.fillText('Use .toEffectColor() for effects', 20, y);
  y += 20;
  gfx.fillStyle = '#ff6666';
  gfx.fillText('Do NOT use .toHex() with effects!', 20, y);
};

Main.run(60);
