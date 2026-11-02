import imaplib, ssl, email
from email.header import decode_header
from email.utils import parseaddr
from pathlib import Path
import json

mail = imaplib.IMAP4_SSL('imap.gmail.com', 993, ssl_context=ssl.create_default_context())
mail.login('itsub@bartholomew.info', 'srfkgsizawgimchn')
mail.select('INBOX')

status, msgs = mail.search(None, 'FROM', 'marketing@keychron.com')
ids = msgs[0].split()

results = []
for i in ids:
    res, d = mail.fetch(i, '(RFC822)')
    if res != 'OK': continue
    msg = email.message_from_bytes(d[0][1])
    
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

    results.append({
        'from': msg.get('From'),
        'to': msg.get('To'),
        'date': msg.get('Date'),
        'subject': msg.get('Subject'),
        'body': body.strip()
    })

mail.logout()

out_path = Path("C:/Users/User/.gemini/antigravity/scratch/bartholomew_ad_network/KEYCHRON_ACTUAL_REPLY.json")
with open(out_path, 'w', encoding='utf-8') as f:
    json.dump(results, f, indent=2)

print(f"Dumped {len(results)} Keychron replies to {out_path}")
