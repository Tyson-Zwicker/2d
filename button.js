import GUI from './gui.js';
import View from './view.js';

export default class Button {
  guiElement = undefined;
  clicked = false;
  clickFn = undefined;
  hovered = false;
  pressed = false;
  toggle = false;
  //Must be bound by an actor or Element to do anything..
  //They must bind the actor OR guiElement property.
  constructor(clickFn = null, toggle = false, value) {
    this.clickFn = clickFn;
    this.toggle = toggle;
    this.value = value;
  }  
  checkForMouse() {
    let insideBounds = GUI.isMouseIn(this.guiElement);
    return this.#doButton(insideBounds);  // Do this even if NOT in bounds to allow others to de-hover..
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
        this.hovered = true
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
    let buttonOwner = this.guiElement;
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