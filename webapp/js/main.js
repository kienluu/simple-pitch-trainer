(function($){
    $(document).ready(function(){
        $('.start-button').click(function(){
            $('.start-box').addClass('hidden');
            $('.trainer-box').removeClass('hidden');
        });

        // Setup the trainer app

        var buttonSelectors = {
            same: '.btn-group button.same',
            lower: '.btn-group button.lower',
            higher: '.btn-group button.higher',
            play: 'button.play',
            next: '.btn-group button.next'
        };

        var gameStats = new GameStats();
        $correctAnswerCountP = $('.stats-box p.correct');
        $wrongAnswerCountP = $('.stats-box p.wrong');

        var resetElementStyles = function() {
            // Clear up all the answer related divs / icons
            $('.answer-info p.show, .answer-choices .icon-remove, .answer-choices .icon-ok').removeClass('show');
        };

        var onNewQuestion = function() {
            resetElementStyles();

            gameStats.addNewQuestion();
        };

        var onWrongAnswer = function(event, app) {
            resetElementStyles();
            $button = $(buttonSelectors[app.getLastChoice()]);
            $button.find('.icon-remove').addClass('show');
            $('.answer-info p.wrong-text').addClass('show');

            gameStats.addWrong();
            $wrongAnswerCountP.text(gameStats.totalWrongCount());
        };

        var onCorrectAnswer = function(event, app) {
            resetElementStyles();
            $button = $(buttonSelectors[app.getLastChoice()]);
            $button.find('.icon-ok').addClass('show');
            $('.answer-info p.correct-text').addClass('show');

            gameStats.addCorrect();
            $correctAnswerCountP.text(gameStats.totalCorrectCount());
        };


        var noteTrainerApp = new NoteTrainerApp({
            sameButtonSelectors: buttonSelectors.same,
            lowerButtonSelectors: buttonSelectors.lower,
            higherButtonSelectors: buttonSelectors.higher,
            playButtonSelectors: buttonSelectors.play,
            nextButtonSelectors: buttonSelectors.next,

            onNewQuestion: onNewQuestion,
            onWrongAnswer: onWrongAnswer,
            onCorrectAnswer: onCorrectAnswer,

            doNotDisablePlay:true
        });

        // Debug
//        $('.start-button').click();
//        window._app = noteTrainerApp;

    });

    var RandomNoteTrainer = function() {
        var self = this;
        var $self = $(this);
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

        self.makeQuestion = function() {
            noteA = notes[Math.floor(Math.random() * notes.length)];
            noteB = notes[Math.floor(Math.random() * notes.length)];
            //console.log(noteA, noteB);
        };

        self.getNoteA = function() {return noteA; };
        self.getNoteB = function() {return noteB; };
        self.answerQuestion = function(guess){
          if (guess=='same'){
              return noteB.value == noteA.value;
          }
          else if (guess=='lower') {
              return noteB.value < noteA.value;
          }
          else if (guess=='higher') {
              return noteB.value > noteA.value;
          }
          throw Error('Unknown value for guess.');
        };

        init();
    };

    var NoteTrainerEngine = function(_options) {
        var self = this;
        var $self = $(this);
        var defaultOptions = {
            secondTonePlayDelay: 1300
        };
        var options = $.extend({}, defaultOptions, _options);

        var EVENT_FINNISH_PLAY_BACK = 'finnishplayback';

        var $audioA, $audioB, audioA, audioB;
        // Declare here for ide auto completion
        var noteTrainer = new RandomNoteTrainer();

        var init = function() {
            // NOTE: If using source, the whole audio tag must be replaced as its src will not automatically refresh
            // NOTE2: chrome needs the server to support 206 partial content to play.  firefox dont but it needs ogg files
            var $audioBox = $('<div id="audio-box-19875876"><audio class="audio-a" controls preload="auto"></audio><audio class="audio-b" controls preload="auto"></audio></div>');
            $('body').append($audioBox);

            $audioA = $('#audio-box-19875876 .audio-a');
            audioA = $audioA.get(0);
            window.audioA = audioA;
            $audioB = $('#audio-box-19875876 .audio-b');
            audioB = $audioB.get(0);

            $audioB.bind('ended', function(){
                if (timeOut){
                    $self.trigger(EVENT_FINNISH_PLAY_BACK);
                }
            });
        };

        self.makeQuestion = function(){
            noteTrainer.makeQuestion();
            $audioA.attr('src', noteTrainer.getNoteA().url);
            $audioB.attr('src', noteTrainer.getNoteB().url);
        };

        self.answerQuestion = function(guess){
            return noteTrainer.answerQuestion(guess);
        };

        var timeOut;
        self.play = function() {
            self.stopAudio();

            audioA.play();
            timeOut = setTimeout(function(){
                timeOut = null;
                audioB.play();
                timeOut = setTimeout(function(){
                    timeOut = null;
                    $self.trigger(EVENT_FINNISH_PLAY_BACK);
                }, options.secondTonePlayDelay);
            }, options.secondTonePlayDelay);
        };

        self.stopAudio = function() {
            if (timeOut) clearTimeout(timeOut);
            try {
                audioA.pause();
                audioA.currentTime = 0;
                audioB.pause();
                audioB.currentTime = 0;
            }
            catch (error){
                // Ignore
            }
        };

        init();
    };

    var NoteTrainerApp = function(_options) {
        var self = this;
        var $self = $(this);
        var defaultOptions = {
            doNotDisablePlay: false
        }
        var options = $.extend({}, defaultOptions, _options);

        var EVENT_NEW_QUESTION = 'newquestion';
        var EVENT_ANSWER_WRONG = 'answerwrong';
        var EVENT_ANSWER_CORRECT = 'answercorrect';

        var engine = new NoteTrainerEngine(options);
        var $sameButtons, $lowerButtons, $higherButtons, $playButtons, $nextButtons;
        var lastChoice = '';

        var init = function() {
            $sameButtons = $(options.sameButtonSelectors);
            $sameButtons.click(function(){answerQuestion('same')});

            $lowerButtons = $(options.lowerButtonSelectors);
            $lowerButtons.click(function(){answerQuestion('lower')});

            $higherButtons = $(options.higherButtonSelectors);
            $higherButtons.click(function(){answerQuestion('higher')});

            $playButtons = $(options.playButtonSelectors);
            $playButtons.click(function(){ play(); });
            $(engine).bind('finnishplayback', function(){
                enablePlayButton();
            });

            $nextButtons = $(options.nextButtonSelectors);
            $nextButtons.click(function(){
                restart();
            });

            if (options.onNewQuestion) {
                $self.bind(EVENT_NEW_QUESTION, options.onNewQuestion);
            }
            if (options.onWrongAnswer) {
                $self.bind(EVENT_ANSWER_WRONG, options.onWrongAnswer);
            }
            if (options.onCorrectAnswer) {
                $self.bind(EVENT_ANSWER_CORRECT, options.onCorrectAnswer);
            }

            start();
        };

        var play = function() {
            engine.play();
            if (!options.doNotDisablePlay)
                $playButtons.prop('disabled', true);
        };
        self.play = play;

        var enablePlayButton = function() {
            $playButtons.prop('disabled', false);
        };

        var start  = function() {
          restart();
        };
        
        var restart = function() {
          engine.stopAudio();
          engine.makeQuestion();
          enableChoices();
          $self.trigger('newquestion');
        };

        var answerQuestion = function(choice) {
            lastChoice = choice;
            var success = engine.answerQuestion(choice);
            //console.log(success);
            if (!success){
                onWrong();
            }
            else {
                onCorrect();
            }
        };

        var onWrong = function() {
            $self.trigger('answerwrong', [self]);
        };
        
        var onCorrect = function() {
            $self.trigger('answercorrect', [self]);
            disableChoices();
        };

        var disableChoices = function() {
            $sameButtons.prop('disabled', true);
            $lowerButtons.prop('disabled', true);
            $higherButtons.prop('disabled', true);
            $nextButtons.prop('disabled', false);
        };
        
        var enableChoices = function() {
            $sameButtons.prop('disabled', false);
            $lowerButtons.prop('disabled', false);
            $higherButtons.prop('disabled', false);
            $nextButtons.prop('disabled', true);
        };

        this.getLastChoice = function() {
            return lastChoice;
        };

        init();
    };


    var GameStats = function(options) {
        var self = this;
        var $self = $(self);
        options = options || {};
        var currentStat;
        var statList = [];

        var init = function() {
            reset();
        };

        var reset = function() {
            statList = [];
        };

        var createStat = function(questionNo) {
            var stats =  {
                wrong: 0,
                correct: 0,
                questionNo: questionNo
            };
            return stats;
        };


        // Public

        self.addNewQuestion = function() {
            var stats = createStat(statList.length + 1);
            currentStat = stats;
            statList.push(stats);
        };

        self.addWrong = function() {
            currentStat.wrong += 1;
        };

        self.addCorrect = function() {
            currentStat.correct += 1;
        };

        // statistics

        self.totalCorrectCount = function () {
            var sum = 0;
            _.each(statList, function(stat){
                sum += stat.correct;
            });
            return sum;
        };

        self.totalWrongCount = function() {
            var sum = 0;
            _.each(statList, function(stat){
                sum += stat.wrong;
            });
            return sum;
        };

        self.totalQuestionCount = function() {
            return statList.length;
        };

        init()

    };


})(window.jQuery);