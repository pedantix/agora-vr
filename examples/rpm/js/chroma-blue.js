(() => {
    if ("undefined" == typeof AFRAME) throw new Error("Component attempted to register before AFRAME was available.");
    AFRAME.registerShader("chromakey", {
        schema: { 
        	src: { type: "map" }, 
        	color: { default: { x: .01, y: .01, z: .99 }, type: "vec3", is: "uniform" }, 
        	transparent: { default: true },
        	GreenThresholdIn : {default: 0.17},
        },
        init: function(e) {
            var r = new THREE.VideoTexture(e.src);
            r.format = THREE.RGBAFormat,
            this.uniforms = { 
            		color: { type: "c", value: e.color }, 
            		myTexture: { type: "t", value: r },
            		GreenThresholdIn: {type: 'float', value: e.GreenThresholdIn}
            	},
            this.uniforms = THREE.UniformsUtils.merge([
                                                      this.uniforms,
                                                      THREE.UniformsLib['lights']
                                                    ]),
            this.material = new THREE.ShaderMaterial({ 
            	uniforms: this.uniforms, 
            	vertexShader: this.vertexShader, 
            	fragmentShader: this.fragmentShader })
        },
        update: function(e) { 
        	this.material.color = e.color, 
        	this.material.src = e.src, 
        	this.material.transparent = e.transparent,
        	this.material.side = THREE.DoubleSide
        },
        vertexShader: [
        "varying vec2 vUv;", 
        "void main(void)", 
        "{", 

		"vec4 worldPosition = modelViewMatrix * vec4( position, 1.0 );",
        "vec3 vWorldPosition = worldPosition.xyz;",
        "vUv = uv;",
        "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
        "}"
        ].join("\n"),
        fragmentShader: [
        "uniform sampler2D myTexture;", 
        "uniform vec3 color;", 
        "varying vec2 vUv;", 
        "uniform float GreenThresholdIn;",
        "void main(void)", 
        "{", 
        "vec2 uv = vUv;",
        "vec3 tColor = texture2D( myTexture, vUv ).rgb;", 
        "float a = (length(tColor - color) - 0.5) * 7.0;", 
        "gl_FragColor = vec4(tColor, a);",
		"if (gl_FragColor.a < 0.5) discard;",
        "}"
        ].join("\n")
    })
})();