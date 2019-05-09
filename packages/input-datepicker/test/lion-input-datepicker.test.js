/* eslint-env mocha */
/* eslint-disable no-unused-expressions, no-template-curly-in-string, no-unused-vars */
// TODO: enable linting again when proper imports can be done
/* eslint-disable */
import { expect, fixture } from '@open-wc/testing';
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
import { DatepickerInputObject } from './test-utils.js';
import { LionButton } from '../../button/src/LionButton.js';
import { LionInputDate } from '../../input-date/src/LionInputDate.js';

describe.only('<lion-input-datepicker>', () => {
  beforeEach(() => {
    localizeTearDown();
  });

  describe('Calendar Overlay', () => {
    it('implements calendar-overlay Style component', async () => {
      const el = await fixture(
        html`
          <lion-input-datepicker></lion-input-datepicker>
        `,
      );
      // TODO: use the snapshot functionality
      expect(el.querySelector('calendar-overlay')).not.to.equal(null);
      expect(el.querySelector('calendar-overlay__header')).not.to.equal(null);
      expect(el.querySelector('calendar-overlay__title')).not.to.equal(null);
      expect(el.querySelector('calendar-overlay__close-button')).not.to.equal(null);
    });

    // TODO: this should be implemented as option in the ModalDialogController?
    it('activates full screen mode on mobile screens', async () => {
      // TODO: should this be part of globalOverlayController as option?
    });

    it('has a close button, with a tooltip "close"', async () => {
      const elObj = new DatepickerInputObject(
        await fixture(
          html`
            <lion-input-datepicker></lion-input-datepicker>
          `,
        ),
      );
      // Since tooltip not ready, use title which can be progressively enhanced in extension layers.
      expect(elObj.overlayCloseButton().getAttribute('title')).to.equal('Close');
      expect(elObj.overlayCloseButton().getAttribute('aria-label')).to.equal('Close');
    });

    it('has a default title based on input label', async () => {
      const elObj = new DatepickerInputObject(
        await fixture(
          html`
            <lion-input-datepicker
              label="Pick your date"
              .modelValue="${new Date('2020-02-15')}"
            ></lion-input-datepicker>
          `,
        ),
      );
      expect(elObj.overlayHeading()).lightDom.to.equal('Pick your date');
    });

    it('can have a custom heading', async () => {
      const el = await fixture(html`
        <lion-input-datepicker
          label="Pick your date"
          calendar-heading="foo"
        ></lion-input-datepicker>
      `);
      const elObj = new DatepickerInputObject(el);
      expect(elObj.overlayHeading().textContent).to.equal('foo');
    });

    /**
     * Not in scope:
     * - centralDate can be overridden
     */
  });

  describe('Input synchronization', () => {
    it('adds invoker button for calendar overlay as suffix slot that toggles the overlay on click', async () => {
      const elObj = new DatepickerInputObject(
        await fixture(
          html`
            <lion-input-datepicker></lion-input-datepicker>
          `,
        ),
      );
      expect(elObj.invoker()).not.to.equal(null);
      expect(elObj.overlayController.isShown).to.be.false;
      elObj.invoker().click();
      expect(elObj.overlayController.isShown).to.equal(true);
    });

    // Integration test that relies on functional style 'pointer-events:none;' of lion-field
    it('disabled flag also disables the datepicker invoker', async () => {
      const elObj = new DatepickerInputObject(
        await fixture(
          html`
            <lion-input-datepicker disabled></lion-input-datepicker>
          `,
        ),
      );
      expect(elObj.overlayController.isShown).to.equal(false);
      elObj.invoker().click();
      expect(elObj.overlayController.isShown).to.equal(false);
    });

    it('syncs modelValue with lion-calendar', async () => {
      const myDate = new Date('2019/06/15');
      const myOtherDate = new Date('2003/08/18');
      const el = await fixture(
        html`
          <lion-input-datepicker .modelValue="${myDate}"></lion-input-datepicker>
        `,
      );
      const elObj = new DatepickerInputObject(el);
      elObj.invoker().click();
      expect(elObj.calendar().selectedDate).to.equal(myDate);
      elObj.calendar().selectedDate = myOtherDate;
      expect(el.modelValue).to.equal(myOtherDate);
    });

    // TODO: introduce event user-selected-date-changed
    it('closes the calendar overlay on "selected-date-changed"', async () => {
      const elObj = new DatepickerInputObject(
        await fixture(
          html`
            <lion-input-datepicker></lion-input-datepicker>
          `,
        ),
      );
      // Make sure the calendar overlay is opened
      elObj.invoker().click();
      expect(elObj.overlayController.isShown).to.equal(true);
      // Mimic user input: should fire the 'selected-date-changed' event
      elObj.calendar().selectedDate = new Date();
      expect(elObj.overlayController.isShown).to.equal(false);
    });

    // TODO: fix the Overlay system, so that the backdrop/body cannot be focused
    it('closes the calendar on [esc] key', async () => {
      const elObj = new DatepickerInputObject(
        await fixture(
          html`
            <lion-input-datepicker></lion-input-datepicker>
          `,
        ),
      );
      // Make sure the calendar overlay is opened
      elObj.invoker().click();
      expect(elObj.overlayController.isShown).to.equal(true);
      // Mimic user input: should fire the 'selected-date-changed' event
      // Make sure focus is inside the calendar/overlay
      keyUpOn(elObj.calendar(), keyCodes.escape);
      expect(elObj.overlayController.isShown).to.equal(false);
    });

    it('focuses first interactable date', async () => {
      const el = await fixture(
        html`
          <lion-input-datepicker></lion-input-datepicker>
        `,
      );
      const elObj = new DatepickerInputObject(el);
      // expect(elObj.calendar().activeElement).to.equal(elObj.calendar().querySelector(['[role="grid"]'].querySelector('[tabindex="0"]')));
      expect(elObj.calendar().activeElement).to.equal(elObj.calendarObj().centralDate());
    });

    describe('Accessibility', () => {
      it('has a heading of level 1', async () => {
        const elObj = new DatepickerInputObject(
          await fixture(
            html`
              <lion-input-datepicker heading="foo"></lion-input-datepicker>
            `,
          ),
        );
        const hNode = elObj.overlayHeading();
        const headingIsLevel1 =
          hNode.tagName === 'H1' ||
          (hNode.getAttribute('role') === 'heading' && hNode.getAttribute('aria-level') === 1);
        expect(headingIsLevel1).to.equal(true);
      });

      it('adds accessible label to invoker button', async () => {
        const elObj = new DatepickerInputObject(
          await fixture(
            html`
              <lion-input-datepicker></lion-input-datepicker>
            `,
          ),
        );
        expect(elObj.invoker().getAttribute('title')).to.equal('Open date picker');
        expect(elObj.invoker().getAttribute('aria-label')).to.equal('Open date picker');
      });

      // TODO: move this functionality to GlobalOverlay
      it('adds aria-haspopup="dialog" and aria-expanded="true" to invoker button', async () => {
        const el = await fixture(
          html`
            <lion-input-datepicker></lion-input-datepicker>
          `,
        );
        const elObj = new DatepickerInputObject(el);
        expect(elObj.invoker().getAttribute('aria-haspopup')).to.equal('dialog');
        expect(elObj.invoker().getAttribute('aria-expanded')).to.equal('true');
      });
    });

    describe('Validators', () => {
      /**
       * Validators are the Application Developer facing API in <lion-input-datepicker>:
       * - setting restrictions on min/max/disallowed dates will be done via validators
       * - all validators will be translated under the hood to enabledDates and passed to
       *   lion-calendar
       */

      it('has an disabledDates validator', async () => {
        const no15th = d => d.getDate() !== 15;
        const no16th = d => d.getDate() !== 16;
        const no15thOr16th = d => no15th(d) && no16th(d);
        const el = await fixture(html`
          <lion-input-datepicker .errorValidators="${[disabledDatesValidator(no15thOr16th)]}">
          </lion-input-datepicker>
        `);
        const elObj = new DatepickerInputObject(el);
        expect(elObj.calendar().disabledDates).to.equal(no15thOr16th);
      });

      it('translates minDateValidator to "minDate" property', async () => {
        const myMinDate = new Date('2019/06/15');
        const el = await fixture(html`
          <lion-input-datepicker
            .errorValidators=${[minDateValidator(myMinDate)]}>
          </lion-input-date>`);
        const elObj = new DatepickerInputObject(el);
        expect(elObj.calendar().minDate).to.equal(myMinDate);
      });

      it('translates maxDateValidator to "minDate" property', async () => {
        const myMaxDate = new Date('2030/06/15');
        const el = await fixture(html`
          <lion-input-datepicker .errorValidators=${[maxDateValidator(myMaxDate)]}>
          </lion-input-datepicker>
        `);
        const elObj = new DatepickerInputObject(el);
        expect(elObj.calendar().maxDate).to.equal(myMaxDate);
      });

      it('translates minMaxDateValidator to "minDate" and "maxDate" property', async () => {
        const myMinDate = new Date('2019/06/15');
        const myMaxDate = new Date('2030/06/15');
        const el = await fixture(html`
          <lion-input-datepicker
            .errorValidators=${[minMaxDateValidator({ min: myMinDate, max: myMaxDate })]}
          >
          </lion-input-datepicker>
        `);
        const elObj = new DatepickerInputObject(el);
        expect(elObj.calendar().minDate).to.equal(myMinDate);
        expect(elObj.calendar().maxDate).to.equal(myMaxDate);
      });

      /**
       * Not in scope:
       * - min/max attr (like platform has): could be added in future if observers needed
       */
    });

    describe('Subclassers', () => {
      // TODO: move to validate/validators
      it('can allocate the picker in a different slot supported by LionField', async () => {
        class MyInputDatepicker extends LionInputDatepicker {
          constructor() {
            super();
            this._calendarSlot = 'prefix';
          }
        }
        customElements.define('my-input-datepicker', MyInputDatePicker);

        const myEl = await fixture(
          html`
            <my-input-datepicker> </my-input-datepicker>
          `,
        );
        const myElObj = new DatepickerInputObject(myEl);
        expect(myElObj.invoker().getAttribute('slot')).to.equal('prefix');
      });
    });
  });
});
