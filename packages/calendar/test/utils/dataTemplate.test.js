/* eslint-disable no-unused-expressions */
import { expect, fixture } from '@open-wc/testing';

import { createMultipleMonth } from '../../src/utils/createMultipleMonth.js';
import { dataTemplate } from '../../src/utils/dataTemplate.js';
import { weekdaysShort, weekdays } from '../test-utils.js';

// eslint-disable-next-line camelcase
import snapshot_enGB_Sunday_201812 from './snapshots/monthTemplate_en-GB_Sunday_2018-12.js';

describe('dataTemplate', () => {
  it('renders one month table', async () => {
    const date = new Date('2018/12/01');
    const month = createMultipleMonth(date, { firstDayOfWeek: 0 });
    const el = await fixture(
      dataTemplate(month, {
        focusDate: date,
        weekdaysShort: weekdaysShort['en-GB'].Sunday,
        weekdays: weekdays['en-GB'].Sunday,
      }),
    );

    expect(el).dom.to.equal(snapshot_enGB_Sunday_201812);
  });
});
