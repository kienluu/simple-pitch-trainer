(function($){
    $(document).ready(function(){
        $('.start-button').click(function(){
            $('.start-box').addClass('hidden');
            $('.trainer-box').removeClass('hidden');
        });

        // Debug
        $('.start-button').click();
    });

})(window.jQuery);