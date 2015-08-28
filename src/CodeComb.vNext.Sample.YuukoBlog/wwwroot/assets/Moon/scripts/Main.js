var autoplay = false;

var blog = window.blog = {
    autoHighlight: function () {
        if (window.enable_autoHighlight == undefined) {
            window.enable_autoHighlight = false
        }
        if (!window.enable_autoHighlight) {
            return
        }
        var a = null;
        $(window).scroll(function () {
            var c = $(window).scrollTop();
            var b = $(window).height();
            $(window.enable_autoHighlight).each(function () {
                var d = c + (b * 0.35);
                if (d > $(this).offset().top && d < $(this).offset().top + $(this).height()) {
                    if (a !== null) {
                        a.removeClass("active")
                    }
                    a = $(this).addClass("active");
                    return false
                }
            })
        }).scroll()
    },
    init: function () {
        var a = blog;
        a.autoHighlight();
        MusicPlayerEnabled();
    }
};
var lock = false;

function LoadArticles() {
    if (lock) return;
    lock = true;
    $.getJSON("/Home/GetArticles", {
        page: page,
        year: year,
        month: month,
        category: category,
        title: title
        }, function (data) {
            for (var i in data)
            {
                var article = "<div class='article'><div class='header'><div class='title'><a href='/Page/" + data[i].ID + "'>{Article_Title}</a></div><div class='info info1'><span class='time'>{Article_CreationTime} 发表在 <a href='/Category/{Article_CategoryID}'>{Article_Category}</a></span></div></div><div class='section entry'>{Article_Html}{Article_More}</div></div>"
                .replace("{Article_More}", data[i].Line < 20 ? "" : "<p><a href='/Page/" + data[i].ID + "' class='more-link'>(更多&#8230;)</a></p>")
                .replace("{Article_Title}", data[i].Title)
                .replace("{Article_CategoryID}", data[i].CategoryID)
                .replace("{Article_Category}", data[i].Category)
                .replace("{Article_CreationTime}", data[i].CreationTime)
                .replace("{Article_Html}", data[i].Body);
                article = article.replace("{Article_Title_Url}", encodeURIComponent(data[i].Title));
                $("#main").append(article);
                
            }
            page++;
            MusicPlayerEnabled();
            lock = false;
        });
}


function bor(musicSrc) {
    if (autoplay) {
        var bower = window.navigator.userAgent;
        if (bower.indexOf("MSIE 6") != -1 || bower.indexOf("MSIE 7") != -1 || bower.indexOf("MSIE 8") != -1)
        { return "<embed src='" + musicSrc + "' class='muc' autostart=true loop=true hiddle=true>"; }
        if (bower.indexOf("Firefox") != -1)
        { return "<audio src='" + musicSrc + "' class='muc' controls loop autoplay preload><p>您的浏览器版本过低请升级您的浏览器</p></audio>" }
        else { return "<audio src='" + musicSrc + "' class='muc' controls loop autoplay preload><p>您的浏览器版本过低请升级您的浏览器</p></audio>" }
    }
    else {
        var bower = window.navigator.userAgent;
        if (bower.indexOf("MSIE 6") != -1 || bower.indexOf("MSIE 7") != -1 || bower.indexOf("MSIE 8") != -1)
        { return "<embed src='" + musicSrc + "' class='muc' loop=true hiddle=true>"; }
        if (bower.indexOf("Firefox") != -1)
        { return "<audio src='" + musicSrc + "' class='muc' controls loop preload><p>您的浏览器版本过低请升级您的浏览器</p></audio>" }
        else { return "<audio src='" + musicSrc + "' class='muc' controls loop preload><p>您的浏览器版本过低请升级您的浏览器</p></audio>" }
    }
};

function MusicPlayerEnabled()
{
    $(".MusicPlayer").unbind().each(function () {
        var downstr = "<p><a href='" + $(this).attr("url") + "'>右键->目标另存为 下载本音频</a></p>";
        $(this).html(bor($(this).attr("url"))+downstr);
    });
}

