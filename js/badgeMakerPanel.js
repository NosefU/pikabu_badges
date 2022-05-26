import {handleColorButtonClick, handleAddBadgeButtonClick} from "./handlers.js";
import {buttonColors, defaultColor, inputPlaceholders} from "./const.js";


/**
 * Собирает и возвращает панель создания бейджа
 * @param {string} userId id пользователя, для которого делается панель создания бейджа
 * @returns {HTMLDivElement}
 */
export function getBadgeMakerPanel(userId) {
  // создаём панель
  let profilePopupBadgePanel = document.createElement("div");
  profilePopupBadgePanel.classList.add("profile__section", "profile__section_non-border", "add-badge-panel");

  // создаём текстовое поле для ввода заметки
  let inputDiv = document.createElement("div");
  let badgeTextInput = document.createElement("input");
  badgeTextInput.className = `badge badge-${defaultColor}`;
  badgeTextInput.dataset.badgeColor = defaultColor;
  badgeTextInput.dataset.belongsTo = userId;
  badgeTextInput.placeholder = inputPlaceholders[0];
  badgeTextInput.addEventListener("keypress", handleAddBadgeButtonClick);

  // создаём кнопку добавления заметки
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
    button.addEventListener("click", handleColorButtonClick);
    colorSelectorDiv.appendChild(button);
  }

  profilePopupBadgePanel.appendChild(colorSelectorDiv);
  return profilePopupBadgePanel;
}