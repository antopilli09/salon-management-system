document.addEventListener("DOMContentLoaded", function () {
  const formCliente = document.getElementById(
    "form-nuovo-cliente"
  );

  if (!formCliente) {
    console.error(
      "Errore: il modulo nuovo cliente non è stato trovato."
    );
    return;
  }

  const pulsanteSalva = formCliente.querySelector(
    'button[type="submit"]'
  );

  formCliente.addEventListener(
    "submit",
    async function (evento) {
      evento.preventDefault();

      const nome = document
        .getElementById("nome")
        .value
        .trim();

      const cognome = document
        .getElementById("cognome")
        .value
        .trim();

      const telefono = document
        .getElementById("telefono")
        .value
        .trim();

      const campoPrezzo =
        document.getElementById("prezzo");

      const prezzo = Number(
        campoPrezzo.value
      );

      const ultimoAppuntamento =
        document.getElementById(
          "data-appuntamento"
        ).value;

      const prossimoAppuntamento =
        document.getElementById(
          "prossimo-appuntamento"
        ).value;

      const note = document
        .getElementById("note")
        .value
        .trim();

if (!nome) {
  alert("Inserisci il nome");
  return;
}

      if (
        campoPrezzo.value === "" ||
        Number.isNaN(prezzo) ||
        prezzo < 0
      ) {
        alert(
          "Inserisci un prezzo valido."
        );
        return;
      }

if (
  ultimoAppuntamento &&
  prossimoAppuntamento &&
  prossimoAppuntamento < ultimoAppuntamento
) {
        alert(
          "Il prossimo appuntamento non può essere precedente a quello attuale."
        );
        return;
      }

      if (
        typeof firebase === "undefined" ||
        typeof db === "undefined"
      ) {
        console.error(
          "Firebase oppure Firestore non risultano disponibili."
        );

        alert(
          "Firebase non è stato caricato correttamente."
        );
        return;
      }

      if (
        typeof auth === "undefined" ||
        !auth.currentUser
      ) {
        alert(
          "La sessione non è attiva. Accedi nuovamente."
        );

        window.location.replace(
          "accesso.html"
        );
        return;
      }

      pulsanteSalva.disabled = true;
      pulsanteSalva.textContent =
        "Salvataggio in corso...";

      try {
        const idAppuntamento =
          Date.now().toString();

        const clienteFirestore = {
          nome: nome,
          cognome: cognome,
          telefono: telefono,
          prezzo: prezzo,

          ultimoAppuntamento:
            ultimoAppuntamento,

          prossimoAppuntamento:
            prossimoAppuntamento,

          note: note,

appuntamenti: ultimoAppuntamento
  ? [
      {
        id: idAppuntamento,
        data: ultimoAppuntamento,
        descrizione:
          "Appuntamento iniziale",
        prezzo: prezzo,
        note: note
      }
    ]
  : [],

          dataCreazione:
            firebase.firestore.FieldValue
              .serverTimestamp(),

          ultimaModifica:
            firebase.firestore.FieldValue
              .serverTimestamp()
        };

        await db
          .collection("clienti")
          .add(clienteFirestore);

        alert(
          "Cliente salvata correttamente."
        );

        window.location.href =
          "clienti.html";
      } catch (errore) {
        console.error(
          "Errore durante il salvataggio su Firestore:",
          errore
        );

        let messaggio =
          "Non è stato possibile salvare la cliente.";

        if (
          errore.code ===
          "permission-denied"
        ) {
          messaggio =
            "Permesso negato. Accedi nuovamente al gestionale.";
        } else if (
          errore.code ===
          "unavailable"
        ) {
          messaggio =
            "Connessione assente. Controlla Internet e riprova.";
        } else if (
          errore.code ===
          "unauthenticated"
        ) {
          messaggio =
            "Sessione scaduta. Accedi nuovamente.";
        }

        alert(messaggio);

        pulsanteSalva.disabled = false;
        pulsanteSalva.textContent =
          "Salva cliente";
      }
    }
  );
});