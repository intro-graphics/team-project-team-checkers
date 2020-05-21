/////////////////////////////////////////////////////////////////////////////////////
// GLOBALS //
/////////////////////////////////////////////////////////////////////////////////////
const BOARD_DIM = 8
const MAX_HEURISTIC = 100
const MAX_DIST = 10


/////////////////////////////////////////////////////////////////////////////////////
// GAME RULES //
/////////////////////////////////////////////////////////////////////////////////////

//zig-zag eating
var test_state1 = [['b', 0 , 0 , 0 , 0 , 0 , 0 , 0 ],
                   [ 0 ,'w', 0 , 0 , 0 , 0 , 0 , 0 ],
                   [ 0 , 0 , 0 , 0 , 0 , 0 , 0,  0 ],
                   [ 0 , 0 , 0 ,'w', 0 ,'w', 0 , 0 ],
                   [ 0 , 0 , 0 , 0 , 0 , 0 ,'w', 0 ],
                   [ 0 ,'w', 0 ,'w', 0 ,'w', 0 , 0 ],
                   [ 0 , 0 , 0 , 0 ,'w', 0 , 0 , 0 ],
                   [ 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 ]];

//becoming a queen
var test_state2 = [[ 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 ],
                   [ 0 , 0 ,'b', 0 ,'w', 0 , 0 , 0 ],
                   [ 0 ,'w', 0 , 0 , 0 , 0 , 0,  0 ],
                   [ 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 ],
                   [ 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 ],
                   [ 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 ],
                   [ 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 ],
                   [ 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 ]];

//queen eating backwards
var test_state3 = [[ 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 ],
                   [ 0 , 0 , 0 , 0 , 0 , 0 , 0 ,'w'],
                   [ 0 , 0 ,'w', 0 , 0 , 0 , 0,  0 ],
                   [ 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 ],
                   [ 0 , 0 , 0 , 0 ,'w', 0 , 0 , 0 ],
                   [ 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 ],
                   [ 0 , 0 , 0 , 0 , 0 , 0 ,'w', 0 ],
                   [ 0 , 0 , 0 , 0 , 0 , 0 , 0 ,'k']];

//queen chosing to take most peices
var test_state4 = [[ 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 ],
                   [ 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 ],
                   [ 0 , 0 ,'w', 0 , 0 , 0 , 0,  0 ],
                   [ 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 ],
                   [ 0 , 0 , 0 , 0 ,'w', 0 ,'w', 0 ],
                   [ 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 ],
                   [ 0 , 0 , 0 , 0 , 0 , 0 ,'w', 0 ],
                   [ 0 , 0 , 0 , 0 , 0 , 0 , 0 ,'k']];

class Game
{
  //initialize game state
  constructor()
  {
    //w for white, b for black, q for white queen, k for black queen
    this.gameState = [[ 0 ,'b', 0 ,'b', 0 ,'b', 0, 'b'],
                      ['b', 0 ,'b', 0 ,'b', 0, 'b', 0 ],
                      [ 0 ,'b', 0 ,'b', 0 ,'b', 0, 'b'],
                      [ 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 ],
                      [ 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 ],
                      ['w', 0 ,'w', 0 ,'w', 0, 'w', 0 ],
                      [ 0 ,'w', 0 ,'w', 0 ,'w', 0, 'w'],
                      ['w', 0 ,'w', 0 ,'w', 0, 'w', 0 ]];
    this.turn = "white"
  }

  print_state(state)
  {
    var print_str = ""
    for(var r=0; r<BOARD_DIM; r++){
      for(var c=0; c<BOARD_DIM; c++){
        print_str += state[r][c] + " "
      }
      print_str += "\n"
    }
    console.log(print_str)
  }


  print_states(states)
  {
    for (var i=0; i<states.length; i++)
     this.print_state(states[i])
  }

  isFriendly(state,turn,r,c)
  {
    if(turn=='white')
      return (state[r][c]=='w' || state[r][c]=='q')

    if(turn=='black')
      return (state[r][c]=='b' || state[r][c]=='k')

    return false
  }

  isEnemy(state,turn,r,c)
  {
    if(turn=='white')
      return (state[r][c]=='b' || state[r][c]=='k')

    if(turn=='black')
      return (state[r][c]=='w' || state[r][c]=='q')

    return false
  }

  isQueen(state,turn,r,c)
  {
    if(turn=='white')
      return (state[r][c]=='q')

    if(turn=='black')
      return (state[r][c]=='k')

    return false
  }

  makeQueens(state)
  {
    for(var c=0; c<BOARD_DIM; c++)
    {
      if (state[0][c] == 'w')
        state[0][c] = 'q'
      if (state[BOARD_DIM-1][c] == 'b')
        state[BOARD_DIM-1][c] = 'k'
    }
    return state
  }

  isEmpty(state,r,c)
  {
    return (state[r][c]==0);
  }

