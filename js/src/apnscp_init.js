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

        $('#modal').on('keydown', function (e) {
            if (e.which ===  $.ui.keyCode.ENTER) {
                $(e.currentTarget).find('.btn-primary:first-of-type').triggerHandler('click');
                return false;
            }
        });

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

        var lastIndex = -1;

        var searchApps = function (e) {
            var code = e.keyCode || e.which,
                term = $(this).val();
            switch (code) {
                case 38:
                case 40:
                    // down
                    e.preventDefault();
                    var $lastFocus = $('#ui-nav .ui-menu-link:visible');
                    $lastFocus.eq(lastIndex).removeClass('ui-search-caret');
                    if (code === 40 && ++lastIndex >= $lastFocus.length) {
                        lastIndex = $lastFocus.length - 1;
                    } else if (code === 38 && --lastIndex < 0) {
                        lastIndex = 0;
                    }
                    $lastFocus.eq(lastIndex).addClass('ui-search-caret');
                    return false;
                case 27:
                    // escape
                    $(this).blur();
                    return false;
                case 8:
                    if (term.length > 0) {
                        // backspace
                        term = term.substr(0, term.length - 1);
                    }
                    break;
                case 13:
                    // enter
                    var href = $('#ui-nav .ui-search-caret').eq(0).attr('href');
                    if (!href) {
                        return false;
                    }
                    window.location.href = $('#ui-nav .ui-search-caret').eq(0).attr('href');
                    return true;
                default:
                    lastIndex = -1;
                    if (code >= 32) {
                        term += String.fromCharCode(code);
                    }
                    break;
            }
            $('#ui-nav').find('.ui-menu-category,.ui-menu-category-apps').each(function () {
                if (this.getAttribute('data-toggle') === 'collapse') {
                    // sub-menu control
                    $(this).addClass('hide');
                    return;
                }
                if (-1 !== $(this).text().toLowerCase().indexOf(term.toLowerCase())) {
                    $(this).removeClass('hide');
                    if (-1 !== this.className.indexOf('collapse')) {
                        $(this).addClass('show');
                    }
                } else {
                    $(this).removeClass('ui-search-caret').addClass('hide');
                }
            });
        };

        $('#ui-search').bind('click', function (e) {
            // roughly md and below
            if (window.hasTouchscreen() && getNestedObject(matchMedia("(max-width: 992px)"), 'matches')) {
                return;
            }
            $(this).tooltip({
                fallbackPlacement: 'bottom'
            }).tooltip('show');
        }).bind('keydown.search', searchApps).blur(function () {
            setTimeout(function () {
                $(this).val("").unbind('keypress.search');
                $('#ui-nav .hide, #ui-nav .ui-menu-link').removeClass('hide show ui-search-caret');
                $(this).tooltip('dispose');
            }, 200);

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
            var target = $(this).data('target'), toggle = $(this).attr('aria-expanded') == 'true' ? 'false' : 'true';
            // do not like...
            $(this).attr('aria-expanded', toggle);
            $(target).attr('aria-expanded', toggle);
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
                            badgeClass = 'badge badge-info', label;
                        if (job.status === 'pending') {
                            badgeClass = 'badge badge-default';
                            reservedTime = 'pending';
                        } else if (job.status === 'reserved') {
                            badgeClass = 'badge badge-success';
                        } else if (job.status === 'failed') {
                            badgeClass = 'badge badge-danger';
                            reservedTime = 'failed';
                        }
                        label = (job.tag.length ? job.tag.join(', ') : job.name);
                        $('#ui-job-queue', this).append($('<li class="job" data-id="' + job.id + '">' +
                            label +
                            '</li>').prepend($('<span>').attr('class', badgeClass + ' mr-1').text(reservedTime)));
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

                        if (data['return'].length >= 1) {
                            var classes = 'active';

                            for (var idx = data['return'].length - 1; idx >= 0; idx--) {
                                var job = data['return'][idx];
                                if (job.status === 'reserved') {
                                    if (-1 === document.getElementById('ui-job-indicator').className.indexOf('running')) {
                                        animated = true;
                                        classes += ' running';
                                    }

                                    break;
                                }
                            }
                            $('#ui-job-indicator').addClass(classes);
                        }

                        if (data['return'].length == 0 || !animated) {
                            var classes = !animated ? 'running' : '';
                            if (data['return'].length === 0) {
                                classes = 'active running';
                            }
                            $('#ui-job-indicator').removeClass(classes);
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

window.hasTouchscreen = function() {
    if ("maxTouchPoints" in navigator) {
        return navigator.maxTouchPoints > 0;
    }
    if ("msMaxTouchPoints" in navigator) {
        return navigator.msMaxTouchPoints > 0;
    }

    var hasTouchScreen, mQ = window.matchMedia && matchMedia("(pointer:coarse)");
    if (mQ && mQ.media === "(pointer:coarse)") {
        hasTouchScreen = !!mQ.matches;
    } else if ('orientation' in window) {
        hasTouchScreen = true; // deprecated, but good fallback
    } else {
        // Only as a last resort, fall back to user agent sniffing
        var UA = navigator.userAgent;
        hasTouchScreen = (
            /\b(BlackBerry|webOS|iPhone|IEMobile)\b/i.test(UA) ||
            /\b(Android|Windows Phone|iPad|iPod)\b/i.test(UA)
        );
    }
    return hasTouchScreen;
};

window.getNestedObject = function(nestedObj, pathArr) {
    if (typeof pathArr == 'string') {
        // dot notation
        pathArr = pathArr.split('.');
    }
    return pathArr.reduce((obj, key) =>
        (obj && obj[key] !== 'undefined') ? obj[key] : undefined, nestedObj);
};
