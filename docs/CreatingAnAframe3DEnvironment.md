### Creating an Aframe environment

##### A) Modeling the environment
-Create a lightweight environment with as less triangles/polys as possible to have it running smoothly on low-end hardwares
-Can be modeled in any 3d software package. In this case Maya was used.
-Create basic materials with approximate colors (like a light brown for the floor) that can help with the light bakes with bounced lighting.

![01](https://imgur.com/5zMXDSL.jpg "01")
![02](https://imgur.com/aMc432c.jpg "02")

##### B) Light the environment

-Using a ray tracer render engine (in this case V-ray), light the environment using Domelight (which can use an HDRI for image based lighting), directional lights for sun, and additional rectangular lights for areas that need more illumination. 

![03](https://imgur.com/6SX1UTY.jpg "03")

##### C) Create Lightmap UVs 

-Need to create UVs for the surfaces that need to receive shadows. You can omit the surfaces that are self-illuminating like digital screens or light sources etc. as they don’t receive any shadows
-Combine all the objects that need need to share the lightmap texture. Lay out the UVs in a 0 to 1 UV space as follows. But keep all surface separate for using inside Aframe.

![04](https://imgur.com/W7aizuX.jpg "04")

##### D) Bake the lightmaps

-Using the combined geometry that have their UVs in 0 to 1 space, bake the lighting in a lightmap texture using the render engine. After the bake the lightmap should look like this.

![05](https://imgur.com/3paR9J6.jpg "05")

##### E) Create the Aframe materials

-Export the separated geometry in .obj files for each material that is needed, for e.g. If you two chairs share a same material they can be combined into a single .obj. But if a single chair has a metallic handle and a cloth back, then both those need to be separated into two .objs.
-Once you have the scene loaded with all the required objs, create the material properties inside Aframe html as needed.
-The geometries that were used for lightmap, will utilize the lightmap textures and the self-illuminating objects will disregard those. Once the materials are set, it should look something like this:

![06](https://imgur.com/Kr7IkvK.jpg "06")

##### F) Create Navmesh
-Navmesh is basically creating the walkable area for the player. So wherever the user is allowed to walk on, there needs to be a 3d model underneath it. Where you want the user to get blocked (like for a wall or desk), delete the 3d surface underneath it.
-If you want the player to go over stairs, have a slope around the stairs on which the player can go on top.

![07](https://imgur.com/jSOu3sN.jpg "07")

##### G) Customize Branding
-Additional meshes have been added for adding custom logos and desk colors. You can change the URLs to the images and they will be shown in the environment.

![08](https://imgur.com/VI7RdHK.jpg "08")

For eg. (URLs are dummy)
`<img id="DeskGradient" src="https://99designs-blog.imgix.net/Gradient_builder_2.jpg">`
`<img id="DeskLabels" src="https://upload.wikimedia.org/Facebook_Logo.png">`

And they would look like this:

![09](https://imgur.com/fgKYDl5.jpg "09")

Note:

1) Due to the proportions of the desk, only the center portion of the gradient (or any other image) will be used. Rest won't be shown on the desk.

![10](https://imgur.com/272NfjL.jpg "10")

2) The logo needs to be in a square transparent png (the actual logo can be any proportion, but needs to have transparency padding around it to make it square). This is to avoid the stretching on non-square logos as the 3d model is square.

![11](https://imgur.com/bX8clZl.jpg "11")