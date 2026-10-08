document.addEventListener("DOMContentLoaded", function () {
  const parametriUrl = new URLSearchParams(
    window.location.search
  );

  const idCartella = parametriUrl.get("id");

  const contenutoScheda = document.getElementById(
    "contenuto-scheda-colore"
  );

  const pulsanteModifica = document.getElementById(
    "modifica-cartella-colore"
  );

  const pulsanteElimina = document.getElementById(
    "elimina-cartella-colore"
  );

  let cartellaCorrente = null;

  if (!idCartella) {
    mostraErrore(
      "L'identificativo della cartella colore non è presente."
    );

    return;
  }

  if (
    typeof firebase === "undefined" ||
    typeof db === "undefined"
  ) {
    mostraErrore(
      "Il collegamento al database non è disponibile."
    );

    return;
  }

  const riferimentoCartella = db
    .collection("cartelle_colore")
    .doc(idCartella);

  function formattaData(data) {
    if (!data) {
      return "Non indicata";
    }

    const parti = data.split("-");

    if (parti.length !== 3) {
      return data;
    }

    return (
      parti[2] +
      "/" +
      parti[1] +
      "/" +
      parti[0]
    );
  }

  function mostraErrore(messaggio) {
    if (!contenutoScheda) {
      alert(messaggio);
      return;
    }

    contenutoScheda.innerHTML = "";

    const riquadro = document.createElement("div");
    riquadro.className = "sezione-note";

    const titolo = document.createElement("h3");
    titolo.textContent =
      "Impossibile aprire la cartella colore";

    const testo = document.createElement("p");
    testo.textContent = messaggio;

    const collegamento = document.createElement("a");

    collegamento.href =
      "cartella-colori.html";

    collegamento.className =
      "pulsante pulsante-primario";

    collegamento.textContent =
      "Torna all'archivio";

    collegamento.style.marginTop =
      "20px";

    riquadro.appendChild(titolo);
    riquadro.appendChild(testo);
    riquadro.appendChild(collegamento);

    contenutoScheda.appendChild(
      riquadro
    );
  }

  function mostraDatiCartella(cartella) {
    const iniziale = document.getElementById(
      "iniziale-colore"
    );

    const nomeCompleto = document.getElementById(
      "nome-cartella-colore"
    );

    const telefono = document.getElementById(
      "telefono-cartella-colore"
    );

    const data = document.getElementById(
      "data-cartella-colore"
    );

    const formulaColore = document.getElementById(
      "formula-cartella-colore"
    );

    const note = document.getElementById(
      "note-cartella-colore"
    );

    iniziale.textContent = cartella.nome
      ? cartella.nome.charAt(0).toUpperCase()
      : "?";

    nomeCompleto.textContent = (
      (cartella.nome || "") +
      " " +
      (cartella.cognome || "")
    ).trim();

    telefono.textContent =
      "Telefono: " +
      (cartella.telefono || "Non indicato");

    data.textContent =
      formattaData(cartella.data);

    formulaColore.textContent =
      cartella.colore || "Non indicato";

    note.textContent =
      cartella.note ||
      "Nessuna nota inserita.";
  }

function modificaCartella() {
  if (!cartellaCorrente) {
    alert(
      "La cartella colore non è disponibile."
    );

    return;
  }

  window.location.href =
    "modifica-cartella-colore.html?id=" +
    encodeURIComponent(idCartella);
}

  async function eliminaCartella() {
    if (!cartellaCorrente) {
      alert(
        "La cartella colore non è disponibile."
      );

      return;
    }

    const nomeCompleto = (
      (cartellaCorrente.nome || "") +
      " " +
      (cartellaCorrente.cognome || "")
    ).trim();

    const conferma = confirm(
      "Vuoi eliminare definitivamente la cartella colore di " +
      nomeCompleto +
      "?"
    );

    if (!conferma) {
      return;
    }

    try {
      await riferimentoCartella.delete();

      alert(
        "Cartella colore eliminata correttamente."
      );

      window.location.href =
        "cartella-colori.html";
    } catch (errore) {
      console.error(
        "Errore durante l'eliminazione della cartella colore:",
        errore
      );

      alert(
        "Non è stato possibile eliminare la cartella colore."
      );
    }
  }

  function ascoltaCartella() {
    riferimentoCartella.onSnapshot(
      function (documento) {
        if (!documento.exists) {
          mostraErrore(
            "La cartella colore non esiste oppure è stata eliminata."
          );

          return;
        }

        cartellaCorrente = {
          id: documento.id,
          ...documento.data()
        };

        mostraDatiCartella(
          cartellaCorrente
        );
      },

      function (errore) {
        console.error(
          "Errore durante il caricamento della cartella colore:",
          errore
        );

        mostraErrore(
          "Non è stato possibile caricare la cartella colore."
        );
      }
    );
  }

  if (pulsanteModifica) {
    pulsanteModifica.addEventListener(
      "click",
      modificaCartella
    );
  }

  if (pulsanteElimina) {
    pulsanteElimina.addEventListener(
      "click",
      eliminaCartella
    );
  }

  auth.onAuthStateChanged(function (utente) {
    if (utente) {
      ascoltaCartella();
    } else {
      window.location.replace(
        "accesso.html"
      );
    }
  });
});