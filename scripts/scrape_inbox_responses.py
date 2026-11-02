import imaplib
import email
from email.header import decode_header
from email.utils import parseaddr
import ssl
import json
from pathlib import Path

IMAP_SERVER = 'imap.gmail.com'
USERNAME = 'itsub@bartholomew.info'
PASSWORD = 'srfkgsizawgimchn'

context = ssl.create_default_context()
mail = imaplib.IMAP4_SSL(IMAP_SERVER, 993, ssl_context=context)
mail.login(USERNAME, PASSWORD)
mail.select('INBOX')

status, messages = mail.uid('search', None, 'ALL')
uids = messages[0].split()
print(f"Total messages in inbox: {len(uids)}")

email_items = []
for uid in reversed(uids):
    res, data = mail.uid('fetch', uid, '(RFC822)')
    if res != 'OK':
        continue
    raw = data[0][1]
    msg = email.message_from_bytes(raw)
    from_raw = msg.get('From', '')
    name, addr = parseaddr(from_raw)
    subj = msg.get('Subject', '')
    date_str = msg.get('Date', '')
    
    decoded_subj = ''
    for part, enc in decode_header(subj):
        if isinstance(part, bytes):
            decoded_subj += part.decode(enc or 'utf-8', errors='ignore')
        else:
            decoded_subj += str(part)
            
    body = ''
    if msg.is_multipart():
        for p in msg.walk():
            if p.get_content_type() == 'text/plain':
                payload = p.get_payload(decode=True)
                if payload:
                    body = payload.decode('utf-8', errors='ignore')
                break
    else:
        payload = msg.get_payload(decode=True)
        if payload:
            body = payload.decode('utf-8', errors='ignore')

    email_items.append({
        'uid': uid.decode('utf-8'),
        'from': from_raw,
        'name': name,
        'addr': addr,
        'date': date_str,
        'subject': decoded_subj,
        'body': body.strip()
    })

mail.logout()

# Filter out self-sent emails from itsub@bartholomew.info to find genuine external incoming replies
external_replies = [e for e in email_items if 'itsub@bartholomew.info' not in e['addr'].lower()]

print(f"\nTotal external messages found: {len(external_replies)}")
print("=" * 70)
for idx, r in enumerate(external_replies, start=1):
    print(f"[{idx}] FROM: {r['from']} <{r['addr']}>")
    print(f"    DATE: {r['date']}")
    print(f"    SUBJECT: {r['subject']}")
    print(f"    BODY SNIPPET:\n{r['body'][:350]}\n")
    print("-" * 70)

# Save clean structured report
output_path = Path("C:/Users/User/.gemini/antigravity/scratch/bartholomew_ad_network/INBOX_SCRAPED_EXTERNAL_REPLIES.json")
with open(output_path, "w", encoding="utf-8") as f:
    json.dump(external_replies, f, indent=2)

print(f"Saved {len(external_replies)} cleaned responses to {output_path}")
