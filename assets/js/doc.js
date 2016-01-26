/**
 * Created by Payne on 2016/1/26 0026.
 */
(function($) {
    //$('body').scrollspy({ target: '.sidebar' })

    //used for top next/prev buttons
    var section_list = [], section_map = {}, current = 0;
    var sindex = 0;
    $('.sidebar .nav-list a').each(function() {
        var href = getHref($(this).attr('href'));
        if(href) {
            section_list.push(href);
            section_map[href] = sindex++;
        }
    });

    $('#help-move-prev').on('click', function(e) {
        e.preventDefault();
        if( --current >= 0 ) {
            var href = section_list[current];
            document.location.hash = href;
        }
        if(current < 0) current = 0;
    });
    $('#help-move-next').on('click', function(e) {
        e.preventDefault();
        if( ++current < section_list.length ) {
            var href = section_list[current];
            document.location.hash = href;
        }
        if(current >= section_list.length) current = section_list.length - 1;
    });

    $(document).on(ace.click_event, '.help-content > .widget-box > .widget-header > .info-title', function(e) {
        var widget_box = $(this).closest('.widget-box').widget_box('toggle');
    });

    $(document).off(ace.click_event+'.ace.submenu', '.sidebar .nav-list');
    $(document).on(ace.click_event+'.ace.submenu', '.sidebar .nav-list a', function(e) {
        var href = getHref($(this).attr('href'));
        if(!href) return false;
    });

    $(window).on('hashchange.help', function(e) {
        var href = getHref(window.location.hash);
        if(!href) return false;
        return gotoUrl(href);
    })
    $(document).on(ace.click_event+'.help', '.help-more', function(ev) {
        var href = $(this).attr('href');
        if(window.location.hash == href) gotoUrl(href);
    });

    var href = getHref(window.location.hash);
    if(!href) window.location.hash = '#intro';
    else $(window).triggerHandler('hashchange.help');

    var prev_target = null;

    function gotoUrl(href) {
        current = section_map[href];

        var url = href.replace(/\..*$/g, '').replace(/#/gi , '')
        var parts = url.split('/');
        if(parts.length == 1) {
            if(url.length == 0) url = 'intro';
            url = url+'/index.html';
        }
        else if(parts.length > 1) {
            url = url+'.html';
        }

        $('.sidebar .active').removeClass('active');
        var link = $('a[href="'+href+'"]').eq(0);
        link.parents('li').addClass('active');

        var text = $.trim(link.find('.menu-text').text());
        if(text.length == 0) text = $.trim(link.text());
        document.title = text + " - Bilibili 直播弹幕助手";

        if(!scrollToTarget(href)) {
            $('.page-content').empty().html('<i class="ace-icon fa fa-spinner fa-spin blue fa-2x"></i>');

            //otherwise try downloading the page
            $.ajax({url: 'sections/'+url}).done(function(result) {
                result = result.replace(/\<pre(?:\s+)data\-language=["'](?:html|javascript|php)["']\>([\S|\s]+?)\<\/pre\>/ig, function(a, b){
                    return a.replace(b , b.replace(/\</g , '&lt;').replace(/\>/g , '&gt;'));
                });

                $('.page-content').addClass('hidden').empty().html(result);
                formatResult();

                scrollToTarget(href);
            }).fail(function() {
                $('.page-content').empty().html('<div class="alert alert-danger"><i class="fa fa-warning"></i> 访问页面失败! 请稍后再试</div>');
            });
        }

        return true;
    }

    function formatResult() {
        $('.page-content .info-section').each(function() {
            var header = $(this).prevAll('.info-title').eq(0).addClass('widget-title').wrap('<div class="widget-header" />')
                .parent().append('<div class="widget-toolbar no-border">\
				<a href="#" data-action="collapse">\
					<i data-icon-hide="fa-minus" data-icon-show="fa-plus" class="ace-icon fa fa-plus"></i>\
				</a>\
			</div>').closest('.widget-header');

            $(this).wrap('<div class="widget-box transparent'+(header.length > 0 ? ' collapsed':'')+'"><div class="widget-body"><div class="widget-main"></div></div></div>');
            $(this).closest('.widget-box').prepend(header);

            $(this).ace_scroll({size: parseInt($(window).height()  - 200), reset: true});
        });

        Rainbow.color();

        $('.page-content').removeClass('hidden');
    }

    function getHref(href) {
        href = href && href.replace(/.*(?=#[^\s]*$)/, '') // strip for ie7
        href = $.trim(href);
        if(href.match(/[\#\/]$/i)) return false;
        return href;
    }

    function scrollToTarget(href) {
        target = $('[data-id="'+href+'"]').eq(0);
        if(target.length == 1) {
            target.closest('.widget-box').widget_box('show');

            //if target exists on page scroll to it
            $('html,body').animate({scrollTop: target.offset().top - 75} , 300);
            if(prev_target) prev_target.find('.fa-angle-right').remove();

            if(!target.is('h1')) target.prepend('<i class="fa fa-angle-right red"></i> ');
            prev_target = target;

            return true;
        }
        return false;//section not found, go back and get it via ajax
    }


    $(document).on(ace.click_event, '.open-file[data-open-file]', function() {
        var url = $(this).text();
        var language = $(this).attr('data-open-file');
        $.ajax({url: '../'+url, dataType:'text'}).done(function(content) {
            if(language != 'json') {
                if(language != 'css') {
                    //replace each tab character with two spaces (only those that start at a new line)
                    content = content.replace(/\n[\t]{1,}/g, function(p, q) {
                        return p.replace(/\t/g, "  ");
                    });
                } else {
                    content = content.replace(/\t/g , "  ")
                }
            }
            else {
                content = JSON.stringify(JSON.parse(content), null, 2);
            }
            content = content.replace(/\>/g, '&gt;').replace(/\</g, '&lt;')
            Rainbow.color(content, language, function(highlighted_code) {
                display_code(url, highlighted_code);

            });
        });
    });

    function display_code(url, highlighted_code) {
        var modal = $(document.body).find('#code-modal');
        if(modal.length == 0) {
            modal = $('<div id="code-modal" class="modal fade code-modal" tabindex="-1" role="dialog" aria-labelledby="CodeDialog" aria-hidden="true">\
				  <div class="modal-dialog modal-lg">\
					<div class="modal-content">\
						<div class="modal-header">\
						  <button aria-hidden="true" data-dismiss="modal" class="close" type="button">&times;</button>\
						  <i class="fa fa-file-o"></i>\
						  <code class="code-url"></code>\
						</div>\
						<div class="modal-body"><pre class="code-content"></pre></div>\
					</div>\
				  </div>\
				</div>').appendTo('body');
        }

        modal.find('.code-url').html(url);
        modal.find('.code-content').html(highlighted_code);
        modal.modal('show');
    }
})(jQuery);