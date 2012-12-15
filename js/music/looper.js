//SCRIPT FOR THE LOOPER


var clock= new THREE.Clock();
var loopTime=0;
var t;



function looperStart(){
	clock.start();
	clockStarted=1;	
}
	
	
function looper(){
				
				loopTime += clock.getDelta();
				
				
				//Test to see if the loop should be repeated First, 
				//so we don't have the  current loops change twice whenever the loop repeats
				if (loopTime>=level.speed){
					loopTime=0;
					
					newLoop();
					
				}
				
				
				
				for(i=0;i<level.loops.length;i++){
					
					//see if the time is over the subdivision of the current loop
					var subDivisionTime=((level.speed/level.loopRepeat[i])*level.loopCurrentRepeat[i]);
					if(loopTime>=subDivisionTime){
						level.loopCurrentRepeat[i]+=1;
						newSubLoop(i);
						
					}
				}
				
				
				
				t=setTimeout(looper,2);
			}



//This is what will happen each level			
function newLoop(){
				
				//plays all loops from a level
				playAll();
				
				//sets all loops current repeat to 0
				for(i=0;i<level.loops.length;i++){
					level.loopCurrentRepeat[i]=0;
				}
			}


//this is what will happeen each sub loop			
function newSubLoop(loopNumber){
		
		level.musicBlockIds[loopNumber]=Math.ceil(Math.random()*level.numberOfObjects);
		
		//if the level hasn't started, reassign the music Block ID to -1 so it can't be arbitrarily clicked on
		//weird bug fix...
		if(level.musicBlockCompletion[loopNumber]==0){
				level.musicBlockIds[loopNumber]=-1
		}
		
		
		level.musicBlockClicked[loopNumber]=0;
	
	
	
}






			
		