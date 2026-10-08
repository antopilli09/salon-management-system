document.addEventListener(
  "DOMContentLoaded",
  function () {
    const parametriUrl =
      new URLSearchParams(
        window.location.search
      );

    const idCliente =
      parametriUrl.get("id");

    const form =
      document.getElementById(
        "form-modifica-cliente"
      );

    const campoNome =
      document.getElementById("nome");

    const campoCognome =
      document.getElementById("cognome");

    const campoTelefono =
      document.getElementById("telefono");

    const campoPrezzo =
      document.getElementById("prezzo");

    const campoUltimoAppuntamento =
      document.getElementById(
        "ultimo-appuntamento"
      );

    const campoProssimoAppuntamento =
      document.getElementById(
        "prossimo-appuntamento"
      );

    const campoNote =
      document.getElementById("note");

    const messaggio =
      document.getElementById(
        "messaggio-modifica"
      );

    const pulsanteSalva =
      document.getElementById(
        "salva-modifica"
      );

    const tornaScheda =
      document.getElementById(
        "torna-scheda"
      );

    const annullaModifica =
      document.getElementById(
        "annulla-modifica"
      );

    if (!idCliente) {
      mostraMessaggio(
        "ID della cliente non presente.",
        true
      );

      disabilitaForm();
      return;
    }

    if (typeof db === "undefined") {
      mostraMessaggio(
        "Collegamento al database non disponibile.",
        true
      );

      disabilitaForm();
      return;
    }

    const indirizzoScheda =
      "scheda-cliente.html?id=" +
      encodeURIComponent(idCliente);

    tornaScheda.href = indirizzoScheda;
    annullaModifica.href = indirizzoScheda;

    const riferimentoCliente = db
      .collection("clienti")
      .doc(idCliente);

    function mostraMessaggio(
      testo,
      errore
    ) {
      messaggio.textContent = testo;

      messaggio.style.color = errore
        ? "#b42318"
        : "#26734d";
    }

    function disabilitaForm() {
      const campi = form.querySelectorAll(
        "input, textarea, button"
      );

      campi.forEach(function (campo) {
        campo.disabled = true;
      });
    }

    async function caricaCliente() {
      try {
        const documento =
          await riferimentoCliente.get();

        if (!documento.exists) {
          mostraMessaggio(
            "La cliente non esiste oppure è stata eliminata.",
            true
          );

          disabilitaForm();
          return;
        }

        const cliente = documento.data();

        campoNome.value =
          cliente.nome || "";

        campoCognome.value =
          cliente.cognome || "";

        campoTelefono.value =
          cliente.telefono || "";

        campoPrezzo.value =
          Number(cliente.prezzo) || 0;

        campoUltimoAppuntamento.value =
          cliente.ultimoAppuntamento || "";

        campoProssimoAppuntamento.value =
          cliente.prossimoAppuntamento || "";

        campoNote.value =
          cliente.note || "";
      } catch (errore) {
        console.error(
          "Errore nel caricamento della cliente:",
          errore
        );

        mostraMessaggio(
          "Non è stato possibile caricare i dati della cliente.",
          true
        );

        disabilitaForm();
      }
    }

    form.addEventListener(
      "submit",
      async function (evento) {
        evento.preventDefault();

        const nome =
          campoNome.value.trim();

        const cognome =
          campoCognome.value.trim();

        const telefono =
          campoTelefono.value.trim();

        const note =
          campoNote.value.trim();

        const ultimoAppuntamento =
          campoUltimoAppuntamento.value;

        const prossimoAppuntamento =
          campoProssimoAppuntamento.value;

        const prezzoTesto =
          campoPrezzo.value
            .trim()
            .replace(",", ".");

        const prezzo =
          prezzoTesto === ""
            ? 0
            : Number(prezzoTesto);

        if (!nome) {
          mostraMessaggio(
            "Inserisci il nome della cliente.",
            true
          );

          campoNome.focus();
          return;
        }

        if (
          Number.isNaN(prezzo) ||
          prezzo < 0
        ) {
          mostraMessaggio(
            "Inserisci un prezzo valido.",
            true
          );

          campoPrezzo.focus();
          return;
        }

        pulsanteSalva.disabled = true;
        pulsanteSalva.textContent =
          "Salvataggio...";

        mostraMessaggio(
          "Salvataggio in corso...",
          false
        );

        try {
          await riferimentoCliente.update({
            nome: nome,
            cognome: cognome,
            telefono: telefono,
            prezzo: prezzo,
            ultimoAppuntamento:
              ultimoAppuntamento,
            prossimoAppuntamento:
              prossimoAppuntamento,
            note: note,

            ultimaModifica:
              firebase.firestore.FieldValue
                .serverTimestamp()
          });

          window.location.href =
            indirizzoScheda;
        } catch (errore) {
          console.error(
            "Errore durante la modifica:",
            errore
          );

          mostraMessaggio(
            "Non è stato possibile salvare le modifiche.",
            true
          );

          pulsanteSalva.disabled = false;
          pulsanteSalva.textContent =
            "Salva modifiche";
        }
      }
    );

    caricaCliente();
  }
);