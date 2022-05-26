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
    if (err.name === 'TypeError') {
      return null;
    }
    throw err;
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

  if (!userIdFilter) return allNodes;
  else return allNodes.filter(node => getUserId(node) === userIdFilter);
}


export function initStorage() {
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