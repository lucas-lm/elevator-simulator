# Elevator Simulator

A small elevator simulator built with React, TypeScript and Vite. You call the elevator to a floor and watch it work through its queue of requested floors.

## Getting started

You need [Node.js](https://nodejs.org/) 22 or later and [pnpm](https://pnpm.io/).

```bash
pnpm install
pnpm dev
```

Then open the URL Vite prints (usually http://localhost:5173).

| Script         | What it does                                  |
| -------------- | --------------------------------------------- |
| `pnpm dev`     | Starts the dev server with hot reload         |
| `pnpm build`   | Type-checks and builds for production (`dist/`) |
| `pnpm preview` | Serves the production build locally           |

## How it works

- Every **2 seconds**, the simulation asks the elevator to go to the next floor in its queue.
- If the elevator is idle and has floors waiting, it travels to the next one, then becomes idle again. The trip time (`travelDuration`) depends on the distance and the elevator's speed: at the default speed of **1 floor per second**, going from floor 2 to floor 7 takes 5 seconds.
- The order floors are visited in depends on the selected routing strategy (by default, the order they were requested).

### Using the app

- **Call panel**: click a floor button to request that floor.
- **Building**: the car slides to its destination. It turns orange while moving, and floors waiting in the queue are highlighted.
- **Status**: shows the current floor, whether the elevator is idle, moving or paused, the next floor, and how long the current (or next) trip takes.
- **Queue**: shows the pending floors, the total distance to serve them all, and the total travel time (which doesn't include the wait for the next tick between trips).
- **Activity**: a log of requests, departures and arrivals.
- **Pause / Resume** stops and restarts the 2-second tick.
- **Settings**:
  - **Routing strategy**: *Request order* (`simpleRouting`), *Lowest floor first* (`ascendingSortRouting`) or *Highest floor first* (`descendingSortRouting`). Changing it re-orders the floors already queued, except the destination of a trip in progress.
  - **Speed** (1–5 floors per second, default 1). A change made during a trip applies from the next trip.
  - **Floors** (2–20, default 10). The building can't shrink below a floor the elevator is on, heading to, or has queued.

The elevator also logs each step to the browser's devtools console.

## Project structure

```
src/
  elevator.ts     # Core Elevator class and routing functions (no UI code)
  useElevator.ts  # React hook: creates the elevator, runs the 2s tick, exposes state
  App.tsx         # User interface
  main.tsx        # React entry point
  index.css       # Styles (light and dark themes)
```

## Customizing

- **Limits and defaults**: the slider ranges (`MIN_SPEED`, `MAX_SPEED`, `MIN_FLOOR_COUNT`, `MAX_FLOOR_COUNT`), their defaults and the tick interval (`TICK_MS`) are constants at the top of `src/App.tsx`.
- **Routing**: a routing function receives the list of requested floors and returns them in the order they should be visited. To add a strategy, write one in `src/elevator.ts` and add it to `ROUTING_STRATEGIES` in `src/App.tsx`, which makes it appear in the selector. For example, to visit even floors first:

  ```ts
  // src/elevator.ts
  export function evenFirstRouting(floors: number[]) {
    return [...floors.filter((f) => f % 2 === 0), ...floors.filter((f) => f % 2 !== 0)]
  }

  // src/App.tsx
  const ROUTING_STRATEGIES = {
    // ...
    evenFirst: { label: 'Even floors first', routing: evenFirstRouting },
  }
  ```
