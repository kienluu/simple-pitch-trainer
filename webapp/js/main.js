(function($){
    $(document).ready(function(){
        $('.start-button').click(function(){
            $('.start-box').addClass('hidden');
            $('.trainer-box').removeClass('hidden');
        });

        var noteTrainerApp = new NoteTrainerApp();

        $('.trainer-box .play').click(function(){
            noteTrainerApp.play();
        });

        // Debug
        $('.start-button').click();
        window.app = noteTrainerApp;
        noteTrainerApp.makeQuestion();

    });

    var RandomNoteTrainer = function () {
        var letters = ['a', 'a#', 'b', 'c', 'c#', 'd', 'd#', 'e', 'f', 'f#', 'g', 'g#'];
        var octaves = ['2','3'];
        var urlPrefix = '/mp3/note_';
        var extension = '.mp3';
        var notes = [];
        var noteA;
        var noteB;

        var init = function () {
            for (var i=0; i < octaves.length; i++){
                var octave = octaves[i];
                for (var j=0; j < letters.length; j++){
                    notes.push({
                       url: encodeURI(urlPrefix + letters[j].replace('#','sharp') + octave + extension),
                       name: letters[j],
                       value: parseInt(j)
                    });
                }
            }
        };

        this.makeQuestion = function() {
            noteA = notes[Math.floor(Math.random() * notes.length)];
            noteB = notes[Math.floor(Math.random() * notes.length)];
            console.log(noteA, noteB);
        };

        this.getNoteA = function() {return noteA; }
        this.getNoteB = function() {return noteB; }
        this.answerQuestion = function(guess){
          if (guess=='same'){
              if (noteB.value == noteA.value) return true;
              return false;
          }
          else if (guess=='lower') {
              if (noteB.value < noteA.value) return true;
              return false
          }
          else if (guess=='higher') {
              if (noteB.value > noteA.value) return true;
              return false;
          }
          throw Error('Unknown value for guess.');
        };

        init();
    }

    var NoteTrainerApp = function() {
        var $audioA, $audioB, audioA, audioB;
        // Declare here for ide auto completion
        var noteTrainer = new RandomNoteTrainer();

        var init = function() {
            // NOTE: If using source, the whole audio tag must be replaced as its src will not automatically refresh
            // NOTE2: chrome needs the server to support 206 partial content to play.  firefox dont but it needs ogg files
            var $audioBox = '';
            $('body').append('<div id="audio-box-19875876"><audio class="audio-a" controls preload="auto"></audio><audio class="audio-b" controls preload="auto"></audio></div>');

            $audioA = $('#audio-box-19875876 .audio-a');
            audioA = $audioA.get(0);
            window.audioA = audioA;
            $audioB = $('#audio-box-19875876 .audio-b');
            audioB = $audioB.get(0);
        };

        this.makeQuestion = function(){
            noteTrainer.makeQuestion();
            $audioA.attr('src', noteTrainer.getNoteA().url);
            $audioB.attr('src', noteTrainer.getNoteB().url);
        };

        this.answerQuestion = function(guess){
            return noteTrainer.answerQuestion(guess);
        };

        this.play = function() {
            audioA.play();
            setTimeout(function(){
                audioB.play();
            }, 1000);
        };

        init();
    }
})(window.jQuery);