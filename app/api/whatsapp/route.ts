import { NextRequest, NextResponse } from 'next/server';
import { Client, LocalAuth } from 'whatsapp-web.js';
import QRCode from 'qrcode';

// Global client instance
let whatsappClient: Client | null = null;
let qrCodeData: string | null = null;
let isReady = false;
let clientInfo: any = null;

// Initialize WhatsApp client
function initializeClient() {
  if (whatsappClient) {
    return whatsappClient;
  }

  whatsappClient = new Client({
    authStrategy: new LocalAuth({
      dataPath: './whatsapp-session'
    }),
    puppeteer: {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    }
  });

  // QR Code event
  whatsappClient.on('qr', async (qr) => {
    try {
      qrCodeData = await QRCode.toDataURL(qr);
      console.log('QR Code generated');
    } catch (err) {
      console.error('Error generating QR code:', err);
    }
  });

  // Ready event
  whatsappClient.on('ready', async () => {
    isReady = true;
    qrCodeData = null;
    try {
      clientInfo = {
        number: whatsappClient?.info?.wid?.user,
        name: whatsappClient?.info?.pushname,
        platform: whatsappClient?.info?.platform
      };
      console.log('WhatsApp client is ready!', clientInfo);
    } catch (err) {
      console.error('Error getting client info:', err);
    }
  });

  // Authenticated event
  whatsappClient.on('authenticated', () => {
    console.log('WhatsApp client authenticated');
  });

  // Auth failure event
  whatsappClient.on('auth_failure', (msg) => {
    console.error('Authentication failure:', msg);
    isReady = false;
    qrCodeData = null;
    clientInfo = null;
  });

  // Disconnected event
  whatsappClient.on('disconnected', (reason) => {
    console.log('WhatsApp client disconnected:', reason);
    isReady = false;
    qrCodeData = null;
    clientInfo = null;
    whatsappClient = null;
  });

  return whatsappClient;
}

// GET - Get connection status and QR code
export async function GET() {
  try {
    if (!whatsappClient) {
      const client = initializeClient();
      await client.initialize();
    }

    return NextResponse.json({
      isReady,
      qrCode: qrCodeData,
      clientInfo: isReady ? clientInfo : null
    });
  } catch (error) {
    console.error('Error in GET /api/whatsapp:', error);
    return NextResponse.json(
      { error: 'Failed to get WhatsApp status' },
      { status: 500 }
    );
  }
}

// POST - Handle actions (connect, disconnect)
export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();

    switch (action) {
      case 'connect':
        if (!whatsappClient) {
          const client = initializeClient();
          await client.initialize();
        }
        return NextResponse.json({ message: 'Connection initiated' });

      case 'disconnect':
        if (whatsappClient) {
          await whatsappClient.logout();
          await whatsappClient.destroy();
          whatsappClient = null;
          isReady = false;
          qrCodeData = null;
          clientInfo = null;
        }
        return NextResponse.json({ message: 'Disconnected successfully' });

      case 'status':
        return NextResponse.json({
          isReady,
          qrCode: qrCodeData,
          clientInfo: isReady ? clientInfo : null
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in POST /api/whatsapp:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

// DELETE - Disconnect WhatsApp
export async function DELETE() {
  try {
    if (whatsappClient) {
      await whatsappClient.logout();
      await whatsappClient.destroy();
      whatsappClient = null;
      isReady = false;
      qrCodeData = null;
      clientInfo = null;
    }
    return NextResponse.json({ message: 'Disconnected successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/whatsapp:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect' },
      { status: 500 }
    );
  }
}