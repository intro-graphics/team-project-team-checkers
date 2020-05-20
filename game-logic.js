const BOARD_DIM = 8

var test_state = [['b', 0 , 0 , 0 , 0 , 0 , 0 , 0 ],
                  [ 0 ,'w', 0 , 0 , 0 , 0 , 0 , 0 ],
                  [ 0 , 0 , 0 , 0 , 0 , 0 , 0,  0 ],
                  [ 0 , 0 , 0 ,'w', 0 ,'w', 0 , 0 ],
                  [ 0 , 0 , 0 , 0 , 0 , 0 ,'w', 0 ],
                  [ 0 ,'w', 0 ,'w', 0 ,'w', 0 , 0 ],
                  [ 0 , 0 , 0 , 0 ,'w', 0 , 0 , 0 ],
                  [ 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 ]];

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

  print_state(state=this.gameState)
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

  isEnemy(state=this.gameState,turn=this.turn,r,c)
  {
    if(turn=='white')
      return (state[r][c]=='b' || state[r][c]=='k')

    if(turn=='black')
      return (state[r][c]=='w' || state[r][c]=='q')

    return false
  }

  isQueen(state=this.gameState,turn=this.turn,r,c)
  {
    if(turn=='white')
      return (state[r][c]=='q')

    if(turn=='black')
      return (state[r][c]=='k')

    return false
  }

  copy_state(state=this.gameState)
  {
    var copy = [[],[],[],[],[],[],[],[]]
    for(var r=0; r<BOARD_DIM; r++)
      for(var c=0; c<BOARD_DIM; c++)
        copy[r][c] = state[r][c];
    
    return copy;
  }

  //swap the peices at these 2 positions (this creates a new state object)
  swap(state=this.gameState,r1,c1,r2,c2)
  {
   
   var new_state = this.copy_state(state)
   new_state[r1][c1] = state[r2][c2]
   new_state[r2][c2] = state[r1][c1]
   return new_state;
  }

  //helper for get_eat_states (creates a new state based on an eatin move)
  eat(state=this.gameState,r1,c1,r2,c2)
  {
   var new_state = this.copy_state(state)
   new_state[r1][c1] = 0
   new_state[(r1+r2)/2][(c1+c2)/2] = 0
   new_state[r2][c2] = state[r1][c1]
   return new_state;
  }


  //traverses (Recursively if needed) from r,c to see all eating moves possible
  get_eat_states(state=this.gameState, turn=this.turn, r,c, is_queen)
  {
      
    //all the eating moves from r,c
    var eat_states = []

    //bounds check
    var top_left_allowed = (is_queen||turn=='white')&&(c-2>=0)&&(r-2>=0)
    var bottom_left_allowed = (is_queen||turn=='black')&&(c-2>=0)&&(r+2<BOARD_DIM)
    var top_right_allowed = (is_queen||turn=='white')&&(c+2<BOARD_DIM)&&(r-2>=0)
    var bottom_right_allowed = (is_queen||turn=='black')&&(c+2<BOARD_DIM)&&(r+2<BOARD_DIM)

    //eat top left
    if(top_left_allowed && this.isEnemy(state,turn,r-1,c-1) && state[r-2][c-2]==0)
    {
      var ate_state = this.eat(state,r,c,r-2,c-2)
      var more_states = this.get_eat_states(ate_state,turn,r-2,c-2,is_queen)
      if (more_states.length == 0)
        eat_states.push(ate_state)
      else
        eat_states=eat_states.concat(more_states)
    }

    //bottom left
    if(bottom_left_allowed && this.isEnemy(state,turn,r+1,c-1) && state[r+2][c-2]==0)
    {
      var ate_state = this.eat(state,r,c,r+2,c-2)
      var more_states = this.get_eat_states(ate_state,turn,r+2,c-2,is_queen)
      if (more_states.length == 0)
        eat_states.push(ate_state)
      else
        eat_states=eat_states.concat(more_states)
    }

    //top right
    if(top_right_allowed && this.isEnemy(state,turn,r-1,c+1) && state[r-2][c+2]==0)
    {
      var ate_state = this.eat(state,r,c,r-2,c+2)
      var more_states = this.get_eat_states(ate_state,turn,r-2,c+2,is_queen)
      if (more_states.length == 0)
        eat_states.push(ate_state)
      else
        eat_states=eat_states.concat(more_states)
    }

    //bottom right
    if(bottom_right_allowed && this.isEnemy(state,turn,r+1,c+1) && state[r+2][c+2]==0)
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

  next_states(state=this.gameState, turn=this.turn)
  {
    //all next_states where we move
    var move_states = []

    //all next_states where we eat
    var eat_states = []    

    //traverse board and look for w or b peices
    for(var r=0; r<BOARD_DIM; r++){
      for(var c=0; c<BOARD_DIM; c++){

        //item at this coord
        if( this.isEnemy(state,turn,r,c) )
          continue;
    
        //eating
        eat_states.concat(this.get_eat_states(state,turn,r,c,this.isQueen(state,turn,r,c)))
                
        //if the option to eat exists, we must eat. We dont need non-eating moves
        if (eat_states.length != 0)
          continue;

        //moving

         //left move
        if ((c>0)&&(r+dir>=0)&&(r+dir<BOARD_DIM)&&(state[r+dir][c-1]==0)){
          move_states.push(this.swap(state,r,c,r+dir,c-1))
        }
      
        //right move
        if ((c+1<BOARD_DIM)&&(r+dir>=0)&&(r+dir<BOARD_DIM)&&(state[r+dir][c+1]==0) ){
          move_states.push(this.swap(state,r,c,r+dir,c+1))
        }                   
      }
    }


    //in checkers we must eat if it is possible:
    if (eat_states.length != 0)
      return eat_states;
    else
      return move_states;
  }
}

