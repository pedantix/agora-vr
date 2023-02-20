// Append GLSL to the end of the main routine
function appendMain(shader, code) {
    const lastIndex = shader.lastIndexOf("}");
    code += "\n}";
    return (
      shader.slice(0, lastIndex) + code + shader.slice(lastIndex + code.length)
    );
  }
  
  // Inject our content into an existing material
  function injectShader(shader) {
    const framentUniforms =
      ["uniform float contrast;", "uniform float deltaTime;"].join("\n") + "\n";
    const fragmentMain =
      [
        "vec3 c = vec3(gl_FragColor.rgb);",  
        "vec3 unlitColor = (clamp(texture2D(map, vUv).rgb - vec3(1.0 - 0.85), 0.0, 1.0)) * 1.0 / 0.85;",
        "vec3 col = (clamp(c - vec3(1.0 - contrast), 0.0, 1.0)) * 1.0 / contrast;",
        "col = mix(col, unlitColor, 0.4);",
        "gl_FragColor = vec4(col, 1.0);",
      ].join("\n") + "\n";
    shader.fragmentShader = framentUniforms + shader.fragmentShader;
    shader.fragmentShader = appendMain(shader.fragmentShader, fragmentMain);
  }
  
  // Update an existing THREE.js material with support for the contrast property 
  function decorateMaterial(material, uniforms = {}, callback = () => {}) {
    material.onBeforeCompile = (shader, renderer) => {
      Object.assign(uniforms, shader.uniforms);
      shader.uniforms = uniforms;
      callback(shader, renderer);
    };
    return {
      material,
      uniforms,
    };
  }


     const hologramEl = document.getElementById("hologram");
      hologramEl.addEventListener("oncanplay", () => {
        const hologram = hologramEl.components.hologram;

      let  eightiMaterial = decorateMaterial(
            new THREE.MeshBasicMaterial({
              color: new THREE.Color(0x99AAAA),
              map: hologram.map,
              transparent: true,
              emissiveIntensity: 0.3,
              opacity: 1.0,
            }),
            { contrast: new THREE.Uniform(0.55) },
            injectShader
          );
/*
        let eightiMaterial = decorateMaterial(
        new THREE.MeshStandardMaterial({
            flatShading: false,
            metalness: 0.0,
            shininess: 0.3,
            roughness: 1.0,
            map: hologram.map,
            transparent: true,
            emissiveIntensity: 0.3,
            opacity: 1.0,
        }),
        { contrast: new THREE.Uniform(0.5) },
        injectShader
        );
  */              
        hologram.material = eightiMaterial.material;
        hologram.play()
      });
  