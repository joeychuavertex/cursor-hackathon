Right now there is a very basic endpoint that can act as a judge

1. cd backend dir
2. python3 -m venv .venv
3. source .venv/bin/activate
4. pip3 install -r requirements.txt
5. uvicorn main:app --reload
6. send cur request as follows

```
curl -X POST "http://127.0.0.1:8000/judges/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "judge": "Elon",
    "conversation_history": {
      "messages": [
      ]
    },
    "new_message": "At Stofee, we’re redefining instant coffee for the modern coffee lover. Our premium freeze-dried brews are made from 100% specialty-grade beans, sourced sustainably and crafted to deliver the full aroma and flavor of a fresh café-quality cup — in just seconds. No machines, no mess — just hot water and barista-level taste anywhere. We’re bringing convenience and quality together, one cup at a time"
  }'
```

