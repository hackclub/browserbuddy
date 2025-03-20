// background.js

/**
 * Checks a given text by querying the Google Fact-Check Tools API.
 * Returns a string message based on the API response.
 *
 * @param {string} text The text to be fact-checked.
 * @returns {Promise<string>} A message with the fact-check result.
 */
async function checkFact(text) {
    // Замените на ваш действительный API-ключ (в виде строки)
    const apiKey = 'AIzaSyCyPHv4YexcA5jQEG-IHdxDnkCufV1CW10';
    const endpoint = `https://factchecktools.googleapis.com/v1alpha1/claims:search?query=${encodeURIComponent(text)}&key=${apiKey}`;
    
    try {
      const response = await fetch(endpoint);
      if (!response.ok) {
        console.error('Fact-check API error:', response.statusText);
        return "Error calling Fact-check API: " + response.statusText;
      }
      const data = await response.json();
      console.log('Fact-check API response data:', data);
    
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
        // Объединяем все найденные текстовые рейтинги через точку с запятой
        return "Fact-check result: " + ratings.join("; ");
      } else {
        return "No fact-check reviews found. The selected text appears to be factual.";
      }
    } catch (error) {
      console.error('Error calling fact-check API:', error);
      return "Error calling Fact-check API.";
    }
  }
    
  // Удаляем предыдущие пункты контекстного меню и создаём новый
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: "checkSelectedText",
      title: "Check selected text for fakeness",
      contexts: ["selection"]
    });
  });
    
  // Обработчик клика по пункту контекстного меню
  chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId === "checkSelectedText" && info.selectionText) {
      const apiMessage = await checkFact(info.selectionText);
        
      try {
        if (!tab?.id) {
          throw new Error('Invalid tab');
        }
    
        // Пытаемся отправить сообщение напрямую
        try {
          await chrome.tabs.sendMessage(tab.id, {
            action: "showNotification",
            message: apiMessage
          });
          console.log("Message sent successfully");
        } catch (messageError) {
          // Если отправка не удалась, инжектируем content script и повторяем попытку
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['scripts/content.js']
          });
    
          // Даём небольшую паузу для загрузки скрипта
          await new Promise(resolve => setTimeout(resolve, 100));
    
          // Повторяем отправку сообщения
          await chrome.tabs.sendMessage(tab.id, {
            action: "showNotification",
            message: apiMessage
          });
        }
      } catch (error) {
        console.error("Error in message handling:", error);
      }
    }
  });
  