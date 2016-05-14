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

(function()
{
  var remote = require('remote');
  var BrowserWindow = remote.require('browser-window');

  function init()
  {
    document.getElementById("min_button").addEventListener("click", function(e)
    {
      var window = BrowserWindow.getFocusedWindow();
      window.minimize();
    });

    document.getElementById("close_button").addEventListener("click", function(e)
    {
      var window = BrowserWindow.getFocusedWindow();
      window.close();
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
