
export default class PlanetZone {
  people = 0;
  BREEDING_RATE = 0.1;
  STARVATION_RATE = 0.1;
  resources = { food: 0, gas: 0, ore: 0, power: 0 };
  stored = { food: 0, gas: 0, ore: 0, power: 0 };
  infrastructure = { farms: 0, refiners: 0, factories: 0, generators: 0 }; //# built.
  process() {
    if (this.people > 0) {
      //Eating..
      if (this.people > this.stored.food) {
        this.people -= BREEDING_RATE * (this.stored.food / this.people);
      } else {
        this.storedfood -= this.people;
      }
      //Breeding..
      this.people += people * STARVATION_RATE;
    }
    let power = 0;
    let workers = Math.floor(this.people); //IMPORTANT BECAUSE PEOPLE WILL BE A FLOAT AND 1/2 A PERSON CAN'T DO ANYTHING..
    for (let i = 0; (i < this.infrastructure.generators) && (workers > 0); i++) {
      power += this.resources.power;
      workers--;
    }
    let food = 0;
    for (let i = 0; (i < this.infrastructure.farms) && (workers > 0) && (power > 0); i++) {
      food += this.resources.food;
      workers--;
      power--;
    }
    let ore = 0;
    for (let i = 0; (i < this.infrastructure.mines) && (workers > 0) && (power > 0); i++) {
      ore += this.resources.ore;
      workers--;
      power--;
    }
    let gas = 0;
    for (let i = 0; (i < this.infrastructure.refiners) && (workers > 0) && (power > 0); i++) {
      gas += this.resources.gas;
      workers++;
      power--;
    }
    this.employment = workers / this.people;
    this.stored.food += food;
    this.stored.ore += ore;
    this.stored.power += power;
    this.stored.gas += gas;
  }
}