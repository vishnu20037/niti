const mongoose = require("mongoose");

const responseSchema = new mongoose.Schema({
  status: String,
  format: String,
  Payload: [
    {
      data: [
        {
          decryptedFI: {
            account: {
              linkedAccRef: String,
              maskedAccNumber: String,
              type: String,
              version: String,
              profile: {
                holders: {
                  type: String,
                  holder: {
                    address: String,
                    ckycCompliance: String,
                    dob: String,
                    email: String,
                    landline: String,
                    mobile: String,
                    name: String,
                    nominee: String,
                    pan: String,
                  },
                },
              },
              summary: {
                currentBalance: String,
                currency: String,
                branch: String,
                balanceDateTime: String,
                currentODLimit: String,
                drawingLimit: String,
                exchgeRate: String,
                facility: String,
                ifscCode: String,
                micrCode: String,
                openingDate: String,
                status: String,
                type: String,
                Pending: {
                  transactionType: String,
                  amount: String,
                },
              },
              transactions: {
                startDate: String,
                endDate: String,
              },
            },
          },
          linkRefNumber: String,
          maskedAccNumber: String,
        },
      ],
      fipID: String,
    },
  ],
  id: String,
  DataRange: {
    from: String,
    to: String,
  },
  consentId: String,
});

const FiData = mongoose.model("FiData", responseSchema);
module.exports = FiData;