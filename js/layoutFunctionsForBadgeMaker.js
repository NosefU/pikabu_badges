import {getUserId} from "./commonFunctions.js";
import {getBadgeMakerPanel} from "./badgeMakerPanel.js";


/**
 * Добавляет панели создания бейджей в переданную ноду
 * @param node
 */
export function addBadgeMakerPanelsToNode(node) {
  let profileNodes = node.querySelectorAll(".profile[data-user-id]");
  for (let profileNode of profileNodes) {
    let userId = getUserId(profileNode);
    let badgeMakerPanel = getBadgeMakerPanel(userId);

    // если нода - попап
    if (profileNode.parentNode.classList.contains("popup__content")) {
      let targetNode = profileNode.querySelector(".profile__user");
      targetNode.insertAdjacentElement("afterend", badgeMakerPanel);
    }
    // если нода - заголовок профиля
    else {
      let targetNode = profileNode.querySelector('[class="profile__section"]');
      targetNode.insertAdjacentElement("afterend", badgeMakerPanel);
    }
  }
}