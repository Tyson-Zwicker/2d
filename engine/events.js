export default class Events{
  static #occurences = [];
  static {;}
  static make (type, origin){
    return {type:type, origin:origin, when:Date.now()};
  }
  static add (type,origin){
    this.#occurences.push (Events.make (type, origin));
  }
  static reset (){
    Events.#occurences.length = 0;
  }
  
  static getEvents(type){
    if (!type) return this.#occurences;
    let occ = [];
    for (let e of Events.#occurences){
      if (e.type===type) occ.push (e);
    }
    return occ;
  }
}
