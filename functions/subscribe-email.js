const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  // Handle CORS preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: '',
    };
  }

  try {
    // Parse request body
    const { email, name } = JSON.parse(event.body);

    // Validate email
    if (!email || !email.includes('@')) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
        body: JSON.stringify({ error: 'Valid email address is required' }),
      };
    }

    // Get MailerLite API key from environment variables
    const apiKey = process.env.MAILERLITE_API_KEY;
    if (!apiKey) {
      console.error('MAILERLITE_API_KEY environment variable not set');
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
        body: JSON.stringify({ error: 'Server configuration error' }),
      };
    }

    // Prepare subscriber data
    const subscriberData = {
      email: email.toLowerCase().trim(),
    };

    // Add name if provided
    if (name) {
      subscriberData.fields = {
        name: name.trim(),
      };
    }

    // Make request to MailerLite API
    const response = await fetch(
      'https://connect.mailerlite.com/api/subscribers',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(subscriberData),
      }
    );

    const responseData = await response.json();

    if (!response.ok) {
      // Handle specific MailerLite errors
      if (response.status === 422 && responseData.errors) {
        // Validation errors from MailerLite
        const errorMessage = Object.values(responseData.errors)
          .flat()
          .join(', ');
        return {
          statusCode: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type',
          },
          body: JSON.stringify({ error: errorMessage }),
        };
      }

      if (response.status === 429) {
        // Rate limit exceeded
        return {
          statusCode: 429,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type',
          },
          body: JSON.stringify({
            error: 'Too many requests. Please try again later.',
          }),
        };
      }

      // Other API errors
      console.error('MailerLite API error:', response.status, responseData);
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
        body: JSON.stringify({
          error: 'Failed to subscribe. Please try again.',
        }),
      };
    }

    // Success response
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify({
        success: true,
        message: 'Successfully subscribed to updates!',
        subscriber: {
          email: responseData.data?.email || email,
          id: responseData.data?.id,
        },
      }),
    };
  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
