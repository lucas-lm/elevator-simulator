import { useEffect, useRef, useState } from 'react'
import { useElevator } from './useElevator'

const MIN_FLOOR = 0
const MAX_FLOOR = 9
const FLOOR_HEIGHT = 56 // px, keep in sync with --floor-height in CSS
const SPEED = 1 // floors per second
const TICK_MS = 2000

const formatSeconds = (ms: number) => `${(ms / 1000).toFixed(1)}s`

const floors = Array.from(
  { length: MAX_FLOOR - MIN_FLOOR + 1 },
  (_, i) => MAX_FLOOR - i,
)

interface LogEntry {
  id: number
  time: string
  message: string
}

export default function App() {
  const elevator = useElevator(SPEED, TICK_MS)
  const { floor, moving, nextFloor, queue, travelDuration, running, setRunning, addFloor } =
    elevator
  const [log, setLog] = useState<LogEntry[]>([])
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
  const carOffset = (displayFloor - MIN_FLOOR) * FLOOR_HEIGHT
  const carTransition = moving ? `${travelDuration}ms` : '0ms'

  return (
    <div className="app">
      <header>
        <h1>Elevator Simulator</h1>
        <p className="subtitle">
          Call the elevator to any floor. It checks its queue every{' '}
          {TICK_MS / 1000} seconds and travels at {SPEED} floor
          {SPEED === 1 ? '' : 's'} per second.
        </p>
      </header>

      <main className="layout">
        <section className="building" aria-label="Building">
          <div className="shaft" style={{ height: floors.length * FLOOR_HEIGHT }}>
            {floors.map((f) => (
              <div
                key={f}
                className={`floor ${queue.includes(f) ? 'queued' : ''}`}
                style={{ height: FLOOR_HEIGHT }}
              >
                <span className="floor-label">{f}</span>
              </div>
            ))}
            <div
              className={`car ${moving ? 'moving' : ''}`}
              style={{
                transform: `translateY(-${carOffset}px)`,
                transitionDuration: carTransition,
                height: FLOOR_HEIGHT - 8,
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

          <div className="card">
            <h2>Queue</h2>
            {queue.length === 0 ? (
              <p className="muted">No pending floors</p>
            ) : (
              <ol className="queue">
                {queue.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ol>
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
