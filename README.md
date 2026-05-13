# AppyPay TypeScript SDK

TypeScript SDK for the [AppyPay](https://appypay.co.ao) payment gateway (Angola). Targets Bun, but works on any modern Node runtime.

Read this in: [Português](README.pt.md)

## Install

```bash
bun add @bit-/appypayts
# or
npm install @bit-/appypayts
```

## Configuration

Set the following environment variables (or pass them to `new AppyPay({...})`):

```bash
APPYPAY_CLIENT_ID=...
APPYPAY_CLIENT_SECRET=...
APPYPAY_RESOURCE=...
APPYPAY_AUTH_URL=https://login.microsoftonline.com/.../oauth2/token
APPYPAY_API_URL=https://apiservices.appypay.co.ao
APPYPAY_VERSION=v2.0

# Terminal / POS
APPYPAY_POS_CODE=...

# Merchant-side payment method IDs (provided by AppyPay)
APPYPAY_GPO=...   # Multicaixa Express / QR
APPYPAY_REF=...   # Bank reference
APPYPAY_ETPA=...  # Physical terminal
```

## Quick start

```ts
import { AppyPay } from "@bit-/appypayts";
import { PaymentMethod } from "@bit-/appypayts/dist/types";

const appy = AppyPay.fromEnv();

const response = await appy.charge({
    amount: 1500,
    description: "Order #123",
    merchantTransactionId: "TX-000123",
    paymentMethod: PaymentMethod.express,
    paymentInfo: { phoneNumber: "923000000" },
});
```

There is also a ready-to-use singleton (reads `process.env` at module load):

```ts
import { AppyPayClient } from "@bit-/appypayts/dist/AppyPayClient";

await AppyPayClient.charge({ /* ... */ });
```

## Payment methods

| Method     | Endpoint        | Notes                                              |
|------------|-----------------|----------------------------------------------------|
| `express`  | `POST /charges` | Multicaixa Express (push to phone)                 |
| `aexpress` | `POST /charges` | Same as `express`, async (`vnd.appypay.asyncapi`)  |
| `ref`      | `POST /charges` | Bank reference (Multicaixa reference)              |
| `aref`     | `POST /charges` | Same as `ref`, async                               |
| `qr`       | `POST /qr-codes`| Static / dynamic QR code (posCode comes from env)  |

## Other operations

```ts
// Single charge
await appy.getCharge(id);                          // by gateway UUID

// List charges (default page = 50)
await appy.listCharges(query);

// Refund (full or partial)
await appy.refund(chargeId, { amount: 500, description: "Partial refund" });

// Permanent references
await appy.registerReference(dto);
await appy.listReferences(query);
```

## Token caching

By default tokens are cached on disk (`<cwd>/temp/oauth_token.json`). Plug in your own storage:

```ts
import { AppyPay } from "@bit-/appypayts";
import { RedisTokenStorage } from "@bit-/appypayts/dist/storage/RedisTokenStorage";

const appy = AppyPay.fromEnv(new RedisTokenStorage(redis));
```

Available storages: `MemoryTokenStorage`, `DiskTokenStorage` (default), `RedisTokenStorage`.

## Error handling

Failed HTTP calls throw `AppyPayError`. Normalize with `handleAppyPayException`:

```ts
import { handleAppyPayException } from "@bit-/appypayts/dist/exception/handleAppyPayException";

try {
    await appy.charge(input);
} catch (e) {
    const err = handleAppyPayException(e); // { success: false, code, message, original }
}
```

## License

MIT
