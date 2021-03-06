/*
 * For maximum modularity, we place everything within a single function that
 * takes the canvas that it will need.
 */
((canvas) => {
    // Grab the WebGL rendering context.
    let gl = GLSLUtilities.getGL(canvas);
    if (!gl) {
        alert("No WebGL context found...sorry.");

        // No WebGL, no use going on...
        return;
    }

    // Set up settings that will not change.  This is not "canned" into a
    // utility function because these settings really can vary from program
    // to program.
    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    gl.viewport(0, 0, canvas.width, canvas.height);

    // This variable stores 3D model information. We inline it for now but will want to separate it later.
    let objectsToDraw = [
        // Calibration: x, y, and z axis indicators.
        {
            color: { r: 0.5, g: 0, b: 0 },
            vertices: [
                1.0, 0.0, 0.0,
                0.9, 0.1, 0.0,
                1.0, 0.0, 0.0,
                0.9, -0.1, 0.0,
                1.0, 0.0, 0.0,
                -1.0, 0.0, 0.0
            ],
            mode: gl.LINES
        },

        {
            color: { r: 0, g: 0.5, b: 0 },
            vertices: [
                0.0, 1.0, 0.0,
                -0.1, 0.9, 0.0,
                0.0, 1.0, 0.0,
                0.1, 0.9, 0.0,
                0.0, 1.0, 0.0,
                0.0, -1.0, 0.0
            ],
            mode: gl.LINES
        },

        {
            color: { r: 0, g: 0, b: 0.5 },
            vertices: [
                0.0, 0.0, 1.0,
                0.0, 0.1, 0.9,
                0.0, 0.0, 1.0,
                0.0, -0.1, 0.9,
                0.0, 0.0, 1.0,
                0.0, 0.0, -1.0
            ],
            mode: gl.LINES
        },

        // Three solid triangles.
        {
            color: { r: 1.0, g: 0, b: 1.0 },
            vertices: [].concat(
                [ 0.0, 0.0, 0.0 ],
                [ 0.5, 0.0, -0.75 ],
                [ 0.0, 0.5, 0.0 ]
            ),
            mode: gl.TRIANGLES
        },

        {
            color: { r: 1.0, g: 1.0, b: 0 },
            vertices: [].concat(
                [ 0.25, 0.0, -0.5 ],
                [ 0.75, 0.0, -0.5 ],
                [ 0.25, 0.5, -0.5 ]
            ),
            mode: gl.TRIANGLES
        },

        {
            color: { r: 0.0, g: 1.0, b: 1.0 },
            vertices: [].concat(
                [ -0.25, 0.0, 0.5 ],
                [ 0.5, 0.0, 0.5 ],
                [ -0.25, 0.5, 0.5 ]
            ),
            mode: gl.TRIANGLES
        },

        // A quadrilateral.
        {
            color: { r: 0.5, g: 0.5, b: 0.5 },
            vertices: [].concat(
                [ -1.0, -1.0, 0.75 ],
                [ -1.0, -0.1, -1.0 ],
                [ -0.1, -0.1, -1.0 ],
                [ -0.1, -1.0, 0.75 ]
            ),
            mode: gl.LINE_LOOP
        },

        // Shape library demonstration.
        {
            color: { r: 1, g: 0.5, b: 0 },
            vertices: Shapes.toRawLineArray(Shapes.icosahedron()),
            mode: gl.LINES
        }
    ];

    // Pass the vertices to WebGL.
    objectsToDraw.forEach((objectToDraw) => {
        objectToDraw.verticesBuffer = GLSLUtilities.initVertexBuffer(gl, objectToDraw.vertices);
    });

    // Initialize the shaders.
    let abort = false;
    let shaderProgram = GLSLUtilities.initSimpleShaderProgram(
        gl,
        $("#vertex-shader").text(),
        $("#fragment-shader").text(),

        // Very cursory error-checking here...
        (shader) => {
            abort = true;
            alert("Shader problem: " + gl.getShaderInfoLog(shader));
        },

        // Another simplistic error check: we don't even access the faulty
        // shader program.
        (shaderProgram) => {
            abort = true;
            alert("Could not link shaders...sorry.");
        }
    );

    // If the abort variable is true here, we can't continue.
    if (abort) {
        alert("Fatal errors encountered; we cannot continue.");
        return;
    }

    // All done --- tell WebGL to use the shader program from now on.
    gl.useProgram(shaderProgram);

    // Hold on to the important variables within the shaders.
    let vertexPosition = gl.getAttribLocation(shaderProgram, "vertexPosition");
    gl.enableVertexAttribArray(vertexPosition);

    /*
     * Displays an individual object.
     */
    let drawObject = (object) => {
        gl.uniform3f(gl.getUniformLocation(shaderProgram, "color"), object.color.r, object.color.g, object.color.b);
        gl.bindBuffer(gl.ARRAY_BUFFER, object.verticesBuffer);
        gl.vertexAttribPointer(vertexPosition, 3, gl.FLOAT, false, 0, 0);
        gl.drawArrays(object.mode, 0, object.vertices.length / 3);
    };

    /*
     * Displays the scene.
     */
    let drawScene = () => {
        // Clear the display.
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // Display the objects.
        objectsToDraw.forEach(drawObject);

        // All done.
        gl.flush();
    };

    // ...and finally, do the initial display.
    drawScene();

})(document.getElementById("hello-webgl"));
