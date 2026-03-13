// create-charge.dto.ts


import {ExpressCharge, PaymentMethod, QrCharge} from "../Types";

export class NotifyDto {
    name?: string
    telephone?: string
    email?: string
    smsNotification?: boolean
    emailNotification?: boolean
}

export class PaymentInfoGpoDto {
    phoneNumber!: string
}

export class PaymentInfoRefDto {
    referenceNumber!: string
    dueDate?: string
}

export class PaymentInfoEtpaDto {
    posCode!: string
}

export class BaseChargeDto {
    amount!: number
    currency?: string
    description?: string
    merchantTransactionId!: string
    options?: Record<string, any>
    notify?: NotifyDto
}

export class RefChargeDto extends BaseChargeDto {
    paymentMethod: PaymentMethod.ref = PaymentMethod.ref
    paymentInfo!: PaymentInfoRefDto
}

export class ExpressChargeDto extends BaseChargeDto  implements ExpressCharge{
    paymentMethod!: PaymentMethod.express | PaymentMethod.aexpress
    paymentInfo!: PaymentInfoGpoDto
}

export class QrChargeDto implements QrCharge {
  amount!: number
  currency?: string
  description?: string
  merchantTransactionId!: string
  options?: Record<string, any>
  notify?: any
  paymentMethod: PaymentMethod.qr = PaymentMethod.qr
  paymentInfo!: { posCode: string }
  qrCodeType!: 'SINGLE' | 'MULTIPLE'
  minAmount?: number
  maxTransactions?: number
  startDate?: string
  endDate?: string
}

export type CreateChargeDto = RefChargeDto | ExpressChargeDto | QrChargeDto

// create-charge-response.dto.ts
export class SourceDetailsDto {
    attempt!: number
    type!: string
    code!: string
    message!: string
}

export class ResponseStatusDto {
    successful!: boolean
    status!: 'Requested' | 'Pending' | 'Success' | 'Failed'
    code!: number
    message!: string
    source!: string
    sourceDetails!: SourceDetailsDto
    attempt!: number
    type!: string
}

export class ReferenceDto {
    referenceNumber!: string
    dueDate!: string
    entity!: string
}

export class EletronicReceiptDto {
    customerReceipt!: string
    merchantReceipt!: string
}

export class CreateChargeResponseDto {
    id!: string
    responseStatus!: ResponseStatusDto
    reference?: ReferenceDto
    eletronicReceipt?: EletronicReceiptDto
}

// payment-webhook.dto.ts
export class PaymentWebHookDto {
    id!: string
    merchantTransactionId!: string
    amount!: number
    options?: Record<string, any>
    reference?: {
        referenceNumber: string
        dueDate?: string
        entity?: string
    }
    eletronicReceipt?: {
        customerReceipt?: string
        merchantReceipt?: string
    }
    responseStatus!: {
        successful: boolean
        status: 'Requested' | 'Pending' | 'Success' | 'Failed'
        code: number
        message: string
        source: 'APPY' | 'REF' | 'UMM' | 'FTBAI'
        sourceDetails?: {
            attempt?: number
            type?: string
            code?: string
            message?: string
        }
    }
}
