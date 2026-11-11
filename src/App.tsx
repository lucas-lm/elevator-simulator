import { useEffect, useRef, useState } from 'react'
import { useElevator } from './useElevator'

const TICK_MS = 2000

// Building size (floors are numbered from 0)
const MIN_FLOOR_COUNT = 2 // an elevator needs at least two floors to go anywhere
const MAX_FLOOR_COUNT = 20 // keeps the building readable on screen
const DEFAULT_FLOOR_COUNT = 10

// Speed in floors per second
const MIN_SPEED = 1
const MAX_SPEED = 5
const SPEED_STEP = 0.5
const DEFAULT_SPEED = 1

// Floors shrink as the building grows, so it stays about the same height
const BUILDING_HEIGHT = 560 // px
const MAX_FLOOR_HEIGHT = 56 // px
const MIN_FLOOR_HEIGHT = 28 // px

const formatSeconds = (ms: number) => `${(ms / 1000).toFixed(1)}s`

interface LogEntry {
  id: number
  time: string
  message: string
}

export default function App() {
  const elevator = useElevator(DEFAULT_SPEED, TICK_MS)
  const {
    floor,
    moving,
    nextFloor,
    queue,
    speed,
    travelDuration,
    queueTotalDistance,
    queueTotalDuration,
    running,
    setRunning,
    addFloor,
    setSpeed,
  } = elevator
  const [floorCount, setFloorCount] = useState(DEFAULT_FLOOR_COUNT)
  const [log, setLog] = useState<LogEntry[]>([])

  const topFloor = floorCount - 1
  const floors = Array.from({ length: floorCount }, (_, i) => topFloor - i)
  const floorHeight = Math.max(
    MIN_FLOOR_HEIGHT,
    Math.min(MAX_FLOOR_HEIGHT, Math.floor(BUILDING_HEIGHT / floorCount)),
  )

  // The building can't shrink below a floor the elevator is on, heading to, or has queued
  const highestFloorInUse = Math.max(floor, nextFloor ?? 0, ...queue)
  const minFloorCount = Math.max(MIN_FLOOR_COUNT, highestFloorInUse + 1)
  const logId = useRef(0)

  const pushLog = (message: string) => {
    const entry = {
      id: logId.current++,
      time: new Date().toLocaleTimeString(),
      message,
    }
    setLog((prev) => [entry, ...prev].slice(0, 50))
  }

  // Track movement transitions to build the activity log
  const prev = useRef({ floor, moving })
  useEffect(() => {
    if (!prev.current.moving && moving) {
      pushLog(
        `Moving from floor ${floor} to floor ${nextFloor} (${formatSeconds(travelDuration)})`,
      )
    } else if (prev.current.moving && !moving) {
      pushLog(`Arrived at floor ${floor}`)
    }
    prev.current = { floor, moving }
  }, [floor, moving, nextFloor, travelDuration])

  const requestFloor = (target: number) => {
    // Only log requests the elevator accepted (not duplicates or the current floor)
    if (addFloor(target)) {
      pushLog(`Floor ${target} requested`)
    }
  }

  // While moving, render the car at its destination and let a CSS transition
  // lasting exactly travelDuration animate it there, so it arrives in sync
  // with the core's arrival timer.
  const displayFloor = moving && nextFloor !== null ? nextFloor : floor
  const carOffset = displayFloor * floorHeight
  const carTransition = moving ? `${travelDuration}ms` : '0ms'

  return (
    <div className="app">
      <header>
        <h1>Elevator Simulator</h1>
        <p className="subtitle">
          Call the elevator to any floor. It checks its queue every{' '}
          {TICK_MS / 1000} seconds and travels at {speed} floor
          {speed === 1 ? '' : 's'} per second.
        </p>
      </header>

      <main className="layout">
        <section className="building" aria-label="Building">
          <div className="shaft" style={{ height: floorCount * floorHeight }}>
            {floors.map((f) => (
              <div
                key={f}
                className={`floor ${queue.includes(f) ? 'queued' : ''}`}
                style={{ height: floorHeight }}
              >
                <span className="floor-label">{f}</span>
              </div>
            ))}
            <div
              className={`car ${moving ? 'moving' : ''}`}
              style={{
                transform: `translateY(-${carOffset}px)`,
                transitionDuration: carTransition,
                height: floorHeight - 8,
              }}
            >
              <span className="doors" />
              <span className="car-floor">{moving ? `→${nextFloor}` : floor}</span>
            </div>
          </div>
        </section>

        <section className="controls">
          <div className="card status">
            <div>
              <span className="label">Current floor</span>
              <span className="value">{floor}</span>
            </div>
            <div>
              <span className="label">Status</span>
              <span className={`value badge ${moving ? 'moving' : 'idle'}`}>
                {!running ? 'Paused' : moving ? 'Moving' : 'Idle'}
              </span>
            </div>
            <div>
              <span className="label">Next floor</span>
              <span className="value">{nextFloor ?? '—'}</span>
            </div>
            <div>
              <span className="label">{moving ? 'Trip time' : 'Next trip'}</span>
              <span className="value">
                {nextFloor === null ? '—' : formatSeconds(travelDuration)}
              </span>
            </div>
          </div>

          <div className="card">
            <h2>Call panel</h2>
            <div className="keypad">
              {[...floors].reverse().map((f) => (
                <button
                  key={f}
                  className={`key ${queue.includes(f) ? 'active' : ''} ${
                    f === floor && !moving ? 'here' : ''
                  }`}
                  onClick={() => requestFloor(f)}
                >
                  {f}
                </button>
              ))}
            </div>

            <button className="secondary" onClick={() => setRunning(!running)}>
              {running ? 'Pause simulation' : 'Resume simulation'}
            </button>
          </div>

          <div className="card settings">
            <h2>Settings</h2>
            <label className="setting">
              <span className="setting-header">
                <span>Speed</span>
                <output>{speed} floors/s</output>
              </span>
              <input
                type="range"
                min={MIN_SPEED}
                max={MAX_SPEED}
                step={SPEED_STEP}
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
              />
              {moving && <span className="hint">Applies from the next trip</span>}
            </label>

            <label className="setting">
              <span className="setting-header">
                <span>Floors</span>
                <output>{floorCount}</output>
              </span>
              <input
                type="range"
                min={MIN_FLOOR_COUNT}
                max={MAX_FLOOR_COUNT}
                step={1}
                value={floorCount}
                onChange={(e) =>
                  setFloorCount(Math.max(minFloorCount, Number(e.target.value)))
                }
              />
              {minFloorCount > MIN_FLOOR_COUNT && (
                <span className="hint">
                  At least {minFloorCount} while floor {highestFloorInUse} is in use
                </span>
              )}
            </label>
          </div>

          <div className="card">
            <h2>Queue</h2>
            {queue.length === 0 ? (
              <p className="muted">No pending floors</p>
            ) : (
              <>
                <ol className="queue">
                  {queue.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ol>
                <dl className="queue-totals">
                  <div>
                    <dt>Total distance</dt>
                    <dd>
                      {queueTotalDistance} floor{queueTotalDistance === 1 ? '' : 's'}
                    </dd>
                  </div>
                  <div>
                    <dt>Total travel time</dt>
                    <dd>{formatSeconds(queueTotalDuration)}</dd>
                  </div>
                </dl>
              </>
            )}
          </div>

          <div className="card">
            <h2>Activity</h2>
            {log.length === 0 ? (
              <p className="muted">Nothing yet</p>
            ) : (
              <ul className="log">
                {log.map((entry) => (
                  <li key={entry.id}>
                    <time>{entry.time}</time> {entry.message}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}
