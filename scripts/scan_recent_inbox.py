import imaplib, ssl, email
from email.header import decode_header
from email.utils import parseaddr
from pathlib import Path
import json

mail = imaplib.IMAP4_SSL('imap.gmail.com', 993, ssl_context=ssl.create_default_context())
mail.login('itsub@bartholomew.info', 'srfkgsizawgimchn')
mail.select('INBOX')

status, msgs = mail.search(None, 'ALL')
ids = msgs[0].split()

recent_ids = ids[-100:]  # check last 100 emails
relevant_replies = []

for i in reversed(recent_ids):
    res, d = mail.fetch(i, '(RFC822)')
    if res != 'OK': continue
    msg = email.message_from_bytes(d[0][1])
    from_raw = msg.get('From', '')
    name, addr = parseaddr(from_raw)
    
    # skip mailer-daemon, self, squarespace, aws alerts, indeed
    ignored_patterns = ['mailer-daemon', 'itsub@bartholomew.info', 'squarespace', 'indeed', 'paperform', 'techstars', 'costalerts', 'googlecloud', 'workspace-noreply']
    if any(pat in addr.lower() for pat in ignored_patterns):
        continue
    
    subj = msg.get('Subject', '')
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

    relevant_replies.append({
        'from': from_raw,
        'name': name,
        'addr': addr,
        'date': msg.get('Date'),
        'subject': decoded_subj,
        'body': body.strip()
    })

mail.logout()

out_path = Path("C:/Users/User/.gemini/antigravity/scratch/bartholomew_ad_network/ALL_RELEVANT_INBOX_RESPONSES.json")
with open(out_path, 'w', encoding='utf-8') as f:
    json.dump(relevant_replies, f, indent=2)

print(f"Found {len(relevant_replies)} relevant non-bounce messages in recent inbox.")
