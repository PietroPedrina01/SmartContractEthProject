# Sistema Gestione Carriere Studenti (Ethereum)

Progetto per l'esame di **Introduzione alla Programmazione di Smart Contract**.
Il sistema permette la gestione di carriere universitarie su blockchain attraverso il **Factory Pattern**, garantendo immutabilità, sicurezza e determinismo nei calcoli.

## Architettura del Progetto

Il progetto si basa su due smart contract principali:
- **StudentFactory**: Gestisce il registro degli studenti e il deploy dei singoli contratti carriera. Solo l'Owner (Università) può creare nuove carriere e proporre voti.
- **StudentCareer**: Contratto individuale per ogni studente. Gestisce il workflow dei voti (Proposta -> Accettazione/Rifiuto), il calcolo della media pesata e lo stato di laurea.

### Caratteristiche principali:
- **Workflow Interattivo**: I voti non sono imposti, devono essere accettati formalmente dallo studente tramite il proprio wallet.
- **Aritmetica Deterministica**: Il calcolo della media pesata è eseguito on-chain evitando perdite di precisione (Fixed Point Arithmetic) ed eseguendo la divisione solo come operazione finale.
- **Sicurezza**: Accesso protetto tramite modificatori personalizzati (`onlyOwner`, `onlyStudent`, `onlyFactory`) e gestione degli errori tramite Custom Errors per il risparmio di gas.

---

## Requisiti e Installazione

Assicurati di avere [Node.js](https://nodejs.org/) e `npm` installati.

1. Clonare la repository o scaricare i file del progetto.
2. Installare le dipendenze:
   ```bash
   npm install

# Testing 
Test unitari in Solidity:
```
npx hardhat test test/StudentSystem.t.sol
```
Test d'integrazione in TypeScript + Viem:
```
npx hardhat test test/StudentSystem.ts
```

# Simulazione interattiva
Le varie azioni possibili sono:
    1. Deploy contratto Factory
    2. Creazione carriera di uno studente
    3. Proposta di un esame da parte di un admin (Professore / Università)
    4. Accettazione o rifiuto da parte dello studente (firma della transazione)
    5. Calcolo della media pesata
    6. Processo di laurea basato sul raggiungimento della soglia dei crediti previsti

# Scelte progettuali
    1. Precisione aritmetica: la media viene vista come un intero moltiplicato per 100 per la mancanza di floating point in Solidity. Viene seguita la regola vista in aula della moltiplicazione prima di divisione per evitare perdita di precisione.
    2. Gestione degli stati: lo stato degli esami viene gestito grazie a delle enum: NOT_EXISTENT, PENDING, ACCEPTED, REJECTED.
    3. Access control: ogni contratto dello studente è legato univocamente all'indirizzo dello stesso, garantendo che solo il legittimo proprietario possa accettare o rifiutare i propri voti.