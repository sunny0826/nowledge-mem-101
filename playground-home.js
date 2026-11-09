(window.NMemModules = window.NMemModules || []).push(["playground-home.js", function () {
  "use strict";

  var templates = window.NMemHomeTemplates;
  var base = "/playground-assets/home-illustration/";

  function px(value) {
    return value + "px";
  }

  function box(values) {
    return "left:" + px(values[0]) + ";top:" + px(values[1]) + ";width:" + px(values[2]) + ";height:" + px(values[3]);
  }

  function esc(text) {
    return String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function layersHtml(layers, template) {
    return layers.map(function (layer) {
      if (layer.kind === "img") {
        return '<img src="' + base + layer.src + '" alt="" draggable="false" style="' + box(layer.box) + (layer.blend ? ";mix-blend-mode:" + layer.blend : "") + '">';
      }
      if (layer.kind === "clip") {
        return '<span class="home-illustration-clip" style="clip-path:path(\'' + layer.path + '\')">' + layersHtml(layer.children, template) + "</span>";
      }
      if (layer.kind === "text") {
        var slot = template.slots.filter(function (item) { return item.name === layer.slot; })[0];
        var padding = slot.face.padding.map(px).join(" ");
        var text = slot.text;
        var content = slot.name === "round" ? "Atlas" : "";
        return '<span class="home-illustration-face home-illustration-' + slot.name + '-face" style="' + box(slot.face.box) + ";padding:" + padding + ";justify-content:" + (slot.face.justify === "start" ? "flex-start" : slot.face.justify === "end" ? "flex-end" : "center") + ";align-items:" + (slot.face.align === "start" ? "flex-start" : slot.face.align === "end" ? "flex-end" : "center") + ";rotate:" + slot.face.rotate + 'deg">' +
          '<span class="home-illustration-text home-illustration-' + slot.name + '-text" style="width:' + px(text.width) + ";font-size:" + px(text.fontSize) + ";line-height:" + px(text.lineHeight) + ";text-align:" + text.align + (text.italic ? ";font-style:italic" : "") + ";--illustration-ink:" + text.color + '">' + esc(content) + "</span></span>";
      }
      return dateHtml(template.date, new Date());
    }).join("");
  }

  function dateHtml(date, day) {
    var month = new Intl.DateTimeFormat("en-US", {month: "short"}).format(day);
    var lines = date.format === "caps" ? [day.getDate() + " " + month.toUpperCase(), String(day.getFullYear())] : date.format === "serif" ? [day.getDate() + " " + month + " " + day.getFullYear()] : [day.getDate() + " " + month, String(day.getFullYear())];
    return '<span class="home-illustration-date" data-format="' + date.format + '" style="' + box(date.box) + (date.rotate ? ";rotate:" + date.rotate + "deg" : "") + ";--illustration-ink:" + date.color + '">' + lines.map(function (line, index) {
      var offset = date.lines && date.lines[index];
      return "<span" + (offset ? ' style="left:' + px(offset[0]) + ";top:" + px(offset[1]) + '"' : "") + ">" + line + "</span>";
    }).join("") + "</span>";
  }

  function pieceHtml(piece, template) {
    var layers = layersHtml(piece.layers, template);
    template.pieces.filter(function (item) { return item.attachedTo === piece.name; }).forEach(function (item) {
      layers += '<span class="home-illustration-carried" style="inset:0">' + layersHtml(item.layers, template) + "</span>";
    });
    if (!piece.rest || !piece.out) return layers;
    return '<span class="home-illustration-piece home-illustration-' + piece.name + '"' + (piece.attachedTo ? " data-attached" : "") + ' style="inset:0;--illustration-rest:' + piece.rest.map(px).join(" ") + ";--illustration-out:" + piece.out.map(px).join(" ") + ';--illustration-open-delay:0ms;--illustration-close-delay:40ms;--illustration-open-duration:700ms;--illustration-close-duration:931ms">' + layers + "</span>";
  }

  function illustrationHtml(template, day, label) {
    var front = template.pieces.filter(function (piece) { return piece.name === "front"; })[0];
    var edge = front.layers.filter(function (layer) { return layer.kind === "img"; })[0].box;
    var pocket = "polygon(-10000px -10000px,10000px -10000px,10000px " + px(edge[1]) + "," + px(edge[0] + edge[2]) + " " + px(edge[1]) + "," + px(edge[0] + edge[2]) + " 10000px," + px(edge[0]) + " 10000px," + px(edge[0]) + " " + px(edge[1]) + ",-10000px " + px(edge[1]) + ")";
    var stage = template.stage;
    var button = template.button;
    return '<span class="home-illustration" data-static data-template="' + template.id + '" style="width:' + px(button.width) + ";height:" + px(button.height) + ";margin-top:" + px(button.top) + '">' +
      '<span class="home-illustration-stage" aria-hidden="true" style="' + box([stage.left, stage.top, stage.width, stage.height]) + '">' + template.pieces.map(function (piece) {
        var html = pieceHtml(piece, template);
        return piece.rest && piece.out && piece.name !== "front" ? '<span class="home-illustration-pocket" style="clip-path:' + pocket + '">' + html + "</span>" : html;
      }).join("") + "</span></span>" +
      '<button type="button" class="home-illustration-switch" data-mp-paper aria-label="' + esc(label) + '" style="left:calc(50% + ' + px(button.width / 2 - 24) + ");top:" + px(button.top + button.height - 24) + '"><span class="home-illustration-switch-glyph" aria-hidden="true"></span></button>';
  }

  function render(day, offset, label) {
    var index = (templates.findIndex(function (template) { return template.weekday === day.getDay(); }) + offset) % templates.length;
    var template = templates[index];
    var weekday = new Intl.DateTimeFormat(document.documentElement.lang || "en", {weekday: "long"}).format(new Date(2026, 10, 1 + template.weekday, 12));
    return illustrationHtml(template, day, label.replace("{{weekday}}", weekday));
  }

  window.NMemHome = {render: render, templates: templates};
}]);
