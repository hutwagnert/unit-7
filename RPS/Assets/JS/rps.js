$(function() {
    $('#startGame').modal('show');  // Open the Bootrap 4 modal on start

    var config = {
        apiKey: "AIzaSyDasEFFJptOz2EEsJT9uO5eiIWWdzB-XoA",
        authDomain: "ucb-tate-test.firebaseapp.com",
        databaseURL: "https://ucb-tate-test.firebaseio.com",
        projectId: "ucb-tate-test",
        storageBucket: "ucb-tate-test.appspot.com",
        messagingSenderId: "781755290553"
      };
     
    // Firebase database init
    firebase.initializeApp(config);
    var db = firebase.database();

  
    var whchplayer = db.ref('players'); 
    var thisisplay1 = whchplayer.child('move1'); 
    var thisisplay2 = whchplayer.child('move2');
    var numberofwins = db.ref('win');
    var numberofloses = db.ref('losses');
    var turnsfordb = db.ref('turn'); 
    var connections = db.ref("connections"); 
    var thisisconnected = db.ref(".info/connected");
    var resultsin = db.ref("results");
    var player2name = '';
    var player1name = '';
    var p1Wins = 0;
    var p1Losses = 0;
    var p1Choice = '';
    var p2Wins = 0;
    var p2Losses = 0;
    var p2Choice = '';
    var turn = '';
    var numberofplayers = 0;
   var whatresults =''

    resultsin.on('value', function check(snapper) { 
       whatresults= snapper.val();
       console.log(whatresults);
       $('#resultsPanel').find('h4').text(whatresults);
});
// numberofwins.on('value', function check(snapper) { 
//     couldyouwinP1= snapper.val().p1;
//     couldyouwinP2= snapper.val().p2;
    
//     $('#p2WinCountSpan').text(couldyouwinP1);
   
//     $('#p1WinCountSpan').text(couldyouwinP2);
//     connections.onDisconnect().remove();
//     console.log(couldyouwinP1);
//     console.log(couldyouwinP2);
// });

// numberofloses.on('value', function check(snapp) { 
//     couldyouloseP1= snapp.val().p1;
//     couldyouloseP2= snapp.val().p2;
//     $('#p1LoseCountSpan').text(couldyouloseP1);
//     $('#p2LoseCountSpan').text(couldyouloseP2);
//     connections.onDisconnect().remove();
//     console.log(couldyouloseP1);
//     console.log(couldyouloseP2);
// });

    // Functions
    function playerName (){
        thisisconnected.on('value', function check(snapshot) { 
            if(snapshot.val()){
                connections.push(true);
                connections.onDisconnect().remove();
            }
        });
        connections.on('value', function numbertime(snapshot) { 
            
            numberofplayers = snapshot.numChildren();  
            console.log(numberofplayers);  
            playerName = $('#name').val(); 
            console.log(playerName);
            $('span.playerName').text(playerName); 

            if(numberofplayers == 1) { 
             // playertwocard.style.display = "none";
                player1name = playerName;  
                var move1 = {
                    choice: '',
                    name: player1name, 
                };
                var trackturn = { whoseturn: turn };

               
                thisisplay1.set(move1);
                turnsfordb.set(trackturn);
                $('#resultsPanel').find('h4').text('Waiting for player 2');
                console.log('Waiting for player 2');
                turn = 'p2turn';
                turnsfordb.update({ whoseturn: turn }); 
            }
            else if(numberofplayers == 2) {  
                player2name = playerName;  
                var move2 = {
                    choice: '',
                    name: player2name
                };
                var w = {
                    move1: p1Wins,
                    move2: p2Wins
                }
                var l = {
                    move1: p1Losses,
                    move2: p2Losses
                }
                thisisplay2.set(move2); 
                numberofwins.set(w);
                numberofloses.set(l);
           
                console.log('play now');
                turn = 'p1turn';
                turnsfordb.update({ whoseturn: turn });
                resultsin.set('Play Now!');

                $('#resultsPanel').find('h4').text(whatresults);
            }
        });
    }

    turnsfordb.on('child_changed', function nxtturn(snapshot) { // Listen for turn changes
        var pturn = snapshot.val();
        console.log('its' +pturn);
        if(pturn == 'p1turn' && numberofplayers == 2) { 
            $('#p1ChoiceDiv').on('click','.thisbtn', function play1chooser(){
                p1Choice = $(this).attr('data-userChoice');
                thisisplay1.update({ choice: p1Choice });
                console.log(p1Choice);
                turn = 'p2turn'; 
                turnsfordb.update({ whoseturn: turn });
            }); //player on clicks
        }
        else if(pturn == 'p2turn' && numberofplayers == 2) { 
        $('#p2ChoiceDiv').on('click','.thisbtn', function play1chooser(){
            p2Choice = $(this).attr('data-userChoice');
            thisisplay2.update({ choice: p2Choice });
            console.log(p2Choice);
            turn = 'p1turn'; 
            turnsfordb.update({ whoseturn: turn });
        }); // player two click
        }
    });



    whchplayer.on('value', function player2isplaying(snapshot) {   
        if(turn == 'p2turn' && numberofplayers == 2) {
            var nameofplay1 = snapshot.val().move1.name;
            var nameofplay2 = snapshot.val().move2.name;
            var player1choice = snapshot.val().move1.choice;
            var player2choice = snapshot.val().move2.choice;

            if( player1choice == 'rock' && player2choice == 'rock'){
                resultsin.set('Tie');
               
            }
            else if( player1choice == 'rock' && player2choice == 'paper'){
                resultsin.set('Player 2:' + ' '+nameofplay2+' '+'Won');
               
                p1Losses = p1Losses +1;
                p2Wins =p2Wins +1;
                numberofwins.update({ p1: p1Wins, p2: p2Wins});
                numberofloses.update({ p1: p1Losses, p2: p2Losses });
            }
            else if( player1choice == 'rock' && player2choice == 'scissors'){
                resultsin.set('Player 1:' + ' '+nameofplay1+' '+'Won');
                
                p2Losses= p2Losses +1;
                p1Wins= p1Wins +1;
                numberofwins.update({ p1: p1Wins, p2: p2Wins});
                numberofloses.update({ p1: p1Losses, p2: p2Losses });

            }
            else if( player1choice == 'paper' && player2choice == 'paper'){
                resultsin.set('Tie');

            }
            else if( player1choice == 'paper' && player2choice == 'rock'){
                resultsin.set('Player 1:' + ' '+nameofplay1+' '+'Won');

                p2Losses = p2Losses +1;
                p1Wins =p1Wins +1;
                numberofwins.update({ p1: p1Wins, p2: p2Wins });
                numberofloses.update({ p1: p1Losses, p2: p2Losses });

            }
            else if( player1choice == 'paper' && player2choice == 'scissors'){
                resultsin.set('Player 2:' + ' '+nameofplay2+' '+'Won');

                p1Losses =p1Losses +1;
                p2Wins =p2Wins +1;
                numberofwins.update({ p1: p1Wins, p2: p2Wins });
                numberofloses.update({ p1: p1Losses, p2: p2Losses });
            }
            else if( player1choice == 'scissors' && player2choice == 'scissors'){
                resultsin.update('Tie');


            }
            else if( player1choice == 'scissors' && player2choice == 'rock'){
                resultsin.set('Player 2:' + ' '+nameofplay2+' '+'Won');

                p1Losses =p1Losses+1;
                p2Wins =p2Wins+1;
                numberofwins.update({ p1: p1Wins, p2: p2Wins });
                numberofloses.update({ p1: p1Losses, p2: p2Losses });

            }
            else if( player1choice == 'scissors' && player2choice == 'paper'){
               resultsin.set('Player 1:' + ' '+nameofplay1+' '+'Won');

                p2Losses =p2Losses+1;
                p1Wins= p1Wins+1;
                
                numberofwins.update({ p1: p1Wins, p2: p2Wins });
                numberofloses.update({ p1: p1Losses, p2: p2Losses });

            }
        }
    });

    $('#startup').on('click', playerName);
  


   
});