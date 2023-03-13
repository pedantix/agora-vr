AFRAME.registerComponent('canvas-to-text', {
    dependencies: ['geometry', 'material'],
    schema: {
        string: {default: ''},
        preferedFontSize: {default: 50},
        truncate: {default: false},
        truncateEnding: {default: '...'},
        fontFamily: {default: 'Arial'},
        fontColor: {default: '#ff0000'},
        fontStyle: {default: 'normal'},
        fontWeight: {default: 'normal'},
        textAlign: {default: 'center'},
        textVAlign: {default: 'middle'},
        width: {default: 2},
        height: {default: 0.5},
        fill: {default: true},
        strokeWidth: {default: 2},
        shadow: {default: false},
        shadowXoff: {default: 3},
        shadowYoff: {default: 3},
        shadowColor: {default: '#ffffff'},
        shadowBlur: {default: 0},
        canvasRatio: {default: 250}
    },
    init: function () {
    },
    update: function (olddata) {
        el = this.el;
        data = this.data;
        if (!el.txtcanvas) {
            el.setAttribute('width',data.width);
            el.setAttribute('height',data.height);
            let canv = document.createElement('canvas');
            canv.style.display="none";
            document.body.appendChild(canv);
            canv.id = el.id+'_canvForWrappedText';
            canv.width = el.getAttribute('width')*data.canvasRatio;
            canv.height = el.getAttribute('height')*data.canvasRatio;
            el.txtcanvas = canv;
            setTimeout(() => {this.drawtext();}, 50);
        } else {
            if (data.width !== olddata.width || data.height !== olddata.height) {
                el.setAttribute('width',data.width);
                el.setAttribute('height',data.height);
            }
            el.getObject3D('mesh').material.dispose();
            document.getElementById(el.id+"_canvForWrappedText").width = el.getAttribute('width')*data.canvasRatio;
            document.getElementById(el.id+"_canvForWrappedText").height = el.getAttribute('height')*data.canvasRatio;
            this.drawtext();
        }
    },
    drawtext: function () {
        data = this.data;
        el = this.el;
        let ctx = el.txtcanvas.getContext("2d");
        ctx.fillStyle = data.fontColor;
        ctx.strokeStyle = data.fontColor;
        ctx.lineWidth = data.strokeWidth;
        if (data.shadow) {
            ctx.shadowOffsetX = data.shadowXoff;
            ctx.shadowOffsetY = data.shadowYoff;
            ctx.shadowColor = data.shadowColor;
            ctx.shadowBlur = data.shadowBlur;
        }

        canvasTxtTest.font = data.fontFamily
        canvasTxtTest.fontSize = data.preferedFontSize
        canvasTxtTest.fontStyle = data.fontStyle
        canvasTxtTest.fontWeight = data.fontWeight
        canvasTxtTest.align = data.textAlign
        canvasTxtTest.vAlign = data.textVAlign
        // canvasTxtTest.debug = true //shows debug info
        canvasTxtTest.justify = false
        let doesFit = canvasTxtTest.drawText(ctx, data.string, 0, 0, el.txtcanvas.width, el.txtcanvas.height*0.7);
        // console.log(doesFit.height);
        if (doesFit.height > el.txtcanvas.height) {
            if (!data.truncate) {
                data.preferedFontSize-=2;
                this.drawtext();
            } else {
                let truncateLength = 4;
                if (data.truncateEnding.length > 0) {
                    truncateLength = data.truncateEnding.length*2;
                }
                data.string = data.string.substring(0,data.string.length-truncateLength);
                data.string = data.string+data.truncateEnding;
                this.drawtext();
            }
        } else {
            canvasTxt.font = data.fontFamily
            canvasTxt.fontSize = data.preferedFontSize
            canvasTxt.fontStyle = data.fontStyle
            canvasTxt.fontWeight = data.fontWeight
            canvasTxt.align = data.textAlign
            canvasTxt.vAlign = data.textVAlign
            // canvasTxt.debug = true //shows debug info
            canvasTxt.justify = false
            canvasTxt.fill = data.fill
            canvasTxt.drawText(ctx, data.string, 0, 0, el.txtcanvas.width, el.txtcanvas.height*0.9);
            const ctexture = new THREE.CanvasTexture(ctx.canvas);
            const cmaterial = new THREE.MeshBasicMaterial({
                map: ctexture,
                transparent: true,
                alphaTest: 0.1,
                side: THREE.DoubleSide
            });
            el.getObject3D('mesh').material = cmaterial;
        }
    },
    remove: function () {
        data = this.data;
        el = this.el;
        ///remove canvas
        document.getElementById(el.id+'_canvForText').remove();
    }
});

