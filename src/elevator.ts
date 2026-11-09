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

  public addFloor(floor: number) {
    console.log(`Elevator: added floor ${floor}. nextFloors = ${this.nextFloors}`)
    this.nextFloors.push(floor)
    this.recalculateRoute()
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
