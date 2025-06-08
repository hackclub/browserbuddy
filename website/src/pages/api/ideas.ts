import type { APIRoute } from "astro";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: import.meta.env.BROWSER_BUDDY_OPENAI_API_KEY,
});

function buildPrompt(problem: string) {
  return `
        You're an experienced developer and have developed a ton of web browser extensions. you know the steps to come up with a useful browser extensions that solves problems or that are simply fun to use. I want you to recommend to me a browser extension that will solve my problem. Do not hallucinate. It should be something really unique, perhaps with it's own twist of personality to it. Suggest five and no more. Be elaborate as to how it works. It should not be over-engineered and should be something that can be reasonably developed in a day or two by a single teenage developer. 

        Problem: ${problem}

   give your response in valid JSON following the form described below
The root node's name should be "extensions" and it's children should be a list of objects. each object represents an extension and it has the following structure
- name: string
- description: string
- features: list of string
- uniqueTwist

Be elaborate in your description and the features of the extension. 
Return JSON only.
.Do not hallucinate.  
    `;
}

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json();
  const { problem } = body;

  const chatCompletion = await openai.chat.completions.create({
    messages: [{ role: "user", content: buildPrompt(problem) }],
    model: "gpt-3.5-turbo",
  });

  const suggestion = chatCompletion.choices[0].message.content;

  return new Response(suggestion);
};
