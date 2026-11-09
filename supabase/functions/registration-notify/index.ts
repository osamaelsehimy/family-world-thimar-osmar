const ownerEmail = 'Eng.osama.elsehimy@gmail.com';

Deno.serve(async (request) => {
  const expected = Deno.env.get('REGISTRATION_WEBHOOK_SECRET');
  const supplied = request.headers.get('x-webhook-secret');
  if (!expected || !supplied || !constantTimeEqual(expected, supplied)) {
    return new Response('Unauthorized', { status: 401 });
  }

  const event = await request.json().catch(() => null);
  if (event?.type !== 'INSERT' || event?.table !== 'profiles' || event?.schema !== 'public' || !event?.record?.id) {
    return new Response('Ignored', { status: 202 });
  }

  const apiKey = Deno.env.get('RESEND_API_KEY');
  const from = Deno.env.get('REGISTRATION_EMAIL_FROM');
  if (!apiKey || !from) return new Response('Email service is not configured', { status: 503 });

  const result = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from,
      to: [ownerEmail],
      subject: 'New Family World registration',
      text: 'A new Family World account was created. No player name or email is included in this notification.',
    }),
  });
  if (!result.ok) return new Response('Email delivery failed', { status: 502 });
  return new Response('Notification sent', { status: 200 });
});

function constantTimeEqual(left: string, right: string): boolean {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  return difference === 0;
}
