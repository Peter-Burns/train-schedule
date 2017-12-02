var config = {
    apiKey: "AIzaSyDdh9eDNpdCAJCBfTHkaTH1s4ZsD29NLv8",
    authDomain: "train-scheduler-52b32.firebaseapp.com",
    databaseURL: "https://train-scheduler-52b32.firebaseio.com",
    projectId: "train-scheduler-52b32",
    storageBucket: "train-scheduler-52b32.appspot.com",
    messagingSenderId: "94439665067"
};
firebase.initializeApp(config);
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
    var train = snapshot.val();
    var name = train.name;
    var destination = train.destination;
    var frequency = train.frequency;
    var fTrainTime = train.fTrainTime;
    var newRow = $('<tr>');
    newRow.append($('<td>' + name + '</td>'));
    newRow.append($('<td>' + destination + '</td>'));
    newRow.append($('<td>' + frequency + '</td>'));
    var firstTime = moment(fTrainTime, "HH:mm").subtract(1, "years");
    var diffTime = moment().diff(firstTime, "minutes");
    var minutesAway = frequency - (diffTime % frequency);
    var nextArrival = moment(moment().add(minutesAway,'minutes')).format("HH:mm");
    newRow.append('<td>' + nextArrival + '</td>');
    newRow.append($('<td>' + minutesAway + '</td>'));
    $('#scheduleTable tbody').append(newRow);
});