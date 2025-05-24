var token = $("meta[name=_token]").attr("value");
var socket = $("meta[name=_socket]").attr("value");

var lastScrollTop = 0;
$(window).scroll(function() {
    var st = $(this).scrollTop();
    var netword = $(".network-top");
    if (st > lastScrollTop) {
        netword.addClass("network-top-hide");
    } else {
        netword.removeClass("network-top-hide");
    }
    var navbar = $(".navbar");
    if (st > lastScrollTop) {
        navbar.addClass("navbar-hide");
    } else {
        navbar.removeClass("navbar-hide");
    }
});

$.ajaxSetup({
    beforeSend: function(xhr) {
        /* Authorization header */
        xhr.setRequestHeader("Authorization", "Basic " + btoa(token + ':' + socket));
    },
});

jQuery(document).ready(function($) {
    if (typeof filmId !== 'undefined') {
        filmId = filmId;
    } else {
        filmId = false;
    }

    var lazyLoadInstance = new LazyLoad({
        elements_selector: ".lazy",
        oad_delay: 300
    });

    if (filmId) {
        player_default(filmId);
        $('#related').html('<div class="loading-player"><img src="/css/loading-player.gif" height="150"></div>');
        $.post('/ajax/relatedAjax', {
            pg: 1,
            filmId: filmId
        }, function(response) {
            var item = JSON.parse(response);
            $('#related').html(relatedMV(item));
        });
    }

    let pg_ = 1;
    $('.load_more').on('click', function() {
        pg_ = pg_ + 1;
        let isAdBlocked = typeof window.pJGQYAfPSq === "function" ? window.pJGQYAfPSq() : false;
        if (!isAdBlocked) {
            $.post('/ajax/relatedAjax', {
                pg: pg_,
                filmId: filmId
            }, function(response) {
                var item = JSON.parse(response);
                $('#related').append(relatedMV(item));
            });
        } else {
            $.pgwModal({
                target: '#noteads',
                title: "AdBlock Detected!",
                maxWidth: 400,
                closeOnBackgroundClick: false,
                closeContent: '[X]'
            });
        }
    });
    $('.navbar-toggle').on('click', function(event) {
        $('nav.navbar').css('z-index', '8888');
        $('#navbar-left').addClass('activated');
        event.stopPropagation();
    });
    $('.navbar-user').on('click', function(event) {
        $('nav.navbar').css('z-index', '8888');
        $('#navbar-right').addClass('activated');
        event.stopPropagation();
    });
    $('input[name="search-box"]').click(function(event) {
        $('.navbar-search').addClass('activated');
        event.stopPropagation();
    });

    $('.icon-close').on('click', function() {
        $('#navbar-left').removeClass('activated');
        $('#navbar-right').removeClass('activated');
    });

    $('.show-search').on('click', function() {
        $('.layout_search').toggle();
    });

    $('.search_action').click(function() {
        var type = trim($('select[name="type"]').val());
        var kw = trim($('input[name="search-box"]').val());
        if (!kw) {
            $.pgwModal({
                content: '<center>Please type the keyword to search.</center>',
                title: 'Notice!',
                closeContent: '[X]'
            });
            $('input[name="search-box"]').focus();
            return false;
        }
        kw = kw.toLowerCase().replace(/[\s\.:;=+]+/g, '-').replace(/-+-/g, "-").replace(/^\-+|\-+$/g, "");
        if (type != '') {
            window.location.href = '/search/' + type + '/' + kw;
        } else {
            window.location.href = '/search/' + kw;
        }
    });
    $('input[name="search-box"]').on('keypress', function(e) {
        var type = trim($('select[name="type"]').val());
        var kw = trim($('input[name="search-box"]').val());
        if (e.which == 13) {
            if (!kw) {
                $.pgwModal({
                    content: '<center>Please type the keyword to search.</center>',
                    title: 'Notice!',
                    closeContent: '[X]'
                });
                $('input[name="search-box"]').focus();
                return false;
            }
            kw = kw.toLowerCase().replace(/[\s\.:;=+]+/g, '-').replace(/-+-/g, "-").replace(/^\-+|\-+$/g, "").replace("'", "");
            if (type != '') {
                window.location.href = '/search/' + type + '/' + kw;
            } else {
                window.location.href = '/search/' + kw;
            }
        }
    });

    $('.tab-item').on('click', function() {
        $('.player-sidebar-header').find('.activated').removeClass('activated');
        $(this).addClass('activated');
        var myclass = this.className.replace('tab-item', '');
        myclass = myclass.replace('activated', '');
        myclass = myclass.trim();
        if (myclass == 'tab-comment') {
            $('.player-sidebar-body').addClass('hidden');
            $('.body-comment').removeClass('hidden');
        } else if (myclass == 'tab-actor') {
            $('.player-sidebar-body').addClass('hidden');
            $('.body-actor').removeClass('hidden');
        } else {
            $('.player-sidebar-body').addClass('hidden');
            $('.body-episode').removeClass('hidden');
        }
    });



    $('button.btn-player').on('click', function() {
        var fthis = $(this);
        var episode = $(this).attr('data-id');
        $('#sextb-player').html('<div class="loading-player"><img src="/css/loading-player.gif" height="150"></div>');
        $.post('/ajax/player', {
            episode: episode,
            filmId: filmId
        }, function(response) {
            var item = JSON.parse(response);
            scrollTop("body", "slow");
            $('#sextb-player').html(item.player);
            $('.episode-list').find('.active').removeClass('active');
            fthis.addClass('active');
        })
    });

    $('.btn-download-vip').on('click', function() {
        event.preventDefault();
        let _this = $(this);
        var movies_id = $(this).attr('data-id');
        var episode_id = $(this).attr('data-epid');
        var type = $(this).attr('data-type');
        _this.attr('disabled', true);
        $('.loading-dl-video-' + episode_id).removeClass('fa-download').addClass('fa-spinner fa-spin');
        $.post('/ajax/dlfile', {
            movies_id: movies_id,
            episode_id: episode_id,
            type: type
        }, function(obj) {
            $('.loading-dl-video-' + episode_id).removeClass('fa-spinner fa-spin').addClass('fa-download');
            _this.attr('disabled', false);
            if (obj.error == true) {
                $.pgwModal({
                    content: '<center>' + obj.message + '</center>',
                    title: 'Download For V.I.P',
                    closeContent: '[X]'
                });
            } else if (obj.error == 'link') {
                window.open(obj.message);
            } else {
                $.pgwModal({
                    content: '<center>' + obj.message + '</center>',
                    titleBar: false,
                    closeContent: '[X]'
                });
            }
        });
    });

    $('.btn-download-sub').on('click', function() {
        event.preventDefault();
        let _this = $(this);
        var movies_id = $(this).attr('data-id');
        var episode_id = $(this).attr('data-epid');
        var type = $(this).attr('data-type');
        _this.attr('disabled', true);
        $('.loading-dl-sub').removeClass('fa-download').addClass('fa-spinner fa-spin');
        $.post('/ajax/dlfile', {
            movies_id: movies_id,
            episode_id: episode_id,
            type: type
        }, function(obj) {
            $('.loading-dl-sub').removeClass('fa-spinner fa-spin').addClass('fa-download');
            _this.attr('disabled', false);
            if (obj.error == true) {
                $.pgwModal({
                    content: '<center>' + obj.message + '</center>',
                    title: 'Download For V.I.P',
                    closeContent: '[X]'
                });
            } else if (obj.error == 'link') {
                window.open(obj.message);
            } else {
                $.pgwModal({
                    content: '<center>' + obj.message + '</center>',
                    titleBar: false,
                    closeContent: '[X]'
                });
            }
        });
    });

    $('.floating-action').on('click', function() {
        $(this).addClass('activated');
    });

    $('.action-top').on('click', function() {
        scrollTop("body", "slow");
        $('.floating-action').removeClass('activated');
    });

    $('.navbar-menu-has-sub').on('click', function() {
        $(this).toggleClass('activated');
    });
    $('.navbar-menu-sub-sub-drop').on('click', function() {
        $(this).toggleClass('activated');
    });
    /*=====================================
            TRAILER MOVIES
    ======================================*/
    $(document).on('click', '.tray-item-trailer', function() {
        var url = $(this).attr('data-url');
        var title = $(this).attr('data-title');
        var link = $(this).attr('data-link');
        var poster = $(this).attr('data-poster');
        var time = Date.now();
        var width = window.screen.availWidth > 480 ? 720 : 380;
        var height = window.screen.availWidth > 480 ? 480 : 245;

        $.pgwModal({
            title: title,
            maxWidth: width,
            height: 'auto',
            content: '<div id="modal-content" style="text-align:center;">Loading in progress...</div>',
            closeContent: '[X]'
        });

        if (url.endsWith('.mp4') || url.endsWith('.m3u8')) {
            setTimeout(function() {
                updateModal(loadPlayer(url));
            }, 100);
        } else {
            $.ajax({
                url: '/ajax/trailer',
                type: 'POST',
                data: {
                    url: url
                },
                dataType: 'json',
                success: function(response) {
                    if (response.type === "vip") {
                        updateModal(loadIframeVip(response.file));
                    } else {
                        updateModal(loadIframeFree(response.file));
                    }
                },
            });
        }

        function loadPlayer(fileUrl) {
            return '<div id="player' + time + '"></div>' +
                '<script>' +
                'setTimeout(function() {' +
                'var player = jwplayer("player' + time + '").setup({' +
                'file: "' + fileUrl + '",' +
                'image: "' + poster + '",' +
                'width: "100%",' +
                'height: "' + height + '",' +
                'primary: "html5",' +
                'autostart: false' +
                '});' +
                '}, 200);' +
                '</script>' +
                '<br><center><a href="' + link + '" title="' + title + '">' +
                '<button class="btn-success btn_player"><i class="fa fa-play-circle"></i> Watch Now</button>' +
                '</a></center>';
        }

        function loadIframeFree(url) {
            return '<iframe src="' + url + '?poster=' + poster + '" width="100%" height="' + height + '" frameborder="0" allowfullscreen></iframe>' +
                '<div style="text-align: center;background: #514746; padding: 3px;"><span style="background-image: url(/images/bg_text.gif);">Upgrade VIP member remove Ad-free on site.</span></div>' +
                '<div>' +
                '<a href="/user/upgrade" title="Upgrade Member"><button class="btn-success btn_player" style="float: left; margin: 10px 0px;><i class="fa fa-play-circle"></i> Upgrade V.I.P</button></a>' +
                '<a href="' + link + '" title="' + title + '" style="float: right; margin: 10px 0px;"><button class="btn-success btn_player"><i class="fa fa-play-circle"></i> Watch Free</button></a>' +
                '</div>';
        }

        function loadIframeVip(url) {
            return '<iframe src="' + url + '?poster=' + poster + '" width="100%" height="' + height + '" frameborder="0" allowfullscreen></iframe>' +
                '<div style="text-align:center; margin: 10px 0px;">' +
                '<a href="' + link + '" title="' + title + '"><button class="btn-success btn_player"><i class="fa fa-play-circle"></i> Watch Now</button></a>' +
                '</div>';
        }

        function updateModal(contentHtml) {
            $('#modal-content').html(contentHtml);
        }


    });


    /*=====================================
            CLOSE NOTICE
    ======================================*/
    var noti = getCookie('notice-domain-one');
    if (noti != '' || noti == 1) {
        $('#alert-domain').css('display', 'none');
    } else {
        $('#alert-domain').css('display', 'block');
        $(".alert-content").html('Some countries have blocked our website, please use a backup domain name: <a href="https://sextb.date" target="_blank">SEXTB.<b>DATE</b></a>.<br>Alternatively, <a href="https://www.google.com/search?q=google+how+to+change+phone+dns">change your device settings</a> to Google or Cloudflare DNS to bypass ISP Block.');
    }
    $('.close-ntdomain').on('click', function() {
        $('#alert-domain').css('display', 'none');
        setCookie("notice-domain-one", '1', 10);
    });

    // $(document).on('click', '.tray-item-trailer', function(){
    //     var url = $(this).attr('data-url');
    //     var title = $(this).attr('data-title');
    //     var link = $(this).attr('data-link');
    //     var poster = $(this).attr('data-poster');
    //     if(url != '') {
    //         $('#modalTrailer > video > source').attr('src', url);
    //         $('#modalTrailer > video').attr('poster', poster);
    //         $('#modalTrailer > center > a').attr('href', link);
    //         $.pgwModal({
    //             target: '#modalTrailer',
    //             title: title,
    //             maxWidth: 800,
    //             closeContent : '[X]'
    //         });
    //     }else {
    //         $.pgwModal({
    //             target: 'Updating... Please try again!!!',
    //             title: title,
    //             maxWidth: 800,
    //             closeContent : '[X]'
    //         });
    //         //alert('Updating... Please try again!!!');
    //     }
    // });


    // $(document).on('click', '.tray-item-live', function(){
    //     var url = $(this).attr('data-url');
    //     var title = $(this).attr('data-title');
    //     var link = $(this).attr('data-link');
    //     if(window.screen.availWidth < 480){
    //         var height = 210;
    //         var width = 640;
    //         var embed = '&embed_video_only=1';
    //     }else{
    //         var height = 415;
    //         var width = 850;
    //         var embed = '';
    //     }
    //     if(url != '') {
    //         $('#modalLive > iframe').attr('src', url + embed);
    //         $('#modalLive > iframe').attr('height', height);
    //         $('.livechat > a').attr('href', link);
    //         $.pgwModal({
    //             target: '#modalLive',
    //             title: title,
    //             closable : false,
    //             maxWidth: width,
    //             height: 'auto',
    //             responsive: true
    //         });
    //     }else {
    //         alert('Updating... Please try again!!!');
    //     }
    // });

    $(document).bind('PgwModal::Close', function() {
        $('#modalLive > iframe').attr('src', '');
    });

    $('.report').click(function() {
        $.pgwModal({
            target: '#modalReport',
            title: 'Feedback / Report',
            maxWidth: 400
        });
    });

    $('.explayer').on('click', function() {
        let isAdBlocked = typeof window.pJGQYAfPSq === "function" ? window.pJGQYAfPSq() : false;
        if (!isAdBlocked) {
            if ($(this).attr('data-expend') == 'Expand') {
                $('.left').removeClass('col-7');
                $('.left').addClass('col-10');
                $('.right').addClass('hidden');
                $(this).attr('data-expend', 'Compress');
                $('.explayer').html('<i class="fa fa-compress"></i>');
                scrollTop("body", "slow");
            } else {
                $('.left').removeClass('col-10');
                $('.left').addClass('col-7');
                $('.right').removeClass('hidden');
                /*$('.layout_info').removeClass('col-7');*/
                $(this).attr('data-expend', 'Expand');
                $('.explayer').html('<i class="fa fa-expand"></i>');
                scrollTop("body", "slow");
            }
        } else {
            $.pgwModal({
                target: '#noteads',
                title: "AdBlock Detected!",
                maxWidth: 400,
                closeOnBackgroundClick: false,
                closeContent: '[X]'
            });
        }

    });

    $(document).on('click', '.player-lights', function(e) {
        e.preventDefault();
        var _this = $(this),
            _titlewrap = $('.player_div');
        if (_this.hasClass('off')) {
            _titlewrap.addClass('p_light');
            _this.removeClass('off').addClass('on');
            _this.html('<i class="far fa-lightbulb"></i>');
            $('body').append('<div class="modal-backdrop fade" id="player-page-fade"></div>');
            $("#player-page-fade").fadeTo("slow", 0.8, function() {

            });
        } else {
            _titlewrap.removeClass('p_light');
            _this.removeClass('on').addClass('off');
            _this.html('<i class="fas fa-lightbulb"></i>');
            $("#player-page-fade").fadeTo("slow", 0, function() {
                $('#player-page-fade').remove();
            });
        }
    });

    $('h5.tab_info').on('click', function() {
        let _this = $(this),
            _tab = _this.attr('tab');
        $(document).find('h5.tab_info').removeClass('section-heading');
        _this.addClass('section-heading');
        $('.tab-content').hide();
        $('#' + _tab).fadeIn();
        return false;
    });
    $('h5.tab_top_video').on('click', function() {
        let _this = $(this),
            _tab = _this.attr('tab');
        $(document).find('h5.tab_top_video').removeClass('section-heading');
        _this.addClass('section-heading');
        $('.tab-content').hide();
        $('#' + _tab).fadeIn();
        return false;
    });
    $('h5.tab_censored').on('click', function() {
        let _this = $(this),
            _tab = _this.attr('tab');
        $(document).find('h5.tab_censored').removeClass('section-heading');
        _this.addClass('section-heading');
        $('.tab-content-censored').hide();
        $('#' + _tab).fadeIn();
        if (_tab == "new_subtitle") {
            $(document).find('#censored-link').attr('href', "/subtitle");
        } else {
            $(document).find('#censored-link').attr('href', "/censored");
        }
        return false;
    });
    $('h5.tab_comm').on('click', function() {
        let _this = $(this),
            _tab = _this.attr('tab');
        $(document).find('h5.tab_comm').removeClass('section-heading');
        _this.addClass('section-heading');
        $('.tab-comment').hide();
        $('#' + _tab).fadeIn();
        return false;
    });

    $('button.tab_info').on('click', function() {
        let _this = $(this),
            _tab = _this.attr('tab');
        $('#' + _tab).toggle();
        return false;
    });
});

