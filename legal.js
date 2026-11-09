// The address is stored reversed and split so harvesters do not pick it up from the markup.
document.querySelectorAll(".mail").forEach(function (el) {
  function rev(s) { return s.split("").reverse().join(""); }
  var address = rev(el.dataset.u) + "@" + rev(el.dataset.d);
  el.href = "mailto:" + address;
  el.textContent = address;
});
