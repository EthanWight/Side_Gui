/* 
Ethan Wight
April 27, 2025
CMSC 410
Project 3
*/

let gl;
let program;
let vertices = [];
let colors = [];
let indices = [];
let normalsArray = [];

// Viewing parameters
let near = 0.1;
let far = 5.0;
let radius = 2.0;
let theta = 0.0;
let phi = 0.0;
let eye = vec3(0.0, 0.0, radius);
let at = vec3(0.0, 0.0, 0.0);
let up = vec3(0.0, 1.0, 0.0);

// Lighting parameters
let lightPosition = vec4(2.0, 2.0, 0.0, 1.0); // Initial light position
let lightAmbient = vec4(0.2, 0.2, 0.2, 1.0);
let lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
let lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);

let materialAmbient = vec4(1.0, 1.0, 1.0, 1.0);
let materialDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
let materialSpecular = vec4(1.0, 1.0, 1.0, 1.0);
let materialShininess = 100.0;

// Animation parameters for light
let animationStartTime = null;
let animationDuration = 10000; // 10 seconds in milliseconds
let animationRunning = true;

// Shadow parameters
let shadowY = -0.475; // Y-coordinate for the shadow

window.onload = function init() {
    // Get canvas and setup WebGL context
    const canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
        alert("WebGL isn't available");
    }

    // Configure WebGL
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // Load shaders and initialize attribute buffers
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // Get slider elements
    const redSlider = document.getElementById("redSlider");
    const greenSlider = document.getElementById("greenSlider");
    const blueSlider = document.getElementById("blueSlider");
    const sidesSlider = document.getElementById("sidesSlider");
    const sidesValue = document.getElementById("sidesValue");

    // Add event listeners to sliders
    redSlider.addEventListener("input", render);
    greenSlider.addEventListener("input", render);
    blueSlider.addEventListener("input", render);
    sidesSlider.addEventListener("input", function() {
        sidesValue.textContent = this.value;
        render();
    });

    // Initialize the animation start time
    animationStartTime = Date.now();

    // Set up model-view and projection matrices
    setupMatrices();

    // Start the animation and rendering
    requestAnimFrame(animate);
};

function animate() {
    render();
    requestAnimFrame(animate);
}

function setupMatrices() {
    // Set up perspective projection
    const projectionMatrix = perspective(45, 1, near, far);
    const projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));
    
    // Adjust camera position to look down at the object
    eye = vec3(0.0, 1.0, 2.0); // Moved up and back
    at = vec3(0.0, 0.0, 0.0);
    up = vec3(0.0, 1.0, 0.0);
    
    // Set up modelview matrix
    const modelViewMatrix = lookAt(eye, at, up);
    const modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
}

function updateLightPosition() {
    // Calculate elapsed time
    const currentTime = Date.now();
    const elapsedTime = currentTime - animationStartTime;
    
    // Map elapsed time to an angle for the sun's path (0 to π for a half circle)
    // Sunrise to sunset is a half circle motion
    const t = (elapsedTime % animationDuration) / animationDuration;
    const angle = Math.PI * t;
    
    // Sun moves from east (-x) to west (+x)
    const radius = 6.0;
    const xPos = -radius * Math.cos(angle); // Negative sign for east-to-west
    
    // Y position: near horizon at sunrise/sunset, highest at noon
    const maxHeight = 5.0;
    const minHeight = 0.5;
    const yPos = minHeight + (maxHeight - minHeight) * Math.sin(angle);
    
    // Z position: keep the light slightly in front for better visibility
    const zPos = -2.0;
    
    lightPosition = vec4(xPos, yPos, zPos, 1.0);
    
    // Update light position in the shader
    const lightPositionLoc = gl.getUniformLocation(program, "lightPosition");
    gl.uniform4fv(lightPositionLoc, flatten(lightPosition));
}

