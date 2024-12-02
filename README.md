**File Descriptions**
- `public/`
  - `character.glb`: The 3D model of the main character.
  - `Walking (1).glb`: Animation for the walking movement.
  - `Running (1).glb`: Animation for the running movement.
  - `jump.glb`: Animation for the jumping movement.
- `src/`
  - `main.js`: Entry point for the project. Sets up the scene, camera, and renderer.
  - `controls.js`: Contains logic for character movement and animation.

- `index.html`: Main HTML file to run the project in the browser.
- `package.json`: Includes project dependencies and scripts.
- `vite.config.js`: Configuration file for Vite, used to run the project.
- `README.md`: Documentation for the project.



**Project Setup Instructions**

Follow the steps below to set up and run the project:

1. Install Dependencies
Ensure you have Node.js installed. Then, run:  " npm install "

2. Install Required Extensions/Libraries
The project uses the following libraries:
three: For rendering 3D graphics.
vite: For running the development server.
These are included in the package.json file and will be installed during the npm install step.

3. Run the Project
Start the development server with: " npx vite "

4. Open in Browser
Once the server is running, open the link provided in the terminal (usually http://localhost:5173) in your browser.

5. Dependencies
Ensure you have these installed globally or through the npm install process:
three: 3D library for rendering graphics.
vite: Lightweight development server for quick iteration.

7. Additional Notes
Ensure the public/ folder contains all the required assets (character models and animations).
You can adjust the map size, camera settings, or character speed in the main.js and controls.js files.
For advanced configurations, refer to the Three.js documentation: https://threejs.org/.

8. Known Issues
Ensure your character models and animations are correctly placed in the public/ folder, or the game may fail to load them.
Large assets may take time to load; consider optimizing the GLB files if necessary.
ensure to run project whit " npx vite " from the termnal

9. Future Improvements
Add more character animations (e.g., crouch, attack).
Include a scoring system or game objectives.
Enhance the environment with additional models and textures.
