import json
import pandas as pd
import torch
from transformers import AutoModelForSequenceClassification, AutoTokenizer
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from torch.utils.data import Dataset, DataLoader
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import smtplib

# Load input data
with open('input.json') as f:
    df = pd.DataFrame(json.load(f))

# Preprocess text data


def preprocess_text(text):
    stop_words = set(stopwords.words('english'))
    lemmatizer = WordNetLemmatizer()
    tokens = [lemmatizer.lemmatize(t) for t in word_tokenize(
        text) if t not in stop_words]
    return ' '.join(tokens)


df['text'] = df['text'].apply(preprocess_text)

# Tokenize and convert data for model input


def convert_to_model_input(data):
    tokenizer = AutoTokenizer.from_pretrained('bert-base-uncased')
    inputs = tokenizer(
        data['text'].tolist(),
        add_special_tokens=True,
        max_length=512,
        padding=True,
        truncation=True,
        return_tensors='pt'
    )
    return inputs['input_ids'], inputs['attention_mask']


input_ids, attention_masks = convert_to_model_input(df)

# Custom dataset class


class CustomDataset(Dataset):
    def __init__(self, input_ids, attention_masks, labels):
        self.input_ids = input_ids
        self.attention_masks = attention_masks
        self.labels = labels

    def __getitem__(self, idx):
        return {
            'input_ids': self.input_ids[idx],
            'attention_mask': self.attention_masks[idx],
            'labels': self.labels[idx]
        }

    def __len__(self):
        return len(self.labels)


# Create dataset and data loader
dataset = CustomDataset(input_ids, attention_masks, df['label'].values)
data_loader = DataLoader(dataset, batch_size=32, shuffle=True)

# Load model
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
model = AutoModelForSequenceClassification.from_pretrained(
    'bert-base-uncased', num_labels=8).to(device)

# Train the model
optimizer = torch.optim.Adam(model.parameters(), lr=1e-5)
criterion = torch.nn.CrossEntropyLoss()

for epoch in range(5):
    model.train()
    total_loss = 0
    for batch in data_loader:
        optimizer.zero_grad()
        input_ids = batch['input_ids'].to(device)
        attention_masks = batch['attention_mask'].to(device)
        labels = batch['labels'].to(device)

        outputs = model(
            input_ids, attention_mask=attention_masks, labels=labels)
        loss = outputs.loss
        loss.backward()
        optimizer.step()
        total_loss += loss.item()

    print(f'Epoch {epoch+1}, Loss: {total_loss / len(data_loader)}')

# Evaluation
model.eval()


def convert_to_human_language(outputs, llm):
    predicted_labels = torch.argmax(outputs.logits, dim=1)
    probabilities = torch.nn.functional.softmax(outputs.logits, dim=1)

    # Prepare input for LLM
    parsed_results = []
    for i, label in enumerate(predicted_labels):
        human_readable_label = ["Positive",
                                "Negative", "Neutral"][label.item()]
        probability = probabilities[i, label].item()
        parsed_results.append({
            "label": human_readable_label,
            "probability": probability
        })

    # Pass the parsed results to the LLM for additional processing
    llm_input = {
        "results": parsed_results
    }
    llm_response = llm.process(llm_input)  # Assume llm has a process method

    # Return the LLM's response
    return llm_response


# Get model output
with torch.no_grad():
    outputs = model(input_ids.to(device),
                    attention_mask=attention_masks.to(device))
human_readable_output = convert_to_human_language(outputs)

# Prepare email body
email_body = "\n".join([f"* {output}" for output in human_readable_output])

# Send email


def send_email(subject, body, sender_email, receiver_email, password):
    msg = MIMEMultipart()
    msg['From'] = sender_email
    msg['To'] = receiver_email
    msg['Subject'] = subject
    msg.attach(MIMEText(body, 'plain'))

    with smtplib.SMTP('smtp.gmail.com', 587) as server:
        server.starttls()
        server.login(sender_email, password)
        server.sendmail(sender_email, receiver_email, msg.as_string())


send_email("Model Output", email_body, "...@gmail.com",
           "...", "...")  # Replace with actual email addresses and password
