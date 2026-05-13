import type { AxiosInstance, AxiosRequestConfig, CreateAxiosDefaults } from "axios";
import axios from "axios";
import type {
    AppyPayConfig,
    CreateChargeInput,
    CreateChargeResponse,
    CreateQrChargeResponse,
    PaymentInfoETPA,
    PaymentInfoGPO,
    PaymentInfoREF,
    PaymentMethodsConfig,
    QrCharge,
    RefundInput,
    RefundResponse,
} from "./types";
import { PaymentMethod } from "./types";
import { OAuthClientCredentialsProvider } from "./auth/OAuthClientCredentialsProvider";
import { OAuthCredentials } from "./auth/OAuthCredentials";
import { DiskTokenStorage } from "./storage/DiskTokenStorage";
import type { TokenStoragePort } from "./TokenStoragePort";
import {
    GetChargeResponseDto,
    ListChargesQueryDto,
    ListChargesResponseDto,
    ListReferencesQueryDto,
    ListReferencesResponseDto,
    RegisterReferenceDto,
    RegisterReferenceResponseDto,
} from "./dtos";
import { AppyPayError } from "./exception/AppyPayError";

const ASYNC_PAYMENT_METHODS: ReadonlySet<PaymentMethod> = new Set([
    PaymentMethod.aexpress,
    PaymentMethod.aref,
]);

const ASYNC_API_ACCEPT = "application/vnd.appypay.asyncapi+json";

export class AppyPay {
    private client: AxiosInstance;
    private tokenProvider: OAuthClientCredentialsProvider;
    private methods: PaymentMethodsConfig;
    private readonly posCode: string;

    constructor(config: Partial<AppyPayConfig> = {}, storage: TokenStoragePort | null = null) {
        this.methods = config.methods ?? {};
        this.posCode = config.posCode ?? process.env.APPYPAY_POS_CODE ?? "";

        const creds = new OAuthCredentials(
            config.clientId     ?? process.env.APPYPAY_CLIENT_ID     ?? "",
            config.clientSecret ?? process.env.APPYPAY_CLIENT_SECRET ?? "",
            config.resource     ?? process.env.APPYPAY_RESOURCE      ?? "",
        );

        const store: TokenStoragePort = storage ?? new DiskTokenStorage();

        this.tokenProvider = new OAuthClientCredentialsProvider(
            config.authUrl ?? process.env.APPYPAY_AUTH_URL ?? "",
            creds,
            store,
        );

        const baseURL = `${config.baseUrl ?? process.env.APPYPAY_API_URL ?? ""}/${config.version ?? process.env.APPYPAY_VERSION ?? ""}`;

        this.client = axios.create({
            baseURL,
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            timeout: 10000,
        } as CreateAxiosDefaults);
    }

    static fromEnv(storage: TokenStoragePort | null = null): AppyPay {
        return new AppyPay({
            methods: {
                gpo:  process.env.APPYPAY_GPO,
                ref:  process.env.APPYPAY_REF,
                etpa: process.env.APPYPAY_ETPA,
            },
        }, storage);
    }

    async auth() {
        const token = await this.tokenProvider.getToken();
        this.client.defaults.headers["Authorization"] = `Bearer ${token.accessToken}`;
        return token;
    }

    async charge(input: CreateChargeInput): Promise<CreateChargeResponse | CreateQrChargeResponse> {
        switch (input.paymentMethod) {
            case PaymentMethod.express:
            case PaymentMethod.aexpress:
                return this.chargeExpress(input);
            case PaymentMethod.ref:
            case PaymentMethod.aref:
                return this.chargeRef(input);
            case PaymentMethod.qr:
                return this.chargeQr(input);
            default:
                throw new Error("Unsupported payment method");
        }
    }

    async chargeExpress(input: CreateChargeInput): Promise<CreateChargeResponse> {
        return this.postCharge(input);
    }

    async chargeRef(input: CreateChargeInput): Promise<CreateChargeResponse> {
        return this.postCharge(input);
    }

    async chargeQr(input: QrCharge): Promise<CreateQrChargeResponse> {
        input.paymentInfo = this.getPaymentInfo(input.paymentMethod, input.paymentInfo) as PaymentInfoETPA;
        AppyPay.validate(input);
        await this.auth();

        const body: Record<string, any> = {
            currency: "AOA",
            amount: input.amount,
            description: input.description,
            merchantTransactionId: input.merchantTransactionId,
            paymentMethod: this.getPaymentMethod(input.paymentMethod),
            paymentInfo: input.paymentInfo,
            qrCodeType: input.qrCodeType ?? "SINGLE",
        };
        if (input.minAmount       !== undefined) body.minAmount       = input.minAmount;
        if (input.maxTransactions !== undefined) body.maxTransactions = input.maxTransactions;
        if (input.startDate       !== undefined) body.startDate       = input.startDate;
        if (input.endDate         !== undefined) body.endDate         = input.endDate;

        try {
            const response = await this.client.post<CreateQrChargeResponse>("/qr-codes", body);
            return response.data;
        } catch (e) {
            throw AppyPay.wrapAxiosError(e);
        }
    }

