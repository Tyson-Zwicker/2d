import Events from './events.js';
import SimObject from './simobject.js';
import GUI from './gui.js';
import View from './view.js';
export default class Button {
  guiElement = undefined;
  simObjectPart = undefined;
  #owner = undefined;
  get owner() {
    if (this.#owner) return this.#owner;
    if (this.guiElement) return this.guiElement;
    if (this.simObjectPart) return this.simObjectPart;
  }
  clicked = false;
  clickFn = undefined;
  hovered = false;
  pressed = false;
  toggled = false;
  toggle = false;
  constructor(value, toggle = false, clickFn) {
    this.clickFn = clickFn;
    this.toggle = toggle;
    this.value = value;
  }
  checkForMouse() {
    if (this.guiElement) {
      const inside = GUI.isMouseIn(this.guiElement);
      return this.#doButton(inside);
    }
    if (this.simObjectPart) {
      const inside = SimObject.isMouseIn(this.simObjectPart);
      return this.#doButton(inside);
    }
    return false;
  }
  #doButton(insideBounds) {
    let interaction = false;
    if (insideBounds) {
      if (View.mouse.buttonDown && !this.hovered) {
        //*Must* be checked first.. mouse went down somewhere else, but not here.. doesn't affect this actor..
        return false;
      }
      else if (!View.mouse.buttonDown && !this.hovered) {
        //mouse hovers over actor, not button pressed..
        this.hovered = true;
        interaction = true;
      }
      else if (View.mouse.buttonDown && this.hovered && !this.pressed) {
        //they just pressed on this button, which was being hovered over..
        this.pressed = true;
        interaction = true;
      }
      else if (!View.mouse.buttonDown && this.pressed) {
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
    let data = { origin: 'unknown', type: 'click', value: this.value };
    if (this.guiElement) {
      data.origin = this.guiElement.text;
      data.owner = this.guiElement;
    }
    if (this.simObjectPart) {
      data.origin = this.simObjectPart.name;
      data.owner = this.simObjectPart;
    }
    this.clicked = false;    
    if (this.toggle) {
      this.toggled = !this.toggled;
      data.toggled = this.toggled;
    }
    if (this.clickFn) this.clickFn(data);
    Events.add('click', data.origin, data);
  }
}