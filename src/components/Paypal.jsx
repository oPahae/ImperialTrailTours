'use client';

import { useState } from 'react';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

export default function PaypalCheckout({ amount, reservationId, onSuccess }) {
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  return (
    <PayPalScriptProvider
      options={{
        "client-id": process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
        currency: "USD",
      }}
    >
      <PayPalButtons
        style={{ layout: "vertical" }}

        createOrder={async () => {
          setMessage(null);
          const res = await fetch('/api/paypal/create-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              totalPrice: amount,
              reservationId,
            }),
          });

          const data = await res.json();
          return data.id;
        }}

        onApprove={async (data) => {
          setLoading(true);
          setMessage(null);

          const res = await fetch('/api/paypal/capture-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId: data.orderID,
              reservationId,
            }),
          });

          const result = await res.json();
          setLoading(false);

          if (res.ok) {
            setMessage({
              type: 'success',
              text: 'Payment completed successfully!',
            });
            onSuccess?.();
          } else if (res.status === 400) {
            setMessage({
              type: 'error',
              text: result.message || 'Payment was not completed.',
            });
          } else {
            setMessage({
              type: 'error',
              text: 'Server error. Please try again later.',
            });
          }
        }}

        onError={(err) => {
          console.error(err);
          setMessage({
            type: 'error',
            text: 'A PayPal error occurred.',
          });
        }}

        disabled={loading}
      />

      {/* Feedback message */}
      {message && (
        <div
          style={{
            marginTop: '12px',
            padding: '10px',
            borderRadius: '6px',
            backgroundColor: message.type === 'success' ? '#e6fffa' : '#ffe6e6',
            color: message.type === 'success' ? '#065f46' : '#991b1b',
            fontWeight: 500,
          }}
        >
          {message.text}
        </div>
      )}
    </PayPalScriptProvider>
  );
}