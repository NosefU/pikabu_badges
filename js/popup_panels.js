import {Badge} from "./badges_functions.js";
import {generateUUID} from "./common_functions.js";
import {addBadgesToUser, getUserNodes, removeBadgePanelsFromNode} from "../content_main.js";
import BadgesList from "./badgesList.js";

const defaultColor = "light-gray";
const buttonColors = ["light-gray", "blue", "red", "green", "yellow", "gray"];
const inputPlaceholders = ["Нажмите, чтобы ввести заметку о пользователе", "Сначала что-нибудь напишите"]


/**
 * Хэндлер перекрашивает input и кнопку добавления бейджа,
 * передаёт в датасет инпута цвет
 * @param {Event} event
 */
function handleColorButtonClick(event) {
  let badgeColor = event.target.dataset.badgeColor;
  let profilePopupBadgePanel =  event.target.parentNode.parentNode;
  let inputNode = profilePopupBadgePanel.firstChild
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
function handleAddBadgeButtonClick(event) {
  // отсеиваем все нажатия кроме enter
  if (event.type === 'keypress' && event.key !== 'Enter') {
    return;
  }

  let addBadgePanel = event.target.closest(".add-badge-panel");
  let badgeTextInput = addBadgePanel.querySelector("input");
  let userId = badgeTextInput.dataset.belongsTo;
  let color = badgeTextInput.dataset.badgeColor;
  let text = badgeTextInput.value;

  // если текст пустой, то ругаемся
  if (badgeTextInput.value === '') {
    badgeTextInput.placeholder = inputPlaceholders[1];
    return;
  }

  // собираем бейдж и ставим его первым в списке бейджей
  let badge = new Badge(userId, text, color, generateUUID());
  chrome.storage.sync.get(userId, function(data) {
    if (chrome.runtime.error) {
      console.log("Runtime error");
      return;
    }

    let badgesList = new BadgesList(userId, data[userId]);
    badgesList.unshift(badge);

    // let badgesPanel = new BadgesList(badgesList);
    // badgesPanel.unshift('2');
    // badgesPanel.unshift(3, 4);

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
  badgeTextInput.placeholder = "Заметка добавлена";
  setTimeout(() => { badgeTextInput.placeholder = inputPlaceholders[0]; }, 1500);
}


/**
 * Собирает и возвращает панель создания бейджа
 * @param {string} userId id пользователя, для которого делается панель создания бейджа
 * @returns {HTMLDivElement}
 */
export function getBadgeMakerPanel(userId) {
  // создаём панель
  let profilePopupBadgePanel = document.createElement("div");
  profilePopupBadgePanel.classList.add("profile__section", "profile__section_non-border", "add-badge-panel");

  // создаём текстовое поле и кнопку для ввода заметки
  let inputDiv = document.createElement("div");
  let badgeTextInput = document.createElement("input");
  badgeTextInput.className = `badge badge-${defaultColor}`;
  badgeTextInput.dataset.badgeColor = defaultColor;
  badgeTextInput.dataset.belongsTo = userId;
  badgeTextInput.placeholder = inputPlaceholders[0];
  badgeTextInput.addEventListener("keypress", handleAddBadgeButtonClick);


  let addBadgeButton = document.createElement("button");
  addBadgeButton.classList.add("badge", `badge-${defaultColor}`, "add-badge-button");
  addBadgeButton.innerHTML = '<i class="fa-solid fa-square-plus"></i>';
  addBadgeButton.addEventListener("click", handleAddBadgeButtonClick);

  inputDiv.appendChild(badgeTextInput);
  inputDiv.appendChild(addBadgeButton);
  profilePopupBadgePanel.appendChild(inputDiv);

  // собираем селектор цвета
  let colorSelectorDiv = document.createElement("div");
  colorSelectorDiv.classList.add("badge_color_selector");

  for (let buttonColor of buttonColors) {
    let button = document.createElement("button");
    button.classList.add("badge", "badge-" + buttonColor);
    button.dataset.badgeColor = buttonColor;
    // создаём eventListener для каждой кнопки
    button.addEventListener("click", handleColorButtonClick);

    colorSelectorDiv.appendChild(button);

  }
  profilePopupBadgePanel.appendChild(colorSelectorDiv);
  return profilePopupBadgePanel;
}