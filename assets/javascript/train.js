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
var provider = new firebase.auth.GoogleAuthProvider();
var updateInterval;
firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        login(user);
    }
});
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
    $('#name').val('');
    $('#destination').val('');
    $('#fTrainTime').val('');
    $('#frequency').val('');
});
$('body').on('click', '.updateBtn', function () {
    var row = $(this).parent().parent();
    var key = row.attr('data-key');
    var name = row.children(':nth-child(1)').text();
    var destination = row.children(':nth-child(2)').text();
    var frequency = row.children(':nth-child(3)').text();
    var keyRef = database.ref().child(key);
    keyRef.update({
        name: name,
        destination: destination,
        frequency: frequency,
    });
});
$('body').on('click', '.removeBtn', function () {
    var keyRef = database.ref().child($(this).parent().parent().attr('data-key'));
    keyRef.remove();
});
$('#login').on('click', function () {
    firebase.auth().signInWithPopup(provider).then(function (result) {
    }).catch(function (error) {
        console.log(error);
    });
});
$('#logout').on('click', function () {
    firebase.auth().signOut().then(function () {
        $('#userName').text('');
        $('#loginArea').show();
        $('#mainContent').hide();
        $('#userArea').hide();
        database.ref().off('child_removed');
        database.ref().off('child_changed');
        database.ref().off('child_added');
        $('.trainRow').remove();
        clearInterval(updateInterval);
    }).catch(function (error) {
        console.log(error);
    });
});
function login(user) {
    $('#userName').text(user.displayName);
    $('#loginArea').hide();
    $('#mainContent').show();
    $('#userArea').show();
    database.ref().on('child_removed', function (row) {
        $(`[data-key = ${row.key}]`).remove();
    });
    database.ref().on('child_changed', function (snapshot) {
        var newRow = updateRow(snapshot);
        $(`[data-key = ${snapshot.key}]`).replaceWith(newRow);
    });
    database.ref().on('child_added', function (snapshot) {
        var newRow = updateRow(snapshot);
        $('#scheduleTable tbody').append(newRow);
    });
    updateInterval = setInterval(updateTable, 1000);
}
function updateTable() {
    var rows = $('.trainRow');
    for (var i = 0; i < rows.length; i++) {
        var fTrainTime = $(rows[i]).attr('data-fTrainTime');
        var frequency = $(rows[i]).children(':nth-child(3)').text();
        var firstTime = moment(fTrainTime, "HH:mm").subtract(1, "years");
        var diffTime = moment().diff(firstTime, "minutes");
        var minutesAway = frequency - (diffTime % frequency);
        var nextArrival = moment(moment().add(minutesAway, 'minutes')).format("HH:mm");
        $(rows[i]).children(':nth-child(4)').text(nextArrival);
        $(rows[i]).children(':nth-child(5)').text(minutesAway);
    }
}
function updateRow(snapshot) {
    var key = snapshot.key;
    var train = snapshot.val();
    var newRow = $('<tr class="trainRow"></tr>');
    newRow.attr('data-key', key);
    newRow.attr('data-fTrainTime', train.fTrainTime);
    newRow.append($('<td contenteditable="true">' + train.name + '</td>'));
    newRow.append($('<td contenteditable="true">' + train.destination + '</td>'));
    newRow.append($('<td contenteditable="true">' + train.frequency + '</td>'));
    newRow.append($('<td>'));
    newRow.append($('<td>'));
    newRow.append($('<td><button class="btn btn-sm btn-success updateBtn">Update</button></td>'));
    newRow.append($('<td><button class="btn btn-sm btn-danger removeBtn">Remove</button></td>'));
    return newRow;
}