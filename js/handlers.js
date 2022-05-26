import BadgesList from "./badgesList.js";
import Badge from "./badge.js";
import {generateUUID, getUserNodes} from "./commonFunctions.js";
import {congratsBadgeMakerPlaceholder, BadgeMakerPlaceholders, badgeTextMaxLength} from "./const.js";
import {addBadgesToUser, removeBadgeFromNode, removeBadgePanelsFromNode} from "./layoutFunctionsForBadges.js";


/**
 * Хэндлер нажатия на кнопку удаления бейджа.
 * Удаляет со страницы и из хранилища
 * бейджи с тем же uuid, что и у таргета
 * @param {Event} event
 */
export function handleRemoveBadgeButtonClick(event) {
  let badgeNode = event.target.parentNode.parentNode;
  let userId = badgeNode.dataset.belongsTo;
  let badgeUUID = badgeNode.dataset.uuid;

  removeBadgeFromNode(document, badgeUUID);

  // получаем из хранилища все бейджи пользователя
  chrome.storage.sync.get(userId, function(data) {
    let badgesList = new BadgesList(userId, data[userId]);
    if (!badgesList.items.length) return;  // если список бейджей пустой, то делать нам тут нечего

    // ищем бейдж с нужным UUID и удаяем его
    badgesList.removeBadge(badgeUUID);

    // заливаем в хранилище обновлённые данные
    chrome.storage.sync.set(badgesList.dto, function(){
      console.debug(`${userId} badges updated`);
    });
  });
}


/**
 * Хэндлер нажатия на кнопку выбора цвета.
 * Перекрашивает input и кнопку [+] на панели создания бейджа в выбранные цвета,
 * передаёт в датасет инпута выбранный цвет
 * @param {Event} event
 */
export function handleColorButtonClick(event) {
  let badgeColor = event.target.dataset.badgeColor;
  let badgeMakerPanel =  event.target.parentNode.parentNode;
  let inputNode = badgeMakerPanel.firstChild;
  for (let node of inputNode.childNodes) {
    switch (node.nodeName) {
      case "INPUT":
        node.className = `badge badge-${badgeColor}`;
        node.dataset.badgeColor = badgeColor;
        break;
      case "BUTTON":
        node.className = `badge badge-${badgeColor} add-badge-button`;
        break;
    }
  }
}


/**
 * Хэндлер нажатия кнопки добавления бейджа.
 * Отрабатывает по клику и нажатию enter
 * @param event
 */
export function handleAddBadgeButtonClick(event) {
  let addBadgePanel = event.target.closest(".add-badge-panel");
  let badgeTextInput = addBadgePanel.querySelector("input");
  let addBadgeButton = addBadgePanel.querySelector(".add-badge-button");

  // пасхалка: сбрасываем стили
  badgeTextInput.classList.remove("special");
  addBadgeButton.classList.remove("special");


  // отсеиваем все нажатия кроме enter
  if (event.type === 'keypress' && event.key !== 'Enter') {
    // TODO реализовать сохранение временного бейджа, чтобы при случайном пропадании попапа
    //  юзеру не требовалось создавать бейдж заново
    return;
  }

  let userId = badgeTextInput.dataset.belongsTo;
  let color = badgeTextInput.dataset.badgeColor;
  let text = badgeTextInput.value.slice(0, badgeTextMaxLength);

  // если текст пустой, то ругаемся
  if (badgeTextInput.value === '') {
    let currentPlaceholder = badgeTextInput.dataset.currentPlaceholder ?? 0;
    currentPlaceholder = (Number(currentPlaceholder) + 1) % BadgeMakerPlaceholders.length;
    badgeTextInput.placeholder = BadgeMakerPlaceholders[currentPlaceholder];
    badgeTextInput.dataset.currentPlaceholder = currentPlaceholder.toString(10);

    // пасхалка: когда доберёмся до нужной строки - включим чёрно-красное мигание
    if ([13, 14, 15, 16].includes(currentPlaceholder)) {
      badgeTextInput.classList.add("special");
      addBadgeButton.classList.add("special");
    }
    return;
  }

  // собираем бейдж, ставим его первым в списке бейджей, сохраняем обновлённый список бейджей
  let badge = new Badge(userId, text, color, generateUUID());
  chrome.storage.sync.get(userId, function(data) {
    if (chrome.runtime.error) {
      console.log("Runtime error");
      return;
    }

    let badgesList = new BadgesList(userId, data[userId]);
    badgesList.unshift(badge);

    chrome.storage.sync.set(badgesList.dto, function () {
      console.log("object stored");
    });

    // блоки с бейджами надо удалять и добавлять по новой для того, чтобы не поехала вёрстка
    removeBadgePanelsFromNode(document.body, userId);

    // добавляем бейджи пользователя снова
    let userNodes = getUserNodes(document.body, userId);
    for (let userNode of userNodes) {
      addBadgesToUser(userNode);
    }
  });

  // уведомляем пользователя о том, что бейдж добавлен
  badgeTextInput.value = '';
  badgeTextInput.dataset.currentPlaceholder = "0";
  badgeTextInput.placeholder = congratsBadgeMakerPlaceholder;
  setTimeout(() => { badgeTextInput.placeholder = BadgeMakerPlaceholders[0]; }, 1500);
}

