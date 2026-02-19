import Vec from './vec.js';
import GUI from './gui.js';
import GUIElement from './guielement.js';

export default class Button {
  actor = undefined;
  guiElement = undefined;
  clicked = false;
  clickFn = undefined;
  hovered = false;
  pressed = false;
  toggle = false;
  //Must be bound by an actor or Element to do anything..
  //They must bind the actor OR guiElement property.
  constructor(hoveredAppearance, pressedAppearance, clickFn = null, toggle = false, value) {
    if (!Check.obj(hoveredAppearance, Appearance)) throw new Error(`Button.constructor: hoveredAppearance is not an appearance [${hoveredAppearance}]`);
    if (!Check.obj(pressedAppearance, Appearance)) throw new Error(`Button.constructor: pressedAppearance is not an appearance [${pressedAppearance}]`);
    if (typeof toggle !== 'boolean') throw new Error(`Button.constructor: toggle must be boolean [${toggle}]`);
    if (typeof value !== 'string') throw new Error(`button:constructor: value must be a string [${value}]`);
    this.hoveredAppearance = hoveredAppearance;
    this.pressedAppearance = pressedAppearance;
    this.clickFn = clickFn;
    this.toggle = toggle;
    this.value = value;
  }
  checkForMouseOnActor(mouse) {
    let insideBounds = this.actor.polygon.isPointIn(Point.from(mouse));
    return this.#doButton(insideBounds, mouse);//Do this even if NOT in bounds to allow others to de-hover..
  }
  checkForMouseOnGUI(mouse) {
    let insideBounds = GUI.isMouseIn(this.guiElement, Point.from(mouse));
    return this.#doButton(insideBounds, mouse);//Do this even if NOT in bounds to allow others to de-hover..
  }
  #doButton(insideBounds, mouse) {
    let interaction = false;
    if (insideBounds) {
      if (mouse.buttonDown && !this.hovered) {
        //*Must* be checked first.. mouse went down somewhere else, but not here.. doesn't affect this actor..
        return false;
      }
      else if (!mouse.buttonDown && !this.hovered) {
        //mouse hovers over actor, not button pressed..
        this.hovered = true
        interaction = true;
      }
      else if (mouse.buttonDown && this.hovered && !this.pressed) {
        //they just pressed on this button, which was being hovered over..
        this.pressed = true;
        interaction = true;
      }
      else if (!mouse.buttonDown && this.pressed) {
        //they just let up on the button after pressing.. that is a click.
        this.#click();
        this.hovered = false;
        this.pressed = false;
        interaction = true;
      } else {
        interaction = true;
      }
    } else {
      this.pressed = false; // So.. it can't be clicked if its not on it..
      this.hovered = false;
    }
    return interaction;
  }
  #click() {
    let buttonOwner = undefined;
    if (Check.obj( this.actor , Actor)) buttonOwner = this.actor;
    else if (Check.obj( this.guiElement, GUIElement)) buttonOwner = this.guiElement;
    else throw new Error('Button.#click:  This button has been clicked but it has no owner.');
    let r = { "owner": buttonOwner, "value": this.value };
    if (!this.toggle) {
      if (typeof this.clickFn === 'function') {
        this.clickFn(r);
        if (this.originalFn) this.originalFn(r)
      }
    } else {
      this.clicked = !this.clicked;
      if (this.clicked) {
        if (typeof this.clickFn === 'function') {
          this.clickFn(r);//check for 'original function too.'
          if (this.originalFn) this.originalFn(r);
        }
      }
    }
  }
}