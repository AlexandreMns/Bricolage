const EmailType = {
  Welcome: "welcome",
  ResetPassword: "resetPassword",
};

const emailContent = {
  [EmailType.Welcome]: {
    subject: "Welcome to our platform",
    html: `
    <html>
    <head>
    <title>Bem-vindo à Bricolage</title>
    <!DOCTYPE html>
    <html>
    <head>
        <title>Bem-vindo à Bricolage</title>
        <style>
            body {
                font-family: 'Arial', sans-serif;
                background-color: #f2f2f2;
                margin: 0;
                padding: 0;
            }
            .container {
                max-width: 600px;
                margin: 20px auto;
                background-color: #ffffff;
                border-radius: 8px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                overflow: hidden;
            }
            .header {
                background-color: #007bff;
                color: white;
                padding: 20px;
                text-align: center;
            }
            .header h1 {
                margin: 0;
                font-size: 24px;
            }
            .header p {
                margin: 5px 0 0;
            }
            .body {
                padding: 20px;
            }
            .body img {
                width: 100%;
                border-bottom-left-radius: 8px;
                border-bottom-right-radius: 8px;
            }
            .body p {
                margin: 20px 0;
                color: #333333;
                line-height: 1.6;
            }
            .body .button {
                text-align: center;
                margin: 20px 0;
            }
            .body .button a {
                display: inline-block;
                padding: 15px 30px;
                background-color: #28a745;
                color: white;
                text-decoration: none;
                border-radius: 5px;
                font-size: 16px;
                transition: background-color 0.3s ease;
            }
            .body .button a:hover {
                background-color: #218838;
            }
            .footer {
                background-color: #f2f2f2;
                color: #666666;
                text-align: center;
                padding: 20px;
                font-size: 14px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Bem-vindo à Bricolage</h1>
                <p>Estamos felizes por tê-lo conosco!</p>
            </div>
            <div class="body">
                <p>Olá,</p>
                <p>Obrigado por se registrar na BricolageESTG! Estamos ansiosos para ajudá-lo a realizar os seus projetos de bricolage.</p>
                <p>Aqui estão algumas ferramentas e recursos para você começar:</p>
                <div class="button">
                  <a href="#">Comece a explorar</a>
                </div>
                <img src="https://picsum.photos/id/201/600/200" alt="Imagem de Bricolage" style="display: block; width: 100%; border-top-left-radius: 8px; border-top-right-radius: 8px;">
                <p>Se precisar de ajuda, não hesite em nos contactar.</p>
            </div>
            <div class="footer">
                <p>Atenciosamente,<br>Equipa Bricolage</p>
            </div>
        </div>
    </body>
    </html>
  `,
  },
  [EmailType.ResetPassword]: {
    subject: "Reset your password",
    html: (token) => `
    <html>
    <body style="font-family: Arial, sans-serif; background-color: #f2f2f2; margin: 0; padding: 0;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f2f2f2; margin: 0; padding: 0;">
      <tr>
        <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="margin: 20px auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <tr>
          <td style="padding: 20px;">
            <img src="https://picsum.photos/600/200" alt="Logo Techdot" style="display: block; width: 100%; border-top-left-radius: 8px; border-top-right-radius: 8px;">
            <h1 style="color: #333333; margin: 20px 0; font-size: 28px; text-align: center;">Password Esquecida </h1>
            <p style="color: #666666; margin: 20px 0; line-height: 1.6; text-align: center;">Olá,</p>
            <p style="color: #666666; margin: 20px 0; line-height: 1.6; text-align: center;">Para repor a password, clique no botão abaixo:</p>
            <p style="margin: 20px 0; text-align: center;">
            <a href="http://${process.env.FRONTEND_HOST}:${process.env.FRONTEND_PORT}/api/user/reset-password?token=${token}" style="display: inline-block; padding: 15px 35px; background-color: #007bff; color: #ffffff; text-decoration: none; border-radius: 25px; font-size: 18px; border: 2px solid #007bff; transition: background-color 0.3s ease;">Repor Password</a>
            </p>
            <p style="color: #666666; margin: 20px 0; line-height: 1.6; text-align: center;">Se o botão não funcionar, você também pode clicar <a href="http://${process.env.HOST}:${process.env.PORT}/api/user/reset-password?token=${token}" style="color: #007bff; text-decoration: none;">aqui</a></p>
            <p style="color: #999999; padding: 20px 0; text-align: center;">Atenciosamente, Equipe Techdot</p>
          </td>
          </tr>
        </table>
        </td>
      </tr>
      </table>
    </body>
    </html>
  `,
  },
};

module.exports = { EmailType, emailContent };
