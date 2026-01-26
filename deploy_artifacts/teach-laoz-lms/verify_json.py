import json

with open('full_eval.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

print(f"Evaluation: {data['title']}")
for i, q in enumerate(data['questions']):
    print(f"\nQ{i+1}: {q['text'][:50]}...")
    def to_hex(s):
        return ' '.join(hex(ord(c)) for c in s)

    print(f"  Target Correct ID: {repr(q['correctAnswerId'])} (Hex: {to_hex(q['correctAnswerId'])})")
    for opt in q['options']:
        print(f"  - Option ID: {repr(opt['id'])} (Hex: {to_hex(opt['id'])}) | Text: {repr(opt['text'][:40])}...")
        if opt['id'] == q['correctAnswerId']:
            print(f"    [MATCH FOUND]")
