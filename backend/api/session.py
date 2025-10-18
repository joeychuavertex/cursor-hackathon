import os
from uuid import uuid4
from supabase import create_client, Client

from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "../../.env.local"))

url = os.environ.get("SUPABASE_URL") 
key = os.environ.get("SUPABASE_KEY")

supabase: Client = create_client(url, key)

auth = supabase.auth.sign_in_with_password({
    "email": "test@example.com",
    "password": "testpassword"
})

user_id = auth.user.id

# 1️⃣ Create a conversation
conversation = supabase.table("conversations").insert({
    "user_id": user_id
}).execute()

conversation_id = conversation.data[0]["id"]
print("Conversation ID:", conversation_id)

# 2️⃣ Add messages
messages = [
    {"conversation_id": conversation_id, "sender": "user", "content": "Hello, agent!"},
    {"conversation_id": conversation_id, "sender": "agent", "content": "Hello there! How can I help you?"}
]
supabase.table("messages").insert(messages).execute()

# 3️⃣ Fetch conversation history
history = supabase.table("messages").select("*").eq("conversation_id", conversation_id).order("created_at").execute()
for msg in history.data:
    print(f"[{msg['sender']}] {msg['content']}")

print(user_id)