function trim(a) {
    return a.replace(/^s*(S*(s+S+)*)s*$/, "$1");
}



function player_default(filmId) {
    var filmId = parseInt(filmId);
    var episode = 0;
    $.post('/ajax/player', {
        episode: episode,
        filmId: filmId
    }, function(response) {
        var item = JSON.parse(response);
        $('#sextb-player').html(item.player);
    })
}

function scrollTop(element, easing) {
    if (typeof easing == 'undefine') {
        easing = 0;
    }
    $('html,body').animate({
        scrollTop: $(element).offset().top
    }, easing);
}

$("button[id*='vote_']").on('click', function(event) {
    event.preventDefault();
    let _this = $(this);
    //_this.attr('disabled', true);
    var vote_id = $(this).attr("id");
    var id_split = vote_id.split('_');
    var vote = id_split[1];
    var id = id_split[2];
    $.post('/ajax/vote', {
        id: id,
        vote: vote,
    }, function(response) {
        var result = jQuery.parseJSON(response);
        if (result.status == true) {
            if (result.likecount != 0) {
                $('#likevoteCount').html(kFormatter(result.likecount));
            }
            if (result.dislikecount != 0) {
                $('#dislikevoteCount').html(kFormatter(result.dislikecount));
            }
            _this.addClass('btn-player-active');
            _this.attr('disabled', true);
            $.toast({
                text: result.msg,
                position: 'mid-center',
                icon: 'success',
                hideAfter: 1000,
                stack: false

            })
        } else {
            $.toast({
                text: result.msg,
                position: 'mid-center',
                icon: 'warning',
                hideAfter: 1000,
                stack: false

            })
        }
        _this.attr('disabled', false);
    })
});

