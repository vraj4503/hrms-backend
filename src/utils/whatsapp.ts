//import type { RequestInfo, RequestInit, Response } from 'node-fetch';

const fetch = require('node-fetch');
  
const WHATSAPP_TOKEN = 'EAAkzVqTA3y4BPMIuxNZCDdNNQsQHphzgN5W5HrUXqZCZCodb8I6x3x8ExvYZAZBtsv0mcZCcsWMmYVwdpRuKegTxlLOZBDFEIV3f9x9RlcnXP2uezZCRDr9LkhJBdYAfCnGl0BuFeThEG3jUtt7znhschhmv7mIJJkPahZCOSK6Ap7zGf9iIJPKmy5oYjZAZBeGD7cmse8eUs5jvq0NRDFZBzRxlHLNChlXbRDDs7UY68yFPBw1LFYlZC';
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
