# Side GUI WebGL Project

## Overview
This project is a dynamic WebGL application that allows users to render a customizable 3D cylinder-like shape with animated lighting and a projected shadow. It features a simple GUI with sliders to control:
- **Red, Green, Blue** color components of the shape
- **Number of sides** (from 4 to 360) to change the smoothness of the shape

A sun-like light source moves across the sky in a half-arc motion, dynamically affecting lighting and shadowing.

---

## Files

- **Side_GUI.html**: Main HTML page containing the WebGL canvas, GUI controls (sliders), and shader scripts.
- **Side_GUI.js**: Main JavaScript file handling rendering, lighting animation, shadow computation, and interaction with GUI sliders.
- **initShaders.js**: Utility script for loading and compiling WebGL shaders.
- **MV.js**: Math utility library for vectors, matrices, and transformations used in 3D rendering.
- **webgl-utils.js**: WebGL utility functions for context setup and animation loop management.

---

## Features

- **Dynamic Lighting**: A moving light source simulates the sun’s motion across the sky, adjusting lighting based on position.
- **Realistic Shadows**: A ground shadow of the shape is projected in real-time based on the light source.
- **User Controls**:
  - **Red, Green, Blue sliders**: Change object color in real-time.
  - **Sides slider**: Change the number of polygon sides to transition from a rough prism to a smooth cylinder.
- **Custom Shaders**:
  - **Vertex Shader**: Calculates Blinn-Phong lighting per-vertex.
  - **Fragment Shader**: Outputs final pixel color.
- **Blending**: Smooth transparency blending enabled for the shadow effect.

---

## How to Run

1. Make sure all five files (**Side_GUI.html**, **Side_GUI.js**, **initShaders.js**, **MV.js**, **webgl-utils.js**) are in the same directory.
2. Open **Side_GUI.html** in a modern WebGL-supported browser (such as Chrome, Firefox, Edge).

_No server setup is required; it runs entirely client-side._

---

## Controls

| Control         | Description                                |
|-----------------|--------------------------------------------|
| Red Slider      | Adjusts the red component of object color  |
| Green Slider    | Adjusts the green component of object color|
| Blue Slider     | Adjusts the blue component of object color |
| Sides Slider    | Changes the number of sides (4-360)        |

---

## Project Details

- **Author**: Ethan Wight
- **Date**: April 27, 2025
- **Course**: CMSC 410 - Computer Graphics
- **Project**: Project 3

---

## Dependencies

- No external libraries beyond the included scripts.
- Requires a browser with WebGL support.

---

## Notes

- Lighting uses Blinn-Phong shading model.
- Shadow transparency is set to around 30% opacity for realism.
- Perspective projection matrix is set to 45-degree field of view.
- Eye position is elevated for a downward view of the object and its shadow.