$("button[id*='actor_']").on('click', function(event) {
    event.preventDefault();
    let _this = $(this);
    var vote_id = $(this).attr("id");
    var id_split = vote_id.split('_');
    var vote = id_split[1];
    var item_id = id_split[2];
    $.post('/ajax/voteActor', {
        item_id: item_id,
        vote: vote,
    }, function(response) {
        var res = jQuery.parseJSON(response);
        if (res.status == true) {
            if (res.likecount != 0) {
                $('#likevoteCount').html(kFormatter(res.likecount));
            }
            // if(res.dislikescount != 0){
            //     $('#dislikevoteCount').html(res.dislikecount)
            // }
            _this.addClass('btn-player-active');
            _this.attr('disabled', true);
            $.toast({
                text: res.msg,
                position: 'mid-center',
                icon: 'success',
                hideAfter: 1000,
                stack: false

            })
        } else {
            $.pgwModal({
                content: '<center>' + res.msg + '</center>',
                titleBar: false,
                closeContent: '[X]'
            });
        }
        _this.attr('disabled', false);
    })
});

$("button.download").on('click', function() {
    let isAdBlocked = typeof window.pJGQYAfPSq === "function" ? window.pJGQYAfPSq() : false;
    if (!isAdBlocked) {
        $(document).find('h5.tab_info').removeClass('section-heading');
        $('h5[tab=download]').addClass('section-heading');
        $('#download').show();
        $('#infomation').hide();
        $('#gallery').hide();
        $('#trailer').hide();
        $('#poster').hide();
        scrollTop(".col-6", "slow");
    } else {
        $.pgwModal({
            target: '#noteads',
            title: "AdBlock Detected!",
            maxWidth: 400,
            closeOnBackgroundClick: false,
            closeContent: '[X]'
        });
    }

});
$("button.shared").on('click', function() {
    $(document).find('h5.tab_comm').removeClass('section-heading');
    $('h5[tab=shared]').addClass('section-heading');
    $('#shared').show();
    $('#comments').hide();
    scrollTop(".col-4", "slow");

});

