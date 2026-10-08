document.documentElement.style.visibility = "hidden";

function aggiungiPulsanteEsci() {
  const menu = document.querySelector(
    ".menu-laterale nav"
  );

  if (!menu) {
    return;
  }

  if (
    document.getElementById(
      "pulsante-esci"
    )
  ) {
    return;
  }

  const pulsanteEsci =
    document.createElement("button");

  pulsanteEsci.id =
    "pulsante-esci";

  pulsanteEsci.type =
    "button";

  pulsanteEsci.className =
    "voce-menu pulsante-esci";

  pulsanteEsci.textContent =
    "Esci";

  pulsanteEsci.addEventListener(
    "click",
    async function () {
      const conferma = confirm(
        "Vuoi uscire dal gestionale?"
      );

      if (!conferma) {
        return;
      }

      try {
        await auth.signOut();

        window.location.replace(
          "accesso.html"
        );
      } catch (errore) {
        console.error(
          "Errore durante la disconnessione:",
          errore
        );

        alert(
          "Non è stato possibile uscire. Riprova."
        );
      }
    }
  );

  menu.appendChild(
    pulsanteEsci
  );
}

auth.onAuthStateChanged(
  function (utente) {
    if (utente) {
      document.documentElement.style.visibility =
        "visible";

      aggiungiPulsanteEsci();
    } else {
      window.location.replace(
        "accesso.html"
      );
    }
  }
);