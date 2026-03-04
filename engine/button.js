import Events from './events.js';
import GameObject from './gameobject.js';
import GUI from './gui.js';
import View from './view.js';
export default class Button {
  guiElement = undefined;
  gameObjectPart = undefined;
  #owner  = undefined;
  get owner(){
    if (this.#owner) return this.#owner;
    if (this.guiElement)  return this.guiElement;
    if (this.gameObjectPart) return this.gameObjectPart;
  }
  clicked = false;
  clickFn = undefined;
  hovered = false;
  pressed = false;
  toggled = false;
  toggle = false;
  //Must be bound by an actor or Element to do anything..
  //They must bind the actor OR guiElement property.
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
    if (this.gameObjectPart) {
      const inside = GameObject.isMouseIn(this.gameObjectPart);
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
        Events.add('button-clicked', (this.guiElement ? this.guiElement : this.gameObjectPart));
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
    const owner = this.guiElement ?? this.gameObjectPart ?? null;
    const r = { owner, value: this.value };
    this.clicked = false;
    if (this.toggle) {
      this.toggled = !this.toggled;
      r.toggled = this.toggled;
    }
    if (this.clickFn) this.clickFn(r);
    Events.add('click', owner);
  }
/*
  #click() {
    const owner = this.guiElement ?? this.gameObjectPart ?? null;
    const r = { owner, value: this.value };
    if (!this.toggle) {
      this.clicked = false;
    } else {
      this.clicked = !this.clicked;
    }
    if (this.clickFn) this.clickFn(r);
    Events.add('click', owner);
  }
*/
}