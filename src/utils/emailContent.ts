export const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>One-Time Password (OTP)</title>
  <style>
    body {
      font-family: 'Arial', sans-serif;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }

    .container {
      max-width: 600px;
      margin: 20px auto;
      padding: 20px;
      background-color: #fff;
      border-radius: 8px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }

    h2 {
      color: #333;
    }

    p {
      color: #666;
    }

    .otp {
      font-size: 24px;
      font-weight: bold;
      color: #007bff;
    }
  </style>
</head>
<body>
  <div class="container">
    <h2>Your One-Time Password (OTP)</h2>
    <p>Your OTP is: <span class="otp">{{OTP_VALUE}}</span></p>
    <p>This OTP is valid for 10 minutes.</p>
  </div>
</body>
</html>
`;
