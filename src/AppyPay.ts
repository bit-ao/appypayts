import type {AxiosInstance, CreateAxiosDefaults} from "axios";
import axios from "axios";
import type {
    AppyPayConfig,
    CreateChargeInput,
    CreateChargeResponse, CreateQrChargeResponse,
    PaymentInfoETPA,
    PaymentInfoGPO,
    PaymentInfoREF,
    PaymentMethodsConfig,
    QrCharge
} from "./types";
import {PaymentMethod} from "./types";
import {OAuthClientCredentialsProvider} from "./auth/OAuthClientCredentialsProvider";
import {OAuthCredentials} from "./auth/OAuthCredentials";
import {DiskTokenStorage} from "./storage/DiskTokenStorage";

export class AppyPay {
    private client: AxiosInstance;
    private tokenProvider: OAuthClientCredentialsProvider;
    private methods:PaymentMethodsConfig ;
    private readonly posCode:String ;
    constructor(config: Partial<AppyPayConfig> = {}, storage = null) {
        this.methods = config.methods;
        const creds = new OAuthCredentials(
            config.clientId || process.env.APPYPAY_CLIENT_ID!,
            config.clientSecret || process.env.APPYPAY_CLIENT_SECRET!,
            config.resource || process.env.APPYPAY_RESOURCE!
        );
        let store = storage;
        this.posCode = config.posCode ??  process.env.APPYPAY_POS_CODE
        if (storage == null){
            store = new DiskTokenStorage();
        }
        this.tokenProvider = new OAuthClientCredentialsProvider(config.authUrl ||process.env.APPYPAY_AUTH_URL, creds, store);
        const options = {
            baseURL: `${config.baseUrl || process.env.APPYPAY_API_URL}/${config.version || process.env.APPYPAY_VERSION}`,
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            timeout: 10000,
        } as CreateAxiosDefaults;
        this.client = axios.create(options);

    }
    async auth() {
        const token = await this.tokenProvider.getToken();
        this.client.defaults.headers["Authorization"] = `Bearer ${token.accessToken}`;

        return token;
    }
    async charge(input: CreateChargeInput): Promise<CreateChargeResponse> {
        if (input.paymentMethod === PaymentMethod.express || input.paymentMethod  === PaymentMethod.aexpress){
            return this.chargeExpress(input);
        }
        if (input.paymentMethod === PaymentMethod.ref){
            return this.chargeRef(input);
        }
        if (input.paymentMethod === PaymentMethod.qr){
            return this.chargeQr(input);
        }
        throw new Error("Unsupported payment method");
    }
    async chargeExpress(input: CreateChargeInput): Promise<CreateChargeResponse> {
        AppyPay.validate(input);
        await this.auth();
        const config = input.paymentMethod === PaymentMethod.aexpress  ? { headers: { Accept: "application/vnd.appypay.asyncapi+json" } } : undefined;
        const response  =  await this.client.post<CreateChargeResponse>(
            "/charges",
            {
                currency:"AOA",
                amount: input.amount,
                description: input.description,
                merchantTransactionId: input.merchantTransactionId,
                paymentMethod: this.getPaymentMethod(input.paymentMethod),
                paymentInfo:this.getPaymentInfo(input.paymentMethod,input.paymentInfo),
            },
            config
        );
        return response.data as CreateChargeResponse;

    }
    async chargeSingleQr(input: QrCharge): Promise<CreateQrChargeResponse> {
        input.paymentInfo = this.getPaymentInfo(input.paymentMethod, input.paymentInfo);
        AppyPay.validate(input);
        await this.auth();
        try {
            const response = await this.client.post<CreateQrChargeResponse>
            ('/qr-codes',
                {
                        currency: 'AOA',
                        amount: input.amount,
                        description: input.description,
                        merchantTransactionId: input.merchantTransactionId,
                        paymentMethod: this.getPaymentMethod(input.paymentMethod),
                        paymentInfo: input.paymentInfo,
                        qrCodeType: "SINGLE",
                    }
            )
            return response.data as CreateQrChargeResponse;
        } catch (e: any) {
            if (e.response) {
                console.error('Erro AppyPay (HTTP):', e.response.status)
                console.error('Mensagem:', e.response.statusText)
                console.error('Corpo de erro:', JSON.stringify(e.response.data, null, 2))
            } else if (e.request) {
                console.error(' Erro: sem resposta do servidor')
                console.error(e.request)
            } else {
                console.error('Erro ao configurar pedido:', e.message)
            }
            throw e
        }
    }
    async chargeRef(input: CreateChargeInput): Promise<CreateChargeResponse> {
        AppyPay.validate(input);
        await this.auth();

        const config =
            input.paymentMethod === PaymentMethod.aexpress
                ? { headers: { Accept: "application/vnd.appypay.asyncapi+json" } }
                : undefined;
        const response  =  await this.client.post<CreateChargeResponse>(
            "/charges",
            {
                currency:"AOA",
                amount: input.amount,
                description: input.description,
                merchantTransactionId: input.merchantTransactionId,
                paymentMethod: this.getPaymentMethod(input.paymentMethod),
                paymentInfo:this.getPaymentInfo(input.paymentMethod,input.paymentInfo),
            },
            config
        );
        return response.data

    }

    private static validate(input: CreateChargeInput): void {
        const { paymentMethod, paymentInfo } = input;

        if (!paymentInfo) {
            throw new Error(`paymentInfo é obrigatório para método ${paymentMethod}`);
        }

        switch (paymentMethod) {
            case PaymentMethod.aexpress:
            case PaymentMethod.express: {
                const info = paymentInfo as PaymentInfoGPO;
                if (!/^\d{9,15}$/.test(info.phoneNumber)) {
                    throw new Error("phoneNumber inválido para GPO (9-15 dígitos)");
                }
                break;
            }

            case PaymentMethod.ref: {
                const info = paymentInfo as PaymentInfoREF;
                if (!/^\d{9,15}$/.test(info.referenceNumber)) {
                    throw new Error("referenceNumber inválido para REF (9-15 dígitos numéricos)");
                }
                if (info.dueDate && isNaN(Date.parse(info.dueDate))) {
                    throw new Error("dueDate inválido para REF (ISO 8601 esperado)");
                }
                break;
            }

            case PaymentMethod.qr: {
                const info = paymentInfo as PaymentInfoETPA;
                if (!/^[A-Za-z0-9]{6,9}$/.test(info.posCode)) {
                    throw new Error("posCode inválido para eTPA (6-9 alfanumérico)");
                }
                break;
            }

            default:
                throw new Error(`Método de pagamento desconhecido: ${paymentMethod}`);
        }
    }

    private getPaymentMethod(method: PaymentMethod) {
        if (!this.methods) {
            throw new Error("Payment methods config not initialized!");
        }

        switch (method) {
            case PaymentMethod.express:
            case PaymentMethod.aexpress:
            case PaymentMethod.qr:
                return this.methods.gpo;
            case PaymentMethod.ref:
                return this.methods.ref;
            default:
                throw new Error(`Método de pagamento não suportado: ${method}`);
        }
    }

    private getPaymentInfo(method: PaymentMethod, info) {
        if (method == PaymentMethod.qr){
            return {
                posCode:this.posCode
            }
        }
        return info
    }

}
