/**
 * apnscp initialization functions
 */
(function ($) {
    $(document).ready(function() {
        $('#hijackDomain').change(function () {
            if (!$(this).val()) {
                // same as active domain
                return false;
            }
            this.form.submit();
        });
    });
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

	$('.dropdown-menu-form').persistDropdownForm();

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

	    $('#ui-expand-all-postback').click(function () {
		    $('#ui-postback-extended').toggleClass('expanded collapse');
		    return false;
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

        if (getNestedObject(session, 'role') === 'admin') {
            dayjs.extend(relativeTime);
            var jobCheck, animated = false, jobQueue = 0, jobs = [],
                populateJobs = function()
                {
                    $('#ui-job-queue').empty();
                    for (var idx = jobs.length - 1; idx >= 0; idx--) {
                        var job = jobs[idx], reservedTime = dayjs.unix(parseInt(job.reserved_at)).fromNow(),
                            badgeClass = 'badge badge-info';
                        if (!job.reserved_at) {
                            badgeClass = 'badge badge-default';
                            reservedTime = 'pending';
                        }
                        $('#ui-job-queue', this).append($('<li class="job" data-id="' + job.id + '">' +
                            job.name +
                            '</li>').prepend($('<span>').attr('class', badgeClass).text(reservedTime)));
                    }
                };
            $('#ui-job-indicator').on('show.bs.dropdown', function () {
                populateJobs();
            });
            (jobCheck = function() {
                    apnscp.cmd('misc_get_job_queue', []).then((data) => {
                        if (!data['success']) {
                            return $.Deferred().reject().promise();
                        }

                        if (data['return'].length >= 1 && !animated) {
                            animated = true;
                            $('#ui-job-indicator').addClass('active');
                        } else if (data['return'].length == 0 && animated) {
                            animated = false;
                            $('#ui-job-indicator').removeClass('active');
                        }

                        if (jobQueue != data['return'].length) {
                            jobs = data['return'];
                            if ($('#ui-job-indicator .dropdown-menu:visible').length) {
                                populateJobs();
                            }
                            var $el = $('#ui-job-indicator .job-counter');
                            $el.text(jobs.length);
                            if (jobs.length == 0) {
                                $el.fadeOut();
                            } else if (jobs.length > 0 && !jobQueue) {
                                $el.fadeIn();
                            }
                        }
                        jobQueue = jobs.length;
                        setTimeout(jobCheck, 2500)
                    }).fail(() => {});
                })();
        }
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

window.getNestedObject = function(nestedObj, pathArr) {
    if (typeof pathArr == 'string') {
        // dot notation
        pathArr = pathArr.split('.');
    }
    return pathArr.reduce((obj, key) =>
        (obj && obj[key] !== 'undefined') ? obj[key] : undefined, nestedObj);
};
