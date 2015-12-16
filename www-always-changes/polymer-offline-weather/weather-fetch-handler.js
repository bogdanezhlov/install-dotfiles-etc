/*
 Copyright 2015 Google Inc. All rights reserved.
 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at
   http://www.apache.org/licenses/LICENSE-2.0
 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
*/

(function(global) {
  // Removes the search/query portion from a URL.
  // E.g. stripSearchParameters("http://example.com/index.html?a=b&c=d")
  //      ➔ "http://example.com/index.html"
  function stripSearchParameters(url) {
    var strippedUrl = new URL(url);
    strippedUrl.search = '';
    return strippedUrl.toString();
  }

  global.weatherFetchHandler = function(request) {
    // Attempt to fetch(request). This will always make a network request, and will include the
    // full request URL, including the search parameters.
    return global.fetch(request).then(function(response) {
      if (response.ok) {
        // If we got back a successful response, great!
        return global.caches.open(global.toolbox.options.cacheName).then(function(cache) {
          // First, store the response in the cache, stripping away the search parameters to
          // normalize the URL key.
          return cache.put(stripSearchParameters(request.url), response.clone()).then(function() {
            // Once that entry is written to the cache, return the response to the controlled page.
            return response;
          });
        });
      }

      // If we got back an error response, raise a new Error, which will trigger the catch().
      throw new Error('A response with an error status code was returned.');
    }).catch(function(error) {
      // This code is executed when there's either a network error or a response with an error
      // status code was returned.
      return global.caches.open(global.toolbox.options.cacheName).then(function(cache) {
        // Normalize the request URL by stripping the search parameters, and then return a
        // previously cached response as a fallback.
        return cache.match(stripSearchParameters(request.url));
      });
    });
  };
})(self);