    async getCharge(id: string, merchantTransactionId?: string): Promise<GetChargeResponseDto> {
        if (!id) {
            throw new Error("id é obrigatório (UUID da transação no gateway)");
        }
        await this.auth();
        const params = merchantTransactionId ? { merchantTransactionId } : undefined;
        try {
            const response = await this.client.get<GetChargeResponseDto>(
                `/charges/${encodeURIComponent(id)}`,
                params ? { params } : undefined,
            );
            return response.data;
        } catch (e) {
            throw AppyPay.wrapAxiosError(e);
        }
    }

    async refund(chargeId: string, input: RefundInput): Promise<RefundResponse> {
        await this.auth();
        try {
            const response = await this.client.post<RefundResponse>(
                `/charges/${encodeURIComponent(chargeId)}/refund`,
                {
                    amount: input.amount,
                    description: input.description,
                },
            );
            return response.data;
        } catch (e) {
            throw AppyPay.wrapAxiosError(e);
        }
    }

    async listCharges(query?: ListChargesQueryDto): Promise<ListChargesResponseDto> {
        await this.auth();
        try {
            const response = await this.client.get<ListChargesResponseDto>("/charges", {
                params: query?.toQueryParams() ?? {},
            });
            return response.data ?? ({ payments: [] } as ListChargesResponseDto);
        } catch (e) {
            throw AppyPay.wrapAxiosError(e);
        }
    }

    async registerReference(input: RegisterReferenceDto): Promise<RegisterReferenceResponseDto> {
        if (!input.paymentMethod) {
            input.paymentMethod = this.methods?.ref ?? "";
        }
        AppyPay.validateRegisterReference(input);
        await this.auth();
        try {
            const response = await this.client.post<RegisterReferenceResponseDto>(
                "/references",
                input.toBody(),
            );
            return response.data;
        } catch (e) {
            throw AppyPay.wrapAxiosError(e);
        }
    }

    async listReferences(query?: ListReferencesQueryDto): Promise<ListReferencesResponseDto> {
        await this.auth();
        try {
            const response = await this.client.get<ListReferencesResponseDto>("/references", {
                params: query?.toQueryParams() ?? {},
            });
            return response.data ?? ({ references: [] } as ListReferencesResponseDto);
        } catch (e) {
            throw AppyPay.wrapAxiosError(e);
        }
    }

    // ------------------------------------------------------------------
    // Privados
    // ------------------------------------------------------------------

    private async postCharge(input: CreateChargeInput): Promise<CreateChargeResponse> {
        AppyPay.validate(input);
        await this.auth();

        const config: AxiosRequestConfig | undefined = ASYNC_PAYMENT_METHODS.has(input.paymentMethod)
            ? { headers: { Accept: ASYNC_API_ACCEPT } }
            : undefined;

        try {
            const response = await this.client.post<CreateChargeResponse>(
                "/charges",
                {
                    currency: "AOA",
                    amount: input.amount,
                    description: input.description,
                    merchantTransactionId: input.merchantTransactionId,
                    paymentMethod: this.getPaymentMethod(input.paymentMethod),
                    paymentInfo: this.getPaymentInfo(input.paymentMethod, input.paymentInfo),
                },
                config,
            );
            return response.data;
        } catch (e) {
            throw AppyPay.wrapAxiosError(e);
        }
    }

    private static wrapAxiosError(e: unknown): AppyPayError {
        const err = e as any;
        const status = err?.response?.status ?? null;
        const body   = err?.response?.data ?? null;
        const msg    = err?.message ?? "HTTP_ERROR";
        return new AppyPayError(msg, "HTTP_ERROR", body, status);
    }

    private static validateRegisterReference(input: RegisterReferenceDto): void {
        if (!input.paymentMethod) {
            throw new Error("paymentMethod é obrigatório (configure APPYPAY_REF ou passe explicitamente)");
        }
        if (!input.references || input.references.length === 0) {
            throw new Error("references[] não pode estar vazio");
        }
        input.references.forEach((ref, i) => {
            if (!/^\d{9,15}$/.test(ref.referenceNumber)) {
                throw new Error(
                    `references[${i}].referenceNumber inválido: ${ref.referenceNumber} (9-15 dígitos numéricos)`,
                );
            }
            if (ref.minAmount !== undefined && ref.maxAmount !== undefined && ref.minAmount > ref.maxAmount) {
                throw new Error(`references[${i}]: minAmount não pode ser maior que maxAmount`);
            }
        });
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
            case PaymentMethod.ref:
            case PaymentMethod.aref: {
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

    private getPaymentMethod(method: PaymentMethod): string | null | undefined {
        if (!this.methods) {
            throw new Error("Payment methods config not initialized!");
        }
        switch (method) {
            case PaymentMethod.express:
            case PaymentMethod.aexpress:
            case PaymentMethod.qr:
                return this.methods.gpo;
            case PaymentMethod.ref:
            case PaymentMethod.aref:
                return this.methods.ref;
            default:
                throw new Error(`Método de pagamento não suportado: ${method}`);
        }
    }

    private getPaymentInfo(
        method: PaymentMethod,
        info: PaymentInfoGPO | PaymentInfoREF | PaymentInfoETPA,
    ): PaymentInfoGPO | PaymentInfoREF | PaymentInfoETPA {
        if (method === PaymentMethod.qr) {
            return { posCode: this.posCode };
        }
        return info;
    }
}
