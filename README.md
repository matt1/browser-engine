Experiments with writing a toy browser engine, just for fun.

Aim:
  - fairly faithfuly render something like http://info.cern.ch/hypertext/WWW/TheProject.html
  - Perhaps approaching being able to render HTML4 with limited CSS support?
  - Eventually run it inside some sort of desktop-wrapper (e.g. neutralinojs)

# Running

This uses a simple Deno.serve() function to serve the code directly via
`ts_serve`:

```
deno run --allow-all serve.ts
```