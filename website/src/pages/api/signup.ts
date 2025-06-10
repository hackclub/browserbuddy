import Airtable from "airtable";
import type { APIRoute } from "astro";

console.log(import.meta.env.BROWSER_BUDDY_AIRTABLE_PAT);

Airtable.configure({
  endpointUrl: "https://api.airtable.com",
  apiKey: import.meta.env.BROWSER_BUDDY_AIRTABLE_PAT,
});

const base = Airtable.base(import.meta.env.BROWSER_BUDDY_AIRTABLE_ID!);

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json();
  const { email } = body;

  try {
    const result = await new Promise((resolve, reject) => {
      base("Email SignUp").create(
        [
          {
            fields: {
              Email: email,
            },
          },
        ],
        (err: any, records: any) => {
          if (err) reject(err);
          resolve(records);
        },
      );
    });

    return new Response(JSON.stringify({ success: true, result }));
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error }));
  }
};
