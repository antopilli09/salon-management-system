document.addEventListener("DOMContentLoaded", function () {
  const formSpesa = document.getElementById(
    "form-nuova-spesa"
  );

  if (!formSpesa) {
    console.error(
      "Errore: il modulo Nuova spesa non è stato trovato."
    );
    return;
  }

  const pulsanteSalva = formSpesa.querySelector(
    'button[type="submit"]'
  );

  formSpesa.addEventListener(
    "submit",
    async function (evento) {
      evento.preventDefault();

      const data = document.getElementById(
        "data-spesa"
      ).value;

      const descrizione = document
        .getElementById("descrizione-spesa")
        .value
        .trim();

      const categoria = document.getElementById(
        "categoria-spesa"
      ).value;

      const campoImporto = document.getElementById(
        "importo-spesa"
      );

      const importo = Number(campoImporto.value);

      const note = document
        .getElementById("note-spesa")
        .value
        .trim();

      if (!data) {
        alert("Inserisci la data della spesa.");
        return;
      }

      if (!descrizione) {
        alert("Inserisci la descrizione della spesa.");
        return;
      }

      if (!categoria) {
        alert("Seleziona una categoria.");
        return;
      }

      if (
        campoImporto.value === "" ||
        Number.isNaN(importo) ||
        importo < 0
      ) {
        alert("Inserisci un importo valido.");
        return;
      }

      if (
        typeof db === "undefined" ||
        typeof firebase === "undefined"
      ) {
        alert(
          "Il collegamento al database non è disponibile."
        );

        console.error(
          "Firebase o Firestore non sono stati caricati."
        );

        return;
      }

      pulsanteSalva.disabled = true;
      pulsanteSalva.textContent =
        "Salvataggio in corso...";

      try {
        const spesaFirestore = {
          data: data,
          descrizione: descrizione,
          categoria: categoria,
          importo: importo,
          note: note,

          dataCreazione:
            firebase.firestore.FieldValue
              .serverTimestamp(),

          ultimaModifica:
            firebase.firestore.FieldValue
              .serverTimestamp()
        };

        await db
          .collection("spese")
          .add(spesaFirestore);

        alert(
          "Spesa salvata correttamente online."
        );

        window.location.href = "spese.html";
      } catch (errore) {
        console.error(
          "Errore durante il salvataggio della spesa:",
          errore
        );

        let messaggio =
          "Non è stato possibile salvare la spesa.";

        if (errore.code === "permission-denied") {
          messaggio =
            "Permesso negato. Accedi nuovamente al gestionale.";
        } else if (
          errore.code === "unavailable"
        ) {
          messaggio =
            "Connessione assente. Controlla Internet e riprova.";
        } else if (
          errore.code === "unauthenticated"
        ) {
          messaggio =
            "Sessione scaduta. Accedi nuovamente.";
        }

        alert(messaggio);

        pulsanteSalva.disabled = false;
        pulsanteSalva.textContent =
          "Salva spesa";
      }
    }
  );
});