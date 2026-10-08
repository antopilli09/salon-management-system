document.addEventListener("DOMContentLoaded", function () {
  const listaClienti = document.getElementById(
    "lista-clienti"
  );

  const campoRicerca = document.getElementById(
    "ricerca-cliente"
  );

  const numeroClienti = document.getElementById(
    "numero-clienti"
  );

  const nessunRisultato = document.getElementById(
    "nessun-risultato"
  );

  if (
    !listaClienti ||
    !campoRicerca ||
    !numeroClienti ||
    !nessunRisultato
  ) {
    console.error(
      "Errore: alcuni elementi dell'Archivio clienti non sono stati trovati."
    );

    return;
  }

  if (typeof db === "undefined") {
    console.error(
      "Errore: Firestore non è stato caricato."
    );

    listaClienti.innerHTML = `
      <p class="nessun-risultato" style="display: block;">
        Impossibile collegarsi al database.
      </p>
    `;

    return;
  }

  let clientiOnline = [];

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
    const valore = Number(prezzo);

    return new Intl.NumberFormat("it-IT", {
      style: "currency",
      currency: "EUR"
    }).format(
      Number.isNaN(valore) ? 0 : valore
    );
  }

  function normalizzaTesto(testo) {
    return String(testo || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  }

  function creaParagrafo(etichetta, valore) {
    const paragrafo = document.createElement("p");

    paragrafo.textContent =
      etichetta + ": " + valore;

    return paragrafo;
  }

  function creaCardCliente(cliente) {
    const articolo = document.createElement(
      "article"
    );

    articolo.className = "card-cliente";

    const iniziale = document.createElement(
      "div"
    );

    iniziale.className = "iniziale-cliente";

    iniziale.textContent = cliente.nome
      ? cliente.nome.charAt(0).toUpperCase()
      : "?";

    const informazioni = document.createElement(
      "div"
    );

    informazioni.className =
      "informazioni-cliente";

    const nomeCompleto = document.createElement(
      "h3"
    );

    nomeCompleto.textContent = (
      (cliente.nome || "") +
      " " +
      (cliente.cognome || "")
    ).trim();

    const telefono = creaParagrafo(
      "Telefono",
      cliente.telefono || "Non indicato"
    );

    const ultimoAppuntamento = creaParagrafo(
      "Ultimo appuntamento",
      formattaData(
        cliente.ultimoAppuntamento
      )
    );

    const prossimoAppuntamento =
      creaParagrafo(
        "Prossimo appuntamento",
        formattaData(
          cliente.prossimoAppuntamento
        )
      );

    const prezzo = creaParagrafo(
      "Prezzo",
      formattaPrezzo(cliente.prezzo)
    );

    informazioni.appendChild(
      nomeCompleto
    );

    informazioni.appendChild(
      telefono
    );

    informazioni.appendChild(
      ultimoAppuntamento
    );

    informazioni.appendChild(
      prossimoAppuntamento
    );

    informazioni.appendChild(
      prezzo
    );

    const pulsanteScheda =
      document.createElement("a");

    pulsanteScheda.className =
      "pulsante-scheda";

    pulsanteScheda.textContent =
      "Visualizza scheda";

    pulsanteScheda.href =
      "scheda-cliente.html?id=" +
      encodeURIComponent(cliente.id);

    articolo.appendChild(iniziale);
    articolo.appendChild(informazioni);
    articolo.appendChild(pulsanteScheda);

    return articolo;
  }

  function mostraClienti(
    clientiDaMostrare
  ) {
    listaClienti.innerHTML = "";

    clientiDaMostrare.forEach(
      function (cliente) {
        const card =
          creaCardCliente(cliente);

        listaClienti.appendChild(card);
      }
    );

    numeroClienti.textContent =
      clientiDaMostrare.length;

    nessunRisultato.style.display =
      clientiDaMostrare.length === 0
        ? "block"
        : "none";
  }

  function applicaRicerca() {
    const ricerca = normalizzaTesto(
      campoRicerca.value
    );

    if (!ricerca) {
      mostraClienti(clientiOnline);
      return;
    }

    const clientiFiltrate =
      clientiOnline.filter(
        function (cliente) {
          const contenutoRicerca =
            normalizzaTesto(
              [
                cliente.nome,
                cliente.cognome,
                cliente.telefono,
                cliente.ultimoAppuntamento,
                cliente.prossimoAppuntamento,
                cliente.note
              ].join(" ")
            );

          return contenutoRicerca.includes(
            ricerca
          );
        }
      );

    mostraClienti(clientiFiltrate);
  }

  function ordinaClienti(clienti) {
    return clienti.sort(
      function (clienteA, clienteB) {
        const cognomeA =
          clienteA.cognome || "";

        const cognomeB =
          clienteB.cognome || "";

        const confrontoCognomi =
          cognomeA.localeCompare(
            cognomeB,
            "it",
            {
              sensitivity: "base"
            }
          );

        if (confrontoCognomi !== 0) {
          return confrontoCognomi;
        }

        const nomeA =
          clienteA.nome || "";

        const nomeB =
          clienteB.nome || "";

        return nomeA.localeCompare(
          nomeB,
          "it",
          {
            sensitivity: "base"
          }
        );
      }
    );
  }

  function mostraCaricamento() {
    listaClienti.innerHTML = `
      <p
        class="nessun-risultato"
        style="display: block;"
      >
        Caricamento clienti...
      </p>
    `;

    numeroClienti.textContent = "0";
    nessunRisultato.style.display = "none";
  }

  function mostraErroreCaricamento() {
    listaClienti.innerHTML = `
      <p
        class="nessun-risultato"
        style="display: block;"
      >
        Non è stato possibile caricare le clienti.
      </p>
    `;

    numeroClienti.textContent = "0";
    nessunRisultato.style.display = "none";
  }

  function caricaClientiOnline() {
    mostraCaricamento();

    db.collection("clienti").onSnapshot(
      function (risultato) {
        clientiOnline = [];

        risultato.forEach(
          function (documento) {
            clientiOnline.push({
              id: documento.id,
              ...documento.data()
            });
          }
        );

        clientiOnline =
          ordinaClienti(clientiOnline);

        applicaRicerca();
      },

      function (errore) {
        console.error(
          "Errore nel caricamento delle clienti:",
          errore
        );

        mostraErroreCaricamento();
      }
    );
  }

  campoRicerca.addEventListener(
    "input",
    applicaRicerca
  );

  caricaClientiOnline();
});