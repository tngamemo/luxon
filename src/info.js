import { DateTime } from './datetime';
import { Settings } from './settings';
import { Locale } from './impl/locale';
import { Util } from './impl/util';

/**
 * The Info class contains static methods for retrieving general time and date related data. For example, it has methods for finding out if a time zone has a DST, for listing the months in any supported locale, and for discovering which of Luxon features are available in the current environment.
 */
export class Info {
  /**
   * Return whether the specified zone contains a DST.
   * @param {string|Zone} [zone='local'] - Zone to check. Defaults to the environment's local zone.
   * @return {boolean}
   */
  static hasDST(zone = Settings.defaultZone) {
    const proto = DateTime.local()
      .setZone(zone)
      .set({ month: 12 });

    return !zone.universal && proto.offset !== proto.set({ month: 6 }).offset;
  }

  /**
   * Return an array of standalone month names.
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DateTimeFormat
   * @param {string} [length='long'] - the length of the month representation, such as "numeric", "2-digit", "narrow", "short", "long"
   * @param {object} opts - options
   * @param {string} [opts.locale] - the locale code
   * @param {string} [opts.numberingSystem=null] - the numbering system
   * @param {string} [opts.outputCalendar='gregory'] - the calendar
   * @example Info.months()[0] //=> 'January'
   * @example Info.months('short')[0] //=> 'Jan'
   * @example Info.months('numeric')[0] //=> '1'
   * @example Info.months('short', { locale: 'fr-CA' } )[0] //=> 'janv.'
   * @example Info.months('numeric', { locale: 'ar' })[0] //=> '١'
   * @example Info.months('long', { outputCalendar: 'islamic' })[0] //=> 'Rabiʻ I'
   * @return {[string]}
   */
  static months(
    length = 'long',
    { locale = null, numberingSystem = null, outputCalendar = 'gregory' } = {}
  ) {
    return Locale.create(locale, numberingSystem, outputCalendar).months(length);
  }

  /**
   * Return an array of format month names.
   * Format months differ from standalone months in that they're meant to appear next to the day of the month. In some languages, that
   * changes the string.
   * See {@link months}
   * @param {string} [length='long'] - the length of the month representation, such as "numeric", "2-digit", "narrow", "short", "long"
   * @param {object} opts - options
   * @param {string} [opts.locale] - the locale code
   * @param {string} [opts.numbering=null] - the numbering system
   * @param {string} [opts.outputCalendar='gregory'] - the calendar
   * @return {[string]}
   */
  static monthsFormat(
    length = 'long',
    { locale = null, numberingSystem = null, outputCalendar = 'gregory' } = {}
  ) {
    return Locale.create(locale, numberingSystem, outputCalendar).months(length, true);
  }

  /**
   * Return an array of standalone week names.
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DateTimeFormat
   * @param {string} [length='long'] - the length of the month representation, such as "narrow", "short", "long".
   * @param {object} opts - options
   * @param {string} [opts.locale] - the locale code
   * @param {string} [opts.numbering=null] - the numbering system
   * @param {string} [opts.outputCalendar='gregory'] - the calendar
   * @example Info.weekdays()[0] //=> 'Monday'
   * @example Info.weekdays('short')[0] //=> 'Mon'
   * @example Info.weekdays('short', 'fr-CA')[0] //=> 'lun.'
   * @example Info.weekdays('short', 'ar')[0] //=> 'الاثنين'
   * @return {[string]}
   */
  static weekdays(length = 'long', { locale = null, numberingSystem = null } = {}) {
    return Locale.create(locale, numberingSystem, null).weekdays(length);
  }

  /**
   * Return an array of format week names.
   * Format weekdays differ from standalone weekdays in that they're meant to appear next to more date information. In some languages, that
   * changes the string.
   * See {@link weekdays}
   * @param {string} [length='long'] - the length of the month representation, such as "narrow", "short", "long".
   * @param {object} opts - options
   * @param {string} [opts.locale=null] - the locale code
   * @param {string} [opts.numbering=null] - the numbering system
   * @param {string} [opts.outputCalendar='gregory'] - the calendar
   * @return {[string]}
   */
  static weekdaysFormat(length = 'long', { locale = null, numberingSystem = null } = {}) {
    return Locale.create(locale, numberingSystem, null).weekdays(length, true);
  }

  /**
   * Return an array of meridiems.
   * @param {object} opts - options
   * @param {string} [opts.locale] - the locale code
   * @example Info.meridiems() //=> [ 'AM', 'PM' ]
   * @example Info.meridiems('de') //=> [ 'vorm.', 'nachm.' ]
   * @return {[string]}
   */
  static meridiems({ locale = null } = {}) {
    return Locale.create(locale).meridiems();
  }

  /**
   * Return an array of eras, such as ['BC', 'AD']. The locale can be specified, but the calendar system is always Gregorian.
   * @param {string} [length='short'] - the length of the era representation, such as "short" or "long".
   * @param {object} opts - options
   * @param {string} [opts.locale] - the locale code
   * @example Info.eras() //=> [ 'BC', 'AD' ]
   * @example Info.eras('long') //=> [ 'Before Christ', 'Anno Domini' ]
   * @example Info.eras('long', 'fr') //=> [ 'avant Jésus-Christ', 'après Jésus-Christ' ]
   * @return {[string]}
   */
  static eras(length = 'short', { locale = null } = {}) {
    return Locale.create(locale, null, 'gregory').eras(length);
  }

  /**
   * Return the set of available features in this environment.
   * Some features of Luxon are not available in all environments. For example, on older browsers, timezone support is not available. Use this function to figure out if that's the case.
   * Keys:
   * * `timezones`: whether this environment supports IANA timezones
   * * `intlTokens`: whether this environment supports internationalized token-based formatting/parsing
   * * `intl`: whether this environment supports general internationalization
   * @example Info.feature() //=> { intl: true, intlTokens: false, timezones: true }
   * @return {object}
   */
  static features() {
    let intl = false,
      intlTokens = false,
      zones = false;

    if (Util.hasIntl()) {
      intl = true;
      intlTokens = Util.hasFormatToParts();

      try {
        zones =
          new Intl.DateTimeFormat('en', { timeZone: 'America/New_York' }).resolvedOptions()
            .timeZone === 'America/New_York';
      } catch (e) {
        zones = false;
      }
    }

    return { intl, intlTokens, zones };
  }
}
