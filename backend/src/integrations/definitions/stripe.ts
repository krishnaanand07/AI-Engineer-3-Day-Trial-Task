import { IntegrationDefinition } from '../../types/integrations';

export const stripeIntegration: IntegrationDefinition = {
  id: 'stripe',
  displayName: 'Stripe',
  description: 'Handle payments, subscriptions, and billing events via Stripe.',
  authType: 'api_key',
  baseUrl: 'https://api.stripe.com/v1',
  triggers: [
    { name: 'on_payment_success', event: 'create', entity: 'Payment', description: 'Triggered when a payment succeeds' },
    { name: 'on_subscription_created', event: 'create', entity: 'Subscription', description: 'Triggered when a new subscription starts' },
    { name: 'on_invoice_paid', event: 'update', entity: 'Invoice', description: 'Triggered when an invoice is paid' },
    { name: 'on_refund', event: 'create', entity: 'Refund', description: 'Triggered when a refund is processed' },
  ],
  actions: [
    {
      name: 'create_checkout_session',
      description: 'Create a Stripe Checkout session for payment',
      inputSchema: [
        { name: 'price_id', type: 'string', required: true, description: 'Stripe Price ID' },
        { name: 'quantity', type: 'number', required: false, description: 'Quantity (default 1)' },
        { name: 'success_url', type: 'string', required: true, description: 'Redirect URL on success' },
        { name: 'cancel_url', type: 'string', required: true, description: 'Redirect URL on cancel' },
      ],
      outputDescription: 'Returns checkout session URL',
    },
    {
      name: 'create_customer',
      description: 'Create a new Stripe customer',
      inputSchema: [
        { name: 'email', type: 'email', required: true, description: 'Customer email' },
        { name: 'name', type: 'string', required: false, description: 'Customer name' },
      ],
      outputDescription: 'Returns Stripe customer ID',
    },
    {
      name: 'create_subscription',
      description: 'Create a new subscription for a customer',
      inputSchema: [
        { name: 'customer_id', type: 'string', required: true, description: 'Stripe customer ID' },
        { name: 'price_id', type: 'string', required: true, description: 'Stripe Price ID' },
      ],
      outputDescription: 'Returns subscription details',
    },
  ],
  payloadShape: {
    customer: 'string (Stripe customer ID)',
    amount: 'number (cents)',
    currency: 'string (e.g., usd)',
    metadata: '{ [key: string]: string }',
  },
  status: 'implemented',
};
