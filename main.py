import google.generativeai as genai

genai.configure(api_key="AIzaSyCNpFeslIE1XTzi4hz9uGRke7w1T1NAeTo")

model = genai.GenerativeModel(model_name="models/gemini-1.5-flash")

chat = model.start_chat()

print("ConvoBot is ready! Type 'exit' to quit.\n")

while True:
    prompt = input("You: ")
    if prompt.lower() == "exit":
        break
    try:
        response = chat.send_message(prompt)
        print("ConvoBot:", response.text)
    except Exception as e:
        print("Error:", e)