function buildObject(sides) {
    // Clear arrays
    vertices = [];
    colors = [];
    normalsArray = [];
    indices = [];
    
    // Get colors from sliders
    const red = parseFloat(document.getElementById("redSlider").value);
    const green = parseFloat(document.getElementById("greenSlider").value);
    const blue = parseFloat(document.getElementById("blueSlider").value);
    
    // Update material diffuse color based on slider values
    materialDiffuse = vec4(red, green, blue, 1.0);
    const materialDiffuseLoc = gl.getUniformLocation(program, "materialDiffuse");
    gl.uniform4fv(materialDiffuseLoc, flatten(materialDiffuse));
    
    // Set up parameters for the 3D object
    const height = 0.95;      // Height of the object
    const radius = 0.4;      // Radius of the object
    const yTop = height/2;   // Top y-coordinate
    const yBottom = -height/2; // Bottom y-coordinate
    
    // Create top and bottom faces
    for (let i = 0; i < sides; i++) {
        const angle = (i * 2 * Math.PI) / sides;
        const nextAngle = ((i+1) * 2 * Math.PI) / sides;
        
        // Calculate vertex positions
        const x1 = radius * Math.cos(angle);
        const z1 = radius * Math.sin(angle);
        const x2 = radius * Math.cos(nextAngle);
        const z2 = radius * Math.sin(nextAngle);
        
        // Add top face vertices
        vertices.push(0, yTop, 0);  // Center top
        vertices.push(x1, yTop, z1); // Edge top 1
        vertices.push(x2, yTop, z2); // Edge top 2
        
        // Calculate normal for top face (pointing up)
        normalsArray.push(0, 1, 0);
        normalsArray.push(0, 1, 0);
        normalsArray.push(0, 1, 0);
        
        // Add bottom face vertices
        vertices.push(0, yBottom, 0);  // Center bottom
        vertices.push(x1, yBottom, z1); // Edge bottom 1
        vertices.push(x2, yBottom, z2); // Edge bottom 2
        
        // Calculate normal for bottom face (pointing down)
        normalsArray.push(0, -1, 0);
        normalsArray.push(0, -1, 0);
        normalsArray.push(0, -1, 0);
        
        // Add colors for all vertices (will be modulated by lighting)
        for (let j = 0; j < 6; j++) {
            colors.push(red, green, blue, 1.0);
        }
        
        // Add side face (rectangle between two edges)
        // First triangle
        const v1 = vec3(x1, yTop, z1);
        const v2 = vec3(x1, yBottom, z1);
        const v3 = vec3(x2, yBottom, z2);
        
        vertices.push(x1, yTop, z1);      // v1
        vertices.push(x1, yBottom, z1);   // v2
        vertices.push(x2, yBottom, z2);   // v3
        
        // Calculate side face normal by cross product
        const tangent1 = subtract(v2, v1);
        const tangent2 = subtract(v3, v1);
        const normal = normalize(cross(tangent1, tangent2));
        
        normalsArray.push(normal[0], normal[1], normal[2]);
        normalsArray.push(normal[0], normal[1], normal[2]);
        normalsArray.push(normal[0], normal[1], normal[2]);
        
        // Second triangle
        const v4 = vec3(x2, yTop, z2);
        
        vertices.push(x1, yTop, z1);      // v1
        vertices.push(x2, yBottom, z2);   // v3
        vertices.push(x2, yTop, z2);      // v4
        
        normalsArray.push(normal[0], normal[1], normal[2]);
        normalsArray.push(normal[0], normal[1], normal[2]);
        normalsArray.push(normal[0], normal[1], normal[2]);
        
        // Add colors for all vertices of the side face
        for (let j = 0; j < 6; j++) {
            colors.push(red, green, blue, 1.0);
        }
    }
    
    return vertices.length / 3; // Return number of vertices
}

