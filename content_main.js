"use strict";

import {addBadgesToNode, removeBadgePanelsFromNode} from "./js/layoutFunctionsForBadges.js";
import {addBadgeMakerPanelsToNode} from "./js/layoutFunctionsForBadgeMaker.js";

/**
 * Коллбэк для обработки изменений страницы.
 * На лету добавляет/удаляет бейджи и панели создания бейджей
 * @param mutationsList
 * @param observer
 */
const updateDOMCallback = function(mutationsList, observer) {
	for (let mutation of mutationsList) {
		if (mutation.type !== 'childList')	continue;  // проверяем, что это изменение структуры страницы

		for (let node of mutation.addedNodes) {		// сначала проходим по добавленным нодам
			if (node.nodeName === "#text") continue;  // отсекаем текст
			addBadgesToNode(node);  // добавляем бейджи
			addBadgeMakerPanelsToNode(node);  // добавляем панели создания бейджей
		}

		// проходим по удаляемым нодам
		for (let node of mutation.removedNodes) {
			if (node.nodeName === "#text") continue;  // отсекаем текст

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
	addBadgesToNode(document);  // добавляем бейджи
	addBadgeMakerPanelsToNode(document);  // добавляем панели создания бейджей

	// формируем зависимости для MutationObserver
	const targetNode = document.body;  // определяем ноду, мутации которой будем отслеживать
	const config = {childList: true, subtree: true};  // конфиг обсервера

	const observer = new MutationObserver(updateDOMCallback);
	observer.observe(targetNode, config);  // запускаем отслеживание изменений ноды
}