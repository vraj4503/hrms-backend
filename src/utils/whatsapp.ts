import type { RequestInfo, RequestInit, Response } from 'node-fetch';

const fetch: (url: RequestInfo, init?: RequestInit) => Promise<Response> =
  (...args) => import('node-fetch').then(mod => mod.default(...args));


const WHATSAPP_TOKEN = 'EAAUuqmqhEdABO93fa4cQtr1HgnFAHSQzcL49Ai8SGTQZCrYsAZBy5e0oeYzSb7o8ZCO2EJvhasXy430l9777DREy0D02Oh3x1cDp59eF7D3h9qZCrymv4fhLNdWCHDCbCbxre1Hgxa7MrVEZBdxTK1dpIKwsZBoJ5EGlr0wmJH46hp65wYNBZC70vWa0jamZAyp1hMUmoPg2D7P1FxIkVqEkJm9WF4bEGjxHWiV5aVOO3Y2zCwZDZD';
const PHONE_NUMBER_ID = '652798854591840';

export async function sendWhatsAppMessage(to: string, message: string) {
  try {
    const url = `https://graph.facebook.com/v22.0/${PHONE_NUMBER_ID}/messages`;
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
