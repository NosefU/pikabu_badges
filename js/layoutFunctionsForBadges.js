/**
 * Функции бейджей для работы с DOM-деревом
 */

import {getUserId, getUserNodes} from "./commonFunctions.js";
import BadgesList from "./badgesList.js";


/**
 * Добавляет бейджи ко всем пользователям, что находятся в переданной ноде, если не задан userIdFilter
 * @param node
 * @param {String, null} userIdFilter
 */
export function addBadgesToNode(node, userIdFilter = null) {
  let userNodes = getUserNodes(node, userIdFilter);
  for (let userNode of userNodes) {
    addBadgesToUser(userNode);
  }
}


/**
 * Достаёт из хранилища и добавляет бейджи в конкретную/отдельную ноду пользователя
 * @param node
 */
export function addBadgesToUser(node) {
  let userId = getUserId(node);
  if (!userId) return;  // если нет userId, то делать нам тут нечего

  chrome.storage.sync.get(userId, function(data) {
    if (chrome.runtime.error) {
      console.error("Runtime error");
      return;
    }

    let badgesList = new BadgesList(userId, data[userId]);
    if (!badgesList.items.length) {
      console.debug(`No badges for user ${userId}`);
      return;
    }

    placeBadgesToUserNode(node, badgesList);
  });
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
 * Удаляет блоки с бейджами из переданной ноды, принадлежащие выбранному пользователю,
 * либо всем пользователям в ноде, если userIdFilter не задан
 * @param node
 * @param userIdFilter
 */
export function removeBadgePanelsFromNode(node, userIdFilter = null) {
  let badgePanels;
  if (userIdFilter){
    badgePanels = node.querySelectorAll(`[class=badges-panel][data-belongs-to="${userIdFilter}"]`);
  }
  else {
    badgePanels = node.getElementsByClassName("badges-panel");
  }
  for (let badgePanel of badgePanels) {
    badgePanel.remove();
    console.debug("Badges removed");
  }
}

