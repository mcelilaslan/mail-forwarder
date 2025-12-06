/**
 * Google Apps Script: Otomatik Makbuz İletme ve Görev Oluşturucu
 * * Bu script:
 * 1. Belirlenen kriterlere (gönderen, konu) uyan okunmamış e-postaları tarar.
 * 2. E-postadaki PDF eklerini ayıklar ve belirlenen hedef adrese iletir.
 * 3. E-postayı takip etmeniz için Google Tasks'te bir hatırlatıcı görev oluşturur.
 * 4. İşlenen e-postayı 'okundu' olarak işaretler.
 * * Kurulum:
 * - Apps Script düzenleyicisinde "Hizmetler" (Services) kısmından "Tasks API"yi eklemeyi unutmayın.
 */

function processReceiptsAndCreateTasks() {
  
  // ======================================================
  // ⚙️ KULLANICI AYARLARI (Burayı kendinize göre düzenleyin)
  // ======================================================
  const CONFIG = {
    SEARCH: {
      SENDER_EMAIL: 'ornek_sirket@kurum.com', // Örn: musteriiletisim@msg.agesa.com.tr
      KEYWORDS: '"tahsilat makbuzu"',         // Aranacak kelime grubu
      TIMEFRAME: 'newer_than:1d'              // Ne kadar eskiye bakılsın?
    },
    FORWARD: {
      ENABLE: true,                           // İletme özelliği açık mı?
      TARGET_EMAIL: 'alici_adresi@ornek.com', // E-postanın iletileceği adres
      SUBJECT_SUFFIX: ' (Otomatik İletim)',   // Konu başlığının sonuna eklenecek not
      BODY_TEXT: 'Merhaba,\n\nEkte ilgili döneme ait makbuzu iletiyorum. Kontrol etmenizi rica ederim.\n\nSaygılarımla.',
      SENDER_DISPLAY_NAME: 'Adınız Soyadınız' // İletilen mailde görünecek isminiz
    },
    TASK: {
      TITLE: '💳 Yeni Makbuz Geldi - Kontrol Et!',
      NOTE_PREFIX: '(Bu görev otomatik oluşturulmuştur)'
    }
  };
  // ======================================================

  // Arama sorgusunu oluştur
  var searchQuery = `from:${CONFIG.SEARCH.SENDER_EMAIL} ${CONFIG.SEARCH.KEYWORDS} is:unread ${CONFIG.SEARCH.TIMEFRAME}`;
  var threads = GmailApp.search(searchQuery);

  if (threads.length > 0) {
    Logger.log(`${threads.length} adet yeni e-posta bulundu. İşleniyor...`);

    threads.forEach(function(thread) {
      var message = thread.getMessages().pop(); // Konuşmadaki en son mesajı al
      
      // --- 1. ADIM: E-POSTA İLETME (FORWARD) ---
      if (CONFIG.FORWARD.ENABLE && CONFIG.FORWARD.TARGET_EMAIL !== 'alici_adresi@ornek.com') {
        try {
          forwardAttachmentOrMessage(message, CONFIG);
        } catch (e) {
          Logger.log("İletme sırasında hata oluştu: " + e.toString());
        }
      } else {
        Logger.log("İletme pasif veya hedef e-posta ayarlanmamış.");
      }

      // --- 2. ADIM: GOOGLE TASKS GÖREVİ OLUŞTURMA ---
      try {
        createReminderTask(thread, message, CONFIG);
      } catch (e) {
        Logger.log("Görev oluşturulurken hata: " + e.toString());
      }
      
      // --- 3. ADIM: OKUNDU OLARAK İŞARETLEME ---
      thread.markRead();
      Logger.log("İşlem tamamlandı, e-posta okundu olarak işaretlendi.");
    });

  } else {
    Logger.log("Kriterlere uygun yeni e-posta bulunamadı.");
  }
}

/**
 * PDF eklerini bulur ve iletir. PDF yoksa tüm mesajı iletir.
 */
function forwardAttachmentOrMessage(message, config) {
  var attachments = message.getAttachments();
  
  // Sadece PDF olan veya isminde "makbuz" geçen dosyaları filtrele
  var pdfAttachments = attachments.filter(function(attachment) {
    return attachment.getName().toLowerCase().includes("makbuz") || 
           attachment.getContentType() === 'application/pdf';
  });

  var subject = "İLETİ: " + message.getSubject() + config.FORWARD.SUBJECT_SUFFIX;

  if (pdfAttachments.length > 0) {
    // Sadece ekleri temiz bir e-posta ile gönder
    GmailApp.sendEmail(config.FORWARD.TARGET_EMAIL, subject, config.FORWARD.BODY_TEXT, {
      attachments: pdfAttachments,
      name: config.FORWARD.SENDER_DISPLAY_NAME
    });
    Logger.log("PDF ekleri " + config.FORWARD.TARGET_EMAIL + " adresine iletildi.");
  } else {
    // PDF yoksa olduğu gibi yönlendir (Fallback)
    message.forward(config.FORWARD.TARGET_EMAIL, {
      subject: subject
    });
    Logger.log("PDF eki bulunamadı, e-posta doğrudan yönlendirildi.");
  }
}

/**
 * Google Tasks üzerinde hatırlatıcı oluşturur.
 */
function createReminderTask(thread, message, config) {
  var taskLists = Tasks.Tasklists.list();
  if (!taskLists.items) {
    Logger.log("Erişilebilir bir Görev Listesi bulunamadı.");
    return;
  }
  
  var defaultTaskListId = taskLists.items[0].id; // Varsayılan listenin ID'si

  var taskNotes = 
    `Gönderen: ${message.getFrom()}\n` +
    `Konu: ${message.getSubject()}\n` +
    `E-posta Linki: https://mail.google.com/mail/u/0/#all/${thread.getId()}\n\n` +
    `${config.TASK.NOTE_PREFIX}`;

  var task = Tasks.newTask();
  task.title = config.TASK.TITLE;
  task.notes = taskNotes;

  Tasks.Tasks.insert(task, defaultTaskListId);
  Logger.log("Google Task oluşturuldu.");
}