/*$("button.comment").on('click', function () {
    if($(this).attr('data-show') == 1) {
        $(this).attr('data-show', 0);
        $('.shared_').hide();
        $('.comment_').hide();
        $('.info_').show();
        $(document).find('h5.tab_').removeClass('section-heading');
        $('h5[tab=infomation]').addClass('section-heading');
        $('.tab-content').hide();
        $('#infomation').fadeIn();
    }
    else {
        $(this).attr('data-show', 1);
        $('button.shared').attr('data-show', 0);
        $('.comment_').show();
        $('.info_').hide();
        $('.shared_').hide();
        $('.tab-content').hide();
    }
});

$("button.shared").on('click', function () {
    if($(this).attr('data-show') == 1) {
        $(this).attr('data-show', 0);
        $('.shared_').hide();
        $('.comment_').hide();
        $('.info_').show();
        $('.download_').hide();
        $(document).find('h5.tab_').removeClass('section-heading');
        $('h5[tab=infomation]').addClass('section-heading');
        $('.tab-content').hide();
        $('#infomation').fadeIn();
    }
    else {
        $(this).attr('data-show', 1);
        $('button.comment').attr('data-show', 0);
        $('button.download').attr('data-show', 0);
        $('.shared_').show();
        $('.comment_').hide();
        $('.info_').hide();
        $('.download_').hide();
        $('.tab-content').hide();
        scrollTop("div.layout_info", "slow");
    }
});

$("button.download").on('click', function () {
    if($(this).attr('data-show') == 1) {
        $(this).attr('data-show', 0);
        $('.shared_').hide();
        $('.download_').hide();
        $('.info_').show();
        $(document).find('h5.tab_').removeClass('section-heading');
        $('h5[tab=infomation]').addClass('section-heading');
        $('.tab-content').hide();
        $('#infomation').fadeIn();
    }
    else {
        $(this).attr('data-show', 1);
        $('button.shared').attr('data-show', 0);
        $('button.comment').attr('data-show', 0);
        $('.download_').show();
        $('.info_').hide();
        $('.shared_').hide();
        $('.tab-content').hide();
        scrollTop("div.layout_info", "slow");
    }
});*/

function validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

