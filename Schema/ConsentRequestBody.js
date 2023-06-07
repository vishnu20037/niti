// Create the base request body
const ConsentRequestBody = {
  Detail: {
    consentStart: "2023-06-06T14:13:09.303Z",
    consentExpiry: "2023-04-23T05:44:53.822Z",
    Customer: {
      id: "9999999999@onemoney",
    },
    FIDataRange: {
      from: "2021-04-01T00:00:00Z",
      to: "2021-10-01T00:00:00Z",
    },
    consentMode: "STORE",
    consentTypes: ["TRANSACTIONS", "PROFILE", "SUMMARY"],
    fetchType: "PERIODIC",
    Frequency: {
      value: 30,
      unit: "MONTH",
    },
    DataFilter: [
      {
        type: "TRANSACTIONAMOUNT",
        value: "5000",
        operator: ">=",
      },
    ],
    DataLife: {
      value: 1,
      unit: "MONTH",
    },
    DataConsumer: {
      id: "setu-fiu-id",
    },
    Purpose: {
      Category: {
        type: "string",
      },
      code: "101",
      text: "Loan underwriting",
      refUri: "https://api.rebit.org.in/aa/purpose/101.xml",
    },
    fiTypes: ["DEPOSIT"],
  },
  context: [
    {
      key: "accounttype",
      value: "CURRENT",
    },
  ],
  redirectUrl: "https://setu.co",
};
export default {ConsentRequestBody};
