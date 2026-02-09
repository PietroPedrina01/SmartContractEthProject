# Sample Hardhat 3 Beta Project (`node:test` and `viem`)

This project showcases a Hardhat 3 Beta project using the native Node.js test runner (`node:test`) and the `viem` library for Ethereum interactions.

To learn more about the Hardhat 3 Beta, please visit the [Getting Started guide](https://hardhat.org/docs/getting-started#getting-started-with-hardhat-3). To share your feedback, join our [Hardhat 3 Beta](https://hardhat.org/hardhat3-beta-telegram-group) Telegram group or [open an issue](https://github.com/NomicFoundation/hardhat/issues/new) in our GitHub issue tracker.

## Project Overview

This example project includes:

- A simple Hardhat configuration file.
- Foundry-compatible Solidity unit tests.
- TypeScript integration tests using [`node:test`](nodejs.org/api/test.html), the new Node.js native test runner, and [`viem`](https://viem.sh/).
- Examples demonstrating how to connect to different types of networks, including locally simulating OP mainnet.

## Usage

### Running Tests

To run all the tests in the project, execute the following command:

```shell
npx hardhat test
```

You can also selectively run the Solidity or `node:test` tests:

```shell
npx hardhat test solidity
npx hardhat test nodejs
```

### Make a deployment to Sepolia

This project includes an example Ignition module to deploy the contract. You can deploy this module to a locally simulated chain or to Sepolia.

To run the deployment to a local chain:

```shell
npx hardhat ignition deploy ignition/modules/Counter.ts
```

To run the deployment to Sepolia, you need an account with funds to send the transaction. The provided Hardhat configuration includes a Configuration Variable called `SEPOLIA_PRIVATE_KEY`, which you can use to set the private key of the account you want to use.

You can set the `SEPOLIA_PRIVATE_KEY` variable using the `hardhat-keystore` plugin or by setting it as an environment variable.

To set the `SEPOLIA_PRIVATE_KEY` config variable using `hardhat-keystore`:

```shell
npx hardhat keystore set SEPOLIA_PRIVATE_KEY
```

After setting the variable, you can run the deployment with the Sepolia network:

```shell
npx hardhat ignition deploy --network sepolia ignition/modules/Counter.ts
```

# Structure
```
 artifacts/ -> risultato (artifact) della compilazione, file .json che descrivono il contratto
 contracts/ → directory in cui verranno messi i sorgenti dei contratti (estensione .sol) + test in Solidity (estensione .t.sol)
 ignition/modules/ → directory in cui si trovano i file del modulo Ignition usati per eseguire il deploy dei contratti. Un modulo Ignition è un file TypeScript che permette di specificare cosa va pubblicato.
 test/ → directory in cui verranno messi i sorgenti per il testing dei contratti in Solidity (.t.sol) o TypeScript (.ts)
 hardhat.config.ts → file di configurazione
```

# Test Solidity vs Typescript
```
Solidity:
    Vantaggi:
         Utilizzare lo stesso linguaggio di programmazione.
         Ottimo per la scrittura di test unitari semplici. I test unitari vengono solitamente scritti come testNomeDelTest.
         Test più veloci da eseguire perché vengono eseguiti direttamente sulla EVM invece di richiedere la simulazione
        dell’intera blockchain.
         Prevede funzionalità built-in per test con input random e per la verifica di invarianti.
    Limitazioni:
         Non adatto per testare interazioni complesse.
         L’uso di cheatcodes rende più semplice la scrittura di test, ma aggiunge della «magia» all’interno dei contratti che
        non esiste nelle interazioni reali on-chain.
Typescript:
    Vantaggi:
         Esegue i test tramite una simulazione completa della blockchain. Questo rende l’ambiente di test molto più simile all’esecuzione reale
        dei contratti.
         Il linguaggio è molto più espressivo.
         La scrittura di alcuni test semplici possono risultare molto più prolissa rispetto alla versione Solidity, ma è più scalabile.
         È possibile eseguire i test tramite il framework Node.js abbinato a diverse librerie di connessione ad Ethereum alternative: Ether.js e Viem.
         Simulando l’intera blockchain, permette di testare il comportamento dei contratti attraverso una serie di transazioni o blocchi ed usando
        account diversi.
         Permette di stabile connessioni con elementi off-chain, come ad esempio gli oracoli.
    Limitazioni:
         Più complesso per test semplici.
         Esecuzione di test semplici più lenta.
    
    Per farli in ts:
         Node.js test runner + Viem → note:test
         Viem assertions + plugin hardat-network-helpers
         Viem è una libreria mette a disposizione una serie di moduli leggeri, componibili e type-safe per interfacciarsi con una blockchain EVM. 3 concetti fondamentali: (public, wallet, test) client, transport e chain.
         Hardhat Network helpers è un plugin che mette a disposizione una serie di funzionalità per interagire con la rete blockchain
        simulata
    describe() = gruppo di test correlati, it() = test singolo
```

# Security
```
1. Reentrancy: check-effects-interaction pattern
2. delegatecall: library, do not use low level calls
3. Entropy illusion: VRFs or PREVRANDAO or external oracle
4. Unchecked return value: use transfer rather than send/call + withdrawal pattern
5. Race conditions/Front running: commit-reveal approach
6. DoS: no cycles on dynamic data structures + max limit + withdrawal pattern + ez operations inside cycles
7. Floating point imprecision: msg.value * tokensPerEth / weiPerEth
8. Improper input validation: OpenZeppelin
9. Signature replay attack: nonce
10. External contract referencing: use new keyword
```

# Design patterns
```
1. Factory pattern: need to create multiple instances of similar contracts
2. State machine pattern: manage complex state transactions
3. Proxy pattern: manage updatable contracts
4. Withdrawal pattern: manage withdraws from a contract
5. Check-effects-interaction pattern: general of withdrawal
6. Library pattern: manage and reuse of code between contracts
7. Mutex pattern: recursive calls
8. Emergency Stop pattern: block functionalities after a bug
```

# Commands
```
// Init
npx hardhat --init

// Compile
npx hardhat compile

// Testing
npx hardhat test [solidity]
npm add --save-dev @nomicfoundation/hardhat-viem @nomicfoundation/hardhat-viem-assertions @nomicfoundation/hardhat-node-test-runner @nomicfoundation/hardhat-network-helpers viem
// La lista dei plug-in va aggiunta anche nel file di configurazione di Hardhat (hardhat.config.ts)
npx hardhat test [nodejs]
npx hardhat test --coverage

npx hardhat node    // avvia nodo locale
```
Accounts
========

WARNING: Funds sent on live network to accounts with publicly known private keys WILL BE LOST.

Account #0:  0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266 (10000 ETH)
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

Account #1:  0x70997970c51812dc3a010c7d01b50e0d17dc79c8 (10000 ETH)
Private Key: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d

Account #2:  0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc (10000 ETH)
Private Key: 0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a

Account #3:  0x90f79bf6eb2c4f870365e785982e1f101e93b906 (10000 ETH)
Private Key: 0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6

Account #4:  0x15d34aaf54267db7d7c367839aaf71a00a2c6a65 (10000 ETH)
Private Key: 0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a

Account #5:  0x9965507d1a55bcc2695c58ba16fb37d819b0a4dc (10000 ETH)
Private Key: 0x8b3a350cf5c34c9194ca85829a2df0ec3153be0318b5e2d3348e872092edffba

Account #6:  0x976ea74026e726554db657fa54763abd0c3a0aa9 (10000 ETH)
Private Key: 0x92db14e403b83dfe3df233f83dfa3a0d7096f21ca9b0d6d6b8d88b2b4ec1564e

Account #7:  0x14dc79964da2c08b23698b3d3cc7ca32193d9955 (10000 ETH)
Private Key: 0x4bbbf85ce3377467afe5d46f804f221813b2bb87f24d81f60f1fcdbf7cbf4356

Account #8:  0x23618e81e3f5cdf7f54c3d65f7fbc0abf5b21e8f (10000 ETH)
Private Key: 0xdbda1821b80551c9d65939329250298aa3472ba22feea921c0cf5d620ea67b97

Account #9:  0xa0ee7a142d267c1f36714e4a8f75612f20a79720 (10000 ETH)
Private Key: 0x2a871d0798f97d79848a013d4936a73bf4cc922c825d33c1cf7073dff6d409c6

Account #10: 0xbcd4042de499d14e55001ccbb24a551f3b954096 (10000 ETH)
Private Key: 0xf214f2b2cd398c806f84e317254e0f0b801d0643303237d97a22a48e01628897

Account #11: 0x71be63f3384f5fb98995898a86b02fb2426c5788 (10000 ETH)
Private Key: 0x701b615bbdfb9de65240bc28bd21bbc0d996645a3dd57e7b12bc2bdf6f192c82

Account #12: 0xfabb0ac9d68b0b445fb7357272ff202c5651694a (10000 ETH)
Private Key: 0xa267530f49f8280200edf313ee7af6b827f2a8bce2897751d06a843f644967b1

Account #13: 0x1cbd3b2770909d4e10f157cabc84c7264073c9ec (10000 ETH)
Private Key: 0x47c99abed3324a2707c28affff1267e45918ec8c3f20b8aa892e8b065d2942dd

Account #14: 0xdf3e18d64bc6a983f673ab319ccae4f1a57c7097 (10000 ETH)
Private Key: 0xc526ee95bf44d8fc405a158bb884d9d1238d99f0612e9f33d006bb0789009aaa

Account #15: 0xcd3b766ccdd6ae721141f452c550ca635964ce71 (10000 ETH)
Private Key: 0x8166f546bab6da521a8369cab06c5d2b9e46670292d85c875ee9ec20e84ffb61

Account #16: 0x2546bcd3c84621e976d8185a91a922ae77ecec30 (10000 ETH)
Private Key: 0xea6c44ac03bff858b476bba40716402b03e41b8e97e276d1baec7c37d42484a0

Account #17: 0xbda5747bfd65f08deb54cb465eb87d40e51b197e (10000 ETH)
Private Key: 0x689af8efa8c651a91ad287602527f3af2fe9f6501a7ac4b061667b5a93e037fd

Account #18: 0xdd2fd4581271e230360230f9337d5c0430bf44c0 (10000 ETH)
Private Key: 0xde9be858da4a475276426320d5e9262ecfc3ba460bfac56360bfa6c4c28b4ee0

Account #19: 0x8626f6940e2eb28930efb4cef49b2d1f2c9c1199 (10000 ETH)
Private Key: 0xdf57089febbacf7ba0bc227dafbffa9fc08a93fdc68e1e42411a14efcf23656e
```
// apri un nuovo terminale
npx hardhat ignition deploy ignition/modules/Counter.ts --network localhost  // deploy del modulo ignition su rete localhost

// se volessi fare sepolia
npx hardhat keystore set SEPOLIA_RPC_URL
npx hardhat keystore set SEPOLIA_PRIVATE_KEY
npx hardhat ignition deploy ignition/modules/Counter.ts --network sepolia
```

# Ciò che ha detto la prof
```
sistema per la registrazione di carriere degli studenti, aggiungendo a voce che andiamo a memorizzare in blockchain per ogni studente (quindi Factory Pattern) un contratto, per ogni studente dentro il contratto avremo: gli insegnamenti, che voti ha preso, quando ha fatto l'esame e così via. Specifiche per passare l'esame (che è quello che vogliamo fare) è quello di creare gli smart contracts, di testarli con una copertura del 100% e di fare un'interazione a riga di comando tramite degli script Typescript con la libreria Viem. Quindi avere sia i test che uno script Viem che si connette e che invoca le funzioni per vedere cosa succede. Quindi simula, per esempio, il fatto che ci siano un tot di utenti che partecipano ad una lotteria. A un certo punto si invocherà il metodo per estrarre il vincitore. Poi il vincitore invocherà il metodo per esser pagato. Questa è l'idea base del progetto. Quindi, senza la necessità di creare delle applicazioni web decentralizzate, semplicemente tutto da riga di comando, creazione degli smart contract, testing, deploy e interazione. Deploy che a questo punto, visto che siamo sul puramente testuale lo potete fare anche con il nodo di hardhat, quindi prendendovi gl'indirizzi che vi dà hardhat, interagendo con quelli. Questo è quello che serve per i crediti del corso. 
```