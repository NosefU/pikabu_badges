import {handleRemoveBadgeButtonClick} from "./handlers.js";

export default class Badge {
  /**
   * @param userId {String} Имя пользователя
   * @param text   {String} Текст бейджа
   * @param color  {String} Цвет бейджа, брать из content.css, "badge-" отбрасывать
   * @param uuid   {String} Уникальный идентификатор бейджа. Нужен для корректного хранения и удаления бейджа
   */
  constructor(userId, text, color, uuid) {
    this.userId = userId;
    this.text = text;
    this.color = color;
    this.uuid = uuid;
  }

  /**
   * Собирает и возвращает ноду бейджа
   * @returns {HTMLDivElement}
   */
  get node() {
    let badge = document.createElement("div");
    badge.classList.add("badge");
    badge.dataset.uuid = this.uuid;
    badge.dataset.belongsTo = this.userId;

    // если не указан цвет, то ставим дефолтный
    if (!this.color) badge.classList.add("badge-light-gray");
    else  badge.classList.add("badge-" + this.color);

    let badgeText = document.createElement("span");
    badgeText.classList.add('badge-text');
    badgeText.textContent = this.text;

    let removeButton = document.createElement("i");
    removeButton.classList.add("fa-solid", "fa-trash");
    removeButton.addEventListener("click", handleRemoveBadgeButtonClick)

    let hideWrapper = document.createElement("span");
    hideWrapper.classList.add("hide");
    hideWrapper.appendChild(removeButton);

    badge.appendChild(badgeText);
    badge.appendChild(hideWrapper);

    return badge;
  }
}