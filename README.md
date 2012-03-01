## The Vibrant Web

A Chrome plug-in for mining and visualizing 3rd-party entities on the web.

### How it works
From the downloads page, download the crx file, and open it in Chrome.
After installation, click the pink VW icon in your browser bar, and in the resulting popup, click the "ON" button.

### What it collects
3rd-party links, scripts, image beacons, and frames. There is logic to separate benign text links from links that may trigger tracking behavior, and a filtering mechanism
to take out scripts that are not used for tracking (e.g. jQuery), either on a per-site basis or globally. (Entities to be filtered out from results are 
in js/entity_blacklist.js.) However, these mechanisms are neither exhaustive nor perfectly precise, and therefore might either mis-identify something as a tracking entity that isn't, or not find
entities that are tracking.

### Cookies
The Vibrant Web currently does not track cookies. The reasons are technical: from JavaScript it's not possible to get the domain of a cookie on a given site; using the
Chrome Extension API you can get the domain (in background.html) but you can not get the site from which a cookie read/write was initiated. Without domain information, cookies
are very difficult to identify as being the same across sites, and thus the information they provide to a user is limited.

### Privacy
Chrome will ask your permission to install, and inform you that the plug-in has access to all your browsing data.  This is correct.
However, the extension does not make visible any of your browsing data outside your computer.  No data is sent to any outside service.  All browsing data is stored in localStorage in background.html, a page within your extension.

