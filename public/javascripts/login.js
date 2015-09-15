$(document).ready(function($){
    $('#codeImg').click(function(){
        $('#codeImg').attr('src', '/checkcode?' + new Date().getTime());
    });
});