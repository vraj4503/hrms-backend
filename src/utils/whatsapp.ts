import fetch from 'node-fetch';

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN || '';
//const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || '';

export async function sendWhatsAppMessage(to: string, message: string) {
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
      console.log('success');
    } else {
      console.log('unsuccess');
      console.error('WhatsApp API error:', responseBody);
    }
    if (!response.ok) {
      throw new Error(JSON.stringify(responseBody));
    }
    return {
      success: true,
      data: responseBody as Record<string, unknown> | null,
    };
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
    return {
      success: false,
      message,
    };
  }
}
