import nodemailer from "nodemailer";
import twilio from "twilio";
import { statusLabel } from "../utils/orderWorkflow.js";

let cachedTransporter = null;

function getSmtpTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  if (cachedTransporter) {
    return cachedTransporter;
  }

  cachedTransporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass
    }
  });

  return cachedTransporter;
}

function buildStatusMessage(order) {
  const orderId = order?.orderId || order?.orderNumber || "Order";
  const customerName = order?.customerName || order?.customer?.name || "Customer";
  const status = statusLabel(order?.orderStatus || order?.status);

  return `Hello ${customerName}, your order ${orderId} is now ${status}.`;
}

async function sendEmailNotification(order) {
  const transporter = getSmtpTransporter();
  const to = String(order?.email || order?.customer?.email || "").trim().toLowerCase();
  const from = process.env.SMTP_FROM || process.env.SMTP_USER || "";

  if (!transporter || !to || !from) {
    return { sent: false, skipped: true, reason: "Email config missing" };
  }

  try {
    await transporter.sendMail({
      from,
      to,
      subject: `Order Update: ${order?.orderId || "HOFO"}`,
      text: buildStatusMessage(order)
    });

    return { sent: true, skipped: false };
  } catch (error) {
    return {
      sent: false,
      skipped: false,
      error: error instanceof Error ? error.message : "Email failed"
    };
  }
}

async function sendWhatsAppNotification(order) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_FROM;

  const phone = String(order?.phone || order?.customer?.phone || "").replace(/\D/g, "");

  if (!accountSid || !authToken || !from || !phone) {
    return { sent: false, skipped: true, reason: "WhatsApp config missing" };
  }

  try {
    const client = twilio(accountSid, authToken);

    await client.messages.create({
      from,
      to: `whatsapp:+${phone}`,
      body: buildStatusMessage(order)
    });

    return { sent: true, skipped: false };
  } catch (error) {
    return {
      sent: false,
      skipped: false,
      error: error instanceof Error ? error.message : "WhatsApp failed"
    };
  }
}

export async function notifyOrderStatusChange(order) {
  const [email, whatsapp] = await Promise.all([
    sendEmailNotification(order),
    sendWhatsAppNotification(order)
  ]);

  return {
    email,
    whatsapp
  };
}
