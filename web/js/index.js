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

  $(".prime1").children().show();
  $(".prime2").children().hide();
}

function prime2OnMouseUp()
{
  document.getElementById("gameSelectPrime2_div").style.backgroundColor = "#1e1e1d";
  document.getElementById("gameSelectPrime1_div").style.backgroundColor = "#0e0e0d";

  $(".prime2").children().show();
  $(".prime1").children().hide();
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
      prime1OnMouseUp();
    }
  };
})();
