import GUI from './gui.js';
export default class GUIPanel{
  #position;
  constructor (position, direction, constraint){
    this.anchor =undefined;       //Assumed canvas upper-left corner (if undefined) or a GUIElement
    this.#position = position;
    this.direction = direction;
    this.constraint = constraint;
    this.elements = [];
    GUI.panels.push (this);
  }
  get position (){
    if (!this.anchor) return this.#position
    if (this.anchor.panel.direction ==='horizontal'){
      this.#position.x = this.anchor.drawnbounds.x0;
      this.#position.y = this.anchor.drawnbounds.y1;
    } 
    else if (this.anchor.panel.direction ==='vertical'){
      this.#position.x = this.anchor.drawnbounds.x1;
      this.#position.y = this.anchor.drawnbounds.y0;
    }
    return this.#position;
  }
  
  render (){
    let cursor = {};
    cursor.x = this.position.x;
    cursor.y = this.position.y;
    for (let el of this.elements){
      el.render(cursor);
      if (this.direction==='vertical'){
        cursor.y+= el.size.height;
      }else if (this.direction ==='horizontal'){
        cursor.x+= el.size.width;
      } else {
        throw new Error ('unknown direction: '+this.direction);
      }     
    }
  }
}