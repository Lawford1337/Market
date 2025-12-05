'use client';

import { QRCodeSVG } from 'qrcode.react';
import { useState, useEffect } from 'react';
import { Smartphone } from 'lucide-react'; 

export const ProductQR = ({ productId }: { productId: number }) => {
  const [show, setShow] = useState(false);
  const [host, setHost] = useState('');

  // Получаем адрес сайта только на клиенте
  useEffect(() => {
    setHost(window.location.origin);
  }, []);

  const productUrl = `${host}/product/${productId}`;

  return (
    <div style={{ marginTop: 20 }}>
      {!show ? (
        <button 
          onClick={() => setShow(true)}
          style={{
            background: '#fff',
            border: '2px solid #cb11ab', 
            color: '#cb11ab',            
            padding: '12px 20px',
            borderRadius: '12px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            width: '100%',              
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            transition: 'background 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = '#fcf0fb'}
          onMouseOut={(e) => e.currentTarget.style.background = '#fff'}
        >
          <Smartphone size={20} />
          Открыть на телефоне (QR)
        </button>
      ) : (
        <div style={{ 
          border: '2px solid #eaeaea', 
          padding: 20, 
          borderRadius: 12, 
          background: '#fff',
          textAlign: 'center',
          boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
        }}>
          <p style={{marginBottom: 10, fontSize: 14, color: '#666'}}>
            Наведите камеру:
          </p>
          
          <div style={{ background: 'white', padding: 10, display: 'inline-block' }}>
            <QRCodeSVG value={productUrl} size={150} />
          </div>

          <div style={{ marginTop: 15 }}>
            <button 
              onClick={() => setShow(false)}
              style={{ 
                fontSize: 14, 
                border: 'none', 
                background: '#eee', 
                color: '#333', 
                cursor: 'pointer',
                padding: '8px 16px',
                borderRadius: '6px',
                fontWeight: 600
              }}
            >
              Закрыть
            </button>
          </div>
        </div>
      )}
    </div>
  );
};