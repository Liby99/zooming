function Zooming ($elem) {
    
    // Static variables
    const speed = 0.03;
    const $container = $elem.children().eq(0);
    const $cards = $container.children();
    
    // Size variables
    var width, height;
    var containerWidth, containerHeight;
    var cardMarginLeft, cardMarginRight, cardMarginTop, cardMarginBottom;
    var cardHorizontalMargin, cardVerticalMargin;
    var cardWidth, cardHeight;
    var widthRatio, heightRatio;
    var initRatio, finalRatio;
    
    // Instance Variables
    var interval = undefined;
    var timeout = undefined;
    var t = 0;
    var $currCard = undefined;
    var currWidth, currHeight;
    var targetWidth, targetHeight;
    var currX = 0, currY = 0, targetX = 0, targetY = 0;
    var eventTriggered = false;
    
    function initSize() {
        
        t = 0;
        
        // Outer size
        width = $elem.innerWidth();
        height = $elem.innerHeight();
        
        // Container size
        $container.width(width);
        $container.height(height);
        containerWidth = width;
        containerHeight = height;
        
        // Card size
        cardMarginLeft = parseInt($cards.css("margin-left"));
        cardMarginRight = parseInt($cards.css("margin-right"));
        cardMarginTop = parseInt($cards.css("margin-top"));
        cardMarginBottom = parseInt($cards.css("margin-bottom"));
        cardHorizontalMargin = cardMarginLeft + cardMarginRight;
        cardVerticalMargin = cardMarginTop + cardMarginBottom;
        cardWidth = $cards.outerWidth() + cardHorizontalMargin;
        cardHeight = $cards.outerHeight() + cardVerticalMargin;
        
        // Ratio
        widthRatio = cardWidth / width;
        heightRatio = cardHeight / height;
        initRatio = cardWidth / cardHeight;
        finalRatio = width / height;
        
        targetWidth = containerWidth;
        targetHeight = containerHeight;
        currWidth = containerWidth;
        currHeight = containerHeight;
        
        // Cache card initial position
        $cards.each(function () {
            var ox = $(this).offset().left - $container.offset().left - cardMarginLeft;
            var oy = $(this).offset().top - $container.offset().top - cardMarginTop;
            $(this).attr("x", ox / $container.innerWidth());
            $(this).attr("y", oy / $container.innerHeight());
        });
    }
    
    function refresh() {
        
        var diff = Math.abs(currWidth - targetWidth);
        if (diff > 0.1) {
            
            // Scale and move the container
            currWidth += (targetWidth - currWidth) * speed;
            currHeight += (targetHeight - currHeight) * speed;
            currX += (targetX - currX) * speed;
            currY += (targetY - currY) * speed;
            $container.css({
                "width": currWidth,
                "height": currHeight,
                "margin-top": currY,
                "margin-left": currX
            });
        }
        if (diff > 5) {
            eventTriggered = false;
            $cards.children(".zoom-outer").trigger("resize");
        }
        else {
            if (!eventTriggered && $currCard) {
                if (currWidth > width / widthRatio / 2) {
                    $currCard.trigger("span");
                }
                else {
                    $currCard.trigger("collapse");
                }
                eventTriggered = true;
            }
        }
    }
    
    function collapse () {
        t = 0;
        targetY = 0;
        targetX = 0;
        targetWidth = width;
        targetHeight = height;
    }
    
    function span ($card) {
        t = 1;
        targetX = -width * parseFloat($card.attr("x")) / widthRatio;
        targetY = -height * parseFloat($card.attr("y")) / heightRatio;
        targetWidth = width / widthRatio;
        targetHeight = height / heightRatio;
    }
    
    $elem.on("resize", function (event) {
        event.stopPropagation();
        event.preventDefault();
        initSize();
    });
    
    $elem.on("mousewheel", function (event) {
        event.stopPropagation();
    });
    
    $elem.on("triggerCollapse", function (event) {
        
    });
    
    $elem.on("triggerSpan", function (event, $card) {
        
    });
    
    /*
     * Zoom card mousewheel callback, update the target values
     */
    $cards.on("mousewheel", function (event) {
        event.stopPropagation();
        event.preventDefault();
        
        // Cache delta y
        var dy = event.originalEvent.deltaY;
        
        // Cache card value
        var $card = $(this);
        $currCard = $card;
        
        // Modify t
        t += dy * 0.01;
        t = Math.max(Math.min(1.1, t), -0.1);
        
        // Update target width and target height
        targetWidth = width + (width / widthRatio - width) * t;
        targetHeight = height + (height / heightRatio - height) * t;
        
        // Update
        targetX = -width * parseFloat($card.attr("x")) / widthRatio * t;
        targetY = -height * parseFloat($card.attr("y")) / heightRatio * t;
        
        // Set snapping
        clearTimeout(timeout);
        timeout = setTimeout(function() {
            $card.trigger("mousewheelrelease");
        }, 50);
    });
    
    $cards.on("mousewheelrelease", function () {
        if (t > widthRatio) {
            span($(this));
        }
        else {
            collapse();
        }
    });
    
    initSize();
    interval = setInterval(refresh, 10);
}
