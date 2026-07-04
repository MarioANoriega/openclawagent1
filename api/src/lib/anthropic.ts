import type { ChatMessage, Pet } from "../types";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-4-5";
const MAX_TOKENS = 1024;

function systemPromptForPet(pet: Pet): string {
  const details = [
    `Species: ${pet.species}`,
    pet.breed ? `Breed: ${pet.breed}` : null,
    pet.age_years != null ? `Age: ${pet.age_years} years` : null,
    pet.weight_kg != null ? `Weight: ${pet.weight_kg} kg` : null,
    pet.notes ? `Owner notes: ${pet.notes}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  return `You are the Pet Plus assistant, a knowledgeable and friendly companion for pet owners. \
You answer questions about pet nutrition (diet, feeding schedules, safe/unsafe foods, weight management, supplements) \
and general pet medical questions (symptoms, preventive care, common conditions, when to see a vet).

You are currently helping with this pet:
${details}

Guidelines:
- Give clear, practical, and specific answers tailored to this pet's species, breed, age, and weight when relevant.
- You are not a replacement for a licensed veterinarian. For anything urgent, severe, or ambiguous (e.g. suspected poisoning, \
difficulty breathing, prolonged vomiting/diarrhea, suspected fractures, or any emergency), clearly advise contacting a vet or \
emergency animal hospital immediately.
- Include a brief reminder to consult a veterinarian for diagnosis or treatment decisions when discussing medical topics.
- Keep answers concise and easy to read on a mobile screen.`;
}

export async function askPetAssistant(
  apiKey: string,
  pet: Pet,
  history: ChatMessage[],
  question: string,
): Promise<string> {
  const messages = [
    ...history.map((m) => ({ role: m.role, content: m.content })),
    { role: "user" as const, content: question },
  ];

  const response = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: systemPromptForPet(pet),
      messages,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Anthropic API error (${response.status}): ${body}`);
  }

  const data = (await response.json()) as {
    content: { type: string; text?: string }[];
  };

  return data.content
    .filter((block) => block.type === "text" && block.text)
    .map((block) => block.text)
    .join("\n");
}
