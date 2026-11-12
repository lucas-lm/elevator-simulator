import { useEffect, useRef, useState } from 'react'
import { Elevator } from './elevator'

export interface ElevatorSnapshot {
  floor: number
  moving: boolean
  nextFloor: number | null
  queue: number[]
  speed: number
  /** Duration in ms of the current trip (or of the next one, while idle) */
  travelDuration: number
  /** Floors to travel to serve the whole queue */
  queueTotalDistance: number
  /** Travel time in ms to serve the whole queue */
  queueTotalDuration: number
}

const takeSnapshot = (elevator: Elevator): ElevatorSnapshot => ({
  floor: elevator.floor,
  moving: elevator.moving,
  nextFloor: elevator.nextFloor,
  queue: [...elevator.queue],
  speed: elevator.currentSpeed,
  travelDuration: elevator.travelDuration,
  queueTotalDistance: elevator.queueTotalDistance,
  queueTotalDuration: elevator.queueTotalDuration,
})

/** @param initialSpeed elevator speed in floors per second */
export function useElevator(initialSpeed = 1, tickMs = 2000) {
  const elevatorRef = useRef<Elevator | null>(null)
  if (elevatorRef.current === null) {
    elevatorRef.current = new Elevator(initialSpeed)
  }
  const elevator = elevatorRef.current

  const [snapshot, setSnapshot] = useState(() => takeSnapshot(elevator))
  const [running, setRunning] = useState(true)

  useEffect(() => {
    return elevator.subscribe(() =>
      setSnapshot((prev) => {
        const next = takeSnapshot(elevator)
        // The arrival timer was scheduled with the duration at departure, so
        // keep that value for the whole trip even if the speed changes meanwhile.
        if (prev.moving && next.moving) {
          next.travelDuration = prev.travelDuration
        }
        return next
      }),
    )
  }, [elevator])

  useEffect(() => {
    if (!running) return
    const interval = setInterval(() => {
      elevator.goToNextFloor()
    }, tickMs)
    return () => clearInterval(interval)
  }, [elevator, running, tickMs])

  return {
    ...snapshot,
    running,
    setRunning,
    addFloor: (floor: number) => elevator.addFloor(floor),
    setSpeed: (speed: number) => elevator.setSpeed(speed),
    setRouting: (routing: (floors: number[]) => number[]) =>
      elevator.setRoutingCallback(routing),
  }
}