// Hair space character for precise justification
const SPACE = '\u200a'

const canvasTxt = {
  debug: false,
  align: 'center',
  vAlign: 'middle',
  fontSize: 14,
  fontWeight: '',
  fontStyle: '',
  fontVariant: '',
  font: 'Arial',
  lineHeight: null,
  justify: false,
  fill: true,
  /**
   *
   * @param {CanvasRenderingContext2D} ctx
   * @param {string} mytext
   * @param {number} x
   * @param {number} y
   * @param {number} width
   * @param {number} height
   */
  drawText: function(ctx, mytext, x, y, width, height) {
    // Parse all to integers
    ;[x, y, width, height] = [x, y, width, height].map(el => parseInt(el))

    if (width <= 0 || height <= 0 || this.fontSize <= 0) {
      //width or height or font size cannot be 0
      return
    }

    // End points
    const xEnd = x + width
    const yEnd = y + height

    const { fontStyle, fontVariant, fontWeight, fontSize, font } = this
    const style = `${fontStyle} ${fontVariant} ${fontWeight} ${fontSize}px ${font}`
    ctx.font = style

    let txtY = y + height / 2 + parseInt(this.fontSize) / 2

    let textanchor

    if (this.align === 'right') {
      textanchor = xEnd
      ctx.textAlign = 'right'
    } else if (this.align === 'left') {
      textanchor = x;
      ctx.textAlign = 'left'
    } else {
      textanchor = x + width / 2
      ctx.textAlign = 'center'
    }

    //added one-line only auto linebreak feature
    let textarray = []
    let temptextarray = mytext.split('\n')

    const spaceWidth = this.justify ? ctx.measureText(SPACE).width : 0

    temptextarray.forEach(txtt => {
      let textwidth = ctx.measureText(txtt).width
      if (textwidth <= width) {
        textarray.push(txtt)
      } else {
        let temptext = txtt
        let linelen = width
        let textlen
        let textpixlen
        let texttoprint
        textwidth = ctx.measureText(temptext).width
        while (textwidth > linelen) {
          textlen = 0
          textpixlen = 0
          texttoprint = ''
          while (textpixlen < linelen) {
            textlen++
            texttoprint = temptext.substr(0, textlen)
            textpixlen = ctx.measureText(temptext.substr(0, textlen)).width
          }
          // Remove last character that was out of the box
          textlen--
          texttoprint = texttoprint.substr(0, textlen)
          //if statement ensures a new line only happens at a space, and not amidst a word
          const backup = textlen
          if (temptext.substr(textlen, 1) != ' ') {
            while (temptext.substr(textlen, 1) != ' ' && textlen != 0) {
              textlen--
            }
            if (textlen == 0) {
              textlen = backup
            }
            texttoprint = temptext.substr(0, textlen)
          }

          texttoprint = this.justify
            ? this.justifyLine(ctx, texttoprint, spaceWidth, SPACE, width)
            : texttoprint

          temptext = temptext.substr(textlen)
          textwidth = ctx.measureText(temptext).width
          textarray.push(texttoprint)
        }
        if (textwidth > 0) {
          textarray.push(temptext)
        }
      }
    //   console.log(textarray.length); - Number of lines used.
      // end foreach temptextarray
    })
    const charHeight = this.lineHeight
      ? this.lineHeight
      : this.getTextHeight(ctx, mytext, style) //close approximation of height with width
    const vheight = charHeight * (textarray.length - 1)
    const negoffset = vheight / 2

    let debugY = y
    // Vertical Align
    if (this.vAlign === 'top') {
      txtY = y + this.fontSize
    } else if (this.vAlign === 'bottom') {
      txtY = yEnd - vheight
      debugY = yEnd
    } else {
      //defaults to center
      debugY = y + height / 2
      txtY -= negoffset
    }
    //print all lines of text
    textarray.forEach(txtline => {
      txtline = txtline.trim()
    //   if (txtY < 0) {
    //     console.log('Not fitting top!');
    //   }
      if (this.fill) {
        ctx.fillText(txtline, textanchor, txtY)
      } else {
        ctx.strokeText(txtline, textanchor, txtY)
      }
      txtY += charHeight
    //   console.log({txtY});
    //   if (txtY > 250) {
    //     console.log('Not fitting bottom!');
    //   }
    })

    if (this.debug) {
      // Text box
      ctx.lineWidth = 3
      ctx.strokeStyle = '#00909e'
      ctx.strokeRect(x, y, width, height)

      ctx.lineWidth = 2
      // Horizontal Center
      ctx.strokeStyle = '#f6d743'
      ctx.beginPath()
      ctx.moveTo(textanchor, y)
      ctx.lineTo(textanchor, yEnd)
      ctx.stroke()
      // Vertical Center
      ctx.strokeStyle = '#ff6363'
      ctx.beginPath()
      ctx.moveTo(x, debugY)
      ctx.lineTo(xEnd, debugY)
      ctx.stroke()
    }

    const TEXT_HEIGHT = vheight + charHeight

    return { height: TEXT_HEIGHT }
  },
  // Calculate Height of the font
  getTextHeight: function(ctx, text, style) {
    const previousTextBaseline = ctx.textBaseline
    const previousFont = ctx.font

    ctx.textBaseline = 'bottom'
    ctx.font = style
    
    const { actualBoundingBoxAscent: height } = ctx.measureText(text)

    // Reset baseline
    ctx.textBaseline = previousTextBaseline
    ctx.font = previousFont

    return height
  },
  /**
   * This function will insert spaces between words in a line in order
   * to raise the line width to the box width.
   * The spaces are evenly spread in the line, and extra spaces (if any) are inserted
   * between the first words.
   *
   * It returns the justified text.
   *
   * @param {CanvasRenderingContext2D} ctx
   * @param {string} line
   * @param {number} spaceWidth
   * @param {string} spaceChar
   * @param {number} width
   */
  justifyLine: function(ctx, line, spaceWidth, spaceChar, width) {
    const text = line.trim()

    const lineWidth = ctx.measureText(text).width

    const nbSpaces = text.split(/\s+/).length - 1
    const nbSpacesToInsert = Math.floor((width - lineWidth) / spaceWidth)

    if (nbSpaces <= 0 || nbSpacesToInsert <= 0) return text

    // We insert at least nbSpacesMinimum and we add extraSpaces to the first words
    const nbSpacesMinimum = Math.floor(nbSpacesToInsert / nbSpaces)
    let extraSpaces = nbSpacesToInsert - nbSpaces * nbSpacesMinimum

    let spaces = []
    for (let i = 0; i < nbSpacesMinimum; i++) {
      spaces.push(spaceChar)
    }
    spaces = spaces.join('')

    const justifiedText = text.replace(/\s+/g, match => {
      const allSpaces = extraSpaces > 0 ? spaces + spaceChar : spaces
      extraSpaces--
      return match + allSpaces
    })

    return justifiedText
  }
}

