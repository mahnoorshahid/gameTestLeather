/*
 * Creation & Computation - Digital Futures, OCAD University
 * Kate Hartman / Nick Puckett
 * 
 * Receiver file that applies the message to an animated polygon
 * links the receive function with the draw loop
 */

// server variables
//multislide 1

var dataServer;
var subKey = 'sub-c-64587bc8-b0cf-11e6-a7bb-0619f8945a4f';
var pubKey = 'pub-c-a705a585-4407-4f88-8b83-ac846c45e13a';

//name used to sort your messages. used like a radio station. can be called anything
var channelName = "powerpoint";

var sides = 3  //default number of sides to start
var rad = 30;
var yoff = 0.0;
var xoff = 0;

var mx;
var my;

var nextButton;
var slideNumber=0;
var totalImages = 4;

var brushR;
var brushG;
var brushB;
var brushRad;

var bubbleClick;

var overBox = false;
var locked = false;


var bubbles = [];

function setup() 
{
  getAudioContext().resume();
  createCanvas(windowWidth, windowHeight);
  background(255);
  
  stroke(brushR,brushG,brushB);
  strokeWeight(10);
  noFill();
 
 	bx = width/2.0;
  	by = height/2.0;

 	beginShape();
   for (let i = 0; i < 20; i++) {

    let x = random(width);
    let y = random(height);
    let r = random(20, 60);
    let b = new Bubble(x, y, r);
    //let bTwo = new Bubble(bubbleClick, y, r);
    bubbles.push(b);

    vertex(x,y);
  }

  endShape();
 
   // initialize pubnub
  dataServer = new PubNub(
  {
    subscribe_key : subKey,  
    publish_key : pubKey,  
    ssl: true  //enables a secure connection. This option has to be used if using the OCAD webspace
  });
  
  //attach callbacks to the pubnub object to handle messages and connections
  dataServer.addListener({ message: readIncoming });
  dataServer.subscribe({channels: [channelName]});

  dataServer.addListener({ messageMouse: readIncomingMouse });
  dataServer.subscribe({channels: [channelName]});



//sendButton = createButton('NEXT');
 //sendButton.position(mouseX, mouseY);
 // sendButton.mousePressed(sendTheMessage);
 //sendButton.size(100,100);





}

function draw() 
{
  background(255);

  //draws and rotates the polygon
    push();
    fill(255);
    stroke(0);
    strokeWeight(10);
    translate(width/2, height/2);
    rotate(frameCount / -100.0);
    polygon(0, 0, 300, sides); 
    //blob(sides * 10);
     blob(0, 0, mx );
 
    pop();

    for (let i = 0; i < bubbles.length; i++) {
    bubbles[i].move();
    bubbles[i].show();

  }

}


function mouseDragged(){
	sendTheMessage();
	
	console.log("mouseDragged");
};



function mousePressed() {
  for (let i = 0; i < bubbles.length; i++) {
    bubbles[i].clicked(mouseX, mouseY);
  }
}

function readIncoming(inMessage) //when new data comes in it triggers this function, 
{                               
   
    sides = inMessage.message.slide +4; //take the number from the message and assign it to the sides variable
   	mx = inMessage.message.x;
   	my = inMessage.message.y;
   	//bubbleClick = click.clicked();
	bubbleClick = clickTest;

}

//draws a regular polygon. from P5 examples
function polygon(x, y, radius, npoints) 
{
  var angle = TWO_PI / npoints;



  beginShape();
  for (var a = 0; a < TWO_PI; a += angle) 
  {

    var mx = x + cos(a) * radius;
    var my = y + sin(a) * radius;
   
    vertex(mx, my);

    
  }
  if (mouseX > bx-radius && mouseX < bx+radius && 
      mouseY > by-radius && mouseY < by+radius) {

 	cursor(CROSS);
  	overBox = true;  
    if(!locked) { 
      stroke(255); 
      fill(244,122,158);

      sx = mouseX;
    } 
 }
  endShape(CLOSE);
}



function blob(x,y,radius){
	//translate(width / 2, height / 2);
	//var radius = 150;
var radius;

  beginShape();
  var xoff = 0;
  for (var a = 0; a <TWO_PI; a += 0.1 ) {

    var offset = map(noise(xoff, yoff), 0, 1, -25, 25);
    var r = radius + offset;
    var x = r * cos(a);
    var y = r * sin(a);
    vertex(x, y);
    vertex(mx,my);
   // vertex(mx, my);
    xoff += 0.1;
    xoff += mx;
    //ellipse(x, y, 4, 4);
  }
  endShape();

  yoff += 0.01;
}

///uses built in mouseClicked function to send the data to the pubnub server
/*function mousePressed(){

	//function mouseClicked(sendTheMessage) {
  // Send Data to the server to draw it in all other canvases
  dataServer.publish(
    {
      channel: channelName,
      messageMouse: 
      {       //set the message objects property name and value combos    
        x: mouseX,
        y: mouseY,
       	r: brushR,
        g: brushG,
       	b: brushB,
       	rad: brushRad  

       
      }
    });

	}
*/
function sendTheMessage() 
{

//slideNumber = ((slideNumber+1)<=(totalImages-1)) ? slideNumber+=1 : 0; //shorthand for conditional assignment
mx = mouseX;
my = mouseY;

click = new Bubble();
click.clicked(mouseX, mouseY);


console.log(slideNumber);
console.log (mx);
console.log (my);

  //publish the number to everyone.
  dataServer.publish(
    {
      channel: channelName,
      message: 
      {
        slide: slideNumber,
        x: mx,
        y: my,
        clickTest: new Bubble()

      }

    });

}

function mouseDragged(){
	
	sendTheMessage();
	
	console.log("mouseDragged");
	console.log(mouseX);
	console.log(mouseY);

};



function readIncomingMouse(inMessage) //when new data comes in it triggers this function, 
{                               // this works becsuse we subscribed to the channel in setup()
  
  // draw a circle on the screen if the user is someone else
  if(inMessage.channel == channelName)
  {
    noStroke();
    fill(inMessage.messageMouse.r, inMessage.messageMouse.g, inMessage.messageMouse.b);  //read the color values from the message
    ellipse(inMessage.messageMouse.x, inMessage.messageMouse.y, inMessage.messageMouse.rad, inMessage.messageMouse.rad);  //read the size and postion data and draw the ellipse
  }
}



class Bubble {
  constructor(x, y, r) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.brightness = 0;
  }

  clicked(px, py) {
    let d = dist(px, py, this.x, this.y);
    if (d < this.r) {
      this.brightness = 255;
    }
  }

  move() {
    this.x = this.x + random(-2, 2);
    this.y = this.y + random(-2, 2);
  }

  show() {
    stroke(255);
    strokeWeight(4);
    fill(this.brightness, 125);
    ellipse(this.x, this.y, this.r * 2);
  }
}
