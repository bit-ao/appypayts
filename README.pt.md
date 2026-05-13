# AppyPay TypeScript SDK

SDK em TypeScript para o gateway de pagamentos [AppyPay](https://appypay.co.ao) (Angola). Pensado para o Bun, mas corre em qualquer runtime moderno de Node.

Ler noutra língua: [English](README.md)

## Instalação

```bash
bun add @bit-/appypayts
# ou
npm install @bit-/appypayts
```

## Configuração

Defina as variáveis de ambiente (ou passe-as ao `new AppyPay({...})`):

```bash
APPYPAY_CLIENT_ID=...
APPYPAY_CLIENT_SECRET=...
APPYPAY_RESOURCE=...
APPYPAY_AUTH_URL=https://login.microsoftonline.com/.../oauth2/token
APPYPAY_API_URL=https://apiservices.appypay.co.ao
APPYPAY_VERSION=v2.0

# Terminal / POS
APPYPAY_POS_CODE=...

# IDs dos métodos de pagamento (fornecidos pela AppyPay ao comerciante)
APPYPAY_GPO=...   # Multicaixa Express / QR
APPYPAY_REF=...   # Referência bancária
APPYPAY_ETPA=...  # Terminal físico
```

## Início rápido

```ts
import { AppyPay } from "@bit-/appypayts";
import { PaymentMethod } from "@bit-/appypayts/dist/types";

const appy = AppyPay.fromEnv();

const resposta = await appy.charge({
    amount: 1500,
    description: "Encomenda #123",
    merchantTransactionId: "TX-000123",
    paymentMethod: PaymentMethod.express,
    paymentInfo: { phoneNumber: "923000000" },
});
```

Existe também um singleton pronto a usar (lê `process.env` no carregamento do módulo):

```ts
import { AppyPayClient } from "@bit-/appypayts/dist/AppyPayClient";

await AppyPayClient.charge({ /* ... */ });
```

## Métodos de pagamento

| Método     | Endpoint        | Notas                                                  |
|------------|-----------------|--------------------------------------------------------|
| `express`  | `POST /charges` | Multicaixa Express (push para o telemóvel)             |
| `aexpress` | `POST /charges` | Igual ao `express`, assíncrono (`vnd.appypay.asyncapi`)|
| `ref`      | `POST /charges` | Referência Multicaixa                                  |
| `aref`     | `POST /charges` | Igual ao `ref`, assíncrono                             |
| `qr`       | `POST /qr-codes`| QR code estático / dinâmico (posCode vem do `.env`)    |

## Outras operações

```ts
// Consultar uma cobrança
await appy.getCharge(id);                          // por UUID do gateway

// Listar cobranças (página por omissão = 50)
await appy.listCharges(query);

// Reembolso (total ou parcial)
await appy.refund(chargeId, { amount: 500, description: "Devolução parcial" });

// Referências permanentes
await appy.registerReference(dto);
await appy.listReferences(query);
```

## Cache do token

Por omissão o token é guardado em disco (`<cwd>/temp/oauth_token.json`). Pode usar outro storage:

```ts
import { AppyPay } from "@bit-/appypayts";
import { RedisTokenStorage } from "@bit-/appypayts/dist/storage/RedisTokenStorage";

const appy = AppyPay.fromEnv(new RedisTokenStorage(redis));
```

Storages disponíveis: `MemoryTokenStorage`, `DiskTokenStorage` (predefinido), `RedisTokenStorage`.

## Tratamento de erros

Chamadas HTTP falhadas lançam `AppyPayError`. Normalize com `handleAppyPayException`:

```ts
import { handleAppyPayException } from "@bit-/appypayts/dist/exception/handleAppyPayException";

try {
    await appy.charge(input);
} catch (e) {
    const erro = handleAppyPayException(e); // { success: false, code, message, original }
}
```

## Licença

MIT
