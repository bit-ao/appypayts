// create-charge.dto.ts


import type {ExpressCharge, QrCharge} from "../types";
import {PaymentMethod} from "../types";

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

export class ARefChargeDto extends BaseChargeDto {
    paymentMethod: PaymentMethod.aref = PaymentMethod.aref
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

export type CreateChargeDto = RefChargeDto | ARefChargeDto | ExpressChargeDto | QrChargeDto

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

export class RefundInputDto {
    amount?: number
    description!: string
}

export class RefundResponseDto extends CreateChargeResponseDto {}

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

export class CreateQrChargeResponseDto {
    id!: string
    qrCodeArr!: string
    responseStatus!: ResponseStatusDto
}

// ---------------------------------------------------------------------------
// Payment / GetCharge (GET /charges/:id)
// ---------------------------------------------------------------------------
export class TransactionEventDto {
    id!: number
    transactionId!: string
    type!: string
    providerTransactionId?: string | null
    actionStatus!: boolean
    createdDate!: string
    responseStatus?: ResponseStatusDto
}

export class PaymentDto {
    id!: string
    merchantTransactionId?: string | null
    type?: string | null
    operation?: string | null
    amount!: number
    currency?: string | null
    status?: 'Requested' | 'Pending' | 'Success' | 'Failed' | null
    description?: string | null
    disputes?: boolean | null
    applicationFeeAmount?: number | null
    paymentMethod?: string | null
    createdDate?: string | null
    updatedDate?: string | null
    options?: Record<string, any> | null
    reference?: ReferenceDto | null
    transactionEvents?: TransactionEventDto[] | null
}

export class GetChargeResponseDto {
    payment?: PaymentDto | null
}

// ---------------------------------------------------------------------------
// Listagem de cobranças (GET /charges)
// ---------------------------------------------------------------------------
export class ListChargesQueryDto {
    amountFrom?: number
    amountTo?: number
    currency?: string
    dateFrom?: string
    dateTo?: string
    disputes?: string
    limit?: number
    merchantTransactionId?: string
    skip?: number
    type?: string
    culture?: string

    toQueryParams(): Record<string, string | number> {
        const q: Record<string, string | number> = {}
        if (this.amountFrom            !== undefined) q.amountFrom            = this.amountFrom
        if (this.amountTo              !== undefined) q.amountTo              = this.amountTo
        if (this.currency              !== undefined) q.currency              = this.currency
        if (this.dateFrom              !== undefined) q.dateFrom              = this.dateFrom
        if (this.dateTo                !== undefined) q.dateTo                = this.dateTo
        if (this.disputes              !== undefined) q.disputes              = this.disputes
        if (this.limit                 !== undefined) q.limit                 = this.limit
        if (this.merchantTransactionId !== undefined) q.merchantTransactionId = this.merchantTransactionId
        if (this.skip                  !== undefined) q.skip                  = this.skip
        if (this.type                  !== undefined) q.type                  = this.type
        if (this.culture               !== undefined) q.culture               = this.culture
        return q
    }
}

export class ListChargesResponseDto {
    payments!: PaymentDto[]
}

// ---------------------------------------------------------------------------
// Registo de referências (POST /references)
// ---------------------------------------------------------------------------
export class RegisterReferenceAmountDto {
    amount!: number
    descriptionLine1?: string
    descriptionLine2?: string

    toBody(): Record<string, any> {
        const o: Record<string, any> = { amount: this.amount }
        if (this.descriptionLine1 !== undefined) o.descriptionLine1 = this.descriptionLine1
        if (this.descriptionLine2 !== undefined) o.descriptionLine2 = this.descriptionLine2
        return o
    }
}

export class RegisterReferenceItemDto {
    referenceNumber!: string
    currency: string = 'AOA'
    amounts?: RegisterReferenceAmountDto[]
    minAmount?: number
    maxAmount?: number
    startDate?: string
    expirationDate?: string

    toBody(): Record<string, any> {
        const o: Record<string, any> = {
            referenceNumber: this.referenceNumber,
            currency: this.currency,
        }
        if (this.amounts        !== undefined) o.amounts        = this.amounts.map(a => a.toBody())
        if (this.minAmount      !== undefined) o.minAmount      = this.minAmount
        if (this.maxAmount      !== undefined) o.maxAmount      = this.maxAmount
        if (this.startDate      !== undefined) o.startDate      = this.startDate
        if (this.expirationDate !== undefined) o.expirationDate = this.expirationDate
        return o
    }
}

export class RegisterReferenceDto {
    paymentMethod: string = ''
    references!: RegisterReferenceItemDto[]
    createdBy?: string

    toBody(): Record<string, any> {
        const o: Record<string, any> = {
            paymentMethod: this.paymentMethod,
            references: this.references.map(r => r.toBody()),
        }
        if (this.createdBy !== undefined) o.createdBy = this.createdBy
        return o
    }
}

export class RegisterReferenceResultDto {
    referenceNumber!: string
    code!: number
    message!: string
}

export class RegisterReferenceResponseDto {
    references!: RegisterReferenceResultDto[]
}

// ---------------------------------------------------------------------------
// Listagem de referências (GET /references)
// ---------------------------------------------------------------------------
export class ListReferencesQueryDto {
    amountFrom?: number
    amountTo?: number
    dateFrom?: string
    dateTo?: string
    limit?: number
    skip?: number
    culture?: string

    toQueryParams(): Record<string, string | number> {
        const q: Record<string, string | number> = {}
        if (this.amountFrom !== undefined) q.amountFrom = this.amountFrom
        if (this.amountTo   !== undefined) q.amountTo   = this.amountTo
        if (this.dateFrom   !== undefined) q.dateFrom   = this.dateFrom
        if (this.dateTo     !== undefined) q.dateTo     = this.dateTo
        if (this.limit      !== undefined) q.limit      = this.limit
        if (this.skip       !== undefined) q.skip       = this.skip
        if (this.culture    !== undefined) q.culture    = this.culture
        return q
    }
}

export class ListedReferenceDto {
    id!: number
    entity!: string
    referenceNumber!: string
    currency: string = 'AOA'
    amount?: number | null
    minAmount?: number | null
    maxAmount?: number | null
    startDate!: string
    expirationDate!: string
    isActive!: boolean
    createdBy!: string
    updatedBy!: string
    createdDate!: string
    updatedDate!: string
}

export class ListReferencesResponseDto {
    references!: ListedReferenceDto[]
}
