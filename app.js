// Forms: native validation in Russian, then send to Netlify Forms without leaving the page.
// Without JS the forms still post normally and land on /spasibo/.
(function () {
  var forms = document.querySelectorAll("form.order");
  if (!forms.length) return;

  function messageFor(el, formal) {
    var v = el.validity;
    if (v.valueMissing) {
      if (el.type === "radio") return formal ? "Выберите один вариант" : "Выбери один вариант";
      return formal ? "Заполните, пожалуйста" : "Заполни, пожалуйста";
    }
    if (v.typeMismatch && el.type === "email") return formal ? "Проверьте адрес почты" : "Проверь адрес почты";
    return "";
  }

  forms.forEach(function (form) {
    var formal = form.name === "collab";

    form.addEventListener("invalid", function (e) {
      var el = e.target;
      el.setCustomValidity(messageFor(el, formal));
      el.setAttribute("aria-invalid", "true");
    }, true);

    // Native validation runs after the button click: start every attempt from a clean slate,
    // so a field filled by autofill (no input event) is judged by its real value.
    form.querySelector('button[type="submit"]').addEventListener("click", function () {
      form.querySelectorAll("input, textarea").forEach(function (el) { el.setCustomValidity(""); });
    });

    form.addEventListener("input", clear, true);
    form.addEventListener("change", clear, true);
    function clear(e) {
      var el = e.target;
      if (!el.setCustomValidity) return;
      if (el.type === "radio") {
        form.querySelectorAll('input[name="' + el.name + '"]').forEach(function (r) { r.setCustomValidity(""); });
      } else {
        el.setCustomValidity("");
      }
      el.removeAttribute("aria-invalid");
    }

    if (!window.fetch || !window.URLSearchParams || !window.FormData) return;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var button = form.querySelector('button[type="submit"]');
      var label = button.textContent;
      var old = form.querySelector(".form-error");
      if (old) old.remove();

      var data = new FormData(form);
      var body = new URLSearchParams();
      var seen = {};
      data.forEach(function (value, key) {
        if (seen[key] !== undefined) {
          body.set(key, seen[key] + ", " + value);
          seen[key] = seen[key] + ", " + value;
        } else {
          body.append(key, value);
          seen[key] = value;
        }
      });

      button.disabled = true;
      button.textContent = "Отправляю…";

      fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString()
      })
        .then(function (res) {
          if (!res.ok) throw new Error(res.status);
          showSent(form);
        })
        .catch(function () {
          button.disabled = false;
          button.textContent = label;
          var err = document.createElement("p");
          err.className = "form-error";
          err.setAttribute("role", "alert");
          err.textContent = formal
            ? "Не получилось отправить. Проверьте интернет и попробуйте ещё раз или напишите в директ @ulianavien."
            : "Не получилось отправить. Проверь интернет и попробуй ещё раз или напиши в директ @ulianavien.";
          button.insertAdjacentElement("afterend", err);
        });
    });
  });

  function showSent(form) {
    var done = document.createElement("div");
    done.className = "order__done";
    done.setAttribute("role", "status");
    done.innerHTML =
      '<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="21"/><path class="tick" d="M15 24.5l6.5 6.5L33.5 18"/></svg>' +
      "<h3>Отправлено</h3><p></p>";
    done.querySelector("p").textContent = form.getAttribute("data-success") || "";
    form.appendChild(done);
    form.setAttribute("data-state", "sent");
    var rect = form.getBoundingClientRect();
    if (rect.top < 0) form.scrollIntoView({ block: "start" });
  }
})();
