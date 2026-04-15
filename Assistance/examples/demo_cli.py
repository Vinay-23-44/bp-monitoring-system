import os

from hypertension_assistant import HypertensionOrchestrator
from hypertension_assistant.models import UserMessage


def main() -> None:
    orchestrator = HypertensionOrchestrator()

    print("Hypertension Assistant (demo CLI). Type 'quit' to exit.")
    user_id = "demo-user-1"

    while True:
        text = input("\nYou: ")
        if text.lower().strip() in {"quit", "exit"}:
            break

        bp_input = input("Enter BP as 'systolic/diastolic' or press Enter to skip: ").strip()
        systolic = diastolic = None
        if bp_input:
            try:
                s_str, d_str = bp_input.split("/")
                systolic = int(s_str)
                diastolic = int(d_str)
            except Exception:
                print("Could not parse BP input, ignoring.")

        symptoms_input = input("List any symptoms (comma-separated) or press Enter: ").strip()
        symptoms = [s.strip() for s in symptoms_input.split(",") if s.strip()] if symptoms_input else []

        msg = UserMessage(
            user_id=user_id,
            text=text,
            systolic=systolic,
            diastolic=diastolic,
            symptoms=symptoms,
        )

        resp = orchestrator.handle_message(msg)
        print("\nAssistant:")
        print(resp.reply)
        print(f"\n[Sentiment: {resp.sentiment}, Safety level: {resp.safety.level}]")
        print("Reasons:")
        for r in resp.safety.reasons:
            print(f" - {r}")


if __name__ == "__main__":
    main()