// types.ts
export enum PaymentMethod {
    ref = "ref",
    express = "express",
    aexpress = "aexpress",
    qr = "qr",
}
// PaymentInfo para GPO (Multicaixa Express App)
export type PaymentInfoGPO = {
    phoneNumber: string; // 9 a 15 chars
};

// PaymentInfo para REF (Referência bancária)
export type PaymentInfoREF = {
    referenceNumber: string; // 9 a 15 chars numéricos
    dueDate?: string;        // ISO datetime opcional
};

// PaymentInfo para eTPA (Terminal físico)
export type PaymentInfoETPA = {
    posCode: string; // 6 a 9 chars
};

// Union de todos os tipos possíveis
export type PaymentInfo =
    | PaymentInfoGPO
    | PaymentInfoREF
    | PaymentInfoETPA;
export type PaymentMethodsConfig = {
    gpo?:string|null;
    ref?:string|null;
    etpa?:string|null;
};
export type AppyPayConfig = {
    baseUrl?: string;
    authUrl?: string;
    version?: string;
    clientId?: string;
    clientSecret?: string;
    resource?: string;
    methods:PaymentMethodsConfig;
    posCode:string
};
type BaseCharge = {
    amount: number;
    currency?: string;
    description?: string;
    merchantTransactionId: string;
    options?: Record<string, any>;
    notify?: {
        name?: string;
        telephone?: string;
        email?: string;
        smsNotification?: boolean;
        emailNotification?: boolean;
    };
    paymentInfo:PaymentInfo
};

export type RefCharge = BaseCharge & {
    paymentMethod: PaymentMethod.ref;
    paymentInfo: PaymentInfoREF;
};

export type ExpressCharge = BaseCharge & {
    paymentMethod:  PaymentMethod.express |  PaymentMethod.aexpress
    paymentInfo: PaymentInfoGPO;
};

export type QrCharge = BaseCharge & {
    paymentMethod:  PaymentMethod.qr;
    paymentInfo: PaymentInfoETPA;
};

export type CreateChargeInput = RefCharge | ExpressCharge | QrCharge;

export type CreateChargeResponse = {
    id: string; // UUID

    responseStatus: {
        successful: boolean;
        status: "Requested" | "Pending" | "Success" | "Failed"; // estados possíveis
        code: number;
        message: string;
        source: string;
        sourceDetails: {
            attempt: number;
            type: string;
            code: string;
            message: string;
        }; // depende do método
        attempt: number;
        type: string;
    };

    reference?: {
        referenceNumber: string; // 9 a 15 caracteres
        dueDate: string; // ISO date-time
        entity: string;
    };

    eletronicReceipt?: {
        customerReceipt: string; // Base64
        merchantReceipt: string; // Base64
    };
};

export type PaymentWebHook = {
  id: string; // UUID da transação
  merchantTransactionId: string; // identificador único da transação (1-15 chars, alfanumérico)
  amount: number; // valor cobrado, decimal >= 1
  options?: Record<string, any>; // custom options do merchant

  reference?: {
    referenceNumber: string; // REF payments only, 9-15 chars
    dueDate?: string;        // ISO 8601 date-time
    entity?: string;         // payment entity
  };

  eletronicReceipt?: {
    customerReceipt?: string; // base64, apenas eTPA payments
    merchantReceipt?: string; // base64, apenas eTPA payments
  };

  responseStatus: {
    successful: boolean; // true se operação bem-sucedida
    status: "Requested" | "Pending" | "Success" | "Failed"; // status da transação
    code: number;        // código único de resposta
    message: string;     // descrição curta
    source: "APPY" | "REF" | "UMM" | "FTBAI"; // origem da resposta
    sourceDetails?: {
      attempt?: number;   // número de tentativas
      type?: string;      // tipo do retorno
      code?: string;      // código da fonte
      message?: string;   // mensagem da fonte
    };
  };
};
