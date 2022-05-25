import {Badge} from "./badges_functions.js";

export default class BadgesList {
  /**
   * @param userId {string, number}   user id
   * @param items  {Badge[], object[], undefined} список бейджей, либо объектов с полями userId, text, color, uuid
   */
  constructor(userId, items) {
    this.userId = userId.toString(10);
    if (items === undefined) {
      this.items = [];
      return;
    }
    // TODO проверять наличие полей у объектов
    this.items = items.map((badgeParams) => Object.assign(new Badge(), badgeParams));
  }


  /**
   * Удаляет из своего списка бейдж с переданным uuid
   * @param {string} badgeUUID
   */
  removeBadge(badgeUUID){
    let badgeIndex = this.items.findIndex( (badge) => {
      return badge.uuid === badgeUUID;
    });
    if (badgeIndex !== -1) {
      this.items.splice(badgeIndex, 1);
    }
  }


  unshift(...newItems) {
    // TODO проверять наличие полей у объектов
    for (let item of newItems) {
      if (!(item instanceof Badge)) {
        throw item + "is not Badge object"
      }
    }
    return this.items.unshift(...newItems);
  }


  push(...newItems) {
    // TODO проверять наличие полей у объектов
    for (let item of newItems) {
      if (!(item instanceof Badge)) {
        throw item + " is not Badge object"
      }
    }
    return this.items.push(...newItems);
  }


  /**
   * Возвращает объект вида {userId: [...Badge]}, который можно сразу сохранить в хранилище хрома
   * @returns {{[p: string]: Badge[]}}
   */
  get dto() {
    return{[this.userId]: this.items};
  }


  get node() {
    let badgesPanel = document.createElement("div");
    badgesPanel.classList.add("badges-panel");
    badgesPanel.dataset.belongsTo = this.userId;

    if (this.items.length === 0) {
      return badgesPanel;
    }

    for (let badge of this.items){
      badgesPanel.appendChild(badge.node);
    }
    return badgesPanel;
  }
}