/*=====================================
            SEND COMMENT
======================================*/
$("button.post_comment").on('click', function() {
    let content = $('textarea[name=content]').val();
    if (content == '') {
        $.pgwModal({
            content: '<center>Warning! content empty!</center>',
            titleBar: false,
            closeContent: '[X]'
        });
        return false;
    }
    if (content != '') {
        $.post('/ajax/comment', {
            id: filmId,
            content: content
        }, function(response) {
            var item = jQuery.parseJSON(response);
            if (item.code == 0) {
                $('.comment-list').html(showComment(item.data));
                $('textarea[name=content]').val("");
                //document.getElementById('captcha').src = '/captcha?ver=' + Math.random();
            } else {
                $.pgwModal({
                    content: '<center>' + item.msg + '</center>',
                    titleBar: false,
                    closeContent: '[X]'
                });
                //document.getElementById('captcha').src = '/captcha?ver=' + Math.random();
            }
        })
    }
});

/*=====================================
            SEND REPLY COMMENT
======================================*/
function postReply(parent_id) {
    $(document).find('.reply_' + parent_id).css('display', 'block');
}
$(document).on('click', 'button.send_reply', function() {
    let parent_id = $(this).attr('data-id');
    let content = $('textarea[name=content_reply_' + parent_id + ']').val();
    if (content == '' || parent_id == '') {
        $.pgwModal({
            content: '<center>Warning! content empty!</center>',
            titleBar: false,
            closeContent: '[X]'
        });
        return false;
    }
    $.post('/ajax/comment', {
        id: filmId,
        content: content,
        parent_id: parent_id
    }, function(response) {
        var item = jQuery.parseJSON(response);
        if (item.code == 0) {
            $(document).find('.textarea_reply').css('display', 'none');
            $(document).find('.send_reply').css('display', 'none');
            $('.comment-list').html(showComment(item.data));
            //document.getElementById('captcha').src = '/captcha?ver=' + Math.random();
        } else {
            $.pgwModal({
                content: '<center>' + item.msg + '</center>',
                titleBar: false,
                closeContent: '[X]'
            });
            //document.getElementById('captcha').src = '/captcha?ver=' + Math.random();
        }
    })
});

function showComment(data) {
    let html = '';
    //$.each(item, function(index, element) {
    //console.log(data);
    if (data['parent']) {
        $.each(data['parent'], function(index, item) {
            html = html + '<div data-id="' + item['id'] + '" class="item">' +
                '<div class="name">' + item['users_id'] + '<span class="time">' + item['created_at'] + '</span></div>' +
                '<div class="content">' + item['content'] + '</div>' +
                '<a class="btn-reply" onClick="postReply(\'' + item['id'] + '\')">Reply</a>' +
                '<textarea name="content_reply_' + item['id'] + '" class="form-textarea-reply reply_' + item['id'] + '"></textarea>' +
                '<button data-id="' + item['id'] + '" class="btn-default btn_player send_reply reply_' + item['id'] + '">Post Reply</button>' +
                '</div>';
            if (typeof data[item['id']] !== 'undefined') {
                //console.log(data[item['id']]);
                $.each(data[item['id']], function(index, val) {
                    html = html + '<div class="ic-reply"><i class="fa fa-reply fa-rotate-180"></i></div><div class="item-reply">' +
                        '<div class="name">' + val['users_id'] + '<span class="time">' + val['created_at'] + '</span></div>' +
                        '<div class="content">' + val['content'] + '</div>' +
                        '</div>';
                });

            }
        });
    }
    //}) 

    return html;
}

/*$('#contact').submit(function(e){
    e.preventDefault();
    $.post('/ajax/sendContact', $("#contact").serialize(), function(response) {
        var item = JSON.parse(response);
        if (item.code == 0) {
            $('.msg_error').hide();
            $('.msg_ok').show();
            $('.msg_ok').html(item.msg);
            document.getElementById("contact").reset();
        } else {
            $('.msg_ok').hide();
            $('.msg_error').show();
            $('.msg_error').html(item.msg);
        }
    });
});

$('#upload').submit(function(e){
    e.preventDefault();
    $.post('/ajax/submitUpload', $("#upload").serialize(), function(response) {
        var item = JSON.parse(response);
        if (item.code == 0) {
            $('.msg_error').hide();
            $('.msg_ok').show();
            $('.msg_ok').html(item.msg);
            document.getElementById("upload").reset();
        } else {
            $('.msg_ok').hide();
            $('.msg_error').show();
            $('.msg_error').html(item.msg);
        }
    });
});
*/
// Go To Page
$('#go_page_left, #go_page_right, #go_page_mobile').on('click', function() {
    $.pgwModal({
        target: '#gopage',
        title: "Go To Page",
        maxWidth: 200,
        closeOnBackgroundClick: false,
        closeContent: '[X]'
    });
});

$(document).on('submit', '#gopage', function(e) {
    e.preventDefault();
    let formdata = new FormData(this);
    let url = window.location.href;
    let page = formdata.get("pages");
    if (isNaN(page)) {
        alert(page + " is not a number.");
    } else {
        if (url.includes("pg-")) {
            current = url.split('pg-')[0];
            window.location = current + 'pg-' + page;
        } else if (url.includes("?genre")) {
            current = url.split('&pg=')[0];
            window.location = current + '&pg=' + page;
        } else {
            current = url.replace('#', '');
            window.location = current + '/pg-' + page;
        }
    }
});