const canvasTxtTest = {
  align: 'center',
  vAlign: 'middle',
  fontSize: 14,
  fontWeight: '',
  fontStyle: '',
  fontVariant: '',
  font: 'Arial',
  lineHeight: null,
  justify: false,
  /**
   *
   * @param {CanvasRenderingContext2D} ctx
   * @param {string} mytext
   * @param {number} x
   * @param {number} y
   * @param {number} width
   * @param {number} height
   */
  drawText: function(ctx, mytext, x, y, width, height) {
    // Parse all to integers
    ;[x, y, width, height] = [x, y, width, height].map(el => parseInt(el))
    if (width <= 0 || height <= 0 || this.fontSize <= 0) {
      return
    }
    const xEnd = x + width
    const yEnd = y + height
    const { fontStyle, fontVariant, fontWeight, fontSize, font } = this
    const style = `${fontStyle} ${fontVariant} ${fontWeight} ${fontSize}px ${font}`
    ctx.font = style
    let txtY = y + height / 2 + parseInt(this.fontSize) / 2
    let textanchor
    if (this.align === 'right') {
      textanchor = xEnd
      ctx.textAlign = 'right'
    } else if (this.align === 'left') {
      textanchor = x
      ctx.textAlign = 'left'
    } else {
      textanchor = x + width / 2
      ctx.textAlign = 'center'
    }
    let textarray = []
    let temptextarray = mytext.split('\n')
    const spaceWidth = this.justify ? ctx.measureText(SPACE).width : 0
    temptextarray.forEach(txtt => {
      let textwidth = ctx.measureText(txtt).width
      if (textwidth <= width) {
        textarray.push(txtt)
      } else {
        let temptext = txtt
        let linelen = width
        let textlen
        let textpixlen
        let texttoprint
        textwidth = ctx.measureText(temptext).width
        while (textwidth > linelen) {
          textlen = 0
          textpixlen = 0
          texttoprint = ''
          while (textpixlen < linelen) {
            textlen++
            texttoprint = temptext.substr(0, textlen)
            textpixlen = ctx.measureText(temptext.substr(0, textlen)).width
          }
          // Remove last character that was out of the box
          textlen--
          texttoprint = texttoprint.substr(0, textlen)
          //if statement ensures a new line only happens at a space, and not amidst a word
          const backup = textlen
          if (temptext.substr(textlen, 1) != ' ') {
            while (temptext.substr(textlen, 1) != ' ' && textlen != 0) {
              textlen--
            }
            if (textlen == 0) {
              textlen = backup
            }
            texttoprint = temptext.substr(0, textlen)
          }
          texttoprint = this.justify
            ? this.justifyLine(ctx, texttoprint, spaceWidth, SPACE, width)
            : texttoprint

          temptext = temptext.substr(textlen)
          textwidth = ctx.measureText(temptext).width
          textarray.push(texttoprint)
        }
        if (textwidth > 0) {
          textarray.push(temptext)
        }
      }
    })
    const charHeight = this.lineHeight
      ? this.lineHeight
      : this.getTextHeight(ctx, mytext, style) //close approximation of height with width
    const vheight = charHeight * (textarray.length - 1)
    const negoffset = vheight / 2
    // Vertical Align
    if (this.vAlign === 'top') {
      txtY = y + this.fontSize
    } else if (this.vAlign === 'bottom') {
      txtY = yEnd - vheight
    } else {
      txtY -= negoffset
    }
    //print all lines of text
    textarray.forEach(txtline => {
      txtline = txtline.trim()
      txtY += charHeight
    })
    const TEXT_HEIGHT = vheight + charHeight
    return { height: TEXT_HEIGHT }
  },
  // Calculate Height of the font
  getTextHeight: function(ctx, text, style) {
    const previousTextBaseline = ctx.textBaseline
    const previousFont = ctx.font
    ctx.textBaseline = 'bottom'
    ctx.font = style
    const { actualBoundingBoxAscent: height } = ctx.measureText(text)
    // Reset baseline
    ctx.textBaseline = previousTextBaseline
    ctx.font = previousFont
    let plusHeight = height*1.1; // Adding a bit a low serif fonts!!
    return plusHeight
  },
  /**
   * This function will insert spaces between words in a line in order
   * to raise the line width to the box width.
   * The spaces are evenly spread in the line, and extra spaces (if any) are inserted
   * between the first words.
   *
   * It returns the justified text.
   *
   * @param {CanvasRenderingContext2D} ctx
   * @param {string} line
   * @param {number} spaceWidth
   * @param {string} spaceChar
   * @param {number} width
   */
  justifyLine: function(ctx, line, spaceWidth, spaceChar, width) {
    const text = line.trim()
    const lineWidth = ctx.measureText(text).width
    const nbSpaces = text.split(/\s+/).length - 1
    const nbSpacesToInsert = Math.floor((width - lineWidth) / spaceWidth)
    if (nbSpaces <= 0 || nbSpacesToInsert <= 0) return text
    // We insert at least nbSpacesMinimum and we add extraSpaces to the first words
    const nbSpacesMinimum = Math.floor(nbSpacesToInsert / nbSpaces)
    let extraSpaces = nbSpacesToInsert - nbSpaces * nbSpacesMinimum
    let spaces = []
    for (let i = 0; i < nbSpacesMinimum; i++) {
      spaces.push(spaceChar)
    }
    spaces = spaces.join('')
    const justifiedText = text.replace(/\s+/g, match => {
      const allSpaces = extraSpaces > 0 ? spaces + spaceChar : spaces
      extraSpaces--
      return match + allSpaces
    })
    return justifiedText
  }
}







