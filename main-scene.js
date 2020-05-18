window.Assignment_Three_Scene = window.classes.Assignment_Three_Scene =
class Assignment_Three_Scene extends Scene_Component
  { constructor( context, control_box )     // The scene begins by requesting the camera, shapes, and materials it will need.
      { super(   context, control_box );    // First, include a secondary Scene that provides movement controls:
        if( !context.globals.has_controls   ) 
          context.register_scene_component( new Movement_Controls( context, control_box.parentElement.insertCell() ) ); 

        context.globals.graphics_state.camera_transform = Mat4.look_at( Vec.of( 0,10,20 ), Vec.of( 0,0,0 ), Vec.of( 0,1,0 ) );
        this.initial_camera_location = Mat4.inverse( context.globals.graphics_state.camera_transform );

        const r = context.width/context.height;
        context.globals.graphics_state.projection_transform = Mat4.perspective( Math.PI/4, r, .1, 1000 );

        const shapes = { torus:  new Torus( 15, 15 ),
                         torus2: new ( Torus.prototype.make_flat_shaded_version() )( 15, 15 ),
 
                                // TODO:  Fill in as many additional shape instances as needed in this key/value table.
                                //        (Requirement 1)
                         sphere1: new ( Subdivision_Sphere.prototype.make_flat_shaded_version() )(1),
                         sphere2: new ( Subdivision_Sphere.prototype.make_flat_shaded_version() )(2),
                         sphere3: new Subdivision_Sphere(3),
                         sphere4: new Subdivision_Sphere(4),
                         custom_torus: new Custom_Torus(10,10)
                       }
        this.submit_shapes( context, shapes );
                                     
                                     // Make some Material objects available to you:
        this.materials =
          { test:     context.get_instance( Phong_Shader ).material( Color.of( 1,1,0,1 ), { ambient:.2 } ),
            ring:     context.get_instance( Ring_Shader  ).material(),

                                // TODO:  Fill in as many additional material objects as needed in this key/value table.
                                //        (Requirement 1)
            max_amb: context.get_instance(Phong_Shader).material(Color.of(1,1,1,1),{ambient:1}),
            zero_amb: context.get_instance(Phong_Shader).material(Color.of(1,1,1,1),{ambient:0}),


          }

        this.lights = [ new Light( Vec.of( 5,-10,5,1 ), Color.of( 0, 1, 1, 1 ), 1000 ) ];
        this.attached = null
      }
    make_control_panel()            // Draw the scene's buttons, setup their actions and keyboard shortcuts, and monitor live measurements.
      { this.key_triggered_button( "View solar system",  [ "0" ], () => this.attached = () => this.initial_camera_location );
        this.new_line();
        this.key_triggered_button( "Attach to planet 1", [ "1" ], () => this.attached = () => this.planet_1 );
        this.key_triggered_button( "Attach to planet 2", [ "2" ], () => this.attached = () => this.planet_2 ); this.new_line();
        this.key_triggered_button( "Attach to planet 3", [ "3" ], () => this.attached = () => this.planet_3 );
        this.key_triggered_button( "Attach to planet 4", [ "4" ], () => this.attached = () => this.planet_4 ); this.new_line();
        this.key_triggered_button( "Attach to planet 5", [ "5" ], () => this.attached = () => this.planet_5 );
        this.key_triggered_button( "Attach to moon",     [ "m" ], () => this.attached = () => this.moon     );
      }
    display( graphics_state )
      { graphics_state.lights = this.lights;        // Use the lights stored in this.lights.
        const t = graphics_state.animation_time / 1000, dt = graphics_state.animation_delta_time / 1000;

        

        // TODO:  Fill in matrix operations and drawing code to draw the solar system scene (Requirements 2 and 3)
        
        const sun_cycle_period = 5.0
        const sun_cycle_midpoint = sun_cycle_period/2.0
        const sun_cycle_stage = 1 - Math.abs(((t+sun_cycle_period) % sun_cycle_period) - sun_cycle_midpoint)/sun_cycle_midpoint
        const MAX_SUN_RADIUS = 3
        const sun_radius = (MAX_SUN_RADIUS-1)*sun_cycle_stage+1
        const red_level = sun_cycle_stage
        const blue_level = 1 - red_level
        const sun_color = Color.of(red_level,0,blue_level,1)
        
        //graphics_state.lights.push( new Light( Vec.of( 0,0,0,1 ), sun_color, 10**sun_radius ));
        graphics_state.lights = [new Light( Vec.of( 0,0,0,1 ), sun_color, 10**(sun_radius))];

 
        //sun
        this.shapes.sphere4.draw(graphics_state, Mat4.scale([sun_radius,sun_radius,sun_radius]), this.materials.max_amb.override({color:sun_color}))

        //planets
        const INTERPLANET_DIST = 3
        const ORBIT_SLOWDOWN = 0.95
        const dTHETA = 1/2
        function planetary_rotation (mt)
        {
          return mt.times(Mat4.rotation(t,Vec.of(1,1,1)))
        }


        //icy_grey planet
        var orbit_frequency = 10 ** -1
        var orbit_radius = MAX_SUN_RADIUS+5
        var x = Math.cos(2*Math.PI*orbit_frequency*t) * orbit_radius
        var z = Math.sin(2*Math.PI*orbit_frequency*t) * orbit_radius
        const icy_grey = Color.of(0.2833, 0.319, 0.3976, 1)
        this.planet_1 = Mat4.translation([x,0,z])
        this.shapes.sphere2.draw(graphics_state, planetary_rotation(this.planet_1), this.materials.zero_amb.override({color:icy_grey, specularity:0}))

        //swampy_green_blue planet
        orbit_frequency = orbit_frequency * ORBIT_SLOWDOWN
        orbit_radius = orbit_radius+INTERPLANET_DIST
        x = Math.cos(2*Math.PI*orbit_frequency*t) * orbit_radius
        z = Math.sin(2*Math.PI*orbit_frequency*t) * orbit_radius
        const swampy_green_blue = Color.of(0.082, 0.467, 0.37, 1)
        var material_overrides;
        //apply Gouraud Shading on odd seconds
        if(Math.floor(t)%2)
          material_overrides= {color:swampy_green_blue, specularity : 1, diffusivity : 0.2}
        else
          material_overrides= {color:swampy_green_blue, specularity : 1, diffusivity : 0.2, gouraud:1}
        this.planet_2 = Mat4.translation([x,0,z])
        this.shapes.sphere3.draw(graphics_state, planetary_rotation(this.planet_2), this.materials.zero_amb.override(material_overrides))


        //muddy_brown_orange planet
        orbit_frequency = orbit_frequency * ORBIT_SLOWDOWN
        orbit_radius = orbit_radius+INTERPLANET_DIST
        const WOBBLE_FREQUENCY = 4 ** -1
        const WOBBLE_RADIUS = 1.5
        var x_wobble = Math.cos(2*Math.PI*WOBBLE_FREQUENCY*t) * Math.cos(2*Math.PI*WOBBLE_FREQUENCY*t) * WOBBLE_RADIUS
        var y_wobble = Math.cos(2*Math.PI*WOBBLE_FREQUENCY*t/2) * Math.cos(2*Math.PI*WOBBLE_FREQUENCY*t/2) * WOBBLE_RADIUS
        var z_wobble = Math.cos(2*Math.PI*WOBBLE_FREQUENCY*t/4) * Math.cos(2*Math.PI*WOBBLE_FREQUENCY*t/4) * WOBBLE_RADIUS
        x = Math.cos(2*Math.PI*orbit_frequency*t) * orbit_radius + x_wobble
        z = Math.sin(2*Math.PI*orbit_frequency*t) * orbit_radius + z_wobble
        const muddy_brown_orange = Color.of(0.73, 0.40, 0.16, 1)
        this.planet_3 = Mat4.translation([x,y_wobble,z])
        this.shapes.sphere4.draw(graphics_state, planetary_rotation(this.planet_3), this.materials.zero_amb.override({color:muddy_brown_orange, specularity:1}))
        this.shapes.torus.draw( graphics_state, this.planet_3.times(planetary_rotation(Mat4.identity())).times(Mat4.scale([1,1,0])), this.materials.ring);
      
      
        //soft_light_blue planet
        orbit_frequency = orbit_frequency * ORBIT_SLOWDOWN
        orbit_radius = orbit_radius+INTERPLANET_DIST
        x = Math.cos(2*Math.PI*orbit_frequency*t) * orbit_radius
        z = Math.sin(2*Math.PI*orbit_frequency*t) * orbit_radius
        const soft_light_blue = Color.of(.20, .20, 1, 1)
        this.planet_4 = Mat4.translation([x,0,z])
        this.shapes.sphere4.draw(graphics_state, planetary_rotation(this.planet_4), this.materials.zero_amb.override({color:soft_light_blue, specularity:0.8, smoothness : 100 }))

        //moon
        orbit_frequency = orbit_frequency * 2
        var moon_orbit_radius = 2
        const moon_scale = 0.75
        x = (Math.cos(2*Math.PI*orbit_frequency*t) * moon_orbit_radius) / moon_scale + x
        z = (Math.sin(2*Math.PI*orbit_frequency*t) * moon_orbit_radius) / moon_scale + z
        const emerald_green = Color.of(0, .40, .24, 1)
        this.moon = Mat4.translation([x,0,z]).times(Mat4.scale([moon_scale,moon_scale,moon_scale]))
        this.shapes.sphere1.draw(graphics_state, planetary_rotation(this.moon), this.materials.zero_amb.override({color:emerald_green, specularity:0.8, smoothness : 100 }))
  
        //extra credit planet
        orbit_frequency = orbit_frequency / 2 * ORBIT_SLOWDOWN
        orbit_radius = orbit_radius+INTERPLANET_DIST
        x = Math.cos(2*Math.PI*orbit_frequency*t) * orbit_radius
        z = Math.sin(2*Math.PI*orbit_frequency*t) * orbit_radius
        const light_grey = Color.of(0.83, 0.83, 0.83, 1)
        this.planet_5 = Mat4.translation([x,0,z])
        this.shapes.custom_torus.draw(graphics_state, planetary_rotation(this.planet_5), this.materials.zero_amb)
        
        //attach
        if(this.attached != null)
        {
          var new_camera_transform = Mat4.inverse(this.attached().times(Mat4.translation([0,0,+5])))
          graphics_state.camera_transform = new_camera_transform.map( (x,i) => Vec.from( graphics_state.camera_transform[i] ).mix( x, 0.1 ) )
        }
      }
  }


