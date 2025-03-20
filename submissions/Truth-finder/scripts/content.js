// scripts/content.js
console.log("Content script loaded");

/**
 * Запускаем автоматическое сканирование, когда DOM загружен.
 */
window.addEventListener('DOMContentLoaded', () => {
  console.log("Content script loaded, starting highlightFakeText...");
  highlightFakeText();
});

/**
 * Перебирает все абзацы на странице, проверяет их через Google Fact-Check Tools API
 * и подсвечивает «фейковые» абзацы.
 */
async function highlightFakeText() {
  const paragraphs = document.getElementsByTagName("p");
  for (const p of paragraphs) {
    const text = p.innerText.trim();
    if (text.length > 20) {
      const apiMessage = await checkFact(text);
      console.log("Paragraph:", text, "\nFact-check result:", apiMessage);

      if (isNegativeRating(apiMessage)) {
        p.style.backgroundColor = 'rgba(255, 0, 0, 0.2)';
        p.style.border = '1px solid red';
        p.title = "This section may contain false information.";
      }
    }
  }
}

/**
 * Обращается к Google Fact-Check Tools API
 */
async function checkFact(text) {
  const apiKey = 'AIzaSyCyPHv4YexcA5jQEG-IHdxDnkCufV1CW10';
  const endpoint = `https://factchecktools.googleapis.com/v1alpha1/claims:search?query=${encodeURIComponent(text)}&key=${apiKey}`;
  
  try {
    const response = await fetch(endpoint);
    if (!response.ok) {
      console.error('Fact-check API error:', response.statusText);
      return "Error calling Fact-check API: " + response.statusText;
    }
    const data = await response.json();
    
    let ratings = [];
    if (data.claims && data.claims.length > 0) {
      for (const claim of data.claims) {
        if (claim.claimReview && Array.isArray(claim.claimReview)) {
          for (const review of claim.claimReview) {
            if (review.textualRating) {
              ratings.push(review.textualRating);
            }
          }
        }
      }
    }
    if (ratings.length > 0) {
      return "Fact-check result: " + ratings.join("; ");
    } else {
      return "No fact-check reviews found. The selected text appears to be factual.";
    }
  } catch (error) {
    console.error('Error calling fact-check API:', error);
    return "Error calling Fact-check API.";
  }
}

/**
 * Проверяем, содержит ли результат «фейковые» ключевые слова.
 */
function isNegativeRating(message) {
  const negativeKeywords = [
    "false", "fake", "misleading", "mixture", "inaccurate",
    "partly false", "mostly false", "fabricated", "disinformation", "incorrect",
    "ложь", "частично ложь", "манипуляция", "подделка", "неправда",
    "неверно", "обман", "дезинформация"
  ];
  
  const lowerMsg = message.toLowerCase();
  return negativeKeywords.some((kw) => lowerMsg.includes(kw));
}

// Слушаем сообщения от background.js для показа уведомлений на странице.
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "showNotification" && request.message) {
    showInPageNotification(request.message);
  }
});

/**
 * Показывает уведомление прямо над выделенным текстом.
 * Уведомление остается на странице, пока пользователь не нажмет на крестик для его закрытия.
 *
 * @param {string} message Текст уведомления.
 */
function showInPageNotification(message) {
  // Получаем текущее выделение
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return;
  
  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();
  if (!rect || (rect.width === 0 && rect.height === 0)) return;
  
  // Абсолютные координаты относительно документа
  const absTop = rect.top + window.scrollY;
  const absLeft = rect.left + window.scrollX;

  // Приводим всё сообщение к нижнему регистру для проверки
  const lowerMessage = message.toLowerCase();

  // Расширенные списки ключевых слов
  const noReviewsKeywords = [
    "no fact-check reviews found",
    "no data found",
    "отсутствуют фактчек-обзоры"
  ];

  const negativeKeywords = [
    "false", "fake", "misleading", "mixture", "inaccurate", "partly false",
    "mostly false", "fabricated", "disinformation", "incorrect",
    "ложь", "частично ложь", "манипуляция", "подделка", "неправда",
    "неверно", "обман", "дезинформация", "не соответствует действительности"
  ];

  const positiveKeywords = [
    "true", "accurate", "correct", "real", "reliable", "mostly true",
    "правда", "точный", "достоверный", "верный", "подтверждено",
    "правдивый", "соответствует действительности"
  ];

  // Определяем фон уведомления в зависимости от сообщения
  let bgStyle = 'linear-gradient(135deg, #555555, #333333)'; // темно-серый по умолчанию
  
  if (noReviewsKeywords.some((kw) => lowerMessage.includes(kw))) {
    // Используем темно-серый градиент, который не содержит белых оттенков
    bgStyle = 'linear-gradient(135deg, #555555, #333333)';
  } else if (negativeKeywords.some((kw) => lowerMessage.includes(kw))) {
    // Красный градиент для фейка
    bgStyle = 'linear-gradient(135deg, #ff416c, #ff4b2b)';
  } else if (positiveKeywords.some((kw) => lowerMessage.includes(kw))) {
    // Зеленый градиент для достоверного утверждения
    bgStyle = 'linear-gradient(135deg, #00b09b, #96c93d)';
  } else {
    // Если ничего не подошло, оставляем темно-серый
    bgStyle = 'linear-gradient(135deg, #555555, #333333)';
  }
  
  // Создаем элемент уведомления
  const notification = document.createElement('div');
  notification.className = 'inpage-notification';
  notification.style.position = 'absolute';
  notification.style.padding = '12px 20px';
  notification.style.background = bgStyle;
  notification.style.color = '#fff';
  notification.style.borderRadius = '8px';
  notification.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
  notification.style.fontFamily = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
  notification.style.fontSize = '15px';
  notification.style.zIndex = '10000';
  notification.style.opacity = '1';
  notification.style.transition = 'opacity 0.3s ease-in-out';
  
  // Создаем кнопку закрытия (крестик)
  const closeButton = document.createElement('span');
  closeButton.innerHTML = "&times;";
  closeButton.style.cursor = "pointer";
  closeButton.style.fontWeight = "bold";
  closeButton.style.fontSize = "18px";
  closeButton.style.color = "#fff";
  closeButton.style.position = "absolute";
  closeButton.style.top = "5px";
  closeButton.style.right = "8px";
  closeButton.addEventListener('click', () => {
    notification.remove();
  });
  notification.appendChild(closeButton);
  
  // Контейнер для текста уведомления
  const messageNode = document.createElement('div');
  messageNode.style.marginTop = "30px"; // отступ, чтобы не перекрывать кнопку закрытия
  messageNode.textContent = message;
  notification.appendChild(messageNode);
  
  document.body.appendChild(notification);
  const notifHeight = notification.offsetHeight;
  
  // Позиционируем уведомление над выделенным текстом с отступом 10px.
  let topPos = absTop - notifHeight - 10;
  if (topPos < window.scrollY) {
    topPos = absTop + rect.height + 10;
  }
  notification.style.top = topPos + "px";
  notification.style.left = absLeft + "px";
}


