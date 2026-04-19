export default class Events{
  static #occurences = [];
  static types = [
    'click',
    'listItemSelected'
  ];


  static {;}
  
  static make (type, origin, data){
    return {type:type, origin:origin, data:data, when:Date.now()};
  }
  static add (type,origin, data){
    this.#occurences.push (Events.make (type, origin,data));
  }
  static reset (){
    Events.#occurences.length = 0;
  }
  static getEvents(type){
    if (!Events.types.includes (type)) throw new Error (`Invalid event type: ${type}`);
    if (!type) return this.#occurences;
    let occ = [];
    for (let e of Events.#occurences){
      if (e.type===type) occ.push (e);
    }
    return occ;
  }
}
