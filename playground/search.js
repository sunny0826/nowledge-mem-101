(function () {
  "use strict";
  var G = window.NMemPlayground = window.NMemPlayground || {};

  function tokenize(query) {
    var tokens = [];
    var latin = query.toLowerCase().match(/[a-z0-9#]{2,}/g) || [];
    tokens = tokens.concat(latin);
    var hanRuns = query.match(/[一-鿿]+/g) || [];
    for (var i = 0; i < hanRuns.length; i++) {
      var run = hanRuns[i];
      if (run.length === 1) {
        tokens.push(run);
      } else {
        if (run.length <= 4) {
          tokens.push(run);
        }
        for (var j = 0; j < run.length - 1; j++) {
          tokens.push(run.slice(j, j + 2));
        }
      }
    }
    return tokens;
  }

  function searchMemories(memories, query) {
    var tokens = tokenize(query);
    if (!tokens.length) {
      return [];
    }
    var scored = [];
    for (var i = 0; i < memories.length; i++) {
      var memory = memories[i];
      var haystack = (memory.text + " " + memory.tags.join(" ") + " " + memory.source).toLowerCase();
      var score = 0;
      for (var t = 0; t < tokens.length; t++) {
        if (haystack.indexOf(tokens[t]) !== -1) {
          score += 1;
        }
      }
      if (score > 0) {
        scored.push({ memory: memory, score: score });
      }
    }
    scored.sort(function (a, b) {
      return b.score - a.score;
    });
    return scored.slice(0, 3).map(function (hit) {
      return hit.memory;
    });
  }

  function searchDocuments(docs, query) {
    var tokens = tokenize(query);
    if (!tokens.length) {
      return [];
    }
    var scored = [];
    for (var i = 0; i < docs.length; i++) {
      var doc = docs[i];
      if (doc.status !== "indexed") {
        continue;
      }
      var haystack = (doc.name + " " + doc.excerpt + " " + doc.tags.join(" ")).toLowerCase();
      var score = 0;
      for (var t = 0; t < tokens.length; t++) {
        if (haystack.indexOf(tokens[t]) !== -1) {
          score += 1;
        }
      }
      if (score > 0) {
        scored.push({ doc: doc, score: score });
      }
    }
    scored.sort(function (a, b) {
      return b.score - a.score;
    });
    return scored.slice(0, 2).map(function (hit) {
      return hit.doc;
    });
  }

  Object.assign(G, {tokenize, searchMemories, searchDocuments});
})();
