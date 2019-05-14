import { CalendarObject } from '@lion/calendar/test/test-utils.js';

// TODO: refactor CalendarObject to this approach (only methods when arguments are needed)
export class DatepickerInputObject {
  constructor(el) {
    this.el = el;
  }

  /**
   * Methods mimicing User Interaction
   */

  async openCalendar() {
    // Make sure the calendar is opened, not closed/toggled;
    this.overlayController.hide();
    this.invokerEl.click();
    return this.calendarEl ? this.calendarEl.updateComplete : false;
  }

  async selectMonthDay(day) {
    this.overlayController.show();
    await this.calendarEl.updateComplete;
    this.calendarObj.getDayEl(day).click();
    return true;
  }

  /**
   * Node references
   */

  get invokerEl() {
    return this.el._invokerElement;
  }

  get overlayEl() {
    return this.el._overlayCtrl._container && this.el._overlayCtrl._container.firstElementChild;
  }

  get overlayHeadingEl() {
    return this.overlayEl && this.overlayEl.shadowRoot.querySelector('.calendar-overlay__heading');
  }

  get overlayCloseButtonEl() {
    return this.calendarEl && this.overlayEl.shadowRoot.querySelector('#close-button');
  }

  get calendarEl() {
    return this.overlayEl && this.overlayEl.querySelector('#calendar');
  }

  /**
   * @property {CalendarObject}
   */
  get calendarObj() {
    return this.calendarEl && new CalendarObject(this.calendarEl);
  }

  /**
   * Object references
   */

  get overlayController() {
    return this.el._overlayCtrl;
  }
}
