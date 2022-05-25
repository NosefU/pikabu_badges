import {Badge} from "./badges_functions.js";

export function generateUUID() { // Public Domain/MIT
  let d = new Date().getTime();   //Timestamp
  let d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now()*1000)) || 0;//Time in microseconds since page-load or 0 if unsupported
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    let r = Math.random() * 16;  //random number between 0 and 16
    if(d > 0){  //Use timestamp until depleted
      r = (d + r)%16 | 0;
      d = Math.floor(d/16);
    } else {  //Use microseconds since page-load if supported
      r = (d2 + r)%16 | 0;
      d2 = Math.floor(d2/16);
    }
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}


/**
 * Вытаскивает юзернейм из переданной ноды пользователя
 * @param userNode
 * @returns {string|null}
 */
export function getUserId(userNode) {
  try {
    return userNode.dataset.id ?? userNode.dataset.userId ?? null;
  }
  catch (err) {
    if (err.name === 'TypeeError'){
      return null;
    }
    throw err;
  }

  // // если нода - заголовок профиля
  // if (userNode.classList.contains("profile__nick-wrap") || userNode.classList.contains("profile__user")) {
  //   let usernameNodes = userNode.getElementsByClassName("profile__nick");
  //
  //   return usernameNodes[0].textContent.trim();
  // }
  //
  // //если нода - заголовок поста
  // if (userNode.nodeName === "A") {
  //   return userNode.getAttribute("data-name");
  // }
  //
  // // если нода - заголовок коммента
  // if (userNode.nodeName === "SPAN" ) {
  //   return userNode.textContent.trim();
  // }
  //
  // return null;
}


export function initStorage() {

  // let userId = "Soldatudaci";
  // let grayBadge = new Badge(userId, "бейдж серый", "gray", generateUUID());
  // let yellowBadge = new Badge(userId, "бейдж желтый", "yellow", generateUUID());
  // let greenBadge = new Badge(userId, "бейдж зелёный","green", generateUUID());
  // let redBadge = new Badge(userId, "бейдж красный", "red", generateUUID());
  // let zBadge = new Badge(userId, "Z", "red", generateUUID());
  // let blueBadge = new Badge(userId, "бейдж голубой", "blue", generateUUID());
  // let stdBadge = new Badge(userId, "стандартный бейдж", null, generateUUID());
  //
  //
  // let badgesList = [grayBadge, yellowBadge, greenBadge, redBadge, blueBadge, stdBadge];
  // // let badgesList = [zBadge, ];
  //
  // chrome.storage.sync.set({[userId]: badgesList},function(){
  //    console.log("object stored");
  // });


  let siteThemeSettings = window.localStorage['pkb_theme'];
  let darkTheme = false;
  if (siteThemeSettings && siteThemeSettings['d']) {
    darkTheme = true;
  }
}


function getAbsoluteHeight(el) {
  // Get the DOM Node if you pass in a string
  el = (typeof el === 'string') ? document.querySelector(el) : el;

  let styles = window.getComputedStyle(el);
  let margin = parseFloat(styles['marginTop']) +
    parseFloat(styles['marginBottom']);

  return Math.ceil(el.offsetHeight + margin);
}