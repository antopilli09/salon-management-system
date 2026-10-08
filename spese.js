document.addEventListener("DOMContentLoaded", function () {
  const campoRicerca =
    document.getElementById("ricerca-spesa");

  const corpoTabella =
    document.getElementById("corpo-tabella-spese");

  const numeroSpese =
    document.getElementById("numero-spese");

  const totaleSpese =
    document.getElementById("totale-spese");

  const nessunaSpesa =
    document.getElementById("nessuna-spesa");

  if (
    !campoRicerca ||
    !corpoTabella ||
    !numeroSpese ||
    !totaleSpese ||
    !nessunaSpesa
  ) {
    console.error(
      "Mancano alcuni elementi HTML dell'Archivio spese."
    );
    return;
  }

  let speseOnline = [];

  function formattaData(data) {
    if (!data) {
      return "Non indicata";
    }

    const parti = data.split("-");

    if (parti.length !== 3) {
      return data;
    }

    return parti[2] + "/" + parti[1] + "/" + parti[0];
  }

  function formattaEuro(importo) {
    return new Intl.NumberFormat("it-IT", {
      style: "currency",
      currency: "EUR"
    }).format(Number(importo) || 0);
  }

  function formattaCategoria(categoria) {
    const categorie = {
      "prodotti-capelli": "Prodotti per capelli",
      colori: "Colori e trattamenti",
      attrezzatura: "Attrezzatura",
      materiali: "Materiali di consumo",
      "spese-salone": "Spese del salone",
      altro: "Altro"
    };

    return categorie[categoria] || categoria || "Non indicata";
  }

  function normalizzaTesto(testo) {
    return String(testo || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  }

  async function eliminaSpesa(spesa) {
    const conferma = confirm(
      'Vuoi eliminare la spesa "' +
        spesa.descrizione +
        '" di ' +
        formattaEuro(spesa.importo) +
        "?"
    );

    if (!conferma) {
      return;
    }

    try {
      await db
        .collection("spese")
        .doc(spesa.id)
        .delete();

      alert("Spesa eliminata correttamente.");
    } catch (errore) {
      console.error(
        "Errore durante l'eliminazione:",
        errore
      );

      alert("Non è stato possibile eliminare la spesa.");
    }
  }

  function modificaSpesa(spesa) {

  if (!spesa || !spesa.id) {
    return;
  }

  window.location.href =
    "modifica-spesa.html?id=" +
    encodeURIComponent(spesa.id);

}

  function creaRigaSpesa(spesa) {
    const riga = document.createElement("tr");

    const cellaData = document.createElement("td");
    cellaData.textContent = formattaData(spesa.data);

    const cellaDescrizione = document.createElement("td");

    const descrizione = document.createElement("strong");
    descrizione.textContent =
      spesa.descrizione || "Senza descrizione";

    cellaDescrizione.appendChild(descrizione);

    if (spesa.note) {
      const note = document.createElement("small");
      note.className = "nota-spesa";
      note.textContent = spesa.note;
      cellaDescrizione.appendChild(note);
    }

    const cellaCategoria = document.createElement("td");
    cellaCategoria.textContent =
      formattaCategoria(spesa.categoria);

    const cellaImporto = document.createElement("td");
    cellaImporto.className = "importo-spesa";
    cellaImporto.textContent =
      formattaEuro(spesa.importo);

    const cellaAzioni = document.createElement("td");
    cellaAzioni.className = "azioni-riga-spesa";

    const pulsanteModifica =
      document.createElement("button");

    pulsanteModifica.type = "button";
    pulsanteModifica.className =
      "pulsante-tabella pulsante-modifica-spesa";
    pulsanteModifica.textContent = "Modifica";

    pulsanteModifica.addEventListener(
      "click",
      function () {
        modificaSpesa(spesa);
      }
    );

    const pulsanteElimina =
      document.createElement("button");

    pulsanteElimina.type = "button";
    pulsanteElimina.className =
      "pulsante-tabella pulsante-elimina-spesa";
    pulsanteElimina.textContent = "Elimina";

    pulsanteElimina.addEventListener(
      "click",
      function () {
        eliminaSpesa(spesa);
      }
    );

    cellaAzioni.appendChild(pulsanteModifica);
    cellaAzioni.appendChild(pulsanteElimina);

    riga.appendChild(cellaData);
    riga.appendChild(cellaDescrizione);
    riga.appendChild(cellaCategoria);
    riga.appendChild(cellaImporto);
    riga.appendChild(cellaAzioni);

    return riga;
  }

  function mostraSpese(speseDaMostrare) {
    corpoTabella.innerHTML = "";

    let totale = 0;

    speseDaMostrare.forEach(function (spesa) {
      corpoTabella.appendChild(
        creaRigaSpesa(spesa)
      );

      totale += Number(spesa.importo || 0);
    });

    numeroSpese.textContent =
      speseDaMostrare.length;

    totaleSpese.textContent =
      formattaEuro(totale);

    nessunaSpesa.style.display =
      speseDaMostrare.length === 0
        ? "block"
        : "none";
  }

  function applicaRicerca() {
    const ricerca = normalizzaTesto(
      campoRicerca.value
    );

    if (!ricerca) {
      mostraSpese(speseOnline);
      return;
    }

    const risultati = speseOnline.filter(
      function (spesa) {
        const contenuto = normalizzaTesto(
          [
            spesa.data,
            formattaData(spesa.data),
            spesa.descrizione,
            formattaCategoria(spesa.categoria),
            spesa.importo,
            spesa.note
          ].join(" ")
        );

        return contenuto.includes(ricerca);
      }
    );

    mostraSpese(risultati);
  }

  function caricaSpese() {
    nessunaSpesa.textContent =
      "Caricamento spese...";
    nessunaSpesa.style.display = "block";

    db.collection("spese").onSnapshot(
      function (risultato) {
        speseOnline = [];

        risultato.forEach(function (documento) {
          speseOnline.push({
            id: documento.id,
            ...documento.data()
          });
        });

        speseOnline.sort(function (a, b) {
          return new Date(b.data) - new Date(a.data);
        });

        nessunaSpesa.textContent =
          "Nessuna spesa trovata.";

        applicaRicerca();
      },

      function (errore) {
        console.error(
          "Errore durante il caricamento delle spese:",
          errore
        );

        nessunaSpesa.textContent =
          "Errore durante il caricamento delle spese.";

        nessunaSpesa.style.display = "block";
      }
    );
  }

  campoRicerca.addEventListener(
    "input",
    applicaRicerca
  );

  auth.onAuthStateChanged(function (utente) {
    if (utente) {
      caricaSpese();
    } else {
      window.location.replace("accesso.html");
    }
  });
});