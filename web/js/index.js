function inputFocus(i)
{
  if(i.value==i.defaultValue)
  {
    i.value="";
    i.style.color="#a0a0a0";
  }
}

function inputBlur(i)
{
  if(i.value=="")
  {
    i.value=i.defaultValue;
    i.style.color="#a0a0a0";
  }
}

function prime1OnMouseUp()
{
  document.getElementById("gameSelectPrime1_div").style.backgroundColor = "#1e1e1d";
  document.getElementById("gameSelectPrime2_div").style.backgroundColor = "#0e0e0d";

  document.getElementById("primeSeed_in").style.visibility = "visible";
  document.getElementById("primeOptions_div").style.visibility = "visible";
  document.getElementById("primeOptionsHeader_div").style.visibility = "visible";
  document.getElementById("primeOptionsSectionTitle_span").style.visibility = "visible";
  document.getElementById("primeOptionsHeaderDivider_div").style.visibility = "visible";
  document.getElementById("primeFrigate_span").style.visibility = "visible";
  document.getElementById("primeFrigate_check").style.visibility = "visible";
  document.getElementById("primeWarp_span").style.visibility = "visible";
  document.getElementById("primeWarp_check").style.visibility = "visible";
  document.getElementById("primeIls_span").style.visibility = "visible";
  document.getElementById("primeIls_check").style.visibility = "visible";
  document.getElementById("primePopup_span").style.visibility = "visible";
  document.getElementById("primePopup_check").style.visibility = "visible";
  document.getElementById("primeMusic_span").style.visibility = "visible";
  document.getElementById("primeMusic_check").style.visibility = "visible";

  document.getElementById("prime2Seed_in").style.visibility = "hidden";
  document.getElementById("prime2Options_div").style.visibility = "hidden";
  document.getElementById("prime2OptionsHeader_div").style.visibility = "hidden";
  document.getElementById("prime2OptionsSectionTitle_span").style.visibility = "hidden";
  document.getElementById("prime2OptionsHeaderDivider_div").style.visibility = "hidden";
  document.getElementById("prime2Physics_span").style.visibility = "hidden";
  document.getElementById("prime2Physics_check").style.visibility = "hidden";
  document.getElementById("prime2Warp_span").style.visibility = "hidden";
  document.getElementById("prime2Warp_check").style.visibility = "hidden";
  document.getElementById("prime2Ils_span").style.visibility = "hidden";
  document.getElementById("prime2Ils_check").style.visibility = "hidden";
  document.getElementById("prime2Popup_span").style.visibility = "hidden";
  document.getElementById("prime2Popup_check").style.visibility = "hidden";
  document.getElementById("prime2Music_span").style.visibility = "hidden";
  document.getElementById("prime2Music_check").style.visibility = "hidden";
  console.log("prime 1");
}

function prime2OnMouseUp()
{
  document.getElementById("gameSelectPrime2_div").style.backgroundColor = "#1e1e1d";
  document.getElementById("gameSelectPrime1_div").style.backgroundColor = "#0e0e0d";

  document.getElementById("prime2Seed_in").style.visibility = "visible";
  document.getElementById("prime2Options_div").style.visibility = "visible";
  document.getElementById("prime2OptionsHeader_div").style.visibility = "visible";
  document.getElementById("prime2OptionsSectionTitle_span").style.visibility = "visible";
  document.getElementById("prime2OptionsHeaderDivider_div").style.visibility = "visible";
  document.getElementById("prime2Physics_span").style.visibility = "visible";
  document.getElementById("prime2Physics_check").style.visibility = "visible";
  document.getElementById("prime2Warp_span").style.visibility = "visible";
  document.getElementById("prime2Warp_check").style.visibility = "visible";
  document.getElementById("prime2Ils_span").style.visibility = "visible";
  document.getElementById("prime2Ils_check").style.visibility = "visible";
  document.getElementById("prime2Popup_span").style.visibility = "visible";
  document.getElementById("prime2Popup_check").style.visibility = "visible";
  document.getElementById("prime2Music_span").style.visibility = "visible";
  document.getElementById("prime2Music_check").style.visibility = "visible";

  document.getElementById("primeSeed_in").style.visibility = "hidden";
  document.getElementById("primeOptions_div").style.visibility = "hidden";
  document.getElementById("primeOptionsHeader_div").style.visibility = "hidden";
  document.getElementById("primeOptionsSectionTitle_span").style.visibility = "hidden";
  document.getElementById("primeOptionsHeaderDivider_div").style.visibility = "hidden";
  document.getElementById("primeFrigate_span").style.visibility = "hidden";
  document.getElementById("primeFrigate_check").style.visibility = "hidden";
  document.getElementById("primeWarp_span").style.visibility = "hidden";
  document.getElementById("primeWarp_check").style.visibility = "hidden";
  document.getElementById("primeIls_span").style.visibility = "hidden";
  document.getElementById("primeIls_check").style.visibility = "hidden";
  document.getElementById("primePopup_span").style.visibility = "hidden";
  document.getElementById("primePopup_check").style.visibility = "hidden";
  document.getElementById("primeMusic_span").style.visibility = "hidden";
  document.getElementById("primeMusic_check").style.visibility = "hidden";
  console.log("prime 2");
}

function primeISOFileInput()
{
  document.getElementById("primeISOFile_input").click();
}

function prime2ISOFileInput()
{
  document.getElementById("prime2ISOFile_input").click();
}

function minimizeWindow()
{
  var remote = require('remote');
  var BrowserWindow = remote.require('browser-window');
  var window = BrowserWindow.getFocusedWindow();
  window.minimize();
}

function closeWindow()
{
  var remote = require('remote');
  var BrowserWindow = remote.require('browser-window');
  var window = BrowserWindow.getFocusedWindow();
  window.close();
}

(function()
{
  var remote = require('remote');
  var BrowserWindow = remote.require('browser-window');

  function init()
  {
    document.addEventListener('drop', function(e)
    {
      e.preventDefault();
      e.stopPropagation();
    });

    document.addEventListener('dragover', function(e)
    {
      e.preventDefault();
      e.stopPropagation();
    });
  };

  document.onreadystatechange = function()
  {
    if(document.readyState = "complete")
    {
      init();
    }
  };
})();
