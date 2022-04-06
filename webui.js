var twist;
var cmdVel;
var publishImmidiately = true;
var robot_IP;
var manager;
var teleop;
var ros;

function moveAction(linear, angular) {
    if (linear !== undefined && angular !== undefined) {
        twist.linear.x = linear;
        twist.angular.z = angular;
    } else {
        twist.linear.x = 0;
        twist.angular.z = 0;
    }
    cmdVel.publish(twist);
}

function initVelocityPublisher() {
    // Init message with zero values.
    twist = new ROSLIB.Message({
        linear: {
            x: 0,
            y: 0,
            z: 0
        },
        angular: {
            x: 0,
            y: 0,
            z: 0
        }
    });
    // Init topic object
    cmdVel = new ROSLIB.Topic({
        ros: ros,
        name: '/cmd_vel',
        messageType: 'geometry_msgs/Twist'
    });
    // Register publisher within ROS system
    cmdVel.advertise();
}

function initTeleopKeyboard() {
    // Use w, s, a, d keys to drive your robot

    // Check if keyboard controller was aready created
    if (teleop == null) {
        // Initialize the teleop.
        teleop = new KEYBOARDTELEOP.Teleop({
            ros: ros,
            topic: '/cmd_vel'
        });
    }

    // Add event listener for slider moves
    robotSpeedRange = document.getElementById("robot-speed");
    robotSpeedRange.oninput = function () {
        teleop.scale = robotSpeedRange.value / 100
    }
}

function showCam01() {
  var checkBox = document.getElementById("checkVideo01");
  var img1 = document.getElementById("video01");
  if (checkBox.checked == true){
    img1.style.display = "block";
  } else {
    img1.style.display = "none";
  }
}

function showCam02() {
  var checkBox2 = document.getElementById("checkVideo02");
  var img2 = document.getElementById("video02");
  if (checkBox2.checked == true){
    img2.style.display = "block";
  } else {
    img2.style.display = "none";
  }
}

window.onload = function () {
    // determine robot address automatically
    // robot_IP = location.hostname;
    // set robot address statically
    robot_IP = "192.168.0.100";

    // // Init handle for rosbridge_websocket
    ros = new ROSLIB.Ros({
        url: "ws://" + robot_IP + ":9090"
    });

    initVelocityPublisher();
    // get handle for video placeholder
    video = document.getElementById('video01');
    video2 = document.getElementById('video02');
    // Populate video source 
    video.src = "http://localhost:8080/stream?topic=/camera_01/rgb/image_raw";
    video2.src = "http://localhost:8080/stream?topic=/camera_02/rgb/image_raw";
    video.onload = function () {
        // joystick and keyboard controls will be available only when video is correctly loaded
        initTeleopKeyboard();
    };
    video2.onload = function () {
        initTeleopKeyboard();
    }
    
    // Create the main viewer.
    var viewer = new ROS2D.Viewer({
        divID: 'map',
        width:  350,
        height: 300
    });

    // Setup the map client.
    var gridClient = new ROS2D.OccupancyGridClient({
        ros: ros,
        rootObject: viewer.scene
    });
    // Scale the canvas to fit to the map
    gridClient.on('change', function () {
        viewer.scaleToDimensions(gridClient.currentGrid.width, gridClient.currentGrid.height);
        viewer.shift(gridClient.currentGrid.pose.position.x, gridClient.currentGrid.pose.position.y);
    });
}