// Login //
$(document).on('click', '.login-member', function() {
    $(document).find('#register').css('display', 'none');
    $(document).find('#login').css('display', 'block');
    $.pgwModal({
        target: '#modalMember',
        title: "Login / Register",
        maxWidth: 400,
        closeOnBackgroundClick: false,
        closeContent: '[X]'
    });

});
$(document).on('click', 'a.register', function() {
    $(document).find('#pgwModal').find('#register').css('display', 'block');
    $(document).find('#pgwModal').find('#comfirm').css('display', 'none');
    $(document).find('#pgwModal').find('#login').css('display', 'none');
    $(document).find('#pgwModal').find('#forgot_passwd').css('display', 'none');
    $(document).find('#pgwModal').find('#recomfirm').css('display', 'none');
});
$(document).on('click', 'a.comfirm', function() {
    $(document).find('#pgwModal').find('#register').css('display', 'none');
    $(document).find('#pgwModal').find('#comfirm').css('display', 'block');
    $(document).find('#pgwModal').find('#login').css('display', 'none');
    $(document).find('#pgwModal').find('#forgot_passwd').css('display', 'none');
    $(document).find('#pgwModal').find('#recomfirm').css('display', 'none');
});
$(document).on('click', 'a.recomfirm', function() {
    $(document).find('#pgwModal').find('#register').css('display', 'none');
    $(document).find('#pgwModal').find('#comfirm').css('display', 'none');
    $(document).find('#pgwModal').find('#login').css('display', 'none');
    $(document).find('#pgwModal').find('#forgot_passwd').css('display', 'none');
    $(document).find('#pgwModal').find('#recomfirm').css('display', 'block');
});
$(document).on('click', 'a.login', function() {
    $(document).find('#pgwModal').find('#register').css('display', 'none');
    $(document).find('#pgwModal').find('#comfirm').css('display', 'none');
    $(document).find('#pgwModal').find('#login').css('display', 'block');
    $(document).find('#pgwModal').find('#forgot_passwd').css('display', 'none');
    $(document).find('#pgwModal').find('#recomfirm').css('display', 'none');
});
$(document).on('click', 'a.forgot_passwd', function() {
    $(document).find('#pgwModal').find('#register').css('display', 'none');
    $(document).find('#pgwModal').find('#comfirm').css('display', 'none');
    $(document).find('#pgwModal').find('#login').css('display', 'none');
    $(document).find('#pgwModal').find('#forgot_passwd').css('display', 'block');
    $(document).find('#pgwModal').find('#recomfirm').css('display', 'none');
});
// Post login form
$(document).on('submit', '#login_form', function(e) {
    e.preventDefault();
    $.post('/user/login', $(document).find('#pgwModal').find('#login_form').serialize(), function(obj) {
        $(document).find('#pgwModal').find('#login .pt-errors').html(obj.message);
        $(document).find('img#captcha_renew').attr('src', '/captcha?ver=' + Math.random());
        if (obj.error == false) {
            window.location.reload(true);
        }
    });
});
// Post register form
$(document).on('submit', '#registration_form', function(e) {
    e.preventDefault();
    $.post('/user/register', $(document).find('#pgwModal').find('#registration_form').serialize(), function(obj) {
        $(document).find('#pgwModal').find('#register .pt-errors').html(obj.message);
        $(document).find('img#captcha_renew').attr('src', '/captcha?ver=' + Math.random());
        if (obj.error == false) {
            $("#registration_form button").prop("disabled", true);
            $(document).find('#pgwModal').find('#comfirm .pt-errors').html(obj.message);
            $(document).find('#pgwModal').find('#register').css('display', 'none');
            $(document).find('#pgwModal').find('#comfirm').css('display', 'block');
        }
    });
});
// Confirm Account
$(document).on('submit', '#comfirm_acc_form', function(e) {
    e.preventDefault();
    $.post('/user/ajaxcomfirm', $(document).find('#pgwModal').find('#comfirm_acc_form').serialize(), function(obj) {
        $(document).find('#pgwModal').find('#comfirm .pt-errors').html(obj.message);
        $(document).find('img#captcha_renew').attr('src', '/captcha?ver=' + Math.random());
        if (obj.error == false) {
            //window.location.reload(true);
            $(document).find('#pgwModal').find('#login .pt-errors').html(obj.message);
            $(document).find('#pgwModal').find('#comfirm').css('display', 'none');
            $(document).find('#pgwModal').find('#login').css('display', 'block');
        }
    });

});
// Re-confirm Account
$(document).on('submit', '#re_confirm_form', function(e) {
    e.preventDefault();
    $.post('/user/reconfirm', $(document).find('#pgwModal').find('#re_confirm_form').serialize(), function(obj) {
        $(document).find('#pgwModal').find('#recomfirm .pt-errors').html(obj.message);
        $(document).find('img#captcha_renew').attr('src', '/captcha?ver=' + Math.random());
        if (obj.error == false) {
            $(document).find('#pgwModal').find('#comfirm .pt-errors').html(obj.message);
            $(document).find('#pgwModal').find('#recomfirm').css('display', 'none');
            $(document).find('#pgwModal').find('#comfirm').css('display', 'block');
        }
    });

});
// Reset Password
$(document).on('submit', '#reset_password_form', function(e) {
    e.preventDefault();
    $.post('/user/reset-password', $(document).find('#pgwModal').find('#reset_password_form').serialize(), function(obj) {
        $(document).find('#pgwModal').find('#forgot_passwd .pt-errors').html(obj.message);
        $(document).find('img#captcha_renew').attr('src', '/captcha?ver=' + Math.random());
        if (obj.error == false) {
            $(document).find('#pgwModal').find('#login .pt-errors').html(obj.message);
            $(document).find('#pgwModal').find('#forgot_passwd').css('display', 'none');
            $(document).find('#pgwModal').find('#login').css('display', 'block');
        }
    });

});

// $(".reset-filter").on("click", function () {
//     $('#my_select option').prop('selected', function() {
//         return this.defaultSelected;
//     });
// });

$(".reset-filter").on("click", function() {
    let action = $('#myFilter').attr('action');
    window.location.href = action;
});


$(".tray-filter").on("click", function() {
    let check = $(".myFilter").css('display');
    if (check === "none") {
        $(".myFilter").css('display', 'block');
    } else {
        $(".myFilter").css('display', 'none');
    }

});


