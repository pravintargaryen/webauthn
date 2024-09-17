const express = require("express");
const { generateChallenge } = require("./utils");
const {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} = require("@simplewebauthn/server");
const { isoUint8Array } = require("@simplewebauthn/server/helpers");
const db = require("./database");

const router = express.Router();

// Initiate registration
// router.post("/register", async (req, res) => {
//   console.log("Session ID at /register:", req.sessionID);
//   const { username } = req.body;
//   const challenge = generateChallenge();

//   // Store challenge in session
//   req.session.challenge = challenge;
//   console.log("Challenge set in session:", req.session.challenge);

//   const userID = isoUint8Array.fromUTF8String(username);

//   const options = await generateRegistrationOptions({
//     challenge,
//     rpName: "Nillion Network",
//     userID,
//     userName: username,
//     authenticatorSelection: {
//       userVerification: "preferred",
//     },
//     pubKeyCredParams: [
//       {
//         alg: -8, // Ed25519
//         type: "public-key",
//       },
//     ],
//   });
//   res.setHeader("Content-Type", "application/json");
//   console.log(options);
//   res.json(options);
// });

// Complete registration
// router.post("/register/complete", async (req, res) => {
//   console.log("Session ID at /register/complete:", req.sessionID);
//   console.log("Session at /register/complete:", req.session);
//   const { body } = req;
//   const expectedChallenge = req.session.challenge;
//   console.log("Challenge retrieved from session:", expectedChallenge);

//   try {
//     const verification = await verifyRegistrationResponse({
//       credential: body,
//       expectedChallenge,
//       expectedOrigin: "http://localhost:5173", // Replace with your origin
//       expectedRPID: "localhost:5173", // Replace with your RP ID
//     });

//     console.log(verification);
//     if (verification.verified) {
//       const { username, publicKey } = verification;

//       // Store the public key and metadata in the database
//       db.run(`INSERT INTO users (id, publicKey, metadata) VALUES (?, ?, ?)`, [
//         username,
//         publicKey,
//         JSON.stringify(verification.registrationInfo),
//       ]);

//       res.json({ success: true });
//     } else {
//       res.status(400).json({ success: false, message: "Verification failed" });
//     }
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

router.post("/register", async (req, res) => {
  const { step, username, credential } = req.body;

  if (step === "initiate") {
    console.log("Session ID at /register (initiate):", req.sessionID);

    const challenge = generateChallenge();
    req.session.challenge = challenge;
    console.log("Challenge set in session:", req.session.challenge);

    const userID = isoUint8Array.fromUTF8String(username);

    const options = await generateRegistrationOptions({
      challenge,
      rpName: "Nillion Network",
      userID,
      userName: username,
      authenticatorSelection: {
        userVerification: "preferred",
      },
      pubKeyCredParams: [
        {
          alg: -8, // Ed25519
          type: "public-key",
        },
      ],
    });

    res.setHeader("Content-Type", "application/json");
    console.log(options);
    res.json(options);
  } else if (step === "complete") {
    console.log("Session ID at /register (complete):", req.sessionID);
    console.log("Session at /register (complete):", req.session);

    const expectedChallenge = req.session.challenge;
    console.log("Challenge retrieved from session:", expectedChallenge);

    try {
      const verification = await verifyRegistrationResponse({
        credential,
        expectedChallenge,
        expectedOrigin: "http://localhost:5173", // Replace with your origin
        expectedRPID: "localhost:5173", // Replace with your RP ID
      });

      console.log(verification);
      if (verification.verified) {
        const { username, publicKey } = verification;

        // Store the public key and metadata in the database
        db.run(`INSERT INTO users (id, publicKey, metadata) VALUES (?, ?, ?)`, [
          username,
          publicKey,
          JSON.stringify(verification.registrationInfo),
        ]);

        res.json({ success: true });
      } else {
        res
          .status(400)
          .json({ success: false, message: "Verification failed" });
      }
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  } else {
    res.status(400).json({ success: false, message: "Invalid step" });
  }
});

// Initiate authentication
router.post("/authenticate", (req, res) => {
  const { username } = req.body;

  db.get("SELECT publicKey FROM users WHERE id = ?", [username], (err, row) => {
    if (err || !row) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const challenge = generateChallenge();

    // Store challenge in session
    req.session.challenge = challenge;
    console.log("Challenge retrieved from session:", req.session.challenge);

    const options = generateAuthenticationOptions({
      challenge,
      allowCredentials: [
        {
          id: row.publicKey,
          type: "public-key",
        },
      ],
      userVerification: "preferred",
    });

    res.json(options);
  });
});

// Complete authentication
router.post("/authenticate/complete", async (req, res) => {
  const { body } = req;
  const expectedChallenge = req.session.challenge;

  db.get(
    "SELECT publicKey FROM users WHERE id = ?",
    [body.id],
    async (err, row) => {
      if (err || !row) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      try {
        const verification = await verifyAuthenticationResponse({
          credential: body,
          expectedChallenge,
          expectedOrigin: "http://localhost:5173", // Replace with your origin
          expectedRPID: "localhost:5173", // Replace with your RP ID
          authenticator: row.publicKey,
        });

        if (verification.verified) {
          res.json({ success: true });
        } else {
          res
            .status(400)
            .json({ success: false, message: "Authentication failed" });
        }
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    }
  );
});

router.get("/test-session", (req, res) => {
  console.log("Session ID:", req.sessionID);
  console.log("Session Data:", req.session);
  if (!req.session.testValue) {
    req.session.testValue = "This is a test value";
  }
  res.json({
    sessionID: req.sessionID,
    testValue: req.session.testValue,
  });
});

module.exports = router;
