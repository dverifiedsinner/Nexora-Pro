import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // VTU API Integration logic
  // Using VTpass as a reference example
  // Verification Endpoint (for Cable/Electricity)
  app.post('/api/vtu/verify', async (req, res) => {
    const { serviceID, billersCode, type } = req.body;
    const apiKey = process.env.VTPASS_API_KEY;
    const publicKey = process.env.VTPASS_PUBLIC_KEY;

    if (!apiKey) {
      return res.json({
        code: '000',
        content: {
          Customer_Name: "DEMO USER (Nexus Simulation)",
          Status: "Verified"
        }
      });
    }

    try {
      const response = await axios.post('https://api-service.vtpass.com/api/merchant-verify', {
        serviceID,
        billersCode,
        type: type || undefined
      }, {
        headers: { 'api-key': apiKey, 'public-key': publicKey }
      });
      res.json(response.data);
    } catch (error: any) {
      res.status(500).json({ error: 'Verification failed', details: error.message });
    }
  });

  app.post('/api/vtu/purchase', async (req, res) => {
    const { serviceID, amount, phoneNumber, billersCode, variation_code, request_id } = req.body;

    const apiKey = process.env.VTPASS_API_KEY;
    const publicKey = process.env.VTPASS_PUBLIC_KEY;

    if (!apiKey) {
      console.warn('VTU API Key missing. Running in simulation mode.');
      return res.json({
        code: '000',
        content: {
          transactions: {
            status: 'delivered',
            product_name: serviceID,
            unique_element: billersCode || phoneNumber,
            total_amount: amount,
            transactionId: 'SIM-' + Date.now()
          }
        },
        response_description: 'TRANSACTION SUCCESSFUL'
      });
    }

    try {
      const response = await axios.post('https://api-service.vtpass.com/api/pay', {
        request_id: request_id || Date.now().toString(),
        serviceID,
        amount,
        phone: phoneNumber,
        billersCode: billersCode || undefined,
        variation_code: variation_code || undefined
      }, {
        headers: {
          'api-key': apiKey,
          'public-key': publicKey
        }
      });

      res.json(response.data);
    } catch (error: any) {
      console.error('VTU API Error:', error.response?.data || error.message);
      res.status(500).json({ 
        error: 'Failed to process VTU transaction',
        details: error.response?.data || error.message
      });
    }
  });

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', server: 'Nexus VTU Node' });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
