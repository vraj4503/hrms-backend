//import type { RequestInfo, RequestInit, Response } from 'node-fetch';

const fetch = require('node-fetch');
  
const WHATSAPP_TOKEN = 'EAAkzVqTA3y4BPBg40EZBsZADcvsqpwuJLmqIbclkh9HkeduWi9kFRPl2e6ZCVHVskQn1fecRL4ZAMgLBUC9wIIntO5ne8fZB9STcXMPr4zrTwIohpSwwvWOWpJ81lHrCjjpK3vhIGf6VT6ZBIqS3YL9LOS5vaITEoxJZAu07yvlF81gL9ccCSZBZCzNCu0W7FcL4fGkJDdyc4L1VybrLPZC3JfvVQPv1vDv7rOZCyQam9VqWAZDZD';
// const PHONE_NUMBER_ID = '652798854591840';


export async function sendWhatsAppMessage(to: string, message: string) {
  const fetch = (await import('node-fetch')).default;
  // Validate phone number format (must start with '+')
  if (!/^\+\d{10,15}$/.test(to)) {
    const msg = `Invalid phone number format for WhatsApp: ${to}`;
    console.error(msg);
    return { success: false, message: msg };
  }
  try {
    const url = `https://graph.facebook.com/v22.0/652798854591840/messages`;
    const data = {
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body: message },
    };
    const headers = {
      Authorization: `Bearer ${WHATSAPP_TOKEN}`,
      'Content-Type': 'application/json',
    };
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    let responseBody: unknown;
    try {
      responseBody = await response.json();
    } catch {
      responseBody = null;
    }

    if (response.ok) {
      console.log('WhatsApp API success:', responseBody);
      return {
        success: true,
        data: responseBody as Record<string, unknown> | null,
      };
    } else {
      console.error('WhatsApp API error:', responseBody);
      return {
        success: false,
        message: responseBody,
      };
    }
  } catch (error: unknown) {
    let message = 'Failed to send WhatsApp message';
    if (
      typeof error === 'object' &&
      error !== null &&
      'message' in error &&
      typeof (error as { message?: unknown }).message === 'string'
    ) {
      message = (error as { message: string }).message;
    }
    console.error('WhatsApp send error:', message);
    return {
      success: false,
      message,
    };
  }
}
