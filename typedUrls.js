// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// Event listner for clicks on links in a browser action popup.
// Open the link in a new tab of the current window.

var media_left = [];
var left_map = {};
var media_leftCenter = [];
var media_center = [];
var media_rightCenter = [];
var media_right = [];

function onAnchorClick(event) {
  chrome.tabs.create({
    selected: true,
    url: event.srcElement.href
  });
  return false;
}

// Given an array of URLs, build a DOM list of those URLs in the
// browser action popup.
function buildPopupDom(divName, data) {
  var popupDiv = document.getElementById(divName);

  var ul = document.createElement('ul');
  popupDiv.appendChild(ul);

  for (var i = 0, ie = data.length; i < ie; ++i) {
    var a = document.createElement('a');
    a.href = data[i];
    a.style.color = "blue";
    a.appendChild(document.createTextNode(data[i]));
    a.addEventListener('click', onAnchorClick);

    var li = document.createElement('li');
    li.appendChild(a);

    ul.appendChild(li);
  }
}

// Search history to find up to ten links that a user has typed in,
// and show those links in a popup.
function buildTypedUrlList(divName) {
  console.log("in build url list");

  // To look for history items visited in the last week,
  // subtract a week of microseconds from the current time.
  var microsecondsPerWeek = 1000 * 60 * 60 * 24 * 7;
  var oneWeekAgo = (new Date).getTime() - microsecondsPerWeek;

  // Track the number of callbacks from chrome.history.getVisits()
  // that we expect to get.  When it reaches zero, we have all results.
  var numRequestsOutstanding = 0;

  chrome.history.search({
      'text': '',              // Return every history item....
      'startTime': oneWeekAgo  // that was accessed less than one week ago.
    },
    function(historyItems) {
      // For each history item, get details on all visits.

      for (var i = 0; i < historyItems.length; ++i) {
        var url = historyItems[i].url;

        //console.log("media left length "+media_left.length);
        //var news = media_left;

        //console.log("newslength "+news.length);
        //for (var j = 0; j < media_left.length; j++) {
		var shortt = url.substring(0,20);
          if (shortt in left_map) {
			  console.log("TRIM IN THERE",shortt)
            var processVisitsWithUrl = function(url) {
              // We need the url of the visited item to process the visit.
              // Use a closure to bind the  url into the callback's args.
              return function(visitItems) {

                processVisits(url, visitItems);
              };
            };
            //var url = media_left[j];
            chrome.history.getVisits({url: url}, processVisitsWithUrl(url));
            numRequestsOutstanding++;
          }
        //}
      }

      if (!numRequestsOutstanding) {
        onAllVisitsProcessed();
      }
    });

  // Maps URLs to a count of the number of times the user typed that URL into
  // the omnibox.
  var urlToCount = {};




  // Callback for chrome.history.getVisits().  Counts the number of
  // times a user visited a URL by typing the address.
  var processVisits = function(url, visitItems) {
    for (var i = 0, ie = visitItems.length; i < ie; ++i) {
      // Ignore items unless the user typed the URL.

      /*if (visitItems[i].transition != 'typed') {
        continue;
      }*/

      if (!urlToCount[url]) {
        urlToCount[url] = 0;
      }

      urlToCount[url]++;
    }

    // If this is the final outstanding call to processVisits(),
    // then we have the final results.  Use them to build the list
    // of URLs to show in the popup.
    if (!--numRequestsOutstanding) {
      onAllVisitsProcessed();
    }
  };

  // This function is called when we have the final list of URls to display.
  var onAllVisitsProcessed = function() {
    // Get the top scorring urls.
    urlArray = [];
    for (var url in urlToCount) {
      urlArray.push(url);
    }

    // Sort the URLs by the number of times the user typed them.
    urlArray.sort(function(a, b) {
      return urlToCount[b] - urlToCount[a];
    });

    buildPopupDom(divName, urlArray.slice(0, 10));
  };
}

document.addEventListener('DOMContentLoaded', function () {
  mainLoadData();
  //buildTypedUrlList("typedUrl_div");
});

// load data in correct order using promises
var mainLoadData = function loadData(){
    console.log("loading all data with risky promises");
    Promise.all([loadData1(),loadData2(), loadData3(), loadData4(),loadData4()]).then(function(){
        console.log("finished everything!");
        buildTypedUrlList("typedUrl_div");

    });
}

var loadData1 = function loadData1(){
    return new Promise(function(resolve,reject){
      // left
      var xhr = new XMLHttpRequest();
      xhr.open('GET', chrome.extension.getURL('media_data/Left.txt'), true);
      xhr.onreadystatechange = function()
      {
          if(xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200)
          {
              media_left = xhr.responseText.split("\n");
			  for (var j = 0; j < media_left.length; j++) {
				  var trim = media_left[j].substring(0,20);
				  left_map[trim] = "left";
			};
              console.log("loading left data");
              resolve("loaded left");
          }
      };
      xhr.send();
    });
}

var loadData2 = function loadData2(){
    return new Promise(function(resolve,reject){
      // left center
      var xhr = new XMLHttpRequest();
      xhr.open('GET', chrome.extension.getURL('media_data/left_center.txt'), true);
      xhr.onreadystatechange = function()
      {
          if(xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200)
          {
              media_leftCenter = xhr.responseText.split("\n");
                console.log("loading left center");
                resolve("loaded left center");
          }

      };
      xhr.send();    
    });
}

var loadData3 = function loadData3(){
    //center
    var xhr3 = new XMLHttpRequest();
    xhr3.open('GET', chrome.extension.getURL('media_data/center.txt'), true);
    xhr3.onreadystatechange = function()
    {
        if(xhr3.readyState == XMLHttpRequest.DONE && xhr3.status == 200)
        {
            media_center = xhr3.responseText.split("\n");
        }
    };
    return new Promise(function(resolve,reject){
      resolve("loaded center");
    });
}

var loadData4 = function loadData4(){
    return new Promise(function(resolve,reject){
       // right center
      var xhr4 = new XMLHttpRequest();
      xhr4.open('GET', chrome.extension.getURL('media_data/right_center.txt'), true);
      xhr4.onreadystatechange = function()
      {
          if(xhr4.readyState == XMLHttpRequest.DONE && xhr4.status == 200)
          {
              media_rightCenter = xhr4.responseText.split("\n");
          }
      };
      resolve("loaded right center");
    });
}
// right
var loadData5 = function loadData5(){
    return new Promise(function(resolve,reject){
      var xhr5 = new XMLHttpRequest();
      xhr5.open('GET', chrome.extension.getURL('media_data/right.txt'), true);
      xhr5.onreadystatechange = function()
      {
          if(xhr5.readyState == XMLHttpRequest.DONE && xhr5.status == 200)
          {
              media_right = xhr5.responseText.split("\n");
              resolve("loaded right");
          }
      };
    });
}
