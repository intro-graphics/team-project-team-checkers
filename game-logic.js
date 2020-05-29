/////////////////////////////////////////////////////////////////////////////////////
// USAGE //
/////////////////////////////////////////////////////////////////////////////////////
/*
g is an instance of the game class

To get board from g, use g.gameState. This will return a 2D array that looks like this:
[   [ 0 ,'b', 0 ,'b', 0 ,'b', 0, 'b'],
    ['b', 0 ,'b', 0 ,'b', 0, 'b', 0 ],
    [ 0 ,'b', 0 ,'b', 0 ,'b', 0, 'b'],
    [ 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 ],
    [ 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 ],
    ['w', 0 ,'w', 0 ,'w', 0, 'w', 0 ],
    [ 0 ,'w', 0 ,'w', 0 ,'w', 0, 'w'],
    ['w', 0 ,'w', 0 ,'w', 0, 'w', 0 ]   ];


To play a move, use g.player_move(row_start,column_start,row_destination,column_destination)
If the move is invalid, the board will not be updated
If the move is valid, the board will be updated to player's move followed by AIs move


If g.gameState is null, then the game has ended

*/
/////////////////////////////////////////////////////////////////////////////////////
// GLOBALS //
/////////////////////////////////////////////////////////////////////////////////////

//Game
const BOARD_DIM = 8
const NUM_PEICES = 12

//AI
const MAX_HEURISTIC = 100000
const MIN_HEURISTIC = -100000
const MAX_DIST = 10
const DEFAULT_SEARCH_LIMIT = 7



