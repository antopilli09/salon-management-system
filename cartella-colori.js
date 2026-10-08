document.addEventListener("DOMContentLoaded", function () {
  const listaCartelle = document.getElementById(
    "lista-cartelle-colori"
  );

  const campoRicerca = document.getElementById(
    "ricerca-colore"
  );

  const numeroCartelle = document.getElementById(
    "numero-cartelle"
  );

  const nessunaCartella = document.getElementById(
    "nessuna-cartella"
  );

  if (
    !listaCartelle ||
    !campoRicerca ||
    !numeroCartelle ||
    !nessunaCartella
  ) {
    console.error(
      "Errore: alcuni elementi della pagina Cartella colori non sono stati trovati."
    );

    return;
  }

  if (
    typeof firebase === "undefined" ||
    typeof db === "undefined"
  ) {
    console.error(
      "Firebase o Firestore non sono stati caricati."
    );

    nessunaCartella.textContent =
      "Impossibile collegarsi al database.";

    nessunaCartella.style.display = "block";

    return;
  }

  let cartelleOnline = [];

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

  function normalizzaTesto(testo) {
    return String(testo || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  }

  function abbreviaTesto(testo, lunghezzaMassima) {
    const valore = String(testo || "");

    if (valore.length <= lunghezzaMassima) {
      return valore;
    }

    return valore.substring(
      0,
      lunghezzaMassima
    ) + "...";
  }

  function creaParagrafo(etichetta, valore) {
    const paragrafo = document.createElement("p");

    paragrafo.textContent =
      etichetta + ": " + valore;

    return paragrafo;
  }

  function creaCardCartella(cartella) {
    const articolo = document.createElement("article");

    articolo.className = "card-cliente";

    const iniziale = document.createElement("div");

    iniziale.className = "iniziale-cliente";

    iniziale.textContent = cartella.nome
      ? cartella.nome.charAt(0).toUpperCase()
      : "?";

    const informazioni = document.createElement("div");

    informazioni.className =
      "informazioni-cliente";

    const nomeCompleto = document.createElement("h3");

    nomeCompleto.textContent = (
      (cartella.nome || "") +
      " " +
      (cartella.cognome || "")
    ).trim();

    const telefono = creaParagrafo(
      "Telefono",
      cartella.telefono || "Non indicato"
    );

    const data = creaParagrafo(
      "Data",
      formattaData(cartella.data)
    );

    const colore = creaParagrafo(
      "Colore",
      abbreviaTesto(
        cartella.colore || "Non indicato",
        80
      )
    );

    informazioni.appendChild(nomeCompleto);
    informazioni.appendChild(telefono);
    informazioni.appendChild(data);
    informazioni.appendChild(colore);

    const pulsanteScheda = document.createElement("a");

    pulsanteScheda.className =
      "pulsante-scheda";

    pulsanteScheda.textContent =
      "Visualizza cartella";

    pulsanteScheda.href =
      "scheda-colore.html?id=" +
      encodeURIComponent(cartella.id);

    articolo.appendChild(iniziale);
    articolo.appendChild(informazioni);
    articolo.appendChild(pulsanteScheda);

    return articolo;
  }

  function mostraCartelle(cartelleDaMostrare) {
    listaCartelle.innerHTML = "";

    cartelleDaMostrare.forEach(function (cartella) {
      const card = creaCardCartella(cartella);

      listaCartelle.appendChild(card);
    });

    numeroCartelle.textContent =
      cartelleDaMostrare.length;

    nessunaCartella.style.display =
      cartelleDaMostrare.length === 0
        ? "block"
        : "none";
  }
  
function applicaRicerca() {
  const ricerca = normalizzaTesto(
    campoRicerca.value
  );

  if (!ricerca) {
    mostraCartelle(cartelleOnline);
    return;
  }

  const cartelleFiltrate =
    cartelleOnline.filter(function (cartella) {

      const nomeCompleto = normalizzaTesto(
        (cartella.nome || "") +
        " " +
        (cartella.cognome || "")
      );

      return nomeCompleto.includes(
        ricerca
      );
    });

  mostraCartelle(cartelleFiltrate);
}

  function caricaCartelleOnline() {
    nessunaCartella.textContent =
      "Caricamento cartelle colore...";

    nessunaCartella.style.display = "block";

    db.collection("cartelle_colore").onSnapshot(
      function (risultato) {
        cartelleOnline = [];

        risultato.forEach(function (documento) {
          cartelleOnline.push({
            id: documento.id,
            ...documento.data()
          });
        });

        cartelleOnline.sort(function (a, b) {
          const cognomeA = a.cognome || "";
          const cognomeB = b.cognome || "";

          const confrontoCognome =
            cognomeA.localeCompare(
              cognomeB,
              "it",
              {
                sensitivity: "base"
              }
            );

          if (confrontoCognome !== 0) {
            return confrontoCognome;
          }

          return (a.nome || "").localeCompare(
            b.nome || "",
            "it",
            {
              sensitivity: "base"
            }
          );
        });

        nessunaCartella.textContent =
          "Nessuna cartella colore trovata.";

        applicaRicerca();
      },

      function (errore) {
        console.error(
          "Errore nel caricamento delle cartelle colore:",
          errore
        );

        nessunaCartella.textContent =
          "Non è stato possibile caricare le cartelle colore.";

        nessunaCartella.style.display = "block";

        numeroCartelle.textContent = "0";
      }
    );
  }

  campoRicerca.addEventListener(
    "input",
    applicaRicerca
  );

  auth.onAuthStateChanged(function (utente) {
    if (utente) {
      caricaCartelleOnline();
    } else {
      window.location.replace(
        "accesso.html"
      );
    }
  });
});