  copy_state(state)
  {
    var copy = [[],[],[],[],[],[],[],[]]
    for(var r=0; r<BOARD_DIM; r++)
      for(var c=0; c<BOARD_DIM; c++)
        copy[r][c] = state[r][c];

    return copy;
  }

  //swap the peices at these 2 positions (this creates a new state object)
  swap(state,r1,c1,r2,c2)
  {
   var new_state = this.copy_state(state)
   new_state[r1][c1] = state[r2][c2]
   new_state[r2][c2] = state[r1][c1]
   return this.makeQueens(new_state);
  }

  //helper for get_eat_states (creates a new state based on an eatin move)
  eat(state,r1,c1,r2,c2)
  {
   var new_state = this.swap(state,r1,c1,r2,c2)
   new_state[(r1+r2)/2][(c1+c2)/2] = 0
   return this.makeQueens(new_state);
  }


  //checkes all eating moves (Recursively if needed) from r,c to see all eating moves possible
  get_eat_states(state, turn, r,c, is_queen)
  {

    //all the eating moves from r,c
    var eat_states = []

    //bounds check
    var top_left_allowed = (is_queen||turn=='white')&&(c-2>=0)&&(r-2>=0)
    var bottom_left_allowed = (is_queen||turn=='black')&&(c-2>=0)&&(r+2<BOARD_DIM)
    var top_right_allowed = (is_queen||turn=='white')&&(c+2<BOARD_DIM)&&(r-2>=0)
    var bottom_right_allowed = (is_queen||turn=='black')&&(c+2<BOARD_DIM)&&(r+2<BOARD_DIM)

    //eat top left
    if(top_left_allowed && this.isEnemy(state,turn,r-1,c-1) && this.isEmpty(state,r-2,c-2))
    {
      var ate_state = this.eat(state,r,c,r-2,c-2)
      var more_states = this.get_eat_states(ate_state,turn,r-2,c-2,is_queen)
      if (more_states.length == 0)
        eat_states.push(ate_state)
      else
        eat_states=eat_states.concat(more_states)
    }

    //bottom left
    if(bottom_left_allowed && this.isEnemy(state,turn,r+1,c-1) && this.isEmpty(state,r+2,c-2))
    {
      var ate_state = this.eat(state,r,c,r+2,c-2)
      var more_states = this.get_eat_states(ate_state,turn,r+2,c-2,is_queen)
      if (more_states.length == 0)
        eat_states.push(ate_state)
      else
        eat_states=eat_states.concat(more_states)
    }

    //top right
    if(top_right_allowed && this.isEnemy(state,turn,r-1,c+1) && this.isEmpty(state,r-2,c+2))
    {
      var ate_state = this.eat(state,r,c,r-2,c+2)
      var more_states = this.get_eat_states(ate_state,turn,r-2,c+2,is_queen)
      if (more_states.length == 0)
        eat_states.push(ate_state)
      else
        eat_states=eat_states.concat(more_states)
    }

    //bottom right
    if(bottom_right_allowed && this.isEnemy(state,turn,r+1,c+1) && this.isEmpty(state,r+2,c+2))
    {
      var ate_state = this.eat(state,r,c,r+2,c+2)
      var more_states = this.get_eat_states(ate_state,turn,r+2,c+2,is_queen)
      if (more_states.length == 0)
        eat_states.push(ate_state)
      else
        eat_states=eat_states.concat(more_states)
    }
    return eat_states
 }

   //checkes all 1-peice moves from r,c
  get_move_states(state, turn, r,c, is_queen)
  {

    //all the eating moves from r,c
    var move_states = []

    //bounds check
    var top_left_allowed = (is_queen||turn=='white')&&(c-1>=0)&&(r-1>=0)
    var bottom_left_allowed = (is_queen||turn=='black')&&(c-1>=0)&&(r+1<BOARD_DIM)
    var top_right_allowed = (is_queen||turn=='white')&&(c+1<BOARD_DIM)&&(r-1>=0)
    var bottom_right_allowed = (is_queen||turn=='black')&&(c+1<BOARD_DIM)&&(r+1<BOARD_DIM)

    //top left
    if(top_left_allowed && this.isEmpty(state,r-1,c-1))
      move_states.push(this.swap(state,r,c,r-1,c-1))

    //bottom left
    if(bottom_left_allowed && this.isEmpty(state,r+1,c-1))
      move_states.push(this.swap(state,r,c,r+1,c-1))

    //top right
    if(top_right_allowed && this.isEmpty(state,r-1,c+1))
      move_states.push(this.swap(state,r,c,r-1,c+1))

    //bottom right
    if(bottom_right_allowed && this.isEmpty(state,r+1,c+1))
      move_states.push(this.swap(state,r,c,r+1,c+1))

    return move_states
  }

