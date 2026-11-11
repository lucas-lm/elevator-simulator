export type ElevatorListener = () => void

export class Elevator {
  private nextFloors: number[]
  private currentFloor: number
  private isMoving: boolean
  private speed: number
  private routingCallback: Function
  private listeners: Set<ElevatorListener> = new Set()

  public constructor(speed: number = 1, routingCallback: Function = simple_routing) {
    this.nextFloors = []
    this.currentFloor = 0
    this.isMoving = false
    this.routingCallback = routingCallback
    this.speed = speed
  }

  get nextFloor(): number | null {
    return this.nextFloors.length > 0 ? this.nextFloors[0] : null
  }

  // Read-only accessors so the UI can observe the elevator state
  get floor(): number {
    return this.currentFloor
  }

  get moving(): boolean {
    return this.isMoving
  }

  get queue(): readonly number[] {
    return this.nextFloors
  }

  
  get currentSpeed(): number {
    return this.speed
  }

  public setSpeed(speed: number) {
    // Changes the speed. A trip already in progress keeps its duration.
    if (speed <= 0) return
    this.speed = speed
    console.log(`Elevator: speed set to ${speed} floors/s`)
    this.notify()
  }

  // Time in ms to travel from the current floor to the next one (speed = floors per second)
  get travelDuration(): number {
    if (this.nextFloor === null) return 0
    const distance = Math.abs(this.currentFloor - this.nextFloor)
    const msPerFloor = 1000 / this.speed
    const timeToArrival = distance * msPerFloor
    return timeToArrival
  }

  // Floors to travel to serve the whole queue, starting from the current floor
  get queueTotalDistance(): number {
    let totalDist = 0
    for (let i = 0; i < this.nextFloors.length; i++) {
      const curr = this.nextFloors[i]
      const prev = i === 0 ? this.currentFloor : this.nextFloors[i-1] 
      const dist = Math.abs(curr - prev)
      totalDist += dist
    }

    return totalDist
  }
  
  // Time in ms to travel the whole queue (same unit as travelDuration)
  get queueTotalDuration(): number {
    const msPerFloor = 1000 / this.speed
    return this.queueTotalDistance * msPerFloor
  }

  // Lets the UI re-render whenever the elevator state changes
  public subscribe(listener: ElevatorListener): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  private notify() {
    this.listeners.forEach((listener) => listener())
  }

  /** Returns true if the floor was added, false if the request was ignored */
  public addFloor(floor: number): boolean {
    if (floor === this.currentFloor && !this.isMoving) return false
    if (this.nextFloors.includes(floor)) return false
    this.nextFloors.push(floor)
    this.recalculateRoute()
    this.notify()
    console.log(`Elevator: added floor ${floor}. nextFloors = ${this.nextFloors}`)
    return true
  }


  public goToNextFloor() {
    console.log(`Elevator: requested to go next floor. currentFloor = ${this.currentFloor}. nextFloor = ${this.nextFloor}. travelDuration = ${this.travelDuration}`)

    if (!this.isMoving && this.nextFloors.length > 0) {
      console.log(`Elevator: elevator moving to next floor. currentFloor = ${this.currentFloor}. nextFloor = ${this.nextFloor}. travelDuration = ${this.travelDuration}`)
      this.isMoving = true
      this.notify()
      setTimeout(() => {
        this.currentFloor = this.nextFloors.shift() as number
        this.isMoving = false
        console.log(`Elevator: elevator arrived at floor ${this.currentFloor}`)
        this.notify()
      }, this.travelDuration)
      return
    }
  }

  private recalculateRoute() {
    console.log(`Elevator: recalculating route with ${this.routingCallback.name}`)
    this.nextFloors = this.routingCallback(this.nextFloors)
  }
}

export function simple_routing(floors: number[]) {
  return floors
}
