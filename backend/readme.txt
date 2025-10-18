Right now there is a very basic endpoint that can act as a judge

1. be in backend dir
2. uvicorn main:app --reload
3. send cur request as follows

```
curl -X POST "http://127.0.0.1:8000/judges/generate" \   
     -H "Content-Type: application/json" \               
     -d '{"prompt": "Write a short poem about the sea."}'
```