document.addEventListener("DOMContentLoaded", function () {
  const formAccesso =
    document.getElementById("form-accesso");

  const emailAccesso =
    document.getElementById("email-accesso");

  const passwordAccesso =
    document.getElementById("password-accesso");

  const messaggioAccesso =
    document.getElementById("messaggio-accesso");

  const pulsanteAccesso =
    document.getElementById("pulsante-accesso");

  auth.onAuthStateChanged(function (utente) {
    if (utente) {
      window.location.href = "index.html";
    }
  });

  formAccesso.addEventListener(
    "submit",
    function (evento) {
      evento.preventDefault();

      const email = emailAccesso.value.trim();
      const password = passwordAccesso.value;

      messaggioAccesso.textContent = "";
      pulsanteAccesso.disabled = true;
      pulsanteAccesso.textContent = "Accesso in corso...";

      auth
        .signInWithEmailAndPassword(email, password)
        .then(function () {
          window.location.href = "index.html";
        })
        .catch(function (errore) {
          console.error("Errore di accesso:", errore);

          messaggioAccesso.textContent =
            "Email o password non corrette.";

          pulsanteAccesso.disabled = false;
          pulsanteAccesso.textContent = "Accedi";
        });
    }
  );
});