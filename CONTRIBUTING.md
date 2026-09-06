# Contributing to Sentry Navigation

Thanks for helping build Sentry Navigation. This guide covers the local setup, application structure, and the conventions that matter when changing the map, search, or routing flows.

## Prerequisites

- Node.js with npm and workspace support
- Docker Desktop with Docker Compose
- A MapTiler API key for map tiles and geocoding(it's freeeeeeeee)
- Browser location permission for GPS features

## Local Setup

From the repository root:

```powershell
npm install
npm install --workspace=client
npm install --workspace=server
docker compose up -d
```

Start the services in separate terminals:

```powershell
npm run server
npm run dev
```

The Vite development server prints the client URL, normally `http://localhost:5173`. The server proxy listens on port `3000`, and Valhalla listens on port `8002`.

The client sends requests to `/route`; the Vite configuration proxies those requests to the local server. The server forwards route requests to Valhalla.

## Useful Commands

```powershell
npm run dev                         # Start the client
npm run server                      # Start the route proxy
npm run build                       # Build the client
npm run build --workspace=client    # Build the client explicitly
npm run start --workspace=server    # Start the server explicitly
docker compose logs -f valhalla    # View Valhalla logs
docker compose down                 # Stop local containers
```

## Project Structure

- `client/src/main.js`: Client startup and application initialization
- `client/src/map/core.js`: MapLibre map creation
- `client/src/map/markers.js`: Marker creation, tracking, and updates
- `client/src/map/routing.js`: Valhalla requests, polyline decoding, and route rendering
- `client/src/search/search.js`: Search input, debounce, and MapTiler geocoding
- `client/src/search/ui.js`: Search result rendering, icons, geolocation, and destination selection
- `client/src/weather/`: Weather requests and bridge-safety logic
- `server/server.js`: Express proxy from the client to Valhalla
- `valhalla/routing-valhalla/`: Local Valhalla configuration, tiles, and elevation data

## Request Flow

1. The user types into the search field.
2. `search.js` debounces the input and requests results from MapTiler.
3. Selecting a result creates or updates map markers.
4. `routing.js` sends the ordered marker locations to `/route`.
5. The server forwards the request to Valhalla at `http://localhost:8002/route`.
6. Valhalla returns route legs encoded as polylines.
7. The client decodes the legs and renders the route as a blue MapLibre line.

Locations are routed in array order: point 1 -> point 2 -> point 3. They are not independently routed from point 1 to every later point.

## Geolocation Behavior

The client requests a fast, lower-accuracy position so the initial location marker can appear quickly.

When testing geolocation:

- Allow location permission in the browser.
- Test both cached and cold-start location behavior.
- Test when permission is denied or unavailable.
- Confirm that refinement moves the existing marker instead of creating a duplicate.

## Routing Notes

- Valhalla expects locations as `{ lat, lon }` objects.
- Valhalla route shapes use encoded polyline precision 6.
- MapLibre sources and layers must be added only after the map style is ready.
- Multiple route requests can overlap, so stale responses must not replace newer routes.
- Removing a marker should update or clear the route appropriately.

## Validation

Before opening a pull request, run:

```powershell
npm run build
```

Also test the changed workflow manually in the browser. At minimum, verify search results, destination selection, marker placement, route rendering, and marker removal.

The build may report a warning about the generated JavaScript bundle being larger than 500 kB. This is currently a warning, not a build failure.

## Configuration and Secrets

Do not commit private credentials or personal environment files. Use a local `.env` file for development values and document variable names without committing their values.

The MapTiler key is currently referenced by client code. Before production use, move it to the project's environment/configuration approach and restrict or rotate the key as appropriate.

## Git Workflow

- Create a focused branch for each change.
- Keep commits small and describe the user-visible behavior they change.
- Avoid unrelated formatting or generated-file changes.
- Include reproduction steps for bug fixes.
- Include manual test results in the pull request.
- Do not commit `node_modules`, local secrets, or unnecessary build output.

## Pull Requests

A pull request should explain:

- What changed
- Why the change was needed
- How it was tested
- Any known limitations or follow-up work

For map or routing changes, include the affected files and describe the expected marker order and route behavior.
