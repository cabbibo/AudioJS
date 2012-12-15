			
			/* 
			
			
			READ ME!
			
			Redistribute at will
			Include  http://cabbibo.com if you feel like helping me out
			If you use this code, PLEASE let me know! contact@cabbibo.com
		
			
			
			The Organization that you will need to do is as follows, for each MUSIC object you create:
				- make a array of the different files you want, Declared
			
			
			Other things:
			
				-When you call play sound, you may assign an ID so that the sound can more readily be accessed
				-If you want, you can define an onLoaded function, but its not neccesary
				
			
			
			*/
			
		
		
		
		
		
			//MUSIC CONTEXT NEEDS TO BE A GLOBAL CONTEXT, 
			//SO WE ONLY HAVE ONE!
			//(for performance)
			var mctx= new webkitAudioContext();
			
		
			
			//Function for Objectification of new objects			
			var fromPrototype = function(prototype, object) {
			  var newObject = Object.create(prototype);
			 
			  for (var prop in object) {
				if (object.hasOwnProperty(prop)) {
				  newObject[prop] = object[prop];      
				}
			  }
	
			  return newObject;
			};
			
			
			
			
			
			
			//Prototype to created music object
			var MUSIC = function(files,typeOfAudio){
				
		
				
				
				//sets the musicContext equal to global music context
				this.musicContext = mctx
				
				//this function is just for bug checking,
				this.console = function (echo){
						console.log(echo)
						console.log(this)
				}
				
				//Defines all the arguments, 
				//which will be used for linking different audio nodes
				this.arguments=arguments
				console.log(this.arguments)	
				
				//this.fileArray=[]
				this.files=files
				
				
				this.bufferArray=[]
				this.gainArray=[]
				this.sources=[]
				
				
				//LOADS THE FILES
				this.loadFiles = function(){
					var self = this
				
					
					self.bufferLoader = new BufferLoader(
						this.musicContext,
						self.files,
						self.finishedLoading,
						this
					)
				
					self.bufferLoader.load();				
					
				}
				
				this.createAudioElem = function(files){
					var self = this	
					
					
					self.audio = new Audio();
					self.audio.src = self.files;
					self.audio.controls = true;
					self.audio.autoplay = false;
					self.audio.playList=self.files
					console.log(self.audio)
					
					$('body').append("<div id='controls'></div>");
					$('#controls').css("position","fixed")
					$('#controls').css("bottom","0px")
					$('#controls').css("right","0px")
					$('#controls').css("margin-right","-260px")
					$('#controls').css("z-index","999")
			
			
					$('#controls').append(self.audio);
					
					
				}
				
				
				//This is what gets called when the buffer list completes loading
				this.finishedLoading = function(bufferList,whichObj){
					
					console.log("finished Loading");
					console.log(whichObj)
					
					//self.onLoaded();
					for(var i in bufferList){
						
						whichObj.bufferArray.push(bufferList[i]);
						whichObj.gainArray.push(.5);
					}
					
					
					
					//If the user has defined an onLoaded function, adds it!
					if(whichObj.onLoaded){
							whichObj.onLoaded();
					}else{
						console.log("NO ONLOADED FUNCTION");	
					}
				}
				
				
				
				
				//this initializes the entire music group
				this.initMusic = function(){
					
					self = this
					self.type=typeOfAudio
					if (self.type=="loaded"){
						
						console.log("loadedchosen")
						self.loadFiles()
					}else if (self.type=="stream"){
						console.log("streamchoosen")
						self.createAudioElem()
					}else if(self.type=="pls"){
						console.log("plschoosen")
						self.createPLS()
					}else{
						console.log("SELECT A TYPE")	
					}
				}
				
				this.createSource=function() {
					self = this
					
					//This is the object we will return
					//with all the information needed
					var toReturn = {}
					
					
					
					var args=arguments[0]
					var params=args[1]
					console.log(args)
					//console.log()
					//finds the correct buffer source
					var buffer= self.bufferArray[args[0]]
					
					
					
					if(self.type=="stream"){
						source = self.musicContext.createMediaElementSource(self.audio);
						console.log(source)
						toReturn.play = function(){self.audio.play();}
						toReturn.stop = function(){self.audio.stop();}
						
						//toReturn.stop = function(){this.source.noteOff(0);}
						//toReturn.play = function(){this.source.noteOn(0);}
					}else if(self.type=="loaded"){
						source = self.musicContext.createBufferSource();
						source.buffer = buffer;	
						toReturn.stop = function(){this.source.noteOff(0);}
						toReturn.play = function(){this.source.noteOn(0);}
					}else if(self.type=="pls"){
						
						
					}else{
						console.log("YOUR SELF.TYPE IS FUKD")	
					}
					
					
					/*if (looped){
						source.loop=true	
					}*/
				
					
					console.log(params)	
					
					
					//Setting loop on or off
					if(params.looped){
						console.log("looped")
						source.loop=true
						toReturn	
						
					}else{
						console.log("unlooped")
						source.loop=false
					}
					
					//IF VISUALIZED
					if(params.visualized){
						console.log("visualize")
						
						var now = self.musicContext.currentTime
						
						var analyser= self.musicContext.createAnalyser();
						analyser.fftSize=1024;
						
						toReturn.analyser=analyser
					
					
						//Function for creating visualizations
						//remember that all this actually does is set up an animation frame
						//and call a function that the user defines for each MUSIC object they create
						
						
						//TODO, create a standard visualizer, that the user can easily override				
						var updateVisuals = function(time){
							var freqByteData= new Uint8Array(analyser.frequencyBinCount)
							analyser.getByteFrequencyData(freqByteData)
							
							for(var i=0;i<analyser.frequencyBinCount;i++){
								self.visualize(freqByteData[i],analyser.frequencyBinCount,i);
								//console.log(freqByteData[i])
							}
							//console.log(self);
							window.requestAnimationFrame(updateVisuals)	
						}
						
						
						toReturn.visualize=updateVisuals	
						
					}else{
						console.log("unvisualized")	
					}
					
					
					//ADDS GAINS TO toReturn object
					if(params.gains){
						console.log(params.gains.length)
						toReturn.gains=[]
						for(var i=0;i<params.gains.length;i++){
							var gain = self.musicContext.creategain();
							
							
							//Sets id, if there is one
							if (params.gains[i].id){gain.id = params.gains[i].id}
							
							// sets the value of the gain to the one specified by user
							//or by default sets it to .5
							if (params.gains[i].value){
								gain.gain.value= params.gains[i].value
							}else{
								gain.gain.value=.5
							}
							
							toReturn.gains.push(gain)
							console.log(toReturn.gains)
						}
						
					}else{
						console.log("no Gain Nodes")
					}
					
					
					if(params.filters){
						toReturn.filters=[]
						for(var i=0; i< params.filters.length; i++){
							
							var filter = self.musicContext.createBiquadFilter();
							
								//Sets id, if there is one
							if (params.filters[i].id){filter.id = params.filters[i].id}
							
							
							if(params.filters[i].type){
								filter.type = params.filters[i].type
							}else{
								filter.type = filter.HIGHPASS
							}
							
							if(params.filters[i].frequency){
								filter.frequency = params.filters[i].frequency
							}else{
								filter.frequency = 5000
							}
							
							if(params.filters[i].Q){
								filter.frequency = params.filters[i].Q
							}else{
								filter.frequency = 1
							}
							
							toReturn.filters.push(filter)
						}
						
					}else{
						console.log("noFilters")
					}
					
					
					
					if(params.delays){
						//console.log(params.delays.length)
						toReturn.delays=[]
						for(var i=0;i < params.delays.length;i++){
							var delay = self.musicContext.createDelayNode();
							
							
							//Sets id, if there is one
							if (params.delays[i].id){delay.id = params.delays[i].id}
							
							// sets the value of the gain to the one specified by user
							//or by default sets it to .5
							if (params.delays[i].delayTime){
								delay.delayTime.value=params.delays[i].delayTime
							}else{
								delay.delayTime.value=0.4
							}
							
							toReturn.delays.push(delay)
							console.log(toReturn.delays)
						}
						
					}else{
						console.log("no Gain Nodes")
					}
					
					
					
				
					
					// Connect source to gain.
			
					if(params.connection){
					//TODO CREATE CONNECTING ALGORYTHMN
					
					
						
					}else{
						//Standard Connection created, if no alternative connections are given
						if(toReturn.analyser){
							source.connect(toReturn.analyser)
							toReturn.analyser.connect(self.musicContext.destination);
	
						}else{	
							source.connect(self.musicContext.destination)
						}
					
					}
					
					//analyser.connect(self.musicContext.destination)
				
				
					
				
					toReturn.source = source
						
						/*source: source,
						gain: gain,
						analyser:analyser,
						visualize:updateVisuals
						
					  };*/
					  
					 //returns an object we can play with!
					 return (toReturn)
				}
			
				
			
			
			
				//Each time a sound is played, we must create the source from the buffer array
				//and set the gain equal to its gain
				//This way both the buffers and the gains can persist past every time the loop is played
				this.play=function(){
					self=this
					
					console.log(arguments)
					var source=self.createSource(arguments)
					 
					source.timeCreated = self.musicContext.currentTime
					source.whichSound = arguments[0]
					
					if(arguments[1].id){
						source.id=arguments[1].id
					}
					
					if(arguments[1].visualized){
						source.visualize()
					}
					
					source.play()
					self.stop = function(){
						source.stop()	
					}
				}
				
				
				this.playLooped=function(whichSound,id){
					self=this
					var source=self.createSource(whichSound,true)
					 
					source.timeCreated = self.musicContext.currentTime
					source.whichSound=whichSound
					source.loop=true
					if(id){ 
					source.id=id	
					}
					
					//console.log(source.analyser)
					//source.visualize()
					source.play()
				}
				
				this.playVisualized=function(whichSound,id){
					self=this
					var source=self.createSource(whichSound,true)
					 
					source.timeCreated = self.musicContext.currentTime
					source.whichSound=whichSound
					source.loop=true
					if(id){ 
					source.id=id	
					}
					
					//console.log(source.analyser)
					source.visualize()
					source.play()
				}
				
				
				
				//plays all of the sounds
				this.playAll=function(){
					for(i=0;i<this.bufferArray.length;i++){
						this.play(i) 
						
					}
				}
				
				
				this.fadeIn=function(soundID){
					var fadeSound = console.log(soundID)
					
				}
				
				
				
			
			
			
				//initili
				this.initVisual=function(type){
					//$("body").append("<canvas id='visualizer'></canvas>");
					//TODO CREATE STANDARD VISUALS THAT CAN BE ADDED!
					self=this
					var freqArray=[]
					//Sets up standard visualiser
					if (type=="standard"){
						$("body").append("<canvas id='visualizer'></canvas>");
						$('#visualizer').css("display","block")
						$('#visualizer').css("height","356px")
						$('#visualizer').css("width","100px")	
						//$('#visualizer').css("background-color","black")
						
						var canvas = document.getElementById('visualizer');	
						var ctx = canvas.getContext('2d');	
						//first by creating the html part of it
						for(i=0; i<512;i++){
							var itemColor="hsl("+i+", 100%, 45%)"
							freqArray.push(itemColor);
						}
					
						
						self.visualize=function(freqData,binCount,n){
							ctx.clearRect(0, (n+2)*.4, canvas.width, .1);
							ctx.fillStyle=freqArray[n]
							ctx.fillRect(0,(n+2)*.4,freqData,.1);
							
						}
				
						
						
												
					}else{
						console.log("WRONG TYPE SELECTED")	
					}
					
					
				}
			
			
			
			
			
			
			
			
			
			
			
				
				
				//initializes the music when it is called
				this.initMusic();
				
				
			
				
			}
			
			
			
			
		
			
			
			
	
			
			
