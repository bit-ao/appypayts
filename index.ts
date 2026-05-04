// Public API surface
export { AppyPay } from "./src/AppyPay";
export { AppyPayClient } from "./src/AppyPayClient";

// Enum + Types
export { PaymentMethod } from "./src/types";
export type {
    AppyPayConfig,
    PaymentMethodsConfig,
    PaymentInfo,
    PaymentInfoGPO,
    PaymentInfoREF,
    PaymentInfoETPA,
    CreateChargeInput,
    RefCharge,
    ARefCharge,
    ExpressCharge,
    QrCharge,
    CreateChargeResponse,
    CreateQrChargeResponse,
    GetChargeResponse,
    RefundInput,
    RefundResponse,
    PaymentWebHook,
    ChargeStatus,
    ChargeListItem,
    ListChargesFilter,
    ListChargesResponse,
} from "./src/types";

// DTOs
export {
    NotifyDto,
    BaseChargeDto,
    PaymentInfoGpoDto,
    PaymentInfoRefDto,
    PaymentInfoEtpaDto,
    RefChargeDto,
    ARefChargeDto,
    ExpressChargeDto,
    QrChargeDto,
    RefundInputDto,
    RefundResponseDto,
    CreateChargeResponseDto,
    PaymentWebHookDto,
} from "./src/dtos/index";

// Error handling
export { AppyPayError } from "./src/exception/AppyPayError";
export { handleAppyPayException } from "./src/exception/handleAppyPayException";

// Storage adapters
export type { TokenStoragePort } from "./src/TokenStoragePort";
export { DiskTokenStorage } from "./src/storage/DiskTokenStorage";
export { MemoryTokenStorage } from "./src/storage/MemoryTokenStorage";
export { RedisTokenStorage } from "./src/storage/RedisTokenStorage";
