
export default class PlanetZone {
  population = 0;
  breedingRate = 0.05;
  starvationRate = 0.3;
  foodShortfall = 0;
  populationGrowth = 0;
  employment = 0;
  resources = { food: 0, gas: 0, ore: 0, power: 0 }; //extrated per worker.
  stores = { food: 0, gas: 0, ore: 0, power: 0 }; // Units stored
  storage = { food: 0, gas: 0, ore: 0, power: 0 };  //Units that can be stored..
  extractors = { farms: 0, refiners: 0, factories: 0, generators: 0 }; //# facilities built.

  constructor() {

  }
  get industry (){
    return this.extractors.food + this.extractors.ore+this.extractors.power+this.extractors.gas;
  }

  process(firstRun) {
    //Everything needs power, so its first, then food, then ore, then gas... until you run out of power and/or workds.
    let power = 0;
    let workers = Math.floor(this.populaion); //IMPORTANT BECAUSE PEOPLE WILL BE A FLOAT AND 1/2 A PERSON CAN'T DO ANYTHING..
    for (let i = 0; (i < this.extractors.generators) && (workers > 0); i++) {
      power += this.resources.power;
      workers--;
    }
    let food = 0;
    for (let i = 0; (i < this.extractors.farms) && (workers > 0) && (power > 0); i++) {
      food += this.resources.food;
      workers--;
      power--;
    }
    let ore = 0;
    for (let i = 0; (i < this.extractors.mines) && (workers > 0) && (power > 0); i++) {
      ore += this.resources.ore;
      workers--;
      power--;
    }
    let gas = 0;
    for (let i = 0; (i < this.extractors.refiners) && (workers > 0) && (power > 0); i++) {
      gas += this.resources.gas;
      workers++;
      power--;
    }
    //Do population last so they can grow their food before you starve them.
    if (firstRun!==true) {
      this.stores.food -= this.people;
      if (this.stores.food < 0) {
        this.foodShortfall = this.people- this.stores.food;
        this.stores.food = 0;
        this.populationGrowth = -this.starvationRate;
      } else {
        this.populationGrowth = +this.populationGrowth;
      }
      this.population += this.populationGrowth;
    }
    this.employment = Math.floor (100*workers / this.people);
    this.stores.food += food;
    this.stores.ore += ore;
    this.stores.power += power;
    this.stores.gas += gas;
    if (this.stores.food > this.storage.food) this.stores.food = this.storage;
    if (this.stores.ore > this.storage.ore) this.stores.ore = this.storage;
    if (this.stores.power > this.storage.power) this.stores.power = this.storage;
    if (this.stores.gas > this.storage.gas) this.stores.gas = this.storage;
  }
}