"use strict";

import {getUserId} from "./js/common_functions.js";
import {placeBadgesToUserNode} from "./js/badges_functions.js";
import {getBadgeMakerPanel} from "./js/popup_panels.js";
import BadgesList from "./js/badgesList.js";


/**
 * Добавляет панели создания бейджей в переданную ноду
 * @param node
 */
function addBadgeMakerPanelsToNode(node) {
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


/**
 * Собирает из переданной ноды все ноды, принадлежащие пользователю
 * @param 							 node						нода, в которой производится поиск
 * @param {String, null} userIdFilter имя искомого пользователя
 * @returns {*[]}                       массив найденных нод. Если задан userIdFilter, то ноды фильтруются по юзернейму
 */
export function getUserNodes(node, userIdFilter = null) {
	let userNickNodes = node.querySelectorAll(".user__nick[data-profile=\"true\"], .comment__user[data-profile=\"true\"]");
	let userProfileNodes = node.querySelectorAll(".profile[data-user-id]");
	let allNodes = [...userNickNodes].concat(...userProfileNodes);

	if (!userIdFilter) {
		return allNodes;
	}
	return allNodes.filter(node => getUserId(node) === userIdFilter);
}


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
	if (!userId) {
		return;
	}

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

/**
 * Коллбэк для обработки изменений страницы.
 * На лету добавляет/удаляет бейджи и панели создания бейджей
 * @param mutationsList
 * @param observer
 */
const updateDOMCallback = function(mutationsList, observer) {

	for (let mutation of mutationsList) {
		// проверяем, что это изменение структуры страницы
		if (mutation.type !== 'childList') {
			continue;
		}

		for (let node of mutation.addedNodes) {
			// отсекаем текст
			if (node.nodeName === "#text") {
				continue;
			}

			// добавляем бейджи
			addBadgesToNode(node);
			// добавляем панели создания бейджей
			addBadgeMakerPanelsToNode(node);
		}


		for (let node of mutation.removedNodes) {
			// отсекаем текст
			if (node.nodeName === "#text") {
				continue;
			}

			// удаляем панель быстрого добавления бейджей
			// (при быстром вызове попапа профиля пользователя панель могла добавиться несколько раз)
			let profilePopupBadgePanels = node.getElementsByClassName("add-badge-panel");
			for (let profilePopupBadgePanel of profilePopupBadgePanels) {
				profilePopupBadgePanel.remove();
				console.debug("Badge panel removed");
			}

			// удаляем блок с бейджами
			// (при быстром вызове попапа профиля пользователя блок мог добавиться несколько раз)
			removeBadgePanelsFromNode(node);

		}
	}
}



export function main() {
	// function addBadgesToDOM() {
	// 	addBadgesToNode(document)
	// }
	// initStorage();
	// chrome.storage.sync.clear(function () {
	// 	console.debug("Storage clear");
	// });
	// добавляем бейджи
	addBadgesToNode(document);
	// добавляем панели создания бейджей
	addBadgeMakerPanelsToNode(document);


		const targetNode = document.body;  									   // Select the node that will be observed for mutations
		const config = {attributes: false, childList: true, subtree: true};  // Options for the observer (which mutations to observe)
		const observer = new MutationObserver(updateDOMCallback);              // Create an observer instance linked to the callback function
		observer.observe(targetNode, config);  					   			   // Start observing the target node for configured mutations

	// Later, you can stop observing
	// observer.disconnect();
}