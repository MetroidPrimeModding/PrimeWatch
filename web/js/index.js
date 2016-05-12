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

function toggle(chbox)
{
  if(chbox.checked == true)
  {
    chbox.checked = false;
  }
  else
  {
    chbox.checked = true;
  }
}

(function()
{
  var remote = require('remote');
  var BrowserWindow = remote.require('browser-window');

  function init()
  {
    document.getElementById("darken_div").addEventListener("click", function(e)
    {
      darken_div.style.display = 'none';
      fakeClose_button.style.display = 'none';
      warpHelp_span.style.display= 'none';
      ilsHelp_span.style.display = 'none';
      popupHelp_span.style.display = 'none';
      musicHelp_span.style.display = 'none';
    });

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

    document.getElementById("warp_span").addEventListener("click", function(e)
    {
      var warp = document.getElementById("warp_check");
      warp.checked = !warp.checked;
      //darken_div.style.display = 'inline-block';
      //warpHelp_span.style.display = 'inline-block';
      //fakeClose_button.style.display = 'inline-block';
    });

    document.getElementById("ils_span").addEventListener("click", function(e)
    {
      darken_div.style.display = 'inline-block';
      ilsHelp_span.style.display = 'inline-block';
      fakeClose_button.style.display = 'inline-block';
    });

    document.getElementById("popup_span").addEventListener("click", function(e)
    {
      darken_div.style.display = 'inline-block';
      popupHelp_span.style.display = 'inline-block';
      fakeClose_button.style.display = 'inline-block';
    });

    document.getElementById("music_span").addEventListener("click", function(e)
    {
      darken_div.style.display = 'inline-block';
      musicHelp_span.style.display = 'inline-block';
      fakeClose_button.style.display = 'inline-block';
    });
  };

  document.onreadystatechange = function()
  {
    if(document.readyState = "complete")
    {
      init();
      darken_div.style.display = 'none';
      fakeClose_button.style.display = 'none';
      warpHelp_span.style.display = 'none';
      ilsHelp_span.style.display = 'none';
      popupHelp_span.style.display = 'none';
      musicHelp_span.style.display = 'none';
    }
  };
})();

function popupWarpHelp(link, windowName)
{
  if(!window.focus) return true;
  window.open(link, windowName, 'width=400,height=130,scrollbars=no');
}
