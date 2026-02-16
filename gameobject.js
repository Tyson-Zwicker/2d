export default class GameObject {    
  #localPosition = {x:0,y:0};   //READ ONLY
  get localPosition (){
    return this.#localPosition;
  }
  #localRotation = 0;           //READ ONLY
  get localRotation(){
    return this.#localRotation;   
  }
  #centerOfMass = {x:0,y:0};
  worldPosition = undefined;    //assigned when added to Game.
  worldRotation = undefined;    //assigned when added to Game.
  velocity = {x:0,y:0};         //Is changed by application of linear acceleration.
  spin = 0;                     //Is changed by application of angular acceleration.
  name = undefined;             //assigned by constructor  
  body = undefined;             //assigned by constructor
  spinningParts = [];           //collected during "finalize" step..

  constructor (name, body){
    this.name = name;
    this.body = body;
  }
  finalize (){                  //Once after all the parts have been added.
    this.centerOfMass = this.#calcCenterOfMass();
    this.momentOfInertia = this.#calcMomentOfInertia;
    this.spinningParts = this.#getSpinningParts();
  }
  #getSpinningParts (){
    let spinningParts = [];
    for (let part of this.body.parts){
      if (part.parts.length===0 && part.spin!==0){
        spinningParts.push (part);
      }
    }
    return spinningParts;
  }
  #calcCenterOfMass(){
    
  }
  #calcMomentOfInertia(){

  }
  move(){
    this.centerOfMass = Vec.add (this.centerOfMass, this.velocity);
    this.worldRotation = this.worldRotation + this.spin;
  }
}