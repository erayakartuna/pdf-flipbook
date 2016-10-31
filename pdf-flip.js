var PdfFlip = {
    magazineMode: true,
    oldScale: 1,
    currentPage: 1,
    currentScale: 1,
    layout: 'double',
    maxScale: 2,
    audioSrc: "sound/page-flip.mp3",
    init: function () {

        $(window).bind('keydown', function (e) {
            console.log(e.keyCode);
            if (e.target && e.target.tagName.toLowerCase() != 'input') {
                if (e.keyCode == 37 || e.keyCode == 38) {
                    $('.directions .prev-button').click();
                }
                else if (e.keyCode == 39 || e.keyCode == 40) {
                    $('.directions .next-button').click();
                }
            }
        });


        $(document).on('click','#firstPage',function(){
            $("#magazine").turn('page', 1);
        });

        $(document).on('click','#lastPage',function(){
            $("#magazine").turn('page', PDFViewerApplication.pagesCount);
        });


        $(document).on('click','#thumbnailView a',function(){
          $('.toolbar .pageNumber').trigger('change');
        });

        $(document).on('change', '.toolbar .pageNumber', function (e) {
            $("#magazine").turn('page', $(this).val());
        });

        $(document).on('click', '.toolbar #previous , .directions .prev-button', function (e) {
            $("#magazine").turn('previous');
            return false;
        });

        $(document).on('click', '.toolbar #next, .directions .next-button', function (e) {
            $("#magazine").turn('next');
            return false;
        });

        document.addEventListener("pagesloaded", PdfFlip.launchMagazineMode, true);
    },
    launchMagazineMode: function (e) {
        document.removeEventListener("pagesloaded", PdfFlip.launchMagazineMode, true);
        PdfFlip.start();
    },
    start: function () {
        PDFViewerApplication.disableWorker = true;

        PdfFlip.magazineMode = true;
        PdfFlip.oldScale = PDFViewerApplication.pdfViewer.currentScale;
        PDFViewerApplication.pdfViewer.currentScaleValue = 'page-fit';

        $('#viewerContainer').after('<div id="magazineContainer"><div id="magazine"></div></div>');
        $('body').append('<div class="directions"><a href="#" class="prev-button"></a><a href="#" class="next-button"></a></div>')
        $("#viewerContainer").hide();
        $("#viewer").hide();
        $(".se-pre-con").hide();
        $("#magazine").show();

        PdfFlip.currentPage = PDFViewerApplication.page;


        var pages = [1];

        PdfFlip.loadTurnJsPages(pages, $('#magazine'), true, true).then(function () {

            $("#magazine").turn({
                autoCenter: true,
                display: 'single',
                width: $("#viewer .canvasWrapper canvas")[0].width,
                height: $("#viewer .canvasWrapper canvas")[0].height,
                pages: PDFViewerApplication.pdfDocument.numPages,
                page: 1,
                elevation: 100,
                duration: 600,
                acceleration: !PdfFlip.isChrome(),
                when: {
                    missing: function (event, pages) {
                        PdfFlip.loadTurnJsPages(pages, this, false, false);
                    },
                    turning: function (event, page, view) {
                        if (!$('#magazine').turn('hasPage', page)) {

                            PdfFlip.loadTurnJsPages([page], this, false, true).then(function () {
                                $('#magazine').turn('page', page);
                            });

                            event.preventDefault();
                        }
                        PdfFlip.startTurnSound();
                        PdfFlip.currentPage = page;
                        PDFViewerApplication.page = page;
                    },
                    turned: function(event, page, view){

                    }
                }
            });


            setTimeout(function () {
                $("#magazine").turn("display", PdfFlip.layout);

                var multiplier = PdfFlip.layout == 'double' ? 2 : 1;

                $("#magazine").turn("size",
                    $("#magazine canvas")[0].width * multiplier,
                    $("#magazine canvas")[0].height);

                if (PdfFlip.currentPage > 1)
                    $("#magazine").turn("page", PdfFlip.currentPage);


                $("#magazineContainer").zoom({
                    max: PdfFlip.maxScale,
                    flipbook: $('#magazine'),
                    when: {
                        tap: function (event) {

                            if ($(this).zoom('value') == 1) {
                                $('#magazine').
                                    removeClass('animated').
                                    addClass('zoom-in');
                                $(this).zoom('zoomIn', event);
                            } else {
                                $(this).zoom('zoomOut');
                            }
                        },
                        resize: function (event, scale, page, pageElement) {
                            PdfFlip.currentScale = scale;
                            PdfFlip.loadTurnJsPages($('#magazine').turn('view'), $('#magazine'), false, false);

                        },
                        zoomIn: function () {
                            $('.zoom-icon').removeClass('zoom-icon-in').addClass('zoom-icon-out');
                            $('#magazine').addClass('zoom-in');
                            PdfFlip.resizeViewport();
                        },
                        zoomOut: function () {
                            $('.zoom-icon').removeClass('zoom-icon-out').addClass('zoom-icon-in');
                            setTimeout(function () {
                                $('#magazine').addClass('animated').removeClass('zoom-in');
                                PdfFlip.resizeViewport();
                            }, 0);

                        },
                        swipeLeft: function () {
                            $('#magazine').turn('next');
                        },
                        swipeRight: function () {
                            $('#magazine').turn('previous');
                        }
                    }
                });

                $('.zoom-icon').bind('click', function () {
                    if ($(this).hasClass('zoom-icon-in'))
                        $('#magazineContainer').zoom('zoomIn');
                    else if ($(this).hasClass('zoom-icon-out'))
                        $('#magazineContainer').zoom('zoomOut');

                });

            }, 10);
        });


    },
    resizeViewport: function () {

        var width = $(window).width(),
            height = $(window).height(),
            options = $('#magazine').turn('options');

        $('#magazine').removeClass('animated');

        $('#magazineContainer').css({
            width: width,
            height: height - $('.toolbar').height()
        }).zoom('resize');


        if ($('#magazine').turn('zoom') == 2) {
            var bound = PdfFlip.calculateBound({
                width: options.width,
                height: options.height,
                boundWidth: Math.min(options.width, width),
                boundHeight: Math.min(options.height, height)
            });

            if (bound.width % 2 !== 0)
                bound.width -= 1;


            if (bound.width != $('#magazine').width() || bound.height != $('#magazine').height()) {

                $('#magazine').turn('size', bound.width, bound.height);

                if ($('#magazine').turn('page') == 1)
                    $('#magazine').turn('peel', 'br');
            }

            $('#magazine').css({top: -bound.height / 2, left: -bound.width / 2});
        }

        $('#magazine').addClass('animated');

    },
    calculateBound: function (d) {

        var bound = {width: d.width, height: d.height};

        if (bound.width > d.boundWidth || bound.height > d.boundHeight) {

            var rel = bound.width / bound.height;

            if (d.boundWidth / rel > d.boundHeight && d.boundHeight * rel <= d.boundWidth) {

                bound.width = Math.round(d.boundHeight * rel);
                bound.height = d.boundHeight;

            } else {

                bound.width = d.boundWidth;
                bound.height = Math.round(d.boundWidth / rel);

            }
        }

        return bound;
    },
    calculateTotalPages: function () {
        return $('#viewer .page').length;
    },
    startTurnSound: function () {
        var audio = new Audio(PdfFlip.audioSrc);
        audio.play();
    },

    loadTurnJsPages: function (pages, magazine, isInit, defer, scale) {
        var deferred = null;

        if (defer)
            deferred = $.Deferred();

        var pagesRendered = 0;
        for (var i = 0; i < pages.length; i++) {
            PDFViewerApplication.pdfDocument.getPage(pages[i]).then(function (page) {

                var destinationCanvas = document.createElement('canvas');

                var unscaledViewport = page.getViewport(1);
                var divider = PdfFlip.layout == 'double' ? 2 : 1;

                var scale = Math.min((($('#mainContainer').height() - 20) / unscaledViewport.height), ((($('#mainContainer').width() - 80) / divider) / unscaledViewport.width));

                var viewport = page.getViewport(scale);


                if (PdfFlip.currentScale > 1)
                    viewport = page.getViewport(PdfFlip.currentScale);

                destinationCanvas.height = viewport.height; // - ((viewport.height / 100) * 10);
                destinationCanvas.width = viewport.width; // - ((viewport.width / 100) * 10);


                var renderContext = {
                    canvasContext: destinationCanvas.getContext("2d"),
                    viewport: viewport
                };

                page.render(renderContext).promise.then(function () {
                    pagesRendered++;

                    destinationCanvas.setAttribute('data-page-number', page.pageNumber);
                    destinationCanvas.id = 'magCanvas' + page.pageNumber;


                    if (!isInit) {
                        if ($(magazine).turn('hasPage', page.pageNumber)) {

                            var oldCanvas = $('#magCanvas' + page.pageNumber)[0];
                            oldCanvas.width = destinationCanvas.width;
                            oldCanvas.height = destinationCanvas.height;

                            var oldCtx = oldCanvas.getContext("2d");


                            oldCtx.drawImage(destinationCanvas, 0, 0);


                        }
                        else {
                            $(magazine).turn('addPage', $(destinationCanvas), page.pageNumber);
                        }
                    }
                    else {
                        $("#magazine").append($(destinationCanvas));
                    }

                    if (pagesRendered == pages.length)
                        if (deferred)
                            deferred.resolve();
                });
            });
        }

        if (deferred)
            return deferred;

    },
    isChrome: function () {
        return navigator.userAgent.indexOf('Chrome') != -1;
    }
};