AFRAME.registerComponent('rounded', {
      schema: {
        enabled: {default: true},
        width: {type: 'number', default: 1},
        height: {type: 'number', default: 1},
        radius: {type: 'number', default: 0.3},
        topLeftRadius: {type: 'number', default: -1},
        topRightRadius: {type: 'number', default: -1},
        bottomLeftRadius: {type: 'number', default: -1},
        bottomRightRadius: {type: 'number', default: -1},
        color: {type: 'color', default: "#F0F0F0"},
        opacity: {type: 'number', default: 1}
      },
      init: function () {
        this.rounded = new THREE.Mesh( this.draw(), new THREE.MeshBasicMaterial( { color: new THREE.Color(this.data.color), side: THREE.DoubleSide } ) );
        this.updateOpacity();
        this.el.setObject3D('mesh', this.rounded)
      },
      update: function () {
        if (this.data.enabled) {
          if (this.rounded) {
            this.rounded.visible = true;
            this.rounded.geometry = this.draw();
            this.rounded.material.color = new THREE.Color(this.data.color);
            this.updateOpacity();
          }
        } else {
          this.rounded.visible = false;
        }
      },
      updateOpacity: function() {
        if (this.data.opacity < 0) { this.data.opacity = 0; }
        if (this.data.opacity > 1) { this.data.opacity = 1; }
        if (this.data.opacity < 1) {
          this.rounded.material.transparent = true;
        } else {
          this.rounded.material.transparent = false;
        }
        this.rounded.material.opacity = this.data.opacity;
      },
      tick: function () {},
      remove: function () {
        if (!this.rounded) { return; }
        this.el.object3D.remove( this.rounded );
        this.rounded = null;
      },
      draw: function() {
        var roundedRectShape = new THREE.Shape();
        function roundedRect( ctx, x, y, width, height, topLeftRadius, topRightRadius, bottomLeftRadius, bottomRightRadius ) {
          if (!topLeftRadius) { topLeftRadius = 0.00001; }
          if (!topRightRadius) { topRightRadius = 0.00001; }
          if (!bottomLeftRadius) { bottomLeftRadius = 0.00001; }
          if (!bottomRightRadius) { bottomRightRadius = 0.00001; }
          ctx.moveTo( x, y + topLeftRadius );
          ctx.lineTo( x, y + height - topLeftRadius );
          ctx.quadraticCurveTo( x, y + height, x + topLeftRadius, y + height );
          ctx.lineTo( x + width - topRightRadius, y + height );
          ctx.quadraticCurveTo( x + width, y + height, x + width, y + height - topRightRadius );
          ctx.lineTo( x + width, y + bottomRightRadius );
          ctx.quadraticCurveTo( x + width, y, x + width - bottomRightRadius, y );
          ctx.lineTo( x + bottomLeftRadius, y );
          ctx.quadraticCurveTo( x, y, x, y + bottomLeftRadius );
        }

        var corners = [this.data.radius, this.data.radius, this.data.radius, this.data.radius];
        if (this.data.topLeftRadius != -1) { corners[0] = this.data.topLeftRadius; }
        if (this.data.topRightRadius != -1) { corners[1] = this.data.topRightRadius; }
        if (this.data.bottomLeftRadius != -1) { corners[2] = this.data.bottomLeftRadius; }
        if (this.data.bottomRightRadius != -1) { corners[3] = this.data.bottomRightRadius; }

        roundedRect( roundedRectShape, 0, 0, this.data.width, this.data.height, corners[0], corners[1], corners[2], corners[3] );
        return new THREE.ShapeBufferGeometry( roundedRectShape );
      },
      pause: function () {},
      play: function () {}
});

