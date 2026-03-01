export default class GUIPanel {
  /*
  anchor is just a reference to an object with x and y
  //It can be the screen. It can be another guiElement
  //It can be a world object.  Just x and y.
  */
  anchorLayout = undefined; //TODO: this determines a lot.
  achnorOwner = undefined; //'screen', an element or an object.
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
}