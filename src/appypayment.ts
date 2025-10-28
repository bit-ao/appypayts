import { AppyPay } from "./AppyPay";

export const appypay = new AppyPay({
  clientId: process.env.APPYPAY_CLIENT_ID!,
  clientSecret: process.env.APPYPAY_CLIENT_SECRET!,
  resource: process.env.APPYPAY_RESOURCE!,
  authUrl: process.env.APPYPAY_AUTH_URL!,
  baseUrl: process.env.APPYPAY_API_URL!,
  version: process.env.APPYPAY_VERSION!,
  posCode:process.env.APPYPAY_POS_CODE,
  methods:{
    gpo:process.env.APPYPAY_GPO,
    ref:process.env.APPYPAY_REF,
    etpa:process.env.APPYPAY_ETPA
  }
});


