import BadgesList from "./badgesList.js";

export class Badge {
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
    if (!this.color) {
      badge.classList.add("badge-light-gray");
    }
    else {
      badge.classList.add("badge-" + this.color);
    }

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


/**
 * Хэндлер нажатия на кнопку удаления бейджа.
 * Удаляет со страницы и из хранилища
 * бейджи с тем же uuid, что и у таргета
 * @param {Event} event
 */
function handleRemoveBadgeButtonClick(event) {
  let badgeNode = event.target.parentNode.parentNode;
  let userId = badgeNode.dataset.belongsTo;
  let badgeUUID = badgeNode.dataset.uuid;

  removeBadgeFromNode(document, badgeUUID);

  // получаем из хранилища все бейджи пользователя
  chrome.storage.sync.get(userId, function(data) {
    if (!data[userId] || data[userId].length === 0) {
      return;
    }
    let badgesList = new BadgesList(userId, data[userId]);

    // ищем бейдж с нужным UUID и удаяем его
    badgesList.removeBadge(badgeUUID);

    // заливаем в хранилище обновлённые данные
    chrome.storage.sync.set(badgesList.dto, function(){
      console.debug(`${userId} badges updated`);
    });
  });
}


/**
 * Удаляет из переданной ноды бейджи с переданным uuid
 * @param {Document, HTMLElement} node      Нода, уз которой нужно удалить бейджи
 * @param {String}                badgeUUID UUID бейджа, который нужно удалить
 */
export function removeBadgeFromNode(node, badgeUUID) {
  let badges = node.querySelectorAll(`[data-uuid="${badgeUUID}"]`);
  for (let badge of badges) {
    badge.remove()
  }
}


/**
 * Ставит панель с бейджами в ноду пользователя
 * @param userNode
 * @param badgesList {BadgesList}
 */
export function placeBadgesToUserNode(userNode, badgesList) {
  // если нода - заголовок профиля
  if (userNode.classList.contains("profile")) {
    // если нода находится в попапе
    if (userNode.parentNode.classList.contains("popup__content")) {
      let targetNode = userNode.querySelector(".profile__nick");
      targetNode.insertAdjacentElement("afterend", badgesList.node);
    }
    // если нода находится на странице профиля
    else {
      let targetNode = userNode.querySelector(".profile__nick-wrap");
      targetNode.parentNode.style.justifyContent = "flex-start";
      targetNode.parentNode.style.alignItems = "flex-end";
      targetNode.insertAdjacentElement("afterend", badgesList.node);
    }
    return;
  }

  // если нода находится в лучшем комменте
  if (userNode.parentNode.parentNode.parentNode.classList.contains("comment_best")) {
    userNode.parentNode.insertAdjacentElement("afterend", badgesList.node);
    return;
  }

  // если суммарная длина всех бейджей не превышает 35 символов, то ставим их сразу после никнейма
  if (badgesList.node.textContent.length <= 35) {
    userNode.insertAdjacentElement("afterend", badgesList.node);
    return;
  }

  // если суммарная длина всех бейджей больше 35 символов, то кладём их под панель с никнеймом
  if (userNode.classList.contains("comment__user")) {
    userNode.parentNode.insertAdjacentElement("afterend", badgesList.node);
  }
  else {
    userNode.parentNode.parentNode.insertAdjacentElement("afterend", badgesList.node);
  }
}