AFRAME.registerPrimitive('a-rounded', {
  defaultComponents: {
    rounded: {}
  },
  mappings: {
    enabled: 'rounded.enabled',
    width: 'rounded.width',
    height: 'rounded.height',
    radius: 'rounded.radius',
    'top-left-radius': 'rounded.topLeftRadius',
    'top-right-radius': 'rounded.topRightRadius',
    'bottom-left-radius': 'rounded.bottomLeftRadius',
    'bottom-right-radius': 'rounded.bottomRightRadius',
    color: 'rounded.color',
    opacity: 'rounded.opacity'
  }
});






//// LookAt component modified to rotate only the object Y axis

var debug = AFRAME.utils.debug;
var coordinates = AFRAME.utils.coordinates;

var warn = debug('components:look-at:warn');
var isCoordinates = coordinates.isCoordinates || coordinates.isCoordinate;


AFRAME.registerComponent('look-at-modified', {
    schema: {
      default: '',

      parse(value) {
        // A static position to look at.
        if (isCoordinates(value) || typeof value === 'object') {
          return coordinates.parse(value)
        }
        // A selector to a target entity.
        return value
      },

      stringify(data) {
        if (typeof data === 'object') {
          return coordinates.stringify(data)
        }
        return data
      },
    },

    init() {
      this.target3D = null
      this.vector = new THREE.Vector3()
    },


    update() {
      const self = this
      const target = self.data
      const {object3D} = self.el
      let targetEl

      // No longer looking at anything (i.e., look-at="").
      if (!target || (typeof target === 'object' && !Object.keys(target).length)) {
        return self.remove()
      }

      // Look at a position.
      if (typeof target === 'object') {
        return object3D.lookAt(new THREE.Vector3(target.x, target.y, target.z))
      }

      // Assume target is a string.
      // Query for the element, grab its object3D, then register a behavior on the scene to
      // track the target on every tick.
      targetEl = self.el.sceneEl.querySelector(target)
      if (!targetEl) {
        warn(`"${target}" does not point to a valid entity to look-at`)
        return
      }
      if (!targetEl.hasLoaded) {
        return targetEl.addEventListener('loaded', () => {
          self.beginTracking(targetEl)
        })
      }
      return self.beginTracking(targetEl)
    },

    tick: (function () {
      const vec3 = new THREE.Vector3()

      return function (t) {
        // Track target object position. Depends on parent object keeping global transforms up
        // to state with updateMatrixWorld(). In practice, this is handled by the renderer.
        let target
        const {target3D} = this
        const {object3D} = this.el
        let {vector} = this

        if (target3D) {
          target3D.getWorldPosition(vec3)
          if (this.el.getObject3D('camera')) {
            // Flip the vector to -z, looking away from target for camera entities. When using
            // lookat from THREE camera objects, this is applied for you, but since the camera is
            // nested into a Object3D, we need to apply this manually.
            // vector.subVectors(object3D.position, vec3).add(object3D.position);
          } else {
            vector = vec3
          }
          
            //let angle = Math.Atan2((vec3.position.x - object3D.position.x), object3D.position.z - vec3.position.z) * 180 / Math.PI;

          object3D.lookAt(vector.x, 1.835, vector.z);
        }
      }
    }()),

    beginTracking(targetEl) {
      this.target3D = targetEl.object3D
    },
});