/////////////////////////////////////////////////////////////////////////////////////
// GAME RULES //
/////////////////////////////////////////////////////////////////////////////////////

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

    this.player_coords = null
    this.player_states = null
    this.ai = new Game_AI(this)
  }

  print_state(state)
  {
    var print_str = " \t0 1 2 3 4 5 6 7\n\n"
    for(var r=0; r<BOARD_DIM; r++){
      print_str += r.toString() + "\t"
      for(var c=0; c<BOARD_DIM; c++){
        var item = state[r][c]
        if(item == 0)
          print_str += "."
        else
          print_str += item
        print_str += " "
      }
      print_str += "\n"
    }
    console.log(print_str)
  }

  equal_states(s1,s2)
  {
    return_val = true
    for(var r=0; r<BOARD_DIM; r++)
      for(var c=0; c<BOARD_DIM; c++)
        if(s1[r][c] == s2[r][c])
          return false

  return true
  }

  //we get player move as two coordinates (r1,r2,c1,c2)
  //if move is invalid, do nothing
  //if move is valid, let AI opponent play following that move
  //then update the game state to ai's move and wait for white
  //return board after white move and board after black move
  player_move(r1,c1,r2,c2)
  {

    //see all move coordinates (we only want to find them once)
    if(this.player_coords == null)
    {
      this.player_coords = this.next_states(this.gameState,"white",true,false)
      this.player_states = this.next_states(this.gameState,"white",false,false)
    }

    //if no move coords, we've lost
    if(this.player_coords.length == 0)
    {
      console.log("Defeat: AI wins.")
      return
    }

    //check if [[r1,c1],[r2,c2]] is a valid move
    var invalid_move = true
    var move_index;
    for(var i=0; i<this.player_coords.length; i++)
      if(this.player_coords[i][0][0]==r1 && this.player_coords[i][0][1]==c1 && this.player_coords[i][1][0]==r2 && this.player_coords[i][1][1]==c2)
      {
        invalid_move = false
        move_index = i
        break
      }
    if(invalid_move)
    {
      console.log("Invalid move.")
      return
    }


    //verify given move and set resulting state to move_state
    var move_state = this.player_states[move_index]
    this.player_coords = null

    //print the heuristic (for black) change
    this.ai.print_delta_h(this.gameState,move_state)
    this.print_state(move_state)

    //update gameState
    this.gameState = move_state

    //if more eating can be done, don't let AI play yet

    //if eating was done
    if(Math.abs(r2-r1) == 2)
      if(this.get_eat_states(this.gameState, "white", r2,c2, this.isQueen(this.gameState,"white",r2,c2), false).length > 0)
        return


    //let opponent play
    this.gameState = this.ai.ai_move(move_state)
  }


  print_states(states)
  {
    for (var i=0; i<states.length; i++)
     this.print_state(states[i])
  }

  inBounds(r,c)
  {
    return (r>=0 && r<BOARD_DIM && c>=0 && c<BOARD_DIM)
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
  get_eat_states(state, turn, r,c, is_queen, get_coords=false, recurse=true)
  {

    //all the eating moves from r,c
    var eat_states = []

    //bounds check
    var top_left_allowed = (is_queen||turn=='white')&&this.inBounds(r-2,c-2)
    var bottom_left_allowed = (is_queen||turn=='black')&&this.inBounds(r+2,c-2)
    var top_right_allowed = (is_queen||turn=='white')&&this.inBounds(r-2,c+2)
    var bottom_right_allowed = (is_queen||turn=='black')&&this.inBounds(r+2,c+2)

    //eat top left
    if(top_left_allowed && this.isEnemy(state,turn,r-1,c-1) && this.isEmpty(state,r-2,c-2))
    {
      if(get_coords)
        eat_states.push([[r,c],[r-2,c-2]])
      else
      {
        var ate_state = this.eat(state,r,c,r-2,c-2)
        var more_states = [];
        if(recurse)
          more_states = this.get_eat_states(ate_state,turn,r-2,c-2,is_queen,get_coords)
        if (more_states.length == 0)
            eat_states.push(ate_state)
        else
          eat_states=eat_states.concat(more_states)
      }
    }

    //bottom left
    if(bottom_left_allowed && this.isEnemy(state,turn,r+1,c-1) && this.isEmpty(state,r+2,c-2))
    {
      if(get_coords)
        eat_states.push([[r,c],[r+2,c-2]])
      else
      {
        var ate_state = this.eat(state,r,c,r+2,c-2)
        var more_states = [];
        if(recurse)
          more_states = this.get_eat_states(ate_state,turn,r+2,c-2,is_queen,get_coords)
        if (more_states.length == 0)
            eat_states.push(ate_state)
        else
          eat_states=eat_states.concat(more_states)
      }
    }

    //top right
    if(top_right_allowed && this.isEnemy(state,turn,r-1,c+1) && this.isEmpty(state,r-2,c+2))
    {
      if(get_coords)
        eat_states.push([[r,c],[r-2,c+2]])
      else
      {
        var ate_state = this.eat(state,r,c,r-2,c+2)
        var more_states = [];
        if(recurse)
          more_states = this.get_eat_states(ate_state,turn,r-2,c+2,is_queen,get_coords)
        if (more_states.length == 0)
            eat_states.push(ate_state)
        else
          eat_states=eat_states.concat(more_states)
      }
    }

    //bottom right
    if(bottom_right_allowed && this.isEnemy(state,turn,r+1,c+1) && this.isEmpty(state,r+2,c+2))
    {
      if(get_coords)
        eat_states.push([[r,c],[r+2,c+2]])
      else
      {
        var ate_state = this.eat(state,r,c,r+2,c+2)
        var more_states = [];
        if(recurse)
          more_states = this.get_eat_states(ate_state,turn,r+2,c+2,is_queen,get_coords)
        if (more_states.length == 0)
            eat_states.push(ate_state)
        else
          eat_states=eat_states.concat(more_states)
      }
    }

    return eat_states
 }

   //checkes all 1-peice moves from r,c
  get_move_states(state, turn, r,c, is_queen, get_coords=false)
  {

    //all the eating moves from r,c
    var move_states = []

    //bounds check
    var top_left_allowed = (is_queen||turn=='white')&&this.inBounds(r-1,c-1)
    var bottom_left_allowed = (is_queen||turn=='black')&&this.inBounds(r+1,c-1)
    var top_right_allowed = (is_queen||turn=='white')&&this.inBounds(r-1,c+1)
    var bottom_right_allowed = (is_queen||turn=='black')&&this.inBounds(r+1,c+1)

    //top left
    if(top_left_allowed && this.isEmpty(state,r-1,c-1))
    {
      if(get_coords)
        move_states.push([[r,c],[r-1,c-1]])
      else
        move_states.push(this.swap(state,r,c,r-1,c-1))
    }

    //bottom left
    if(bottom_left_allowed && this.isEmpty(state,r+1,c-1))
    {
      if(get_coords)
        move_states.push([[r,c],[r+1,c-1]])
      else
        move_states.push(this.swap(state,r,c,r+1,c-1))
    }

    //top right
    if(top_right_allowed && this.isEmpty(state,r-1,c+1))
    {
      if(get_coords)
        move_states.push([[r,c],[r-1,c+1]])
      else
        move_states.push(this.swap(state,r,c,r-1,c+1))
    }

    //bottom right
    if(bottom_right_allowed && this.isEmpty(state,r+1,c+1))
    {
      if(get_coords)
        move_states.push([[r,c],[r+1,c+1]])
      else
        move_states.push(this.swap(state,r,c,r+1,c+1))
    }

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


  next_states(state, turn, get_coords = false, recurse = true)
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
        var l = this.get_eat_states(state,turn,r,c,this.isQueen(state,turn,r,c),get_coords, recurse)
        eat_states=eat_states.concat(l)

        //if the option to eat exists, we must eat. We dont need non-eating moves
        if (eat_states.length != 0)
          continue;

        //moving
        var l = this.get_move_states(state,turn,r,c,this.isQueen(state,turn,r,c),get_coords)
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

  //bonus for being up peices, especially if the enemy count is low
  peices_up_bonus(black_coords,white_coords)
  {
    return (black_coords.length - white_coords.length) * (NUM_PEICES-white_coords.length)
  }

  //bonus for holding home row
  home_bonus(black_coords,white_coords)
  {
    var bonus = 0
    for (var i=0; i<black_coords.length; i++)
      if (black_coords[i][0] == 0)
        bonus++

    for (var i=0; i<white_coords.length; i++)
      if (white_coords[i][0] == 0)
        bonus--

    return bonus
  }

  //bonus for advancing towards a queen
  advance_bonus(state,turn,friendlies)
  {
    var bonus = 0
    for(var i=0; i<friendlies.length; i++)
    {
      var r = friendlies[i][0]
      var c = friendlies[i][1]
      var isQueen = this.game.isQueen(state,turn,r,c)

      if(isQueen)
        bonus += BOARD_DIM

      else if(turn=="black")
        bonus += r

      else
        bonus += BOARD_DIM - 1 - r
    }
    return bonus
  }

  //bonus for being close to allies
  cluster_bonus(state,turn,friendlies)
  {
    var bonus = 0
    for(var i=0; i<friendlies.length; i++)
    {
      var r = friendlies[i][0]
      var c = friendlies[i][1]
      var isQueen = this.game.isQueen(state,turn,r,c)

      //nearby peices are stronger together
      var backed_top_left = (this.game.inBounds(r-1,c-1) && this.game.isFriendly(state,turn,r-1,c-1))
      var backed_top_right = (this.game.inBounds(r-1,c+1) && this.game.isFriendly(state,turn,r-1,c+1))
      var backed_bottom_left = (this.game.inBounds(r+1,c-1) && this.game.isFriendly(state,turn,r+1,c-1))
      var backed_bottom_right = (this.game.inBounds(r+1,c+1) && this.game.isFriendly(state,turn,r+1,c+1))

      if(isQueen || turn=='black')
      {
        if(backed_top_left)
          bonus++
        if(backed_top_right)
          bonus++
      }

      if(isQueen || turn=='white')
      {
        if(backed_bottom_left)
          bonus++
        if(backed_bottom_right)
          bonus++
      }
    }
    return bonus
  }


  //heuristic for black: return number of enemy peices left + shortest distance to an enemy
  heuristic(state)
  {
    if(state == null)
      return MIN_HEURISTIC

    var peice_coords = this.find_peices(state,"black")
    var friendlies = peice_coords[0]
    var enemies = peice_coords[1]

    if(friendlies.length <= 0)
      return MIN_HEURISTIC

    if(enemies.length <= 0)
      return MAX_HEURISTIC

    var delta_peices = this.peices_up_bonus(friendlies,enemies)
    var cluster_bonus_black = this.cluster_bonus(state,"black",friendlies)
    var cluster_bonus_white = this.cluster_bonus(state,"white",enemies)
    var advance_bonus_black = this.advance_bonus(state,"black",friendlies)
    var advance_bonus_white = this.advance_bonus(state,"white",enemies)
    var h = 20*delta_peices + cluster_bonus_black - cluster_bonus_white + Math.pow(advance_bonus_black,2) - Math.pow(advance_bonus_white,2)

    return h
  }

  //print function for white
  print_delta_h(state1,state2)
  {
    console.log("Player: "+this.heuristic(state1).toString()+'->'+this.heuristic(state2).toString())
  }

  maximizing_agent(children_states,l,alpha=MIN_HEURISTIC,beta=MAX_HEURISTIC)
  {
    var leaf;
    var leaf_h;
    var best_state = null;
    for (var i=0; i<children_states.length; i++)
    {
      leaf = this.depth_limited_minimax(children_states[i],"white",l-1,alpha,beta)
      leaf_h = leaf[0]
      //check if better value was found
      if(leaf_h>alpha)
      {
        alpha = leaf_h
        best_state = children_states[i]
        //minimizing agent will never chose alpha
        if(alpha > beta)
          break;
      }
    }
    return [alpha,best_state]
  }

  minimizing_agent(children_states,l,alpha=MIN_HEURISTIC,beta=MAX_HEURISTIC)
  {
    var leaf;
    var leaf_h;
    var best_state = null;
    for (var i=0; i<children_states.length; i++)
    {
      leaf = this.depth_limited_minimax(children_states[i],"black",l-1,alpha,beta)
      leaf_h = leaf[0]
      //check if better value was found
      if(leaf_h<beta)
      {
        beta = leaf_h
        best_state = children_states[i]
        //minimizing agent will never chose alpha
        if(alpha > beta)
          break;
      }
    }
    return [beta,best_state]
  }


  //runs minimax search with alpha beta pruning for l moves ahead
  //returns [heuristic for leaf l moves ahead, next state in path to reach that leaf]
  depth_limited_minimax(state,turn,l=DEFAULT_SEARCH_LIMIT,alpha=MIN_HEURISTIC,beta=MAX_HEURISTIC)
  {

        //depth exceeded
        if(l<=0)
          return [this.heuristic(state),state]

        //get children_states and check if a goal state was accomplished
        var children_states = this.game.next_states(state,turn)

        //if no children, we have no moves, this is a final state
        if(children_states.length == 0)
        {
          if(turn=="black")
            return [MIN_HEURISTIC,null]
          else
            return [MAX_HEURISTIC,null]
        }

        //otherwise continue with minimax
        if(turn=="black")
          return this.maximizing_agent(children_states,l,alpha,beta)

        else
          return this.minimizing_agent(children_states,l,alpha,beta)

  }


  //take the game state after white move, prints the board after subsequent black move
  //return null if game over, otherwise return new gameboard
  ai_move(state,l=DEFAULT_SEARCH_LIMIT)
  {
    //run minimax
    var move = this.depth_limited_minimax(state,"black",l)
    var leaf_h = move[0]
    var move_state = move[1]

    //return value is true iff game is over
    var return_val = false

    //if state is null, indicates, game is over, return the board as is
    if(move_state == null)
    {
      if (leaf_h>=MAX_HEURISTIC)
        console.log("Defeat: AI wins.")
      else
        console.log("Victory: AI loses.")

      //print state as is and return it
      this.game.print_state(state)
      return null
    }

    //get more heuristics for output
    var state_h = this.heuristic(state)
    var move_h = this.heuristic(move_state)

    //output
    var print_str = state_h.toString()+'->'+move_h.toString()
    if (move_h>=MAX_HEURISTIC)
    {
      console.log("Defeat: AI wins.")
      return null
    }
    else if (move_h<=MIN_HEURISTIC)
    {
      console.log("Victory: AI loses.")
      return null
    }
    else if (leaf_h>=MAX_HEURISTIC)
      print_str += ' (Expecting Victory within '+l.toString()+' moves.)'
    else if (leaf_h<=MIN_HEURISTIC)
      print_str += ' (Expecting Defeat within '+l.toString()+' moves.)'
    else
      print_str += ' (Expected score in '+l.toString()+' moves: '+leaf_h.toString()+')'

    //log to console
    console.log("AI: "+print_str)
    this.game.print_state(move_state)
    //return the new board
    return move_state
  }

}

g = new Game()
