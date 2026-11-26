import os

from openai import OpenAI


class AIConfigurationError(Exception):
    """Raised when the AI provider has not been configured."""


class AIProviderError(Exception):
    """Raised when the AI provider cannot complete a request."""


SYSTEM_PROMPT = """You are DOJA AI, a helpful assistant for learning, research,
writing, coding, web development, project planning, and organizing ideas.

Give clear, accurate, useful answers. For code requests, provide complete,
well-formatted code and explain how to use it when helpful. Do not claim to
have browsed the web, created files, or performed actions you have not
actually performed. If information may be out of date, say so."""


def ask(prompt: str, history: list[dict[str, str]] | None = None) -> str:
    api_key = os.getenv("GROQ_API_KEY", "").strip()
    if not api_key:
        raise AIConfigurationError(
            "AI is not configured yet. Add a GROQ_API_KEY environment variable."
        )

    model = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile").strip()

    client = OpenAI(
        api_key=api_key,
        base_url="https://api.groq.com/openai/v1",
        timeout=60.0,
        max_retries=2,
    )

    messages = [{"role": "system", "content": SYSTEM_PROMPT}]

    for item in (history or [])[-12:]:
        role = item.get("role")
        content = item.get("content", "")
        if role in {"user", "assistant"} and isinstance(content, str):
            messages.append({"role": role, "content": content[:12000]})

    messages.append({"role": "user", "content": prompt[:12000]})

    try:
        result = client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=0.7,
            max_tokens=2048,
        )
        answer = result.choices[0].message.content
        if not answer:
            raise AIProviderError("The AI provider returned an empty response.")
        return answer.strip()
    except AIProviderError:
        raise
    except Exception as error:
        # Keep provider details out of the user-facing response.
        print(f"AI provider request failed: {error}")
        raise AIProviderError(
            "DOJA could not get a response from the AI provider. Check the "
            "server configuration and provider logs."
        ) from error
