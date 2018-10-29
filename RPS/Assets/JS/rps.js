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

    // Reference the database
    var db = firebase.database();

    // Firebase Reference collections
    var whchplayer = db.ref('players'); // Reference entire players folder 
    var thisisplay1 = whchplayer.child('p1'); // Reference entire P1 folder
    var thisisplay2 = whchplayer.child('p2'); // Reference entire P2 folder
    var numberofwins = db.ref('win');    // Reference both player losses
    var numberofloses = db.ref('losses');    // Reference both player wins
    var turnRef = db.ref('turn'); // to track the turns
    var connectionsRef = db.ref("connections"); // Folder to store each connection
    var connectedRef = db.ref(".info/connected");// Firebase's default Ref to track connections (boolean)


    // Variables
    let p2NameVal = '';
    let p1NameVal = '';
    let p1Wins = 0;
    let p1Losses = 0;
    let p1Choice = '';
    let p2Wins = 0;
    let p2Losses = 0;
    let p2Choice = '';
    let turn = '';
    let activePnum = 0;
    let resultsin = '';

    // DOM caching
    const $lego = $('#lego');
    const $pName = $('#name');
    const $p1Panel = $('#playerOne');
    const $p2Panel = $('#playerTwo');
    const $p1Badge = $p1Panel.find('.badge');
    const $p2Badge = $p2Panel.find('.badge'); 
    // const $p1NameSpan = $('.playerOneName');
    // const $p2NameSpan = $('.playerTwoName');
    const $pNameSpan = $('span.playerName');
    const $p1choice = $('#p1ChoiceDiv');
    const $p2choice = $('#p2ChoiceDiv');
    const $rPanel = $('#resultsPanel').find('h4');
    const $p1LoseCountSpan = $('#p1LoseCountSpan');
    const $p1WinCountSpan = $('#p1WinCountSpan');
    const $p2LoseCountSpan = $('#p2LoseCountSpan');
    const $p2WinCountSpan = $('#p2WinCountSpan');


    // Functions
    const playerName = () => {
        connectedRef.on('value', (snap) => { // Check if someone connected/disconnected
            if(snap.val()){ // If someone connected
                connectionsRef.push(true);
                connectionsRef.onDisconnect().remove(); // Remove user from the connection list when they disconnect
            }
        });
        connectionsRef.on('value', (snap) => { // If I just moved someone to my connection folder
            console.log(`Number of players online ${snap.numChildren()}`); 
            activePnum = snap.numChildren();    // Get the number of connections at the moment
            pNameVal = $pName.val(); // Get the name of the user
            $pNameSpan.html(` ${pNameVal}`); // Greet current player

            if(activePnum == 1) { // If you're the 1st player
              
                
                p1NameVal = pNameVal;   // Store the current name into a new variable to keep track inside the app
                // Create the object
                const p1 = {
                    choice: '',
                    name: p1NameVal, 
                };
                const t = { whoseturn: turn };

                // Sync object
                thisisplay1.set(p1);
                turnRef.set(t);

                // Wait for player two
                $rPanel.html('Waiting for player 2');
                console.log('Waiting for player 2');

                turn = 'p2turn';
                turnRef.update({ whoseturn: turn }); // Update the turn in the db

            }
            else if(activePnum == 2) {  // If you are the 2nd player
                p2NameVal = pNameVal;   // Store the current name into a different variable to keep track
                // Create the object
                const p2 = {
                    choice: '',
                    name: p2NameVal
                };
                const w = {
                    p1: p1Wins,
                    p2: p2Wins
                }
                const l = {
                    p1: p1Losses,
                    p2: p2Losses
                }
                // Sync object
                thisisplay2.set(p2); 
                numberofwins.set(w);
                numberofloses.set(l);

                // Inform user
                $rPanel.html('Play Now!');
                console.log('play now');
                turn = 'p1turn';
                turnRef.update({ whoseturn: turn });
            }
        });
    }

    turnRef.on('child_changed', (snap) => { // Listen for turn changes
        let pturn = snap.val();
        console.log(`It's ${pturn}`);
        if(pturn == 'p1turn' && activePnum == 2) {  // If it's p1 turn and there's 2 players online
            $p1choice.on('click', getPchoice(pturn)); // Listen for p1 click events on the choice btns
        }
        else if(pturn == 'p2turn' && activePnum == 2) { //If it's p1 turn and there's 2 players online
            $p2choice.on('click', getPchoice(pturn)); // Liste for p2 click events
        }
    });

    whchplayer.on('value', (snap) => {   // When P2 makes a choice
        if(turn == 'p2turn' && activePnum == 2) {   // Only compute results when is player 2's turn and there are 2 people connected
            let p1name = snap.val().p1.name;
            let p2name = snap.val().p2.name;
            let p1hand = snap.val().p1.choice;
            let p2hand = snap.val().p2.choice;

            if( p1hand == 'rock' && p2hand == 'rock'){
                resultsin = 'Tie';
                $rPanel.html(resultsin);
            }
            else if( p1hand == 'rock' && p2hand == 'paper'){
                resultsin = `Player 2:<br>${p2name}<br>Won`;
                p1Losses++;
                p2Wins++;
                numberofwins.update({ p1: p1Wins, p2: p2Wins});
                numberofloses.update({ p1: p1Losses, p2: p2Losses });
                $p1LoseCountSpan.html(p1Losses);
                $p2WinCountSpan.html(p2Wins);
                $rPanel.html(resultsin);
            }
            else if( p1hand == 'rock' && p2hand == 'scissors'){
                resultsin = `Player 1:<br>${p1name}<br>Won`;
                p2Losses++;
                p1Wins++;
                numberofwins.update({ p1: p1Wins, p2: p2Wins});
                numberofloses.update({ p1: p1Losses, p2: p2Losses });
                $p1WinCountSpan.html(p1Wins);
                $p2LoseCountSpan.html(p2Losses);
                $rPanel.html(resultsin);
            }
            else if( p1hand == 'paper' && p2hand == 'paper'){
                resultsin = 'Tie';
                $rPanel.html(resultsin);
            }
            else if( p1hand == 'paper' && p2hand == 'rock'){
                resultsin = `Player 1:<br>${p1name}<br>Won`;
                p2Losses++;
                p1Wins++;
                numberofwins.update({ p1: p1Wins, p2: p2Wins });
                numberofloses.update({ p1: p1Losses, p2: p2Losses });
                $p1WinCountSpan.html(p1Wins);
                $p2LoseCountSpan.html(p2Losses);
                $rPanel.html(resultsin);
            }
            else if( p1hand == 'paper' && p2hand == 'scissors'){
                resultsin = `Player 2:<br>${p2name}<br>Won`;
                p1Losses++;
                p2Wins++;
                numberofwins.update({ p1: p1Wins, p2: p2Wins });
                numberofloses.update({ p1: p1Losses, p2: p2Losses });
                $p1LoseCountSpan.html(p1Losses);
                $p2WinCountSpan.html(p2Wins);
                $rPanel.html(resultsin);
            }
            else if( p1hand == 'scissors' && p2hand == 'scissors'){
                resultsin = 'Tie';
                $rPanel.html(resultsin);
            }
            else if( p1hand == 'scissors' && p2hand == 'rock'){
                resultsin = `Player 2:<br>${p2name}<br>Won`;
                p1Losses++;
                p2Wins++;
                numberofwins.update({ p1: p1Wins, p2: p2Wins });
                numberofloses.update({ p1: p1Losses, p2: p2Losses });
                $p1LoseCountSpan.html(p1Losses);
                $p2WinCountSpan.html(p2Wins);
                $rPanel.html(resultsin);
            }
            else if( p1hand == 'scissors' && p2hand == 'paper'){
                resultsin = `Player 1:<br>${p1name}<br>Won`;
                p2Losses++;
                p1Wins++;
                numberofwins.update({ p1: p1Wins, p2: p2Wins });
                numberofloses.update({ p1: p1Losses, p2: p2Losses });
                $p1WinCountSpan.html(p1Wins);
                $p2LoseCountSpan.html(p2Losses);
                $rPanel.html(resultsin);
            }
        }
    });

    const getPchoice = (pturn) => {  // Save user choice to Firebase
        return e => {
            let leTarget = $(e.target);
            let pChoice = leTarget.attr('data-userChoice');    // Get player choice attr from the clicked button
           // leTarget.closest('div.card').find('img').attr('src', `./assets/imgs/${pChoice}.png`); // Change the img to match the user's choice
            if (pturn == 'p1turn'){
                p1Choice = pChoice; // store the the data-userChoice attr value in a variable
                thisisplay1.update({ choice: p1Choice }); //Update the database with the user choice
                turn = 'p2turn';    // Change the turn and store the value in a variable
                turnRef.update({ whoseturn: turn });    // Update the turn in the database
                $p1Badge.toggleClass('yourturn');
                $p2Badge.toggleClass('yourturn');
                $p1choice.off('click'); // Removes the event listener 
            }
            else {
                p2Choice = pChoice;
                thisisplay2.update({ choice: p2Choice }); //Update the user choice
                turn = 'p1turn';
                turnRef.update({ whoseturn: turn });
                $p1Badge.toggleClass('yourturn');
                $p2Badge.toggleClass('yourturn');
                $p2choice.off('click');
            }
        }
    }



    // Event Binders
    $lego.on('click', playerName);
  


   
});