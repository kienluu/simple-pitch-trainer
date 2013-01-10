(function($){
    $(document).ready(function(){
        $('.start-button').click(function(){
            $('.start-box').addClass('hidden');
            $('.trainer-box').removeClass('hidden');
        });

        // Debug
        $('.start-button').click();
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
                       name: letters[j]
                    });
                }
            }
        };

        this.randomNotes = function() {
            noteA = notes[Math.floor(Math.random() * notes.length)];
            noteB = notes[Math.floor(Math.random() * notes.length)];
        };

        this.getNoteA = function() {return noteA; }
        this.getNoteB = function() {return noteB; }

        init();
    }
    debugger;
})(window.jQuery);