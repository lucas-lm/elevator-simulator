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
- Floors are visited in the order they were requested (`simple_routing`).

### Using the app

- **Call panel**: click a floor button (0–9) to request that floor.
- **Building**: the car slides to its destination. It turns orange while moving, and floors waiting in the queue are highlighted.
- **Status**: shows the current floor, whether the elevator is idle, moving or paused, the next floor, and how long the current (or next) trip takes.
- **Queue** and **Activity**: show the pending floors and a log of requests, departures and arrivals.
- **Pause / Resume** stops and restarts the 2-second tick.

The elevator also logs each step to the browser's devtools console.

## Project structure

```
src/
  elevator.ts     # Core Elevator class and routing function (no UI code)
  useElevator.ts  # React hook: creates the elevator, runs the 2s tick, exposes state
  App.tsx         # User interface
  main.tsx        # React entry point
  index.css       # Styles (light and dark themes)
```

## Customizing

- **Floor range**: change `MIN_FLOOR` and `MAX_FLOOR` at the top of `src/App.tsx`.
- **Speed and tick interval**: change `SPEED` (floors per second) and `TICK_MS` at the top of `src/App.tsx`.
- **Routing**: `Elevator` takes a routing function as its second argument that receives the list of requested floors and returns them in the order they should be visited. For example, to visit floors in ascending order:

  ```ts
  function ascending_routing(floors: number[]) {
    return [...floors].sort((a, b) => a - b)
  }

  const elevator = new Elevator(speed, ascending_routing)
  ```

  The elevator is created in `src/useElevator.ts`.
