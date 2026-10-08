document.addEventListener("DOMContentLoaded", function () {
  const parametriUrl = new URLSearchParams(
    window.location.search
  );

  const idCliente = parametriUrl.get("id");

  const contenutoScheda = document.getElementById(
    "contenuto-scheda"
  );

  const pulsanteAggiungi = document.getElementById(
    "aggiungi-appuntamento"
  );

  const pulsanteModifica = document.getElementById(
    "modifica-cliente"
  );

  const pulsanteElimina = document.getElementById(
    "elimina-cliente"
  );

  let clienteCorrente = null;

  if (!idCliente) {
    mostraErrore("ID della cliente non presente.");
    return;
  }

  if (typeof db === "undefined") {
    mostraErrore(
      "Collegamento al database non disponibile."
    );
    return;
  }

  const riferimentoCliente = db
    .collection("clienti")
    .doc(idCliente);

  function formattaData(data) {
    if (!data) {
      return "Non programmato";
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

  function formattaPrezzo(prezzo) {
    return new Intl.NumberFormat("it-IT", {
      style: "currency",
      currency: "EUR"
    }).format(Number(prezzo) || 0);
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
    titolo.textContent = "Impossibile aprire la scheda";

    const testo = document.createElement("p");
    testo.textContent = messaggio;

    const collegamento = document.createElement("a");
    collegamento.href = "clienti.html";
    collegamento.className =
      "pulsante pulsante-primario";
    collegamento.textContent =
      "Torna all'archivio";

    collegamento.style.marginTop = "20px";

    riquadro.appendChild(titolo);
    riquadro.appendChild(testo);
    riquadro.appendChild(collegamento);

    contenutoScheda.appendChild(riquadro);
  }

async function eliminaAppuntamento(idAppuntamento) {


  if (!clienteCorrente) {
    return;
  }

  const conferma = confirm(
    "Vuoi eliminare questo appuntamento?"
  );

  if (!conferma) {
    return;
  }

  try {

    const appuntamenti =
      Array.isArray(
        clienteCorrente.appuntamenti
      )
        ? [...clienteCorrente.appuntamenti]
        : [];

    const aggiornati =
  appuntamenti.filter(
    function (appuntamento) {
      return (
        appuntamento.id !==
        idAppuntamento
      );
    }
  );


await riferimentoCliente.update({
  appuntamenti: aggiornati
});


} catch (errore) {

  console.error(
    "Errore Firestore:",
    errore
  );

  alert(
    "Impossibile eliminare l'appuntamento."
  );
}

}

  function mostraStorico(cliente) {
    const corpoStorico = document.getElementById(
      "corpo-storico"
    );

    if (!corpoStorico) {
      return;
    }

    const appuntamenti = Array.isArray(
      cliente.appuntamenti
    )
      ? cliente.appuntamenti
      : [];

    corpoStorico.innerHTML = "";

    if (appuntamenti.length === 0) {
      const riga = document.createElement("tr");

      const cella = document.createElement("td");
      cella.colSpan = 4;
      cella.textContent =
        "Nessun appuntamento registrato.";

      riga.appendChild(cella);
      corpoStorico.appendChild(riga);

      return;
    }

    appuntamenti
      .slice()
      .sort(function (a, b) {
        return new Date(b.data) - new Date(a.data);
      })
      .forEach(function (appuntamento, indice) {
        const riga = document.createElement("tr");

        const cellaData =
          document.createElement("td");

        cellaData.textContent = formattaData(
          appuntamento.data
        );

        const cellaDescrizione =
          document.createElement("td");

        cellaDescrizione.textContent =
          appuntamento.descrizione ||
          "Appuntamento";

        const cellaPrezzo =
          document.createElement("td");

        cellaPrezzo.textContent =
          formattaPrezzo(
            appuntamento.prezzo
          );

const cellaAzioni =
  document.createElement("td");

const pulsanteElimina =
  document.createElement("button");

pulsanteElimina.type = "button";

pulsanteElimina.className =
  "pulsante-tabella pulsante-elimina-spesa";

pulsanteElimina.textContent =
  "Elimina";

pulsanteElimina.addEventListener(
  "click",
  function () {
    eliminaAppuntamento(
  appuntamento.id
);
  }
);

cellaAzioni.appendChild(
  pulsanteElimina
);

        riga.appendChild(cellaData);
        riga.appendChild(cellaDescrizione);
        riga.appendChild(cellaPrezzo);
riga.appendChild(cellaAzioni);

        corpoStorico.appendChild(riga);
      });
  }

  function mostraDatiCliente(cliente) {
    const iniziale = document.getElementById(
      "iniziale-cliente"
    );

    const nomeCliente = document.getElementById(
      "nome-cliente"
    );

    const telefonoCliente =
      document.getElementById(
        "telefono-cliente"
      );

    const ultimoAppuntamento =
      document.getElementById(
        "ultimo-appuntamento"
      );

    const prossimoAppuntamento =
      document.getElementById(
        "prossimo-appuntamento"
      );

    const prezzoCliente =
      document.getElementById(
        "prezzo-cliente"
      );

    const noteCliente = document.getElementById(
      "note-cliente"
    );

    iniziale.textContent = cliente.nome
      ? cliente.nome.charAt(0).toUpperCase()
      : "?";

    nomeCliente.textContent = (
      (cliente.nome || "") +
      " " +
      (cliente.cognome || "")
    ).trim();

    telefonoCliente.textContent =
      "Telefono: " +
      (cliente.telefono || "Non indicato");

    ultimoAppuntamento.textContent =
      formattaData(
        cliente.ultimoAppuntamento
      );

    prossimoAppuntamento.textContent =
      formattaData(
        cliente.prossimoAppuntamento
      );

    prezzoCliente.textContent =
      formattaPrezzo(cliente.prezzo);

    noteCliente.textContent =
      cliente.note ||
      "Nessuna nota inserita.";

    mostraStorico(cliente);
  }

function aggiungiAppuntamento() {

  if (!clienteCorrente) {
    alert("Cliente non disponibile.");
    return;
  }

  window.location.href =
    "aggiungi-appuntamento.html?id=" +
    encodeURIComponent(idCliente);

}

function modificaCliente() {
  if (!clienteCorrente) {
    alert("Cliente non disponibile.");
    return;
  }

  window.location.href =
    "modifica-cliente.html?id=" +
    encodeURIComponent(idCliente);
}

  async function eliminaCliente() {
    if (!clienteCorrente) {
      alert("Cliente non disponibile.");
      return;
    }

    const nomeCompleto = (
      (clienteCorrente.nome || "") +
      " " +
      (clienteCorrente.cognome || "")
    ).trim();

    const conferma = confirm(
      "Vuoi eliminare definitivamente la cliente " +
      nomeCompleto +
      "?"
    );

    if (!conferma) {
      return;
    }

    try {
      await riferimentoCliente.delete();

      alert(
        "Cliente eliminata correttamente."
      );

      window.location.href =
        "clienti.html";
    } catch (errore) {
      console.error(
        "Errore durante l'eliminazione:",
        errore
      );

      alert(
        "Non è stato possibile eliminare la cliente."
      );
    }
  }

  function ascoltaCliente() {
    riferimentoCliente.onSnapshot(
      function (documento) {
        if (!documento.exists) {
          mostraErrore(
            "La cliente non esiste oppure è stata eliminata."
          );
          return;
        }

        clienteCorrente = {
          id: documento.id,
          ...documento.data()
        };

        mostraDatiCliente(
          clienteCorrente
        );
      },

      function (errore) {
        console.error(
          "Errore nel caricamento della scheda:",
          errore
        );

        mostraErrore(
          "Non è stato possibile caricare la scheda."
        );
      }
    );
  }

  if (pulsanteAggiungi) {
    pulsanteAggiungi.addEventListener(
      "click",
      aggiungiAppuntamento
    );
  }

  if (pulsanteModifica) {
    pulsanteModifica.addEventListener(
      "click",
      modificaCliente
    );
  }

  if (pulsanteElimina) {
    pulsanteElimina.addEventListener(
      "click",
      eliminaCliente
    );
  }

  ascoltaCliente();
});