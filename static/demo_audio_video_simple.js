/*
https://easyrtc.com/docs/easyrtc_gettingStarted.php
https://easyrtc.com/docs/easyrtc_client_tutorial.php
Note: The EasyApp framework is not designed to work with multiple media streams. It's based on the simplifying assumption that there is only one local media stream. If you want to use multiple multiple media streams, you have to accept the effort of managing their assignment to video tags yourself.
https://demo.easyrtc.com/demos/demo_audio_video_simple.html
https://github.com/youennf/easyrtc/tree/master/server_example
https://github.com/youennf/easyrtc/tree/master/demos
*/
var selfEasyrtcid = "";
var roomParticipants;
var callParticipants = [];

$(document).ready(function () {

    document.onkeydown = function (event) {
        var keyCode = event.keyCode;
        switch (keyCode) {
            case 13:
                if ($("#connectbtn").is(":visible")) {
                    $("#connectbtn").trigger("click")
                } else {
                    if ($("#confNameBtn").is(":visible")) {
                        $("#confNameBtn").trigger("click");
                    }
                }
                break;
            default:
        }
    }

    // Checking for username in localstorage and initiating camera
    if (window.localStorage && window.localStorage.easyrtcUserName) {
        var userName = window.localStorage.easyrtcUserName;
        document.getElementById('userName').value = userName;
        connectToMyCamera(userName);
    }

    // On Entering conference room ID and submit
    $("#confNameBtn").click(function () {
        var userName = $('#userName').val();
        if (easyrtc.isNameValid(userName)) {
            easyrtc.setUsername(userName);
            window.localStorage.easyrtcUserName = userName;
            connectToMyCamera(userName);
        } else {
            console.log("BAD-USER-NAME");
            easyrtc.showError("BAD-USER-NAME", "illegal user name");
        }
    })

    $("#disconnectbtn").click(function () {
        disconnect();
    })
    function connectToMyCamera(userName) {
        if (window.localStorage.easyrtcUserName) {
            $("#confNameContainer").hide();
            $("#main").show();
            easyrtc.setUsername(userName);
            connect();
        }
    }

    function isEmptySlot(index) {
        var isEmpty = callParticipants[index] == undefined || callParticipants[index] == '';
        return isEmpty;
    }
    // connecting Camera
    function connect() {
        //  easyrtc.setVideoDims(videoWidth, videoHeight);
        //this function is called in every new connection (video-call) regardless if we initiated or not. We have to do some low level coding, such as keep in order in an array the participants of the video-call (callParticipants), so we know which video slot is occupied or not, and assign the current incoming call in an empty slot (video tag). Each index of the array corresponds to a video slot
        easyrtc.setStreamAcceptor(function (callerEasyrtcid, stream) {
            var currentConnections = easyrtc.getConnectionCount();
            var video;
            //we check which slots are occupied, so we can position the videos in order, and hide the non occupied videos we Start at 0 and just ignore index 0
            //   var occupiedSlot = ['', false, false, false];
            var callerName = roomParticipants[callerEasyrtcid].username;

            //check if participant exists and reject him if exists
            for (c = 1; c <= 3; c++) {
                if (callParticipants[c] == callerEasyrtcid) {
                    return;
                }
            }
            //allocate the caller to the next available slot
            if (isEmptySlot(currentConnections)) {
                callParticipants[currentConnections] = callerEasyrtcid;
                video = document.getElementById('callerVideo' + currentConnections);
                $("#name-client" + currentConnections).text(callerName);
                console.log('found empty slot');
            }

            if (currentConnections == 1) {
                $(".video-container").css({ 'width': '30vw' });
                $("#rear-video").css({ left: "10vw" });
                $("#far-video1").css({ left: "60vw", visibility: 'visible' });
            }
            if (currentConnections == 2) {
                $(".video-container").css({ 'width': '27vw' });
                $("#rear-video").css({ left: "5vw" });
                $("#far-video1").css({ left: "38vw", visibility: 'visible' });
                $("#far-video2").css({ left: "70vw", visibility: 'visible' });
            }
            if (currentConnections == 3) {
                $(".video-container").css({ 'width': '23vw' });
                $("#rear-video").css({ left: "1vw" });
                $("#far-video1").css({ left: "26vw", visibility: 'visible' });
                $("#far-video2").css({ left: "51vw", visibility: 'visible' });
                $("#far-video3").css({ left: "76vw", visibility: 'visible' });
            }
            easyrtc.setVideoObjectSrc(video, stream);
        });

        //this function is called every time someone exits the video-call. 
        easyrtc.setOnStreamClosed(function (callerEasyrtcid) {
            var currentConnections = easyrtc.getConnectionCount();
            for (c = 1; c <= 3; c++) {
                if (callParticipants[c] == callerEasyrtcid) {
                    $("#name-client" + c).text("");
                    var video = document.getElementById('callerVideo' + c);
                    callParticipants[c] = '';
                    easyrtc.setVideoObjectSrc(video, "");
                    break;
                }
            }
            //nobody remained in chat
            if (currentConnections == 1) {
                $(".video-container").css({ 'width': '35vw' });
                $("#far-video1").css({ visibility: 'hidden' });
                $("#far-video2").css({ visibility: 'hidden' });
                $("#far-video3").css({ visibility: 'hidden' });
                $("#rear-video").css({ left: "10vw" });
            }
            //one person remained in chat
            if (currentConnections == 2) {
                $("#rear-video").css({ left: "10vw" });
                $(".video-container").css({ 'width': '30vw' });
                $("#far-video1").css({ left: "60vw" });
                $("#far-video1").css({ visibility: 'visible' });
                $("#far-video2").css({ visibility: 'hidden' });
                $("#far-video3").css({ visibility: 'hidden' });
                if (!isEmptySlot(1)) { console.log('here'); }
                else if (!isEmptySlot(2)) {
                    console.log('here');
                    document.getElementById("callerVideo1").srcObject = document.getElementById("callerVideo2").srcObject
                    $("#name-client1").text(easyrtc.idToName(callParticipants[2]));
                    callParticipants[1] = callParticipants[2];
                    callParticipants[2] = "";
                    easyrtc.setVideoObjectSrc(document.getElementById("callerVideo2"), "");
                }
                else if (!isEmptySlot(3)) {
                    console.log('here');
                    document.getElementById("callerVideo1").srcObject = document.getElementById("callerVideo3").srcObject
                    $("#name-client1").text(easyrtc.idToName(callParticipants[3]));
                    callParticipants[1] = callParticipants[3];
                    callParticipants[3] = "";
                    easyrtc.setVideoObjectSrc(document.getElementById("callerVideo3"), "");
                }
            }
            //2 people remained in chat
            if (currentConnections == 3) {
                $("#rear-video").css({ left: "5vw" });
                //   $("#selfVideo, #callerVideo1, #callerVideo2, #callerVideo3").css({ 'max-width': '27vw', 'max-width': '27vw' });
                $(".video-container").css({ 'width': '27vw' });
                console.log('2 person remained in chat');
                $("#far-video1").css({ left: "38vw" });
                $("#far-video2").css({ left: "70vw" });
                $("#far-video3").css({ visibility: 'hidden' });
                if (isEmptySlot(1)) {
                    console.log('empty is one ');
                    document.getElementById("callerVideo1").srcObject = document.getElementById("callerVideo3").srcObject
                    $("#name-client1").text(easyrtc.idToName(callParticipants[3]));
                    callParticipants[1] = callParticipants[3];
                }
                else if (isEmptySlot(2)) {
                    console.log('empty is two ');
                    document.getElementById("callerVideo2").srcObject = document.getElementById("callerVideo3").srcObject
                    $("#name-client2").text(easyrtc.idToName(callParticipants[3]));
                    callParticipants[2] = callParticipants[3];
                }
                callParticipants[3] = "";
                easyrtc.setVideoObjectSrc(document.getElementById("callerVideo3"), "");
            }
        });

        easyrtc.setRoomOccupantListener(convertListToButtons);

        easyrtc.initMediaSource(
            function () {        // success callback
                var selfVideo = document.getElementById("selfVideo");
                easyrtc.setVideoObjectSrc(selfVideo, easyrtc.getLocalStream());
                easyrtc.connect("easyrtc.audioVideoSimple", loginSuccess, loginFailure);
            },
            loginFailure
        );
    }


    function loginSuccess(easyrtcid) {
        selfEasyrtcid = window.localStorage.easyrtcUserName;
        $("#iam").text("Me  - " + easyrtc.cleanId(window.localStorage.easyrtcUserName))
    }

    function loginFailure(errorCode, message) {
        easyrtc.showError(errorCode, message);
    }

    // Enabling connect button, on any other client connects to same room. It is called everytime a client is connected to the room, and we need to get it's name, and create a button to make a call 
    function convertListToButtons(roomName, data, isPrimary) {
        if (roomName == null) {
            window.location.reload();
        }
        roomParticipants = data;
        var i = 1;
        $("#connect-buttons").empty();
        //need to exclude own ID 
        for (var easyrtcid in data) {
            if (selfEasyrtcid != easyrtcid) {
                var button = $('<button id="connectbtn"/>')
                    .text("Connect - " + easyrtc.idToName(easyrtcid))
                    .click(function (easyrtcid, i) {
                        return function () {
                            performCall(easyrtcid, i);
                        };
                    }(easyrtcid, i))

                $("#connect-buttons").append(button);
                i++;
            }
        }
    }

    // Disconnect the call
    function disconnect() {
        easyrtc.disconnect()
    }

    // Establishing the connection for video sharing
    function performCall(otherEasyrtcid, otherClientDivNo) {
        console.log(otherClientDivNo);
        var successCB = function () {
            var username = easyrtc.idToName(otherEasyrtcid);
        };
        var failureCB = function () {
        };
        easyrtc.call(otherEasyrtcid, successCB, failureCB);
    }
})