function buildShadow(sides) {
    // Create a proper shadow projection of the cylinder
    let shadowVertices = [];
    let shadowNormals = [];
    let shadowColors = [];
    
    // Get light position
    const lightX = lightPosition[0];
    const lightY = lightPosition[1]; 
    const lightZ = lightPosition[2];
    
    // Set up parameters for the shadow (same as object)
    const objectRadius = 0.4;
    const height = 0.95;
    const objectTop = height/2;
    const objectBottom = -height/2;
    const objectCenterY = 0; // Center of the object in Y
    
    // Center of the object in xz plane
    const objectCenterX = 0;
    const objectCenterZ = 0;
    
    // Function to project a point (x,y,z) onto the ground plane based on light position
    function projectPointToGround(px, py, pz) {
        // Direction from light to vertex
        const dx = px - lightX;
        const dy = py - lightY;
        const dz = pz - lightZ;

        // Only project if the direction is downward (so shadow is cast onto the ground)
        if (Math.abs(dy) < 0.001) return null;

        // t for intersection with y = shadowY
        const t = (shadowY - lightY) / dy;
        if (t <= 0) return null; // Only project in the direction away from the light

        // Intersection point
        const shadowX = lightX + t * dx;
        const shadowZ = lightZ + t * dz;
        
        // After computing shadowX, shadowZ:
        const mirroredX = -shadowX;
        const mirroredZ = -shadowZ;
        return { x: mirroredX, z: mirroredZ };
    }
    
    // We'll fill the cylinder's shadow with triangles
    // First, project the center of the object to find shadow center
    const shadowCenter = projectPointToGround(objectCenterX, objectCenterY, objectCenterZ);
    
    // Draw the shadow as a proper projection
    for (let i = 0; i < sides; i++) {
        const angle = (i * 2 * Math.PI) / sides;
        const nextAngle = ((i+1) * 2 * Math.PI) / sides;
        
        // Calculate points on the cylinder's perimeter
        const x1 = objectRadius * Math.cos(angle);
        const z1 = objectRadius * Math.sin(angle);
        const x2 = objectRadius * Math.cos(nextAngle);
        const z2 = objectRadius * Math.sin(nextAngle);
        
        // Project perimeter points to the ground
        const topPoint1 = projectPointToGround(x1, objectTop, z1);
        const topPoint2 = projectPointToGround(x2, objectTop, z2);
        const bottomPoint1 = projectPointToGround(x1, objectBottom, z1);
        const bottomPoint2 = projectPointToGround(x2, objectBottom, z2);
        
        // Skip if any projection is null (would be cast upward)
        if (!topPoint1 || !topPoint2 || !bottomPoint1 || !bottomPoint2 || !shadowCenter) continue;
        
        // Use silhouette of cylinder for shadow
        // This gives us the edges that create the shadow shape
        
        // First triangle (from one edge to shadow center)
        shadowVertices.push(topPoint1.x, shadowY, topPoint1.z);
        shadowVertices.push(topPoint2.x, shadowY, topPoint2.z);
        shadowVertices.push(shadowCenter.x, shadowY, shadowCenter.z);
        
        // Add normals and colors for the first triangle
        for (let j = 0; j < 3; j++) {
            shadowNormals.push(0, 1, 0);
            shadowColors.push(0, 0, 0, 0.5); // Slightly darker shadow
        }
        
        // Additional triangles to create the full shadow
        // Connect the projected points of the cylinder edges
        shadowVertices.push(topPoint1.x, shadowY, topPoint1.z);
        shadowVertices.push(bottomPoint1.x, shadowY, bottomPoint1.z);
        shadowVertices.push(bottomPoint2.x, shadowY, bottomPoint2.z);
        
        shadowVertices.push(topPoint1.x, shadowY, topPoint1.z);
        shadowVertices.push(bottomPoint2.x, shadowY, bottomPoint2.z);
        shadowVertices.push(topPoint2.x, shadowY, topPoint2.z);
        
        // Add normals and colors for additional triangles
        for (let j = 0; j < 6; j++) {
            shadowNormals.push(0, 1, 0);
            shadowColors.push(0, 0, 0, 0.5);
        }
    }
    
    return {
        vertices: shadowVertices,
        normals: shadowNormals,
        colors: shadowColors,
        count: shadowVertices.length / 3
    };
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    // Update light position for animation
    updateLightPosition();
    
    // Set up lighting parameters
    const ambientProductLoc = gl.getUniformLocation(program, "ambientProduct");
    const diffuseProductLoc = gl.getUniformLocation(program, "diffuseProduct");
    const specularProductLoc = gl.getUniformLocation(program, "specularProduct");
    const shininessLoc = gl.getUniformLocation(program, "shininess");
    
    // Calculate lighting products
    const ambientProduct = mult(lightAmbient, materialAmbient);
    const diffuseProduct = mult(lightDiffuse, materialDiffuse);
    const specularProduct = mult(lightSpecular, materialSpecular);
    
    gl.uniform4fv(ambientProductLoc, flatten(ambientProduct));
    gl.uniform4fv(diffuseProductLoc, flatten(diffuseProduct));
    gl.uniform4fv(specularProductLoc, flatten(specularProduct));
    gl.uniform1f(shininessLoc, materialShininess);
    
    // Get current values from sliders
    const sides = parseInt(document.getElementById("sidesSlider").value);
    
    // Build the 3D object
    const numVertices = buildObject(sides);
    
    // Create and bind vertex buffer
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    
    const vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    
    // Create and bind normal buffer
    const normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalsArray), gl.STATIC_DRAW);
    
    const vNormal = gl.getAttribLocation(program, "vNormal");
    gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormal);
    
    // Create and bind color buffer
    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    
    const vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);
    
    // Draw the shape
    gl.drawArrays(gl.TRIANGLES, 0, numVertices);
    
    // Build and draw the shadow
    const shadow = buildShadow(sides);
    
    // Create and bind shadow vertex buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(shadow.vertices), gl.STATIC_DRAW);
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    
    // Create and bind shadow normal buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(shadow.normals), gl.STATIC_DRAW);
    gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
    
    // Create and bind shadow color buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(shadow.colors), gl.STATIC_DRAW);
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    
    // Turn off lighting for shadow (set products to shadow color)
    const shadowAmbient = vec4(0.0, 0.0, 0.0, 0.3);
    gl.uniform4fv(ambientProductLoc, flatten(shadowAmbient));
    gl.uniform4fv(diffuseProductLoc, flatten(vec4(0, 0, 0, 0)));
    gl.uniform4fv(specularProductLoc, flatten(vec4(0, 0, 0, 0)));
    
    // Draw the shadow with blending
    gl.drawArrays(gl.TRIANGLES, 0, shadow.count);
    
    // Restore original lighting products
    gl.uniform4fv(ambientProductLoc, flatten(ambientProduct));
    gl.uniform4fv(diffuseProductLoc, flatten(diffuseProduct));
    gl.uniform4fv(specularProductLoc, flatten(specularProduct));
}