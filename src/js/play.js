var http = require('http'), 
    colors = require('colors'), 
    spawn = require('child_process').spawn;

var play;

play = {};
play.playerList = [ 'afplay', 'play' ];

play.Audio = function(audio) {
  this._audio = audio;
}

play.Audio.prototype = {
  pause: function() {
    this._audio.kill('STOP');
  },
  resume: function() {
    this._audio.kill('CONT');
  }
}

exports.play = function(file, callback) {
  var command,
      child;

  if (play.playerList.length == 0) { 
    console.log('No suitable audio player could be found - exiting.'.red);
    return true; 
  }

  command = [file];

  child = spawn(play.playerList[0], command);
  
  child.stderr.setEncoding('ascii');
  child.on('exit', function (code, signal) {
    if(code == null || signal != null || code === 1) {
      console.log('couldnt play, had an error ' + '[code: '+ code + '] ' + '[signal: ' + signal + ']');
    }
    else if(code == 127){
      play.playerList.shift();
      play.sound(file, callback);
    }else if (code == 2) {
      console.log(file.cyan + '=>'.yellow + 'could not be read by your player.'.red)
    }
    else{
      console.log( 'completed'.green + '=>'.yellow + file.magenta);
    }
  });

  return new Audio(child);
}
