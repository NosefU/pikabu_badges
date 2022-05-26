import Badge from "./badge.js";

// TODO возможно стоит реализовать фабрику,
//  которая принимает userId и возвращает готовый список бейджей

// TODO также возможно стоит геттер dto заменить на полноценный метод save()


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

    if (badgeIndex !== -1) this.items.splice(badgeIndex, 1);
  }

  // работает аналогично Array.prototype.unshift()
  unshift(...newItems) {
    // TODO проверять наличие полей у объектов
    for (let item of newItems) {
      if (!(item instanceof Badge)) {
        throw item + " is not Badge object"
      }
    }
    return this.items.unshift(...newItems);
  }

 // работает аналогично Array.prototype.push()
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


  /**
   * Формирует ноду с бейджами пользователя
   * @returns {HTMLDivElement}
   */
  get node() {
    let badgesPanel = document.createElement("div");
    badgesPanel.classList.add("badges-panel");
    badgesPanel.dataset.belongsTo = this.userId;

    for (let badge of this.items){
      badgesPanel.appendChild(badge.node);
    }
    return badgesPanel;
  }
}