AFRAME.registerComponent('load-animations', {
    schema: {
        animationFile: {default: ''},
    },
    init: function () {

      this.el.addEventListener("model-loaded", evt => {
        
        this.data.mixer = new THREE.AnimationMixer(this.el.components['gltf-model'].model.children[0]);
        let mixer = this.data.mixer;
        window.mixer = mixer;

        const gltf_loader = new THREE.GLTFLoader();
        gltf_loader.load( 
          this.data.animationFile, function ( gltf ) {

            
            
            gltf.animations.map(function (e, i) {
              actions.push({ 
                name: gltf.animations[i].name, 
                action:mixer.clipAction(gltf.animations[i])
              });
            });
            
            window.actions = actions;
            console.log( "========================= Avatar animations loaded", actions);

            this.el.parentNode.parentNode.setAttribute("player-info","");
            console.log(this.el.parentNode.parentNode)

            /// idle animation
            switchAction(actions[0].name, this.el);

          });
      })

    },
    tick: function tick(t, dt) {
      if (this.data.mixer && !isNaN(dt)) {
        this.data.mixer.update(dt / 1000);
      };
    }
});


AFRAME.registerComponent('player-info', {
  schema: {
    clip: { type: 'string', default:  "idle" },
    direction: { type: 'string', default:  "up" },
    name: { type: 'string', default: "user-" + Math.round(Math.random()*10000) },
    color: { type: 'string', default: '#' + new THREE.Color( Math.random(), Math.random(), Math.random() ).getHexString() },
  },

  init: function() {
    this.head = this.el.querySelector('.head');
    this.nametag = this.el.querySelector('.nametag');
    this.character = this.el.querySelector('.human-avatar');

    this.ownedByLocalUser = this.el.id === "player";
    if (this.ownedByLocalUser) {
      this.nametagInput = document.getElementById("displayNameInput");
      this.nametagInput.value = this.data.name;
    }
  },

  listUsers: function() {
    console.log("userlist", [...document.querySelectorAll('[player-info]')].map(el => el.components['player-info'].data.name));
  },

  update: function(oldData) {
    this.character = this.el.querySelector('.human-avatar');

    if (this.head) this.head.setAttribute('material', 'color', this.data.color);
    if (this.nametag) this.nametag.setAttribute('value', this.data.name);
    if (this.character) {
      
      if (oldData.clip !== this.data.clip) {
        // this.character.setAttribute('animation-mixer', {clip: this.data.clip, crossFadeDuration: 1});
        // console.log(this.character)
        switchAction(this.data.clip, this.character);
      }
      if (oldData.direction !== this.data.direction) {
        console.log(this.data.direction)
        switch (this.data.direction) {
          case "left":
            this.character.setAttribute("rotation", "0 -90 0");
            break;

          case "up":
            this.character.setAttribute("rotation", "0 180 0");
            break;

          case "right":
            this.character.setAttribute("rotation", "0 90 0");
            break;

          case "down":
            this.character.setAttribute("rotation", "0 0 0");
            break;
        }
      }
    }
  }
});


AFRAME.registerComponent('fix-avatar-rotation', {
    schema: {
        enabled: {default: true},
        x: {default: false},
        y: {default: true},
        z: {default: false},
    },
    init: function () {
    },
    tick: function tick(t, dt) {
      // console.log(document.getElementById(this.data.elSource))
      if (this.data.enabled && this.data.elSource) {
        this.el.setAttribute('rotation', document.getElementById(this.data.elSource).getAttribute('rotation'));
      }
    }
});