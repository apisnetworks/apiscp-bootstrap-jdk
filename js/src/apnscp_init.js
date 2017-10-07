/** 
 * apnscp initialization functions
 */
(function ($) {
    $(window).on('load', function () {
        $('#ui-help-container').click(function(e) {
            switch (e.target.id) {
                case 'ui-wiki-link':
                    var params = "resizable=yes,scrollbars=yes,location=yes,status=yes," +
                        "titlebar=yes,toolbar=yes,menubar=yes,height=640,width=780";
                    var win = window.open(e.target.href, 'helpWindow', params);
                    win.focus();                
                    break;
                case 'ui-help-tag':
                case 'ui-overview-link':
                    var $trigger = $('#ui-overview-link');
                    if ($trigger.hasClass('ui-expanded')) {
                        $('#ui-help').slideUp();
                        $trigger.addClass('ui-collapsed').
                            removeClass('ui-expanded');
                    } else {
                        $('#ui-help').hide().removeClass('hide').
                            slideDown();
                        $trigger.addClass('ui-expanded').
                            removeClass('ui-collapsed');
                    }
                    break;
                default:
                    return true;
            }
            return false;
        });
        $('#ui-account-gauges').hover( function() {
            //$('#ui-gauge-refresh').show();
            //gaugeTooltip =
        }, function () { 
            //$('#ui-gauge-refresh').hide();
            //$(this).tooltip
        }).click (function() { apnscp.refresh_gauge(); });
        $('#ui-side-menu-toggle').click(function() {
            var target = $(this).data('target');
            // do not like...
            if ($(this).attr('aria-expanded') === "true") {
                $(target).hide();
                $(this).removeAttr('aria-expanded', "false");
            } else {
                $(target).show();
                $(this).attr('aria-expanded', "true");
            }
            return false;
            //$.get($(this).data('href'));
        });

        $('#ui-menu-category-feedback').click(function() {
            var $indicator = apnscp.indicator(),
                modal = apnscp.modal($('#feedbackContainer'), {size: 'large'});
            modal.find('#submitFeedback').one('click', function () {
                $(this).find('.ui-ajax-indicator').remove().end().append($indicator);
                var email = $('#feedbackEmail').val(),
                    type = $('#feedbackType').val(),
                    feedback = $('#feedback').val();
                apnscp.call_app('troubleticket', 'on_postback', {
                    'submit': true,
                    'ttdata': feedback,
                    'subject': type,
                    'description': 'Feedback on ' + session.appName,
                    'contact': email
                }, {
                    indicator: $indicator
                }).done(function() {
                    var $frag = $('<h3 class="py-3 col-12 text-center display-3 text-success"><i class="fa fa-smile-o"></i> Thank You!</h3>');
                    modal.find('.modal-content').empty().append($frag);
                    setTimeout(function() {
                        modal.modal('hide');
                    }, 3500);
                });
            })
            modal.modal('show');
            return false;
        });

    });
})(jQuery);

window.console = window.console || {};
window.console.log = window.console.log || function() {};

RegExp.quote = function(str) {
    return (str+'').replace(/[.?*+^$[\]\\(){}|-]/g, "\\$&");
};

String.prototype.unquote = function() {
    return this.replace(/^['"]+|\s+|\\|(;\s?})+|['"]$/g, '');
};