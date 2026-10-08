document.addEventListener("DOMContentLoaded", function () {
  const selettorePeriodo = document.getElementById(
    "periodo-riepilogo"
  );

  const titoloIncasso = document.getElementById(
    "titolo-incasso"
  );

  const titoloSpese = document.getElementById(
    "titolo-spese"
  );

  const titoloClienti = document.getElementById(
    "titolo-clienti"
  );

  const titoloGuadagno = document.getElementById(
    "titolo-guadagno"
  );

  const valoreIncasso = document.getElementById(
    "incasso-oggi"
  );

  const valoreSpese = document.getElementById(
    "spese-oggi"
  );

  const valoreClienti = document.getElementById(
    "clienti-oggi"
  );

  const valoreGuadagno = document.getElementById(
    "guadagno-oggi"
  );

  if (
    !selettorePeriodo ||
    !titoloIncasso ||
    !titoloSpese ||
    !titoloClienti ||
    !titoloGuadagno ||
    !valoreIncasso ||
    !valoreSpese ||
    !valoreClienti ||
    !valoreGuadagno
  ) {
    console.error(
      "Errore: alcuni elementi della Dashboard non sono stati trovati."
    );

    return;
  }

  if (
    typeof firebase === "undefined" ||
    typeof auth === "undefined" ||
    typeof db === "undefined"
  ) {
    console.error(
      "Errore: Firebase, Authentication o Firestore non sono stati caricati."
    );

    return;
  }

  let clientiOnline = [];
  let speseOnline = [];

  let clientiCaricate = false;
  let speseCaricate = false;

  function convertiData(dataTesto) {
    if (!dataTesto) {
      return null;
    }

    const parti = dataTesto.split("-");

    if (parti.length !== 3) {
      return null;
    }

    const anno = Number(parti[0]);
    const mese = Number(parti[1]) - 1;
    const giorno = Number(parti[2]);

    const data = new Date(
      anno,
      mese,
      giorno
    );

    if (Number.isNaN(data.getTime())) {
      return null;
    }

    return data;
  }

  function portaAInizioGiornata(data) {
    const nuovaData = new Date(data);

    nuovaData.setHours(
      0,
      0,
      0,
      0
    );

    return nuovaData;
  }

  function dataCompresaNelPeriodo(
    dataTesto,
    periodo
  ) {
    const data = convertiData(dataTesto);

    if (!data) {
      return false;
    }

    const oggi = portaAInizioGiornata(
      new Date()
    );

    const dataDaControllare =
      portaAInizioGiornata(data);

    if (periodo === "oggi") {
      return (
        dataDaControllare.getTime() ===
        oggi.getTime()
      );
    }

    if (periodo === "sette-giorni") {
      const setteGiorniFa = new Date(oggi);

      setteGiorniFa.setDate(
        oggi.getDate() - 6
      );

      return (
        dataDaControllare >=
          setteGiorniFa &&
        dataDaControllare <= oggi
      );
    }

    if (periodo === "mese") {
      return (
        dataDaControllare.getMonth() ===
          oggi.getMonth() &&
        dataDaControllare.getFullYear() ===
          oggi.getFullYear()
      );
    }

    if (periodo === "anno") {
      return (
        dataDaControllare.getFullYear() ===
        oggi.getFullYear()
      );
    }

    return false;
  }

  function formattaEuro(importo) {
    return new Intl.NumberFormat(
      "it-IT",
      {
        style: "currency",
        currency: "EUR"
      }
    ).format(Number(importo) || 0);
  }

  function ottieniTestoPeriodo(periodo) {
    const testiPeriodi = {
      oggi: "oggi",
      "sette-giorni":
        "ultimi 7 giorni",
      mese: "questo mese",
      anno: "quest'anno"
    };

    return (
      testiPeriodi[periodo] ||
      "oggi"
    );
  }

  function creaListaAppuntamenti(
    clienti
  ) {
    const appuntamenti = [];

    clienti.forEach(
      function (cliente) {
        if (
          Array.isArray(
            cliente.appuntamenti
          ) &&
          cliente.appuntamenti.length > 0
        ) {
          cliente.appuntamenti.forEach(
            function (appuntamento) {
              appuntamenti.push({
                clienteId:
                  cliente.id,

                data:
                  appuntamento.data,

                prezzo:
                  Number(
                    appuntamento.prezzo
                  ) || 0
              });
            }
          );
        } else if (
          cliente.ultimoAppuntamento
        ) {
          appuntamenti.push({
            clienteId:
              cliente.id,

            data:
              cliente.ultimoAppuntamento,

            prezzo:
              Number(
                cliente.prezzo
              ) || 0
          });
        }
      }
    );

    return appuntamenti;
  }

  function mostraCaricamento() {
    valoreIncasso.textContent = "...";
    valoreSpese.textContent = "...";
    valoreClienti.textContent = "...";
    valoreGuadagno.textContent = "...";
  }

  function aggiornaDashboard() {
    if (
      !clientiCaricate ||
      !speseCaricate
    ) {
      mostraCaricamento();
      return;
    }

    const periodo =
      selettorePeriodo.value;

    const testoPeriodo =
      ottieniTestoPeriodo(periodo);

    titoloIncasso.textContent =
      "Incasso " + testoPeriodo;

    titoloSpese.textContent =
      "Spese " + testoPeriodo;

    titoloClienti.textContent =
      "Clienti " + testoPeriodo;

    titoloGuadagno.textContent =
      "Guadagno " + testoPeriodo;

    const appuntamenti =
      creaListaAppuntamenti(
        clientiOnline
      );

    const appuntamentiFiltrati =
      appuntamenti.filter(
        function (appuntamento) {
          return dataCompresaNelPeriodo(
            appuntamento.data,
            periodo
          );
        }
      );

    const speseFiltrate =
      speseOnline.filter(
        function (spesa) {
          return dataCompresaNelPeriodo(
            spesa.data,
            periodo
          );
        }
      );

    const incassoTotale =
      appuntamentiFiltrati.reduce(
        function (
          totale,
          appuntamento
        ) {
          return (
            totale +
            Number(
              appuntamento.prezzo ||
                0
            )
          );
        },
        0
      );

    const speseTotali =
      speseFiltrate.reduce(
        function (
          totale,
          spesa
        ) {
          return (
            totale +
            Number(
              spesa.importo || 0
            )
          );
        },
        0
      );

    const clientiUniche =
      new Set();

    appuntamentiFiltrati.forEach(
      function (appuntamento) {
        clientiUniche.add(
          appuntamento.clienteId
        );
      }
    );

    const numeroClienti =
      clientiUniche.size;

    const guadagnoTotale =
      incassoTotale -
      speseTotali;

    valoreIncasso.textContent =
      formattaEuro(
        incassoTotale
      );

    valoreSpese.textContent =
      formattaEuro(
        speseTotali
      );

    valoreClienti.textContent =
      numeroClienti;

    valoreGuadagno.textContent =
      formattaEuro(
        guadagnoTotale
      );
  }

  function ascoltaClienti() {
    db.collection("clienti")
      .onSnapshot(
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

          clientiCaricate = true;

aggiornaDashboard();

creaCalendarioFull();        },

        function (errore) {
          console.error(
            "Errore nel caricamento delle clienti:",
            errore
          );

          clientiOnline = [];
          clientiCaricate = true;

          aggiornaDashboard();
        }
      );
  }

  function ascoltaSpese() {
    db.collection("spese")
      .onSnapshot(
        function (risultato) {
          speseOnline = [];

          risultato.forEach(
            function (documento) {
              speseOnline.push({
                id: documento.id,
                ...documento.data()
              });
            }
          );

          speseCaricate = true;

          aggiornaDashboard();
        },

        function (errore) {
          console.error(
            "Errore nel caricamento delle spese:",
            errore
          );

          speseOnline = [];
          speseCaricate = true;

          aggiornaDashboard();
        }
      );
  }

  selettorePeriodo.addEventListener(
    "change",
    aggiornaDashboard
  );

  mostraCaricamento();

  auth.onAuthStateChanged(
    function (utente) {
      if (utente) {
        ascoltaClienti();
        ascoltaSpese();
      } else {
        window.location.replace(
          "accesso.html"
        );
      }
    }
  );
  function creaCalendarioFull() {

  const elementoCalendario =
    document.getElementById(
      "calendario-appuntamenti"
    );

  if (!elementoCalendario) {
    return;
  }

  const eventi = [];

  clientiOnline.forEach(function (cliente) {

    (cliente.appuntamenti || [])
      .forEach(function (
        appuntamento
      ) {

        eventi.push({
          title:
            cliente.nome +
            " " +
            cliente.cognome,

          start:
            appuntamento.data,

          extendedProps: {
            clienteId:
              cliente.id,

            telefono:
              cliente.telefono
          }
        });

      });

  });

  elementoCalendario.innerHTML = "";

const calendario = new FullCalendar.Calendar(
  elementoCalendario,
  {
    initialView: "dayGridMonth",

    locale: "it",

    firstDay: 1,

    height: "auto",

    expandRows: true,

    fixedWeekCount: false,

    dayMaxEvents: 3,

    dayMaxEventRows: 3,

    moreLinkClick: "popover",

    headerToolbar: {
      left: "title",
      center: "",
      right: "today prev,next"
    },

    events: eventi,

    eventClick: function (info) {

      const clienteId =
        info.event.extendedProps.clienteId;

      if (clienteId) {

        window.location.href =
          "scheda-cliente.html?id=" +
          encodeURIComponent(clienteId);

      }

    },

    dateClick: function (info) {
      mostraAppuntamentiGiorno(
        info.dateStr
      );
    }
  }
);

  calendario.render();
}
function mostraAppuntamentiGiorno(
  dataSelezionata
) {

  const contenitore =
    document.getElementById(
      "appuntamenti-giorno"
    );

  if (!contenitore) {
    return;
  }

  contenitore.innerHTML =
  `
  <h4>
    Appuntamenti del
    ${dataSelezionata
      .split("-")
      .reverse()
      .join("/")}
  </h4>
  `;

  let trovati = 0;

  clientiOnline.forEach(
    function (cliente) {

      (
        cliente.appuntamenti || []
      ).forEach(
        function (
          appuntamento
        ) {

          if (
            appuntamento.data ===
            dataSelezionata
          ) {

            trovati++;

            const riga =
              document.createElement(
                "p"
              );

            riga.innerHTML =
            `
            <strong>
              ${cliente.nome}
              ${cliente.cognome}
            </strong>
            <br>
            ${cliente.telefono || "Telefono non disponibile"}
            `;

            contenitore.appendChild(
              riga
            );
          }

        }
      );

    }
  );

  if (trovati === 0) {

    contenitore.innerHTML +=
      "<p>Nessun appuntamento.</p>";

  }
}
});