// Extra credit begins here (See TODO comments below):

window.Ring_Shader = window.classes.Ring_Shader =
class Ring_Shader extends Shader              // Subclasses of Shader each store and manage a complete GPU program.
{ material() { return { shader: this } }      // Materials here are minimal, without any settings.
  map_attribute_name_to_buffer_name( name )       // The shader will pull single entries out of the vertex arrays, by their data fields'
    {                                             // names.  Map those names onto the arrays we'll pull them from.  This determines
                                                  // which kinds of Shapes this Shader is compatible with.  Thanks to this function, 
                                                  // Vertex buffers in the GPU can get their pointers matched up with pointers to 
                                                  // attribute names in the GPU.  Shapes and Shaders can still be compatible even
                                                  // if some vertex data feilds are unused. 
      return { object_space_pos: "positions" }[ name ];      // Use a simple lookup table.
    }
    // Define how to synchronize our JavaScript's variables to the GPU's:
  update_GPU( g_state, model_transform, material, gpu = this.g_addrs, gl = this.gl )
      { const proj_camera = g_state.projection_transform.times( g_state.camera_transform );
                                                                                        // Send our matrices to the shader programs:
        gl.uniformMatrix4fv( gpu.model_transform_loc,             false, Mat.flatten_2D_to_1D( model_transform.transposed() ) );
        gl.uniformMatrix4fv( gpu.projection_camera_transform_loc, false, Mat.flatten_2D_to_1D(     proj_camera.transposed() ) );
      }
  shared_glsl_code()            // ********* SHARED CODE, INCLUDED IN BOTH SHADERS *********
    { return `precision mediump float;
              varying vec4 position;
              varying vec4 center;
      `;
    }
  vertex_glsl_code()           // ********* VERTEX SHADER *********
    { return `
        attribute vec3 object_space_pos;
        uniform mat4 model_transform;
        uniform mat4 projection_camera_transform;

        void main()
        { 
          //we want to color based on object_space_pos Not the camera transformed position
          center =  vec4(0,0,0,1.0);
          position = vec4(object_space_pos, 1.0);
          gl_Position = projection_camera_transform * model_transform * position;     // The vertex's final resting place (in NDCS).
        }`;                   // TODO:  Complete the main function of the vertex shader (Extra Credit Part II).

    }
  fragment_glsl_code()           // ********* FRAGMENT SHADER *********
    { return `
        void main()
        { 
            float d;
            bool color_on;
            d = distance(center,position);
            color_on = 0.8*sin(25.0*d)>0.5;
            if (color_on)
              gl_FragColor = vec4(0.73, 0.40, 0.16, 1.0);
            else
              gl_FragColor = vec4(0, 0, 0, 1.0);
            


        }`;                  // TODO:  Complete the main function of the fragment shader (Extra Credit Part II).
    } 
}

window.Grid_Sphere = window.classes.Grid_Sphere =
class Grid_Sphere extends Shape           // With lattitude / longitude divisions; this means singularities are at 
  { constructor( rows, columns, texture_range )             // the mesh's top and bottom.  Subdivision_Sphere is a better alternative.
      { super( "positions", "normals", "texture_coords" );
        

                      // TODO:  Complete the specification of a sphere with lattitude and longitude lines
                      //        (Extra Credit Part III)
      } }