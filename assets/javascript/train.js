var config = {
    apiKey: "AIzaSyDdh9eDNpdCAJCBfTHkaTH1s4ZsD29NLv8",
    authDomain: "train-scheduler-52b32.firebaseapp.com",
    databaseURL: "https://train-scheduler-52b32.firebaseio.com",
    projectId: "train-scheduler-52b32",
    storageBucket: "train-scheduler-52b32.appspot.com",
    messagingSenderId: "94439665067"
};
firebase.initializeApp(config);
var provider = new firebase.auth.GoogleAuthProvider();
firebase.auth().signInWithPopup(provider).then(function(result) {
    // This gives you a Google Access Token. You can use it to access the Google API.
    var token = result.credential.accessToken;
    // The signed-in user info.
    var user = result.user;
    // ...
  }).catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    // The email of the user's account used.
    var email = error.email;
    // The firebase.auth.AuthCredential type that was used.
    var credential = error.credential;
    // ...
    console.log(errorCode);
  });
var database = firebase.database();
$('#newTrain').on('click', function (event) {
    event.preventDefault();
    var name = $('#name').val();
    var destination = $('#destination').val();
    var fTrainTime = $('#fTrainTime').val();
    var frequency = $('#frequency').val();
    var newTrain = {
        name: name,
        destination: destination,
        fTrainTime: fTrainTime,
        frequency: frequency,
        dateAdded: firebase.database.ServerValue.TIMESTAMP,
    };
    database.ref().push(newTrain);
    alert('New Train Successfully added!');
    $('#name').val('');
    $('#destination').val('');
    $('#fTrainTime').val('');
    $('#frequency').val('');
});
database.ref().on('child_added', function (snapshot) {
    var key = snapshot.key;
    var train = snapshot.val();
    var name = train.name;
    var destination = train.destination;
    var frequency = train.frequency;
    var fTrainTime = train.fTrainTime;
    var newRow = $('<tr class="trainRow"></tr>');
    newRow.attr('data-key',key);
    newRow.attr('data-fTrainTime',fTrainTime);
    newRow.append($('<td contenteditable="true">' + name + '</td>'));
    newRow.append($('<td contenteditable="true">' + destination + '</td>'));
    newRow.append($('<td contenteditable="true">' + frequency + '</td>'));
    var firstTime = moment(fTrainTime, "HH:mm").subtract(1, "years");
    var diffTime = moment().diff(firstTime, "minutes");
    var minutesAway = frequency - (diffTime % frequency);
    var nextArrival = moment(moment().add(minutesAway,'minutes')).format("HH:mm");
    newRow.append('<td>' + nextArrival + '</td>');
    newRow.append($('<td>' + minutesAway + '</td>'));
    newRow.append($('<td><button class="btn btn-sm btn-success updateBtn">Update</button></td>'));
    newRow.append($('<td><button class="btn btn-sm btn-danger removeBtn">Remove</button></td>'));
    $('#scheduleTable tbody').append(newRow);
});
$('body').on('click','.updateBtn',function(){
    var row = $(this).parent().parent();
    var key = row.attr('data-key');
    var name = row.children(':nth-child(1)').text();
    var destination = row.children(':nth-child(2)').text();
    var frequency = row.children(':nth-child(3)').text();
    var keyRef = database.ref().child(key);
    keyRef.update({
        name : name,
        destination : destination,
        frequency : frequency,
    });
    var fTrainTime = row.attr('data-fTrainTime');
    var firstTime = moment(fTrainTime, "HH:mm").subtract(1, "years");
    var diffTime = moment().diff(firstTime, "minutes");
    var minutesAway = frequency - (diffTime % frequency);
    var nextArrival = moment(moment().add(minutesAway,'minutes')).format("HH:mm");
    row.children(':nth-child(4)').text(nextArrival);
    row.children(':nth-child(5)').text(minutesAway);
});
$('body').on('click','.removeBtn',function(){
    var row = $(this).parent().parent();
    var keyRef = database.ref().child(row.attr('data-key'));
    keyRef.remove();
    row.remove();
});
var updateInterval = setInterval(updateTable,1000);
function updateTable () {
    var rows = $('.trainRow');
    for(var i = 0; i<rows.length;i++){
        var fTrainTime = $(rows[i]).attr('data-fTrainTime');
        var frequency = $(rows[i]).children(':nth-child(3)').text();
        var firstTime = moment(fTrainTime, "HH:mm").subtract(1, "years");
        var diffTime = moment().diff(firstTime, "minutes");
        var minutesAway = frequency - (diffTime % frequency);
        var nextArrival = moment(moment().add(minutesAway,'minutes')).format("HH:mm");
        $(rows[i]).children(':nth-child(4)').text(nextArrival);
        $(rows[i]).children(':nth-child(5)').text(minutesAway);
    }
}