  //check if game is over
  is_goal_state(state)
  {
    var white_won = true
    var black_won = true
    for(var r=0; r<BOARD_DIM; r++){
      for(var c=0; c<BOARD_DIM; c++){
        if(this.isEnemy(state,'white',r,c))
          white_won = false
        if(this.isEnemy(state,'black',r,c))
          black_won = false
        if(!white_won && !black_won)
          return false
       }
    }
    return true
  }


  next_states(state, turn)
  {

    //all next_states where we move
    var move_states = []

    //all next_states where we eat
    var eat_states = []

    //traverse board and look for w or b peices
    for(var r=0; r<BOARD_DIM; r++){
      for(var c=0; c<BOARD_DIM; c++){

        //item at this coord
        if( !this.isFriendly(state,turn,r,c))
          continue;

        //eating
        var l = this.get_eat_states(state,turn,r,c,this.isQueen(state,turn,r,c))
        eat_states=eat_states.concat(l)

        //if the option to eat exists, we must eat. We dont need non-eating moves
        if (eat_states.length != 0)
          continue;

        //moving
        var l = this.get_move_states(state,turn,r,c,this.isQueen(state,turn,r,c))
        move_states = move_states.concat(l)
        }
      }

    //in checkers we must eat if it is possible:
    if (eat_states.length != 0)
      return eat_states;
    else
      return move_states;
  }
}

/////////////////////////////////////////////////////////////////////////////////////
// AI //
/////////////////////////////////////////////////////////////////////////////////////

class Game_AI
{

  //give the GAME_AI the GAME instance
  constructor(g)
  {
    this.game = g
    this.gameState = g.gameState
  }

  //update the gameState
  update_gameState()
  {
    this.gameState = this.g.gameState
  }


  //if r2,c2 is an enemy, return zero, if no where to go, return -1
  find_peices(state,turn)
  {
    var friendlies = []
    var enemies = []

    for(var r=0; r<BOARD_DIM; r++)
      for(var c=0; c<BOARD_DIM; c++)
        if(this.game.isFriendly(state,turn,r,c))
          friendlies.push([r,c])
        else if(this.game.isEnemy(state,turn,r,c))
          enemies.push([r,c])

    return [friendlies,enemies]
  }

  //enemy peices left (helper for heuristic)
  peices_up(friendlies,enemies)
  {
    return friendlies.length - enemies.length
  }

  //shortest dist between enemies
  enemy_dist(friendlies,enemies)
  {

    //no enemies or no friendlies, the game is over
    if(friendlies.length==0 || enemies.length==0)
      return 0

    var shortest_dist = MAX_DIST

    for(var i=0; i<friendlies.length; i++){
      for(var j=0; j<enemies.length; j++){
        var delta_r = Math.abs(friendlies[i][0] - enemies[j][0])
        var delta_c = Math.abs(friendlies[i][1] - enemies[j][1])
        var diag_dist = Math.max(delta_r,delta_c)-1
        if (diag_dist < shortest_dist)
          shortest_dist = diag_dist
      }
    }
    return Math.max(shortest_dist,0)

  }


  //heuristic: return number of enemy peices left + shortest distance to an enemy
  heuristic(state,turn)
  {
    if(state == null)
      return MAX_HEURISTIC

    var peice_coords = this.find_peices(state,'black')
    var friendlies = peice_coords[0]
    var enemies = peice_coords[1]

    var h = this.peices_up(friendlies,enemies) + Math.floor(this.enemy_dist(friendlies,enemies)/2)

    //console.log(turn,h)
    //this.game.print_state(state)

     return h
  }

  //helper for limited_depth_minimax_wrapper
  limited_depth_minimax(state,turn,l,max_l)
  {

        //depth exceeded or game has ended
        if(l<=0 || this.game.is_goal_state(state))
          if(l == max_l)
            return state
          else
            return this.heuristic(state,turn)

        //get children_states and check if a goal state was accomplished
        var children_states = this.game.next_states(state,turn)


        //switch turns
        var next_turn;
        if (turn == 'white')
          next_turn = 'black'
        else
          next_turn = 'white'

        //current best
        var best_state = null
        var best_h = MAX_HEURISTIC

        //for each child recurse deeper
        for(var i =0; i<children_states.length; i++)
        {
          var found_h = this.limited_depth_minimax(children_states[i],next_turn,l-1,l)
          if (found_h < best_h){
            best_state = children_states[i]
            best_h = found_h
          }
        }
        if(l == max_l)
          return best_state
        else
          return best_h
  }

  //search
  limited_depth_minimax_wrapper(state,l)
  {
    var best = this.limited_depth_minimax(state,'black',l,l)
    //console.log("---")
    return best
  }

}

/*
var gam = new Game()
var ai = new Game_AI(gam)
var move = ai.limited_depth_minimax_wrapper(gam.gameState,5)
gam.print_state(move)
*/
