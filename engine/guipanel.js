import RectBound from './rectbounds.js';

//todo: different panel classes
//based on common need for screen-based
//sizing of their local elements
//but diff: anchor,
//TODO://BUT MOSTLY:  LAYOUT

export default class GUIPanel {
  /*
  anchor is just a reference to an object with x and y
  //It can be the screen. It can be another guiElement
  //It can be a world object.  Just x and y.
  */
  anchor = undefined; //'screen', an element or an object.
  direction = undefined;
  constraint = {
    smallest:{
      width:0,
      height:0
    },
    largest:{
      width:0,
      height:0
    }
  };
  static make (anchor, constraint){
    //First determine if anchor is a GameObject, a GUIElement, or a STRING
    //STRING will indicate SIDE "top, bottom,left,right"
    //if GUIElement will determine startPosition for render..
    //If GameObject same but in World Coords..

    this.anchor = anchor;
    switch (anchor){
      case 'left' :

    }
    
  }

}
