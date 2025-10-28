import axios from "axios";
import { PaymentMethod } from "./types";
import { OAuthClientCredentialsProvider } from "./auth/OAuthClientCredentialsProvider";
import { OAuthCredentials } from "./auth/OAuthCredentials";
import { DiskTokenStorage } from "./storage/DiskTokenStorage";
export class AppyPay {
    client;
    tokenProvider;
    methods;
    posCode;
    constructor(config = {}, storage = null) {
        this.methods = config.methods;
        const creds = new OAuthCredentials(config.clientId || process.env.APPYPAY_CLIENT_ID, config.clientSecret || process.env.APPYPAY_CLIENT_SECRET, config.resource || process.env.APPYPAY_RESOURCE);
        let store = storage;
        this.posCode = config.posCode ?? process.env.APPYPAY_POS_CODE;
        if (storage == null) {
            store = new DiskTokenStorage();
        }
        this.tokenProvider = new OAuthClientCredentialsProvider(config.authUrl || process.env.APPYPAY_AUTH_URL, creds, store);
        const options = {
            baseURL: `${config.baseUrl || process.env.APPYPAY_API_URL}/${config.version || process.env.APPYPAY_VERSION}`,
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            timeout: 10000,
        };
        this.client = axios.create(options);
    }
    async auth() {
        const token = await this.tokenProvider.getToken();
        this.client.defaults.headers["Authorization"] = `Bearer ${token.accessToken}`;
        return token;
    }
    async pay(input) {
        AppyPay.validate(input);
        await this.auth();
        const config = input.paymentMethod === PaymentMethod.aexpress
            ? { headers: { Accept: "application/vnd.appypay.asyncapi+json" } }
            : undefined;
        const response = await this.client.post("/charges", {
            currency: "AOA",
            amount: input.amount,
            description: input.description,
            merchantTransactionId: input.merchantTransactionId,
            paymentMethod: this.getPaymentMethod(input.paymentMethod),
            paymentInfo: this.getPaymentInfo(input.paymentMethod, input.paymentInfo),
        }, config);
        return response.data;
    }
    static validate(input) {
        const { paymentMethod, paymentInfo } = input;
        if (!paymentInfo) {
            throw new Error(`paymentInfo é obrigatório para método ${paymentMethod}`);
        }
        switch (paymentMethod) {
            case PaymentMethod.aexpress:
            case PaymentMethod.express: {
                const info = paymentInfo;
                if (!/^\d{9,15}$/.test(info.phoneNumber)) {
                    throw new Error("phoneNumber inválido para GPO (9-15 dígitos)");
                }
                break;
            }
            case PaymentMethod.ref: {
                const info = paymentInfo;
                if (!/^\d{9,15}$/.test(info.referenceNumber)) {
                    throw new Error("referenceNumber inválido para REF (9-15 dígitos numéricos)");
                }
                if (info.dueDate && isNaN(Date.parse(info.dueDate))) {
                    throw new Error("dueDate inválido para REF (ISO 8601 esperado)");
                }
                break;
            }
            case PaymentMethod.qr: {
                const info = paymentInfo;
                if (!/^[A-Za-z0-9]{6,9}$/.test(info.posCode)) {
                    throw new Error("posCode inválido para eTPA (6-9 alfanumérico)");
                }
                break;
            }
            default:
                throw new Error(`Método de pagamento desconhecido: ${paymentMethod}`);
        }
    }
    getPaymentMethod(method) {
        if (!this.methods) {
            throw new Error("Payment methods config not initialized!");
        }
        switch (method) {
            case PaymentMethod.express:
            case PaymentMethod.aexpress:
                return this.methods.gpo;
            case PaymentMethod.qr:
                return this.methods.etpa;
            case PaymentMethod.ref:
                return this.methods.ref;
            default:
                throw new Error(`Método de pagamento não suportado: ${method}`);
        }
    }
    getPaymentInfo(method, info) {
        if (method == PaymentMethod.qr) {
            return {
                posCode: this.posCode
            };
        }
        return info;
    }
}
