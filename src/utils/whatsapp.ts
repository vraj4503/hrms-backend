//import type { RequestInfo, RequestInit, Response } from 'node-fetch';

const fetch = require('node-fetch');
  
const WHATSAPP_TOKEN = 'EAAkzVqTA3y4BOxeSi9xHZCUtOisdIlRYmhRm3mZAGR5qOsibAHDZAxmbg0HlH8pDYkpquq86rvq6rHXuZBfw4VjyCuGavNqcC6VHGCjXZBUBgXgA18zQYTnaHVTDbcP3zK2o7WYKvZBgsEYcUk0Aky0NU8p39ZCsUNITCtkNus3h6qiQxorMh0TZCEU3KI23innWseqvhhn8nupVSsfjmi24IFTIMuNYEgLpdqBITNKLRtleAAZDZD';
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
