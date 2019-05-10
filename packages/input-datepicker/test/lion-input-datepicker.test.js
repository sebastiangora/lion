/* eslint-env mocha */
/* eslint-disable no-unused-expressions, no-template-curly-in-string, no-unused-vars */
// TODO: enable linting again when proper imports can be done
/* eslint-disable */
import { expect, fixture, aTimeout } from '@open-wc/testing';
import { localizeTearDown } from '@lion/localize/test-helpers.js';
import { html } from '@lion/core';
import {
  maxDateValidator,
  minDateValidator,
  minMaxDateValidator,
  disabledDatesValidator,
} from '@lion/validate';
import { keyCodes } from '@lion/overlays/src/utils/key-codes.js';
import { keyUpOn } from '@polymer/iron-test-helpers/mock-interactions.js';
import { isSameDate } from '@lion/calendar/src/utils/isSameDate.js';
import { DatepickerInputObject } from './test-utils.js';
import '../lion-input-datepicker.js';
import { LionInputDatepicker } from '../src/LionInputDatepicker.js';

describe('<lion-input-datepicker>', () => {
  beforeEach(() => {
    localizeTearDown();
  });

  describe('Calendar Overlay', () => {
    it('implements calendar-overlay Style component', async () => {
      const el = await fixture(html`
        <lion-input-datepicker></lion-input-datepicker>
      `);
      const elObj = new DatepickerInputObject(el);
      await elObj.openCalendar();

      expect(elObj.overlayEl.shadowRoot.querySelector('.calendar-overlay')).not.to.equal(null);
      expect(elObj.overlayEl.shadowRoot.querySelector('.calendar-overlay__header')).not.to.equal(
        null,
      );
      expect(elObj.overlayEl.shadowRoot.querySelector('.calendar-overlay__heading')).not.to.equal(
        null,
      );
      expect(
        elObj.overlayEl.shadowRoot.querySelector('.calendar-overlay__close-button'),
      ).not.to.equal(null);
    });

    // TODO: this should be implemented as option in the ModalDialogController?
    it.skip('activates full screen mode on mobile screens', async () => {
      // TODO: should this be part of globalOverlayController as option?
    });

    // TODO: still add all translations
    it.skip('has a close button, with a tooltip "Close"', async () => {
      const el = await fixture(html`
        <lion-input-datepicker></lion-input-datepicker>
      `);
      const elObj = new DatepickerInputObject(el);
      await elObj.openCalendar();
      // Since tooltip not ready, use title which can be progressively enhanced in extension layers.
      expect(elObj.overlayCloseButtonEl.getAttribute('title')).to.equal('Close');
      expect(elObj.overlayCloseButtonEl.getAttribute('aria-label')).to.equal('Close');
    });

    it('has a default title based on input label', async () => {
      const el = await fixture(html`
        <lion-input-datepicker
          .label="${'Pick your date'}"
          .modelValue="${new Date('2020-02-15')}"
        ></lion-input-datepicker>
      `);
      const elObj = new DatepickerInputObject(el);
      await elObj.openCalendar();
      expect(
        elObj.overlayHeadingEl.querySelector('slot[name="heading"]').assignedNodes()[0],
      ).lightDom.to.equal('Pick your date');
    });

    it('can have a custom heading', async () => {
      const el = await fixture(html`
        <lion-input-datepicker
          label="Pick your date"
          calendar-heading="foo"
        ></lion-input-datepicker>
      `);
      const elObj = new DatepickerInputObject(el);
      await elObj.openCalendar();
      expect(
        elObj.overlayHeadingEl.querySelector('slot[name="heading"]').assignedNodes()[0],
      ).lightDom.to.equal('foo');
    });

    /**
     * Not in scope:
     * - centralDate can be overridden
     */
  });

  describe('Input synchronization', () => {
    it('adds invoker button for calendar overlay as suffix slot that toggles the overlay on click', async () => {
      const el = await fixture(html`
        <lion-input-datepicker></lion-input-datepicker>
      `);
      const elObj = new DatepickerInputObject(el);
      expect(elObj.invokerEl).not.to.equal(null);
      expect(elObj.overlayController.isShown).to.be.false;
      await elObj.openCalendar();
      expect(elObj.overlayController.isShown).to.equal(true);
    });

    // Relies on delegation of disabled property to invoker.
    // TODO: consider making this (delegation to interactive child nodes) generic functionality
    // inside LionField/FormControl. Or, for maximum flexibility, add a config attr
    // to the invoker node
    it('disabled flag also disables the datepicker invoker', async () => {
      const el = await fixture(html`
        <lion-input-datepicker disabled></lion-input-datepicker>
      `);
      const elObj = new DatepickerInputObject(el);
      expect(elObj.overlayController.isShown).to.equal(false);
      await elObj.openCalendar();
      expect(elObj.overlayController.isShown).to.equal(false);
    });

    it('syncs modelValue with lion-calendar', async () => {
      const myDate = new Date('2019/06/15');
      const myOtherDate = new Date('2019/06/28');
      const el = await fixture(html`
        <lion-input-datepicker .modelValue="${myDate}"></lion-input-datepicker>
      `);
      const elObj = new DatepickerInputObject(el);
      await elObj.openCalendar();
      expect(elObj.calendarEl.selectedDate).to.equal(myDate);
      await elObj.selectMonthDay(myOtherDate.getDate());
      expect(isSameDate(el.modelValue, myOtherDate)).to.be.true;
    });

    // TODO: introduce event user-selected-date-changed
    it.skip('closes the calendar overlay on "user-selected-date-changed"', async () => {
      const el = await fixture(html`
        <lion-input-datepicker></lion-input-datepicker>
      `);
      const elObj = new DatepickerInputObject(el);
      // Make sure the calendar overlay is opened
      await elObj.openCalendar();
      expect(elObj.overlayController.isShown).to.equal(true);
      // Mimic user input: should fire the 'user-selected-date-changed' event
      elObj.calendarEl.dispatchEvent(new CustomEvent('user-selected-date-changed'));
      expect(elObj.overlayController.isShown).to.equal(false);
    });

    // TODO: fix the Overlay system, so that the backdrop/body cannot be focused
    it.skip('closes the calendar on [esc] key', async () => {
      const el = await fixture(html`
        <lion-input-datepicker></lion-input-datepicker>
      `);
      const elObj = new DatepickerInputObject(el);
      await elObj.openCalendar();
      expect(elObj.overlayController.isShown).to.equal(true);
      // Mimic user input: should fire the 'selected-date-changed' event
      // Make sure focus is inside the calendar/overlay
      keyUpOn(elObj.calendarEl, keyCodes.escape);
      expect(elObj.overlayController.isShown).to.equal(false);
    });

    it('focuses interactable date on opening of calendar', async () => {
      const el = await fixture(html`
        <lion-input-datepicker></lion-input-datepicker>
      `);
      const elObj = new DatepickerInputObject(el);
      await elObj.openCalendar();
      await aTimeout();
      expect(elObj.calendarObj.focusedDayObj().el).not.to.equal(null);
    });

    describe('Accessibility', () => {
      it('has a heading of level 1', async () => {
        const el = await fixture(html`
          <lion-input-datepicker calendar-heading="foo"></lion-input-datepicker>
        `);
        const elObj = new DatepickerInputObject(el);
        await elObj.openCalendar();

        const hNode = elObj.overlayHeadingEl;
        const headingIsLevel1 =
          hNode.tagName === 'H1' ||
          (hNode.getAttribute('role') === 'heading' && hNode.getAttribute('aria-level') === '1');
        expect(headingIsLevel1).to.be.true;
      });

      // TODO: add translations
      it.skip('adds accessible label to invoker button', async () => {
        const el = await fixture(html`
          <lion-input-datepicker></lion-input-datepicker>
        `);
        const elObj = new DatepickerInputObject(el);
        await elObj.openCalendar();

        expect(elObj.invokerEl.getAttribute('title')).to.equal('Open date picker');
        expect(elObj.invokerEl.getAttribute('aria-label')).to.equal('Open date picker');
      });

      // TODO: add translations
      // TODO: move this functionality to GlobalOverlay
      it.skip('adds aria-haspopup="dialog" and aria-expanded="true" to invoker button', async () => {
        const el = await fixture(html`
          <lion-input-datepicker></lion-input-datepicker>
        `);
        const elObj = new DatepickerInputObject(el);

        expect(elObj.invokerEl.getAttribute('aria-haspopup')).to.equal('dialog');
        expect(elObj.invokerEl.getAttribute('aria-expanded')).to.equal('false');
      });
    });

    describe('Validators', () => {
      /**
       * Validators are the Application Developer facing API in <lion-input-datepicker>:
       * - setting restrictions on min/max/disallowed dates will be done via validators
       * - all validators will be translated under the hood to enabledDates and passed to
       *   lion-calendar
       */

      it('converts disabledDatesValidator to "disabledDates" properrty', async () => {
        const no15th = d => d.getDate() !== 15;
        const no16th = d => d.getDate() !== 16;
        const no15thOr16th = d => no15th(d) && no16th(d);
        const el = await fixture(html`
          <lion-input-datepicker .errorValidators="${[disabledDatesValidator(no15thOr16th)]}">
          </lion-input-datepicker>
        `);
        const elObj = new DatepickerInputObject(el);
        await elObj.openCalendar();

        expect(elObj.calendarEl.disabledDates).to.equal(no15thOr16th);
      });

      it('converts minDateValidator to "minDate" property', async () => {
        const myMinDate = new Date('2019/06/15');
        const el = await fixture(html`
          <lion-input-datepicker .errorValidators=${[minDateValidator(myMinDate)]}>
          </lion-input-date>`);
        const elObj = new DatepickerInputObject(el);
        await elObj.openCalendar();

        expect(elObj.calendarEl.minDate).to.equal(myMinDate);
      });

      it('converts maxDateValidator to "maxDate" property', async () => {
        const myMaxDate = new Date('2030/06/15');
        const el = await fixture(html`
          <lion-input-datepicker .errorValidators=${[maxDateValidator(myMaxDate)]}>
          </lion-input-datepicker>
        `);
        const elObj = new DatepickerInputObject(el);
        await elObj.openCalendar();

        expect(elObj.calendarEl.maxDate).to.equal(myMaxDate);
      });

      it('converts minMaxDateValidator to "minDate" and "maxDate" property', async () => {
        const myMinDate = new Date('2019/06/15');
        const myMaxDate = new Date('2030/06/15');
        const el = await fixture(html`
          <lion-input-datepicker
            .errorValidators=${[minMaxDateValidator({ min: myMinDate, max: myMaxDate })]}
          >
          </lion-input-datepicker>
        `);
        const elObj = new DatepickerInputObject(el);
        await elObj.openCalendar();

        expect(elObj.calendarEl.minDate).to.equal(myMinDate);
        expect(elObj.calendarEl.maxDate).to.equal(myMaxDate);
      });

      /**
       * Not in scope:
       * - min/max attr (like platform has): could be added in future if observers needed
       */
    });

    describe('Subclassers', () => {
      it('can allocate the picker in a different slot supported by LionField', async () => {
        class MyInputDatepicker extends LionInputDatepicker {
          constructor() {
            super();
            this._calendarSlot = 'prefix';
          }
        }
        customElements.define('my-input-datepicker', MyInputDatepicker);

        const myEl = await fixture(html`
          <my-input-datepicker> </my-input-datepicker>
        `);
        const myElObj = new DatepickerInputObject(myEl);
        expect(myElObj.invokerEl.getAttribute('slot')).to.equal('prefix');
      });
    });
  });
});
