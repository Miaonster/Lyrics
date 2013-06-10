"use strict";

var play = require('play'),
    gui = require('nw.gui'),
    input = require('./js/input.js'),
    mm = require('musicmetadata'),
    fs = require('fs');

var audio,
    $start,
    $stop,
    $pause,
    $resume,
    $insert,
    $open,
    $openInput,
    $title,
    $artist,
    $path,
    lyricsMonitor = null,
    win = gui.Window.get();

function init() {
  $start = $('#start');
  $stop = $('#stop'),
  $pause = $('#pause');
  $resume = $('#resume');
  $insert = $('#insert');
  $open = $('#open');
  $openInput = $('#open-input');
  $title = $('#music-info-title');
  $artist = $('#music-info-artist');
  $path = $('#music-info-path');

  var $doc = $(document);

  $doc.on('click', '#start:not(.disable)', function() {
    lyricsMonitor.start();
  });

  $doc.on('click', '#stop:not(.disable)', function() {
    lyricsMonitor.stop();
  });

  $doc.on('click', '#pause:not(.disable)', function() {
    lyricsMonitor.pause();
  });

  $doc.on('click', '#resume:not(.disable)', function() {
    lyricsMonitor.resume();
  });

  $doc.on('click', '#insert:not(.disable)', function() {
    lyricsMonitor.insert();
  });

  $doc.on('click', '#open:not(.disable)', function() {
    $openInput.click();
  });

  $doc.on('change', '#open-input', function(e) {
    lyricsMonitor.init(e.target.files[0]);
  });
}

lyricsMonitor = {
  _audio: null,
  _position: 0,
  src: null,
  init: function(file) {
    var parser, path;
    if (!file || !file.path)  {
      return;
    }
    this.src = path = file.path;
    $path.text(path);
    parser = new mm(fs.createReadStream(path));
    parser.on('metadata', function(result) {
      lyricsMonitor.initMusicInfo(file, result);
    });
  },
  initMusicInfo: function(file, result) {
    var title, artist;
    title = result.title || file.name.replace('.mp3', '');
    artist = result.artist || '';
    $title.text(title);
    $artist.text(artist);
  },
  start: function() {
    if (this.src) {
      this._audio = play.play(this.src, this.stop.bind(this)),
      this._input = document.querySelector('#lyrics');
      this._startTimestamp = new Date().getTime();
      $start.addClass('disable');
      $pause.removeClass('disable');
      $resume.addClass('disable');
      $stop.removeClass('disable');
      $insert.removeClass('disable');
    }
  },
  getTimestamp: function() {
    var mm, ss, xx, now, diff;
    now = new Date().getTime();
    diff = (now - this._startTimestamp);
    xx = parseInt((diff % 1000) / 10);
    xx = xx < 10 ? '0' + xx.toString() : xx;
    ss = parseInt((diff % 60000) / 1000);
    ss = ss < 10 ? '0' + ss.toString() : ss;
    mm = parseInt(diff / 60000);
    mm = mm < 10 ? '0' + mm.toString() : mm;
    return '[' + mm + ':' + ss + '.' + xx + ']';
  },
  insert: function() {
    var i, text, pos, newPos, timeText;

    timeText = this.getTimestamp();
    input.setCursorPosition(this._input, this._position);
    input.insertAtCursorPos(this._input, timeText);

    text = this._input.value.substring(this._position);
    pos = text.search(/\n[^\n]/ig);

    if (pos === -1) {
      return;
    }

    this._position += pos + 1;
  },
  resume: function() {
    this._audio.resume();
    this._startTimestamp += new Date().getTime() - this._startTimestampPause;
    $resume.addClass('disable');
    $pause.removeClass('disable');
  },
  pause: function() {
    this._audio.pause();
    this._startTimestampPause = new Date().getTime();
    $resume.removeClass('disable');
    $pause.addClass('disable');
  },
  stop: function() {
    try {
      this._audio.stop();
    } catch(e) {
      console.log('close fail');
    }
    $start.removeClass('disable');
    $pause.addClass('disable');
    $resume.addClass('disable');
    $stop.addClass('disable');
    $insert.addClass('disable');
  }
}

window.onload = function() {
  init();
}
win.on('close', function() {
  lyricsMonitor.stop();
  console.log("We're closing...");
  this.close(true);
});