$(document).ready(function () {
    $('#lstTemplate').change(function () {
        window.location = "/home/template?folder=" + $(this).val();
    });
    Highlight();
    $('#btnSearch').click(function () {
        if ($('#txtSearch').val())
            window.location = "/Search/" + encodeURIComponent($('#txtSearch').val());
        else
            window.location = "/";
    });

    $('#txtSearch').keydown(function (e) {
        if (e.keyCode == 13)
        {
            if ($('#txtSearch').val())
                window.location = "/Search/" + encodeURIComponent($('#txtSearch').val());
            else
                window.location = "/";
        }
    });

    blog.init();
    if (typeof (ArticleList) != "undefined")
    {
        LoadArticles();
        $(window).scroll(function () {
            totalheight = parseFloat($(window).height()) + parseFloat($(window).scrollTop());
            if ($(document).height() <= totalheight) {
                LoadArticles();
            }
        });
    }
});
(function ($, window) {
    "use strict";

    var supported = (window.File && window.FileReader && window.FileList);

    /**
     * @options
     * @param action [string] "Where to submit uploads"
     * @param label [string] <'Drag and drop files or click to select'> "Dropzone text"
     * @param maxQueue [int] <2> "Number of files to simultaneously upload"
     * @param maxSize [int] <5242880> "Max file size allowed"
     * @param postData [object] "Extra data to post with upload"
     * @param postKey [string] <'file'> "Key to upload file as"
     */

    var options = {
        action: "",
        label: "Drag and drop files or click to select",
        maxQueue: 2,
        maxSize: 5242880, // 5 mb
        postData: {},
        postKey: "file"
    };

    /**
     * @events
     * @event start.dropper ""
     * @event complete.dropper ""
     * @event fileStart.dropper ""
     * @event fileProgress.dropper ""
     * @event fileComplete.dropper ""
     * @event fileError.dropper ""
     */

    var pub = {

        /**
         * @method
         * @name defaults
         * @description Sets default plugin options
         * @param opts [object] <{}> "Options object"
         * @example $.dropper("defaults", opts);
         */
        defaults: function (opts) {
            options = $.extend(options, opts || {});
            return $(this);
        }
    };

    /**
     * @method private
     * @name _init
     * @description Initializes plugin
     * @param opts [object] "Initialization options"
     */
    function _init(opts) {
        var $items = $(this);

        if (supported) {
            // Settings
            opts = $.extend({}, options, opts);

            // Apply to each element
            for (var i = 0, count = $items.length; i < count; i++) {
                _build($items.eq(i), opts);
            }
        }

        return $items;
    }

    /**
     * @method private
     * @name _build
     * @description Builds each instance
     * @param $nav [jQuery object] "Target jQuery object"
     * @param opts [object] <{}> "Options object"
     */
    function _build($dropper, opts) {
        opts = $.extend({}, opts, $dropper.data("dropper-options"));
        $dropper.addClass("dropper");

        var data = $.extend({
            $dropper: $dropper,
            $input: $dropper.parents().find(".dropper-input"),
            queue: [],
            total: 0,
            uploading: false
        }, opts);

        $dropper.on("click.dropper", data, _onClick)
            .on("dragenter.dropper", data, _onDragEnter)
            .on("dragover.dropper", data, _onDragOver)
            .on("dragleave.dropper", data, _onDragOut)
            .on("drop.dropper", data, _onDrop)
            .data("dropper", data);

        data.$input.on("change.dropper", data, _onChange);
    }

    /**
     * @method private
     * @name _onClick
     * @description Handles click to dropzone
     * @param e [object] "Event data"
     */
    function _onClick(e) {
        e.stopPropagation();
        e.preventDefault();

        var data = e.data;

        data.$input.trigger("click");
    }

    /**
     * @method private
     * @name _onChange
     * @description Handles change to hidden input
     * @param e [object] "Event data"
     */
    function _onChange(e) {
        e.stopPropagation();
        e.preventDefault();

        var data = e.data,
            files = data.$input[0].files;

        if (files.length) {
            _handleUpload(data, files);
        }
    }

    /**
     * @method private
     * @name _onDragEnter
     * @description Handles dragenter to dropzone
     * @param e [object] "Event data"
     */
    function _onDragEnter(e) {
        e.stopPropagation();
        e.preventDefault();

        var data = e.data;

        data.$dropper.addClass("dropping");
    }

    /**
     * @method private
     * @name _onDragOver
     * @description Handles dragover to dropzone
     * @param e [object] "Event data"
     */
    function _onDragOver(e) {
        e.stopPropagation();
        e.preventDefault();

        var data = e.data;

        data.$dropper.addClass("dropping");
    }

    /**
     * @method private
     * @name _onDragOut
     * @description Handles dragout to dropzone
     * @param e [object] "Event data"
     */
    function _onDragOut(e) {
        e.stopPropagation();
        e.preventDefault();

        var data = e.data;

        data.$dropper.removeClass("dropping");
    }

    /**
     * @method private
     * @name _onDrop
     * @description Handles drop to dropzone
     * @param e [object] "Event data"
     */
    function _onDrop(e) {
        e.preventDefault();

        var data = e.data,
            files = e.originalEvent.dataTransfer.files;

        data.$dropper.removeClass("dropping");

        _handleUpload(data, files);
    }

    /**
     * @method private
     * @name _handleUpload
     * @description Handles new files
     * @param data [object] "Instance data"
     * @param files [object] "File list"
     */
    function _handleUpload(data, files) {
        var newFiles = [];

        for (var i = 0; i < files.length; i++) {
            var file = {
                index: data.total++,
                file: files[i],
                name: files[i].name,
                size: files[i].size,
                started: false,
                complete: false,
                error: false,
                transfer: null
            };

            newFiles.push(file);
            data.queue.push(file);
        }

        if (!data.uploading) {
            $(window).on("beforeunload.dropper", function () {
                return 'You have uploads pending, are you sure you want to leave this page?';
            });

            data.uploading = true;
        }

        data.$dropper.trigger("start.dropper", [newFiles]);

        _checkQueue(data);
    }

    /**
     * @method private
     * @name _checkQueue
     * @description Checks and updates file queue
     * @param data [object] "Instance data"
     */
    function _checkQueue(data) {
        var transfering = 0,
            newQueue = [];

        // remove lingering items from queue
        for (var i in data.queue) {
            if (data.queue.hasOwnProperty(i) && !data.queue[i].complete && !data.queue[i].error) {
                newQueue.push(data.queue[i]);
            }
        }

        data.queue = newQueue;

        for (var j in data.queue) {
            if (data.queue.hasOwnProperty(j)) {
                if (!data.queue[j].started) {
                    var formData = new FormData();

                    formData.append(data.postKey, data.queue[j].file);

                    for (var k in data.postData) {
                        if (data.postData.hasOwnProperty(k)) {
                            formData.append(k, data.postData[k]);
                        }
                    }

                    _uploadFile(data, data.queue[j], formData);
                }

                transfering++;

                if (transfering >= data.maxQueue) {
                    return;
                } else {
                    i++;
                }
            }
        }

        if (transfering === 0) {
            $(window).off("beforeunload.dropper");

            data.uploading = false;

            data.$dropper.trigger("complete.dropper");
        }
    }

    /**
     * @method private
     * @name _uploadFile
     * @description Uploads file
     * @param data [object] "Instance data"
     * @param file [object] "Target file"
     * @param formData [object] "Target form"
     */
    function _uploadFile(data, file, formData) {
        if (file.size >= data.maxSize) {
            file.error = true;
            data.$dropper.trigger("fileError.dropper", [file, "Too large"]);

            _checkQueue(data);
        } else {
            file.started = true;
            file.transfer = $.ajax({
                url: data.action,
                data: formData,
                type: "POST",
                dataType: 'json',
                contentType: false,
                processData: false,
                cache: false,
                xhr: function () {
                    var $xhr = $.ajaxSettings.xhr();

                    if ($xhr.upload) {
                        $xhr.upload.addEventListener("progress", function (e) {
                            var percent = 0,
                                position = e.loaded || e.position,
                                total = e.total;

                            if (e.lengthComputable) {
                                percent = Math.ceil(position / total * 100);
                            }

                            data.$dropper.trigger("fileProgress.dropper", [file, percent]);
                        }, false);
                    }

                    return $xhr;
                },
                beforeSend: function (e) {
                    data.$dropper.trigger("fileStart.dropper", [file]);
                },
                success: function (response, status, jqXHR) {
                    file.complete = true;
                    data.$dropper.trigger("fileComplete.dropper", [file, response, jqXHR]);

                    _checkQueue(data);
                },
                error: function (jqXHR, status, error) {
                    file.error = true;
                    data.$dropper.trigger("fileError.dropper", [file, error]);

                    _checkQueue(data);
                }
            });
        }
    }

    $.fn.dropper = function (method) {
        if (pub[method]) {
            return pub[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return _init.apply(this, arguments);
        }
        return this;
    };

    $.dropper = function (method) {
        if (method === "defaults") {
            pub.defaults.apply(this, Array.prototype.slice.call(arguments, 1));
        }
    };
})(jQuery, window);

function DropEnable() {
    $('.markdown-textbox').each(function () {
        if (!$(this).hasClass('dropper')) {
            $(this).dropper({
                action: "/file/upload",
                maxQueue: 1,
                postData: { __RequestVerificationToken: $('input[name="__RequestVerificationToken"]').val() }
            })
                .on('fileStart.dropper', function (file) {
                    $(this).val($(this).val() + '\r\n![Upload](Uploading)\r\n');
                })
                .on('fileComplete.dropper', function (file, res, ret) {
                    var content = $(this).val().replace('![Upload](Uploading)', '![' + res.name + '](/file/download/' + ret.fileId + ')');
                    $(this).val(content);
                });
        }
    });
}

function savePost(url) {
    $.post('/admin/post/edit', {
        __RequestVerificationToken: $('#frmSavePost input[name="__RequestVerificationToken"]').val(),
        title: $('#txtTitle').val(),
        id: url,
        newId: $('#txtUrl').val(),
        content: $('#txtContent').val(),
        tags: $('#txtTags').val(),
        catalog: $('#lstCatalogs').val(),
        isPage: $('#chkIsPage').is(':checked')
    }, function (html) {
        $('.post-body').html(html);
        $('.post-edit').slideUp();
        $('.post-body').slideDown();
        Highlight();
        popResult('文章保存成功');
    });
}

function editCatalog(id) {
    var parent = $('tr[data-catalog="' + id + '"]');
    parent.find('.display').hide();
    parent.find('.editing').fadeIn();
}

function cancelEditCatalog() {
    $('.editing').hide();
    $('.display').fadeIn();
}

function deleteCatalog(id) {
    var parent = $('tr[data-catalog="' + id + '"]');
    parent.remove();
    $.post('/admin/catalog/delete', {
        id: id,
        __RequestVerificationToken: $('#frmDeleteCatalog input[name="__RequestVerificationToken"]').val()
    }, function () {
        popResult('删除成功');
    });
}

function saveCatalog(id) {
    var parent = $('tr[data-catalog="' + id + '"]');
    $.post('/admin/catalog/edit/', {
        id: id,
        __RequestVerificationToken: $('#frmEditCatalog input[name="__RequestVerificationToken"]').val(),
        newId: parent.find('.title').val(),
        title: parent.find('.title-zh').val(),
        order: parent.find('.order').val()
    }, function () {
        parent.find('.d-title').html(parent.find('.title').val());
        parent.find('.d-title-zh').html(parent.find('.title-zh').val());
        parent.find('.d-order').html(parent.find('.order').val());
        parent.find('.editing').hide();
        parent.find('.display').fadeIn();
        popResult('修改成功');
    });
}

function saveConfig() {
    $.post('/admin/index', $('#frmConfig').serialize(), function () {
        popResult('网站配置信息修改成功');
    });
}

function popResult(txt) {
    var msg = $('<div class="msg hide">' + txt + '</div>');
    msg.css('left', '50%');
    $('body').append(msg);
    msg.css('margin-left', '-' + parseInt(msg.outerWidth() / 2) + 'px');
    msg.removeClass('hide');
    setTimeout(function () {
        msg.addClass('hide');
        setTimeout(function () {
            msg.remove();
        }, 400);
    }, 2600);
}