// Add favorite
$('.favorite-movie, .favorite-actress, .favorite-studio, .favorite-director, .favorite-label').on('click', function(e) {;
    e.preventDefault();
    var id = $(this).attr('data-id');
    var name = $(this).attr('data-name');
    var type = $(this).attr('data-type');
    var current = window.location.pathname.includes("actress");
    //var url = window.location.href;
    var page = 1;
    let isAdBlocked = typeof window.pJGQYAfPSq === "function" ? window.pJGQYAfPSq() : false;
    if (!isAdBlocked) {
        $.post('/user/addfav', {
            id: id,
            name: name,
            type: type,
            page: page
        }, function(res) {
            if (res.status == true) {
                if (res.count != 0) {
                    $('#favoriteCount').html(kFormatter(res.count));
                }
                if (res.type == 'add') {
                    if (type == 'movie' || current == true) {
                        $(document).find('.favorite-' + type).addClass('btn-player-active').attr('disabled', true);
                    } else {
                        $(document).find('.favorite-' + type + '[data-id=' + id + ']').addClass('heart-active');
                    }
                    $.toast({
                        text: res.msg,
                        position: 'mid-center',
                        icon: 'success',
                        stack: false

                    })
                } else if (res.type == 'remove') {
                    if (type == 'movie' || current == true) {
                        $(document).find('.favorite-' + type).removeClass('btn-player-active');
                    } else {
                        $(document).find('.favorite-' + type + '[data-id=' + id + ']').removeClass('heart-active');
                    }
                    $.toast({
                        text: res.msg,
                        position: 'mid-center',
                        icon: 'warning',
                        stack: false
                    })
                } else {
                    $.toast({
                        heading: 'Error!!!',
                        text: res.msg,
                        position: 'mid-center',
                        icon: 'error',
                        stack: false
                    })
                }

            } else {
                $.pgwModal({
                    target: '#modalMember',
                    title: "Login To Favorite",
                    maxWidth: 400,
                    closeOnBackgroundClick: false,
                    closeContent: '[X]'
                });
            }
        });
    } else {
        $.pgwModal({
            target: '#noteads',
            title: "AdBlock Detected!",
            maxWidth: 400,
            closeOnBackgroundClick: true,
            closeContent: '[X]'
        });
    }
});


// Remove favorite
$('.tray-item-remove-fav, .tray-item-remove-fav-actress, .remove-fav').on('click', function() {
    var id = $(this).attr('data-id');
    var type = $(this).attr('data-type');
    var name = $(this).attr('data-name');
    var url = window.location.href;
    if (url.includes("pg-")) {
        page = url.split('pg-')[1];
    } else {
        page = 1;
    }
    $.pgwModal({
        title: "Remove Favorite",
        content: '<center>Are you want remove ' + type + ' "<b>' + name + '</b>" from favorite?<br><br><button class="btn_player btn-success" id="favremove">Yes</button> <button class="btn_player btn-danger" id="favclose">No</button></center>',
        maxWidth: 500,
        closeOnBackgroundClick: false,
        closeContent: '[X]',
        reposition: true
    });
    $('#favremove').on('click', function(e) {
        e.preventDefault();
        $.post('/user/addfav', {
            id: id,
            type: type,
            page: page
        }, function(res) {
            if (res.status == false) {
                $.pgwModal({
                    title: "#modalMember",
                    content: '<center>' + res.msg + '</center>',
                    titleBar: false,
                    closeContent: '[X]'
                });
            } else {
                window.location.reload(true);
            }

        });
        $.pgwModal('close');

    });
    $('#favclose').on('click', function() {
        $.pgwModal('close');

    });
});

// Remove favorite
$('.delete-account').on('click', function(e) {
    if (confirm('Are you want delete your account?')) {
        e.preventDefault();
        var id = $(this).attr('data-id');
        $.post('/user/delete', {
            id: id
        }, function(res) {
            if (res.status == true) {
                $.toast({
                    heading: 'Success',
                    text: res.msg,
                    position: 'mid-center',
                    hideAfter: 10000,
                    icon: 'success'
                })
            } else {
                $.pgwModal({
                    title: "#modalMember",
                    content: '<center>' + res.msg + '</center>',
                    titleBar: false,
                    closeContent: '[X]'
                });
            }

        });
    }
});

// Remove favorite
$('.clear-cache').on('click', function(e) {
    if (confirm('The system will clear your cache to reload the information?')) {
        e.preventDefault();
        var id = $(this).attr('data-id');
        $.post('/user/clearcache', {
            id: id
        }, function(res) {
            if (res.status == true) {
                $.toast({
                    heading: 'Success',
                    text: res.msg,
                    position: 'mid-center',
                    hideAfter: 10000,
                    icon: 'success',
                    stack: false
                })
                window.location.reload(true);
            } else {
                $.pgwModal({
                    title: "#modalMember",
                    content: '<center>' + res.msg + '</center>',
                    titleBar: false,
                    closeContent: '[X]'
                });
            }

        });
    }
});


// Add Follow
// $('#follow').on('click', function(e){
//     e.preventDefault();
//     var id = $(this).attr('data-id');
//     var name = $(this).attr('data-name');
//     $.post('/user/addfavactors', {id: id, actor: name}, function(obj) {
//         if(obj.status == true){
//             if (obj.count != 0){
//                 $('#followCount').html(obj.count);
//                 $('#follow').addClass("btn-player-active");
//             }
//             if(obj.type == 'add'){
//                 $('#follow').addClass('btn-player-active');
//             }else if(obj.type == 'remove'){
//                 $('#follow').removeClass('btn-player-active');
//             }
//             $.pgwModal({
//                 content: '<center>'+obj.msg+'</center>',
//                 titleBar: false,
//                 closeContent : '[X]'
//             });
//         }else{ 
//             $.pgwModal({
//                 target: '#modalMember',
//                 title: "Please Login To Follow",
//                 maxWidth: 400,
//                 closeOnBackgroundClick : false,
//                 closeContent : '[X]' 
//             });
//         }
//     });
// });
// Login Comment
$('#login_comment').on('focus', function() {
    $.pgwModal({
        target: '#modalMember',
        title: "Please Login To Comment",
        maxWidth: 400,
        closeOnBackgroundClick: false,
        closeContent: '[X]'
    });
});

// Check Password
$('#password, #re-password').on('keyup', function() {
    if ($('#password').val() == $('#re-password').val()) {
        $('#checkpass').html('');
    } else
        $('#checkpass').html('Password not matching.').css('color', 'red');
});

