import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaCopy, FaHome, FaReceipt } from 'react-icons/fa';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const txnid = searchParams.get('txnid') || searchParams.get('order_id');
  const status = searchParams.get('status');
  const amount = searchParams.get('amount');
  const gateway = searchParams.get('gateway') || 'Razorpay';
  const message = searchParams.get('message');

  useEffect(() => {
    // You can add analytics tracking here
    console.log('Payment Success:', { txnid, status, amount, gateway, message });
  }, [txnid, status, amount, gateway, message]);

  const copyTransactionId = () => {
    if (txnid) {
      navigator.clipboard.writeText(txnid);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '40px',
        maxWidth: '500px',
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          fontSize: '80px',
          color: '#28a745',
          marginBottom: '20px'
        }}>
          <FaCheckCircle />
        </div>

        <h1 style={{
          color: '#333',
          marginBottom: '10px',
          fontSize: '28px'
        }}>
          Payment Successful!
        </h1>

        <p style={{
          color: '#666',
          marginBottom: '30px',
          fontSize: '16px'
        }}>
          Thank you for your purchase. Your payment has been processed successfully.
        </p>

        {txnid && (
          <div style={{
            background: '#f8f9fa',
            border: '1px solid #e9ecef',
            borderRadius: '10px',
            padding: '20px',
            marginBottom: '30px'
          }}>
            <h3 style={{ color: '#333', marginBottom: '15px' }}>Transaction Details</h3>
            
            <div style={{ marginBottom: '10px' }}>
              <strong>Transaction ID:</strong>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                marginTop: '5px'
              }}>
                <span style={{
                  background: '#e9ecef',
                  padding: '8px 12px',
                  borderRadius: '5px',
                  fontFamily: 'monospace',
                  fontSize: '14px'
                }}>
                  {txnid}
                </span>
                <button
                  onClick={copyTransactionId}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#007bff',
                    cursor: 'pointer',
                    fontSize: '16px'
                  }}
                  title="Copy Transaction ID"
                >
                  <FaCopy />
                </button>
              </div>
              {copied && (
                <small style={{ color: '#28a745', marginTop: '5px', display: 'block' }}>
                  ✓ Copied to clipboard
                </small>
              )}
            </div>

            {amount && (
              <div style={{ marginBottom: '10px' }}>
                <strong>Amount:</strong> ₹{amount}
              </div>
            )}

            <div>
              <strong>Payment Gateway:</strong> {gateway}
            </div>
          </div>
        )}

        <div style={{
          display: 'flex',
          gap: '15px',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => navigate('/')}
            style={{
              background: '#007bff',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <FaHome /> Go to Home
          </button>

          <button
            onClick={() => navigate('/orders')}
            style={{
              background: '#28a745',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <FaReceipt /> View Orders
          </button>
        </div>

        <div style={{
          marginTop: '30px',
          padding: '15px',
          background: '#d4edda',
          border: '1px solid #c3e6cb',
          borderRadius: '8px',
          color: '#155724'
        }}>
          <strong>What's Next?</strong>
          <ul style={{
            textAlign: 'left',
            marginTop: '10px',
            paddingLeft: '20px'
          }}>
            <li>You will receive an email confirmation shortly</li>
            <li>Your order will be processed within 24 hours</li>
            <li>Track your order in the "My Orders" section</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;