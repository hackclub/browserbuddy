/* Set vars */
var firstChar = false,
    visible = false,
    pissed = false,
    $document = $(document),
    $spotlightWrapper = $('#spotlight_wrapper'),
    $spotlight = $('#spotlight');

/* Function to hide spotlight */
function hideSpotlight() {
  $spotlightWrapper.hide();
  $spotlight.val('');
  visible = false;
}

/* Function to show spotlight */
function showSpotlight() {
  $spotlightWrapper.show();
  $spotlight.focus();
  visible = true;
}

/* Add listener for keydown to detect shortcut */
$document.on('keydown', function(event) {
  // 17 = CTRL
  // 16 = SHIFT
  // 89 = Y
  
  // Check if CTRL and SHIFT are pressed (17 and 16), and if Y (89) is pressed
  if (event.ctrlKey && event.shiftKey && event.which == 89) {
    // Check if spotlight is already visible
    if (!visible) {
      // Show spotlight
      showSpotlight();
    } else {
      // Hide spotlight
      hideSpotlight();
    }
  }
  
  if (event.which == 13 && !pissed) {
    alert('You really thought it would search anything? :-P');
    alert('Possibly in upcoming versions... Who knows? :-)');
    pissed = true;
  }
});

/* Delete firstChar var on keyup to ensure "shortcut" behavior and that the spotlight doesn't show up if not wanted */
$document.on('keyup', function() {
  firstChar = false;
});

/* Stop propagating if clicked within the spotlight */
$spotlight.on('click', function(e) {
  e.stopPropagation();
});

/* Hide spotlight when clicked anywhere */
$document.on('click', function() {
  hideSpotlight();
});
