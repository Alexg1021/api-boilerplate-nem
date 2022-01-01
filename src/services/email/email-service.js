import AWS from "aws-sdk";

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const emailService = async (emails, templateName, templateData) => {
  try {
    const params = {
      Destination: {
        ToAddresses: Array.isArray(emails) ? emails : [emails],
      },
      Source: process.env.EMAIL_FROM,
      Template: templateName,
      TemplateData: templateData,
    };
    const sendPromise = await new AWS.SES({ apiVersion: "2010-12-01" })
      .sendTemplatedEmail(params)
      .promise();
    return sendPromise;
  } catch (e) {
    throw e;
  }
};

export default emailService;