// End Login
// Captcha Reload
$(document).on('click', 'a.captcha_renew', function() {
    let url_captcha = '/captcha?ver=' + Math.random();
    $(this).find('img#captcha_renew').attr('src', url_captcha);
});
$(document).on('click', 'a.captcha_rp', function() {
    let url_captcha = '/captcha?ver=' + Math.random();
    $(this).find('img#captcha_rp').attr('src', url_captcha);
});
$(function() {
    var gallery = $('.gallery a').simpleLightbox({
        navText: ['&lsaquo;', '&rsaquo;']
    });
});

function kFormatter(num) {
    return Math.abs(num) > 999 ? Math.sign(num) * ((Math.abs(num) / 1000).toFixed(1)) + 'k' : Math.sign(num) * Math.abs(num)
}

function sendFeedback() {
    let subject = $(document).find('#pgwModal select[name=subject]').val();
    let msg = $(document).find('#pgwModal textarea[name=msg]').val();
    let email = $(document).find('#pgwModal input[name=email]').val();
    let captcha = $(document).find('#pgwModal input[name=captcha_rp]').val();
    let epi = $(document).find('button.active').attr('data-id');
    if (email == '' || subject == '' || msg == '') {
        alert('Email/Subject/Message is empty!!!');
        return false;
    } else {
        $.post('/ajax/feedback', {
            id: filmId,
            email: email,
            msg: msg,
            epi: epi,
            subject: subject,
            captcha: captcha
        }, function(response) {
            var item = jQuery.parseJSON(response);
            if (item.code == 0) {
                //alert('Thank you feedback message.');
                $('textarea[name=msg]').val("");
                $(document).find('img#captcha_rp').attr('src', '/captcha?ver=' + Math.random());
                $.pgwModal('close');
                $.pgwModal({
                    content: '<center>Thank you feedback message.</center>',
                    titleBar: false,
                    maxWidth: 400,
                    closeOnBackgroundClick: false,
                    closeContent: '[X]'
                });
            } else {
                alert(item.msg)
            }
        })
    }
}

function viewed_format(num) {
    if (num >= 1000000000) {
        return (num / 1000000000).toFixed(1).replace(/\.0$/, '') + 'G';
    }
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return num;
}

// SetCookie
function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    let expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

// GetCookie
function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function relatedMV(item) {
    let html = '';
    $.each(item, function(index, element) {
        let ribbon = '',
            border = '',
            quality = '<span class="sd">SD</span>',
            offensive = '',
            figcaption = '',
            code = element['guid'] || element['code'];

        if (element['genre'] === '2' && element['subtitle'] === '0') {
            ribbon = '<span class="tray-item-ribbon">Uncensored</span>';
            border = ' tray-item-uncensored';
        } else if (['1', '3'].includes(element['genre']) && element['subtitle'] === '1') {
            ribbon = '<span class="tray-item-sub">English Subtitle</span>';
            border = ' tray-item-subtitle';
        } else if (element['genre'] === '2' && element['subtitle'] === '1') {
            ribbon = '<span class="tray-item-sub">English Subtitle</span>';
            border = ' tray-item-sub-uncen';
        }

        if (element['quality'] !== '0') {
            quality = '<span class="hd">HD</span>';
        }

        if (element['offensive'] === '1') {
            offensive = ' offensives';
            figcaption = '<figcaption>Offensive</figcaption>';
        }

        element['thumbinfo'] = element['thumbinfo'].replace('.webp', '.jpg');
        let trailer = element['trailer'],
            trailer_stb = element['trailer_stb'];
        let show_trailer = (!!trailer_stb) ?
            `<div class="tray-item-trailer" data-url="${trailer_stb}" data-title="WATCH TRAILER ${element['code'].toUpperCase()}" data-link="/${code}" data-poster="${element['thumbinfo']}"></div>` :
            (!!trailer && !/(dmm\.co\.jp|dmm\.com|r18\.com)/.test(trailer)) ?
            `<div class="tray-item-trailer" data-url="${trailer}" data-title="WATCH TRAILER ${element['code'].toUpperCase()}" data-link="/${code}" data-poster="${element['thumbinfo']}"></div>` :
            '';

        html += `<div class="tray-item${border}${offensive}">
                    <a href="/${code}">
                        <img class="tray-item-thumbnail" src="${element['poster']}" alt="${element['name']}">${ribbon}${figcaption}
                        <div class="tray-item-description">
                            <div class="tray-item-title">${element['name']}</div>
                            <div class="tray-item-meta-info">
                                <div class="tray-item-quality">${quality}</div>
                                <div class="tray-item-runtime">${element['runtimes']} min</div>
                                <div class="tray-item-code">${element['code']}</div>
                            </div>
                        </div>
                        <div class="tray-item-play-button">
                            <i class="icon-play"></i>
                        </div>
                    </a>${show_trailer}
                </div>`;
    });
    return html;
}

function checkAndToggleText(selector, maxLength = 550) {
    document.querySelectorAll(selector).forEach(container => {
        let fullText = container.querySelector(".full-text-desc"),
            shortText = container.querySelector(".short-text"),
            toggleBtn = container.querySelector(".toggle-btn");

        if (fullText.textContent.length > maxLength) {
            shortText.textContent = fullText.textContent.slice(0, maxLength) + "...";
            fullText.style.display = "none";
            toggleBtn.style.display = "inline";
        } else {
            shortText.textContent = fullText.textContent;
            toggleBtn.style.display = "none";
        }

        toggleBtn.onclick = () => {
            let isHidden = fullText.style.display === "none";
            fullText.style.display = isHidden ? "inline" : "none";
            shortText.style.display = isHidden ? "none" : "inline";
            toggleBtn.textContent = isHidden ? "← Hidden" : "→ Show more";
        };
    });
}
checkAndToggleText(".text-desc-container");

/* Auto Size Iframe Trailer */
function resizeIframeTrailer() {
    var iframe = document.getElementById("IframeTrailer");
    var width = window.innerWidth > 480 ? 720 : 435;
    var height = window.innerWidth > 480 ? 480 : 245;

    iframe.style.height = height + "px";
}
window.onload = resizeIframeTrailer;
window.onresize = resizeIframeTrailer;