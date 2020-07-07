const sendGridEmail = require("@sendgrid/mail");
const config = require("../config");

sendGridEmail.setApiKey(config.emails["api-key"]);

exports.sendMail = async (payload) => {
  const {
    templateId,
    dynamic_template_data,
    to,
    subject,
    text,
    html,
  } = payload;

  const emailTemplate =
    (templateId && getTemplate(templateId, dynamic_template_data)) || {};

  const msg = {
    from: config.emails.from,
    to,
    subject: subject ? subject : emailTemplate.subject,
    text: text ? text : emailTemplate.text,
    html: html ? html : emailTemplate.html,
  };

  try {
    await sendGridEmail.send(msg);
    debug("Mail has been sent successfully.");
  } catch (err) {
    debug(`Mail Sent Error. Error Message is: ${err.message}`);
  }
};

const getTemplate = (templateId, dynamic_template_data) => {
  let template = templates.find((x) => x.id == templateId);
  if (!template) return null;

  if (dynamic_template_data) {
    Object.keys(dynamic_template_data).map((key) => {
      let regx = new RegExp(`{{${key}}}`, "g");
      debug({ regx, replace: dynamic_template_data[key] });

      let newText = template.text
        ? template.text.replace(regx, dynamic_template_data[key])
        : undefined;

      let newHtml = template.html
        ? template.html.replace(regx, dynamic_template_data[key])
        : undefined;

      template = { ...template, text: newText, html: newHtml };
    });
  }

  return template;
};

const templates = [
  {
    id: "emailVerification",
    subject: "Welcome to DoctorBuddy",
    text: "Hello {{name}} \nYour email verification code {{code}}",
    html: "<div>Hello {{name}} <br/>Your email verification code {{code}}</div",
  },
  {
    id: "resetPassword",
    subject: "Password Reset - DoctorBuddy",
    text: "Hello {{name}} \nVisit this link to reset your password {{url}}",
    html:
      '<div>Hello {{name}} <br/>Click on this link to reset your password <a href="{{url}}">{{url}}</a></div',
  },
];
