import { useEffect, useRef, useState } from 'react'
import { Elevator } from './elevator'

export interface ElevatorSnapshot {
  floor: number
  moving: boolean
  nextFloor: number | null
  queue: number[]
  /** Duration in ms of the current trip (or of the next one, while idle) */
  travelDuration: number
}

const takeSnapshot = (elevator: Elevator): ElevatorSnapshot => ({
  floor: elevator.floor,
  moving: elevator.moving,
  nextFloor: elevator.nextFloor,
  queue: [...elevator.queue],
  travelDuration: elevator.travelDuration,
})

/** @param speed elevator speed in floors per second */
export function useElevator(speed = 1, tickMs = 2000) {
  const elevatorRef = useRef<Elevator | null>(null)
  if (elevatorRef.current === null) {
    elevatorRef.current = new Elevator(speed)
  }
  const elevator = elevatorRef.current

  const [snapshot, setSnapshot] = useState(() => takeSnapshot(elevator))
  const [running, setRunning] = useState(true)

  useEffect(() => {
    return elevator.subscribe(() => setSnapshot(takeSnapshot(elevator)))
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
  }
}
