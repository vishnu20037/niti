const express = require("express");
const axios = require("axios");
const app = express();
const mongoose = require("mongoose");
app.use(express.json());
const base_url = "https://fiu-uat.setu.co";
const FiData = require("./Schema/FiData");
const headers = {
  "x-client-id": "255d0b6c-492d-44cf-8581-e9494c7b0914",
  "x-client-secret": "9c2fc756-3d17-46d6-b28d-be4d71953e83",
};
let consent_id, consent_status, session_status;
let session_id = "";
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
const Joi = require("joi");
// Define the schema for the Detail object
// Define the route for your POST API
const detailSchema = require("./Schema/detailSchema");
let currentDate, expiryDate, fromDate;
// Make a POST request to the external API using Axios
app.post("/consent", async (req, res) => {
  try {
    const { mobile_no, account_type } = req.body;
    currentDate = new Date();
    expiryDate = new Date(currentDate.getTime() + 6 * 24 * 60 * 60 * 1000);
    fromDate = new Date(currentDate.getTime() - 6 * 24 * 60 * 60 * 1000 * 30);
    // Merge the base request body with the modified values
    const requestBody = {
      ...ConsentRequestBody,
      Detail: {
        ...ConsentRequestBody.Detail,
        consentStart: currentDate.toISOString(),
        consentExpiry: expiryDate.toISOString(),
        Customer: {
          ...ConsentRequestBody.Detail.Customer,
          id: `${mobile_no}@onemoney`,
        },
        FIDataRange: {
          ...ConsentRequestBody.Detail.FIDataRange,
          from: fromDate.toISOString(),
          to: currentDate.toISOString(),
        },
      },
      context: [
        {
          ...ConsentRequestBody.context[0],
          value: account_type,
        },
      ],
    };
    // Validate the request body against the schema
    const { error } = detailSchema.validate(requestBody.Detail);
    if (error) {
      throw new Error("Invalid request body");
    }
    // Handle the response from the external API
    const response = await axios.post(base_url + "/consents", requestBody, {
      headers: headers,
    });
    const { id, status, url } = response.data;
    // Create a new response object with the desired properties
    const responseBody = {
      id,
      status,
      url,
    };
    console.log(response.data);
    consent_id = id;
    console.log(consent_id);
    res.status(200).json(responseBody);
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
});
//get status of consent -> pending/ approve or rejected
app.get("/consent/:id", async (req, res) => {
  try {
    // Make a GET request to the external API using Axios
    const response = await axios.get(`${base_url}/consents/${consent_id}`, {
      headers: headers,
    });
    console.log(response.data);
    const { status } = response.data;
    consent_status = status;
    console.log(consent_status);
    res.status(200).json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
});
// Create a new data session
app.post("/session", async (req, res) => {
  try {
    const requestBody = {
      consentId: consent_id,
      DataRange: {
        from: fromDate.toISOString(),
        to: currentDate.toISOString(),
      },
      format: "json",
    };
    if (consent_status === "REJECTED") {
      return res.status(401).json({
        message: `consent  rejected`,
      });
    } else if (consent_status === "PENDING") {
      return res.status(404).json({
        message: `consent is still pending can not start a data session`,
      });
    } else {
      // Make a POST request to the external API using Axios
      const response = await axios.post(base_url + "/sessions", requestBody, {
        headers: headers,
      });
      const { id, status } = response.data;
      // Create a new response object with the desired properties
      const responseBody = {
        id,
        status,
      };
      session_id = id;
      session_status = status;
      console.log(response.data);
      res.status(200).json(responseBody);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
});
//get the data and save in database
// Connect to the MongoDB database
mongoose
  .connect("mongodb://localhost:27017/mydatabase", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("MongoDB connection error:", error));
//getting the Fidata
app.get("/session/:id", async (req, res) => {
  try {
    // Make a GET request to the external API using Axios
    if (session_id.length === 0) {
      return res.status(400).json({
        message: `session is either started yet or session id is incorrect`,
      });
    }
    const response = await axios.get(`${base_url}/sessions/${session_id}`, {
      headers: headers,
    });
    const { status } = response.data;
    if (status !== "COMPLETED") {
      return res.status(401).json({
        message: `FI data fetch is incomplete for the requested session.`,
      });
    }
    // Create a new instance of the Response model with the response data
    const responseDocument = new FiData(response.data);
    // Save the response document to MongoDB
    await responseDocument.save();
    console.log(response.data);
    console.log(consent_status);
    res.status(200).json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
});

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
