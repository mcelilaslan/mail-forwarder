# Google Apps Script: Receipt Auto-Forwarder & Task Creator
(Otomatik Makbuz İletici ve Görev Oluşturucu)

This Google Apps Script automates the workflow of receiving financial receipts (or any specific emails). It scans for unread emails based on criteria, forwards the PDF attachments to a specific person (e.g., an accountant or spouse), and creates a Google Task reminder for you to double-check later.

Bu script, finansal makbuzları (veya belirlediğiniz e-postaları) alma iş akışını otomatikleştirir. Okunmamış e-postaları tarar, PDF eklerini belirlediğiniz kişiye (muhasebeci, eş vb.) iletir ve daha sonra kontrol etmeniz için size bir Google Görevi (Task) oluşturur.

## 🚀 Features (Özellikler)

* **Auto-Search:** Finds unread emails from specific senders (e.g., insurance companies). / Belirli göndericilerden gelen okunmamış e-postaları bulur.
* **Smart Forwarding:** Extracts only PDF attachments and sends them with a custom body text. If no PDF is found, forwards the whole email. / Sadece PDF eklerini ayıklar ve özel bir metinle iletir. PDF yoksa tüm maili iletir.
* **Task Integration:** Creates a Google Task with a direct link to the email. / E-postaya doğrudan link içeren bir Google Görevi oluşturur.
* **Cleanup:** Marks the processed email as read. / İşlenen e-postayı okundu olarak işaretler.

## 🛠️ Setup (Kurulum)

1.  Go to [script.google.com](https://script.google.com) and create a new project.
2.  Copy the code from `Code.gs` into the editor.
3.  **Important:** Add **Google Tasks API** from the "Services" (+) menu on the left sidebar.
    * *Önemli: Sol menüdeki "Hizmetler" (+) kısmından Google Tasks API'yi ekleyin.*
4.  Edit the `CONFIG` object at the top of the script with your own details:
    * `SENDER_EMAIL`: The email address of the receipt sender.
    * `TARGET_EMAIL`: The person you want to forward the receipt to.
5.  Set up a **Time-driven Trigger** (Clock icon) to run the `processReceiptsAndCreateTasks` function automatically (e.g., once a day).

## 📝 License

MIT
