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
     -d '{"prompt": "Write a short poem about the sea."}'
```