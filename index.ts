import {AppyPay} from "./src/AppyPay";
import {ExpressChargeDto, QrChargeDto} from "./src/dtos/index";
import {PaymentMethod} from "./src/Types";
import {AppyPayClient} from "./src/AppyPayClient";

/*
const dto = new QrChargeDto()
dto.amount= 100;
dto.currency= 'AOA';
dto.description= 'Pagamento de inscrição';
dto.merchantTransactionId = 'DEVQR0001'
dto.paymentMethod= PaymentMethod.qr;
dto.qrCodeType= 'SINGLE';
dto.minAmount= 100;
dto.maxTransactions= 1;
dto.startDate= '2025-10-28';
dto.endDate= '2025-10-28';
dto.paymentInfo = {
    posCode : 'TPA448822'
}
AppyPayClient.chargeQr(dto).then(r => console.log(r))*/
const dto = new ExpressChargeDto()
dto.amount= 10;
dto.currency= 'AOA';
dto.description= 'Pagamento de inscrição';
dto.merchantTransactionId = 'DEVQR0001'
dto.paymentMethod= PaymentMethod.aexpress;
dto.paymentInfo = {
    phoneNumber : '925924797'
}
AppyPayClient.chargeExpress(dto).then(r => console.log(r))