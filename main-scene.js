window.Checkers_Scene = window.classes.Checkers_Scene =
class Checkers_Scene extends Scene_Component
  { constructor( context, control_box )     // The scene begins by requesting the camera, shapes, and materials it will need.
      { super(   context, control_box );    // First, include a secondary Scene that provides movement controls:
        if( !context.globals.has_controls   )
          context.register_scene_component( new Movement_Controls( context, control_box.parentElement.insertCell() ) );




        context.globals.graphics_state.camera_transform = Mat4.look_at( Vec.of( 0,100,20 ), Vec.of( 0,0,0 ), Vec.of( 0,1,0 ) );
        this.initial_camera_location = Mat4.inverse( context.globals.graphics_state.camera_transform );

        const r = context.width/context.height;
        context.globals.graphics_state.projection_transform = Mat4.perspective( Math.PI/4, r, .1, 1000 );

        const shapes = {
                         sphere1: new ( Subdivision_Sphere.prototype.make_flat_shaded_version() )(1),
                         sphere2: new ( Subdivision_Sphere.prototype.make_flat_shaded_version() )(2),
                         sphere3: new Subdivision_Sphere(3),
                         sphere4: new Subdivision_Sphere(4),
                         checker: new Checker_Peice(20,20),
                         frame  : new Shape_From_File("assets/frame.obj"),
                         tile   : new Square()
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
        this.attached = null;

        this.board_locations = [
                          [Vec.of(-28,0,-28,1), Vec.of(-20,0,-28,1), Vec.of(-12,0,-28,1), Vec.of(-4,0,-28,1), Vec.of(4,0,-28,1), Vec.of(12,0,-28,1), Vec.of(20,0,-28,1), Vec.of(28,0,-28,1)],
                          [Vec.of(-28,0,-20,1), Vec.of(-20,0,-20,1), Vec.of(-12,0,-20,1), Vec.of(-4,0,-20,1), Vec.of(4,0,-20,1), Vec.of(12,0,-20,1), Vec.of(20,0,-20,1), Vec.of(28,0,-20,1)],
                          [Vec.of(-28,0,-12,1), Vec.of(-20,0,-12,1), Vec.of(-12,0,-12,1), Vec.of(-4,0,-12,1), Vec.of(4,0,-12,1), Vec.of(12,0,-12,1), Vec.of(20,0,-12,1), Vec.of(28,0,-12,1)],
                          [Vec.of(-28,0,-4,1), Vec.of(-20,0,-4,1), Vec.of(-12,0,-4,1), Vec.of(-4,0,-4,1), Vec.of(4,0,-4,1), Vec.of(12,0,-4,1), Vec.of(20,0,-4,1), Vec.of(28,0,-4,1)],
                          [Vec.of(-28,0,4,1), Vec.of(-20,0,4,1), Vec.of(-12,0,4,1), Vec.of(-4,0,4,1), Vec.of(4,0,4,1), Vec.of(12,0,4,1), Vec.of(20,0,4,1), Vec.of(28,0,4,1)],
                          [Vec.of(-28,0,12,1), Vec.of(-20,0,12,1), Vec.of(-12,0,12,1), Vec.of(-4,0,12,1), Vec.of(4,0,12,1), Vec.of(12,0,12,1), Vec.of(20,0,12,1), Vec.of(28,0,12,1)],
                          [Vec.of(-28,0,20,1), Vec.of(-20,0,20,1), Vec.of(-12,0,20,1), Vec.of(-4,0,20,1), Vec.of(4,0,20,1), Vec.of(12,0,20,1), Vec.of(20,0,20,1), Vec.of(28,0,20,1)],
                          [Vec.of(-28,0,28,1), Vec.of(-20,0,28,1), Vec.of(-12,0,28,1), Vec.of(-4,0,28,1), Vec.of(4,0,28,1), Vec.of(12,0,28,1), Vec.of(20,0,28,1), Vec.of(28,0,28,1)]
                          ];


                          /*
                           -28,-20,-12,-4,  4 , 8 , 12, 28 :x  z:

                          [ 0 ,'b', 0 ,'b', 0 ,'b', 0, 'b'], -28
                          ['b', 0 ,'b', 0 ,'b', 0, 'b', 0 ], -20
                          [ 0 ,'b', 0 ,'b', 0 ,'b', 0, 'b'], -12
                          [ 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 ], -4
                          [ 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 ],  4
                          ['w', 0 ,'w', 0 ,'w', 0, 'w', 0 ],  12
                          [ 0 ,'w', 0 ,'w', 0 ,'w', 0, 'w'],  20
                          ['w', 0 ,'w', 0 ,'w', 0, 'w', 0 ]   28

                          //black color pieces (far-side of the board/computer)
                          Vec.of(-20,0,-12,1), Vec.of(-4,0,-12,1), Vec.of(12,0,-12,1), Vec.of(28,0,-12,1),
                          Vec.of(-28,0,-20,1),  Vec.of(-12,0,-20,1), Vec.of(4,0,-20,1), Vec.of(20,0,-20,1),
                          Vec.of(-20,0,-28,1), Vec.of(-4,0,-28,1), Vec.of(12,0,-28,1), Vec.of(28,0,-28,1),

                          //white color pieces (near-side of the board/player)
                          Vec.of(-28,0,28,1),  Vec.of(-12,0,28,1), Vec.of(4,0,28,1), Vec.of(20,0,28,1),
                          Vec.of(-20,0,20,1), Vec.of(-4,0,20,1), Vec.of(12,0,20,1), Vec.of(28,0,20,1),
                          Vec.of(-28,0,12,1),  Vec.of(-12,0,12,1), Vec.of(4,0,12,1), Vec.of(20,0,12,1)


                          */

        this.player_checkers = [
                          Vec.of(-28,0,28,1),  Vec.of(-12,0,28,1), Vec.of(4,0,28,1), Vec.of(20,0,28,1),
                          Vec.of(-20,0,20,1), Vec.of(-4,0,20,1), Vec.of(12,0,20,1), Vec.of(28,0,20,1),
                          Vec.of(-28,0,12,1),  Vec.of(-12,0,12,1), Vec.of(4,0,12,1), Vec.of(20,0,12,1)
                          ];

        this.checker_picker = new Pick_Checker(context, control_box.parentElement.insertCell(),this.player_checkers);
        this.g = new Game();
        context.register_scene_component(this.checker_picker);

        this.player_view = Mat4.rotation(-Math.PI/6.0,Vec.of(1,0,0)).times(Mat4.translation([0,10,100]))
        this.opponent_view = Mat4.rotation(Math.PI/6.0,Vec.of(1,0,0)).times(Mat4.translation([0,10,-100])).times(Mat4.rotation(Math.PI,Vec.of(0,1,0)))
      }

    make_control_panel()            // Draw the scene's buttons, setup their actions and keyboard shortcuts, and monitor live measurements.
    {
      this.key_triggered_button( "Top View",  [ "0" ], () => this.attached = () => this.initial_camera_location );
      this.new_line();
      this.key_triggered_button( "Player View",  [ "1" ], () => this.attached = () => this.player_view );
      this.new_line();
      this.key_triggered_button( "Opponent View",  [ "2" ], () => this.attached = () => this.opponent_view);
    }

    convert_to_row_col(coordinates){
      //takes vec2
      return Vec.of((coordinates[0] + 28)/8, (coordinates[1] + 28)/8);
    }
    display(graphics_state)
      { graphics_state.lights = this.lights;        // Use the lights stored in this.lights.
        const t = graphics_state.animation_time / 1000, dt = graphics_state.animation_delta_time / 1000;

        graphics_state.lights = [new Light( Vec.of(-10,0,0,1 ), Color.of(0,0,0,1), 10**5),
                         new Light( Vec.of(10,0,0,1 ), Color.of(0,0,0,1), 10**5),
                         new Light( Vec.of(0,-10,0,1 ), Color.of(0,0,0,1), 10**5),
                         new Light( Vec.of(0,10,0,1 ), Color.of(0,0,0,1), 10**5),
                         new Light( Vec.of(0,0,-10,1 ), Color.of(0,0,0,1), 10**5),
                         new Light( Vec.of(0,0,10,1 ), Color.of(0,0,0,1), 10**5),
                         ];


        const white_color = Color.of(.906,.725,.514,1)
        const black_color = Color.of(.396,.141,0,1)
        const wood_color  = Color.of(.251, .149, .110, 1)
        const white_board = Color.of(.849,.667,.569,1)
        const black_board = Color.of(.251, .149, .110, 1)


        var board = this.g.gameState;
        var valid_move = false;


        //get player move from checker picker
        if(this.checker_picker.move_checker){

          //round movement to most matching checker board square
          var player_move = Vec.of(this.checker_picker.move_checker[0], this.checker_picker.move_checker[1], this.checker_picker.move_checker[2]);
          player_move = player_move.plus(Vec.of(4, 0, 4));
          player_move = Vec.of(Math.round(player_move[0]/8) * 8, Math.round(player_move[1]/8) * 8, Math.round(player_move[2]/8) * 8);
          player_move = player_move.minus(Vec.of(4, 0, 4));

          let checker_piece_selected = this.checker_picker.move_checker[3];

          //if game is still active
          if(board){

            //pass player move to game
            var current_position = this.player_checkers[checker_piece_selected];
            if(current_position){
              var start = this.convert_to_row_col(Vec.of(current_position[0], current_position[2]));
              var dest = this.convert_to_row_col(Vec.of(player_move[0], player_move[2]));
              valid_move = this.g.player_move(start[1], start[0],dest[1],dest[0]);

            }
          }
        }

        board = this.g.gameState;
        var move_found = false;

          if(board){

            //get new positions from board
            var white_pieces = [];
            for(var i = 0; i < 8; i++){
              for(var j = 0; j < 8; j++){

                //white piece found
                if(board[i][j] == 'w' || board[i][j] == 'q'){

                  //if this is the piece that moved, set checker_piece_selected to the index in player_checkers
                  if(valid_move){

                    //set index of move_checker to new position
                    if(i == dest[1] && j == dest[0]){
                       this.checker_picker.move_checker[3] = white_pieces.length;
                       move_found = true;
                    }
                  }

                  if(this.checker_picker.last_clicked_checker > -1){
                    let clicked = this.checker_picker.last_clicked_checker;
                    let clicked_loc = this.convert_to_row_col(Vec.of(this.player_checkers[clicked][0], this.player_checkers[clicked][2]));
                    if(clicked_loc[1] == i && clicked_loc[0] == j){
                        //draw
                      this.shapes.checker.draw(graphics_state,Mat4.translation(this.board_locations[i][j]),this.materials.max_amb.override({ambient:0.90,diffusivity:0.90, color:white_color}));
                      //if queen draw another checker peice
                      if(board[i][j] == 'q')
                        this.shapes.checker.draw(graphics_state,Mat4.translation([this.board_locations[i][j][0],1.0,this.board_locations[i][j][2],1.2]),this.materials.max_amb.override({ambient:0.90,diffusivity:0.90, color:white_color}));
                    
                    }
                    else{
                    //draw
                    this.shapes.checker.draw(graphics_state,Mat4.translation(this.board_locations[i][j]),this.materials.max_amb.override({ambient:0.75,diffusivity:0.5, color:white_color}));
                    //if queen draw another checker peice
                    if(board[i][j] == 'q')
                      this.shapes.checker.draw(graphics_state,Mat4.translation([this.board_locations[i][j][0],1.0,this.board_locations[i][j][2],1.2]),this.materials.max_amb.override({ambient:0.75,diffusivity:0.5, color:white_color}));
                     }
                  }
                  else{
                      //draw
                      this.shapes.checker.draw(graphics_state,Mat4.translation(this.board_locations[i][j]),this.materials.max_amb.override({ambient:0.75,diffusivity:0.5, color:white_color}));
                      //if queen draw another checker peice
                      if(board[i][j] == 'q')
                        this.shapes.checker.draw(graphics_state,Mat4.translation([this.board_locations[i][j][0],1.0,this.board_locations[i][j][2],1.2]),this.materials.max_amb.override({ambient:0.75,diffusivity:0.5, color:white_color}));
                  }

                  //add to player_checkers
                  white_pieces.push(this.board_locations[i][j]);
                  
                }

                //black piece found, draw
                else if(board[i][j] == 'b' || board[i][j] == 'k'){
                  this.shapes.checker.draw(graphics_state,Mat4.translation(this.board_locations[i][j]),this.materials.max_amb.override({ambient:0.75,diffusivity:0.5, color:black_color}));
                  //if queen draw another checker peice
                  if(board[i][j] == 'k')
                    this.shapes.checker.draw(graphics_state,Mat4.translation([this.board_locations[i][j][0],1.0,this.board_locations[i][j][2],1.2]),this.materials.max_amb.override({ambient:0.75,diffusivity:0.5, color:black_color}));
                }
              }
            }

              //if last checker moved was eaten
              if(move_found = false){
                  this.checker_picker.move_checker = undefined;
              }

          }

            this.player_checkers = white_pieces;
            this.checker_picker.checker_locations = this.player_checkers;


        //draw the board
        var color = false; //false = white, true = black board piece
        for(var i = 0; i < 8; i++){
            var row_count = i * 2 - 7;
            for(var j = 0; j < 8; j++){
                let translate = Vec.of(row_count, j * 2 - 7,0,1);
                if(color)
                    this.shapes.tile.draw(graphics_state, Mat4.scale(Vec.of(4, 4, 4)).times(Mat4.rotation(Math.PI / 2, Vec.of(1, 0, 0))).times(Mat4.translation(translate)), this.materials.max_amb.override({ambient:0.75,diffusivity:0.50, color:black_board}));
                else
                    this.shapes.tile.draw(graphics_state, Mat4.scale(Vec.of(4, 4, 4)).times(Mat4.rotation(Math.PI / 2, Vec.of(1, 0, 0))).times(Mat4.translation(translate)), this.materials.max_amb.override({ambient:0.75,diffusivity:0.50, color:white_board}));
                color = !(color);
            }
            color = !(color);
        }
        this.shapes.frame.draw(graphics_state, Mat4.translation(Vec.of(3,1,.25,1)).times(Mat4.scale(Vec.of(46.5, 46.5, 46.5))), this.materials.max_amb.override({ambient:0.50,diffusivity:0.50, color:wood_color}));

        //attach
        if(this.attached != null)
        {
          var new_camera_transform = Mat4.inverse(this.attached().times(Mat4.translation([0,0,0])))
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
