import app from 'ampersand-app';
import webChannel from '../lib/web_channel';
import RecommendedResults from '../collections/recommended_results';

class RecommendedAdapter {
  constructor () {
    this.results = new RecommendedResults();
    // Keep a pointer to the xhr, so we can cancel it.
    this.xhr = null;
    webChannel.on('printable-key', (data) => {
      // Trim whitespace before performing search; don't attempt to search for
      // whitespace-only strings; clear results if the current query is only
      // whitespace.
      let query = data.query.trim();
      if (query.length) {
        this.search(query);
      } else {
        this.results.reset();
      }
    });
  }

  search(term) {
    // XXX Override the search endpoint by setting window.app.searchUrl in a
    //     debugger window :-)
    const searchUrl = app.searchUrl || 'https://tiny-machine.herokuapp.com/search.json?q=';
    const url = searchUrl + encodeURI(term);
    if (this.xhr) {
      this.xhr.abort();
    }
    this.xhr = new XMLHttpRequest();

    this.xhr.open('GET', url, true);
    this.xhr.onload = () => {
      if (this.xhr.readyState === 4 && (this.xhr.status === 200 || this.xhr.status === 202)) {
        let results = [];
        try {
          results = JSON.parse(this.xhr.response);
        } catch (e) {} // eslint-disable-line no-empty
        this.results.reset(results);
      }
    };
    this.xhr.send();
  }

}

// export singleton
export default new RecommendedAdapter();
