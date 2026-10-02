/**
 * config/weddingData.ts
 *
 * Every piece of wedding content and UI copy lives here.
 *
 * - Multi-line copy uses "\n" to mark the editorial line breaks; scenes split
 *   on it to reveal each line individually, and metadata joins it back into a
 *   single sentence (lib/text/lines.ts).
 * - `events` drives the Date Reveal (events[0]), every Event scene, the live
 *   countdowns, Google Maps embeds, directions links, .ics calendar files and
 *   the JSON-LD structured data. Up to `maxEvents` entries are rendered.
 * - `timezone` is used to interpret the event dates (written as local wall
 *   clock time at the venue) so countdowns and calendars are correct for
 *   guests anywhere in the world.
 */

export type WeddingEvent = {
  id: number;
  title: string;
  /** Local wall-clock time at the venue, ISO format without offset. */
  date: string;
  /** "<date>, <time>" — the comma separates the two displayed lines. */
  displayDate: string;
  countdownLabel: string;
  venue: string;
  mapQuery: string;
  mapEmbedQuery: string;
};

export const weddingData = {
  couple: {
    partnerOne: "Zoheb",
    partnerTwo: "Muskan",

    initials: "Z & M",

    partnerOneParents: "S/O Mrs. Aqila &\nMr. Aziz Mukadam",

    partnerTwoParents: "D/O Mrs. Arifa &\nMr. Mansoor Mukadam",
  },

  text: {
    bismillahLine: "In the name of Allah,\nthe Most Gracious,\nthe Most Merciful",

    bismillahAlt: "Bismillah calligraphy — In the name of Allah, the Most Gracious, the Most Merciful",

    title: "With the grace of Almighty Allah,\nwe cordially invite you\nto celebrate this union.",

    revealPrompt: "Tap to reveal the date",

    weddingFunctionsTitle: "Wedding Functions",

    closingInvitation: "Your presence and prayers\nare the greatest gifts\nwe could receive.",

    complimentsTitle: "With Best Compliments From",

    complimentsSubtext: "The families, relatives and friends",

    ampersand: "&",

    envelopePrompt: "Tap to open",
    envelopeAriaLabel: "Open the wedding invitation envelope",

    scrollHint: "Scroll",

    revealAriaLabel: "Reveal the wedding date",
    revealedDateLabel: "Wedding date",

    preloaderLabel: "Preparing your invitation",

    soundOnLabel: "Mute background music",
    soundOffLabel: "Play background music",

    countdown: {
      days: "Days",
      hours: "Hours",
      minutes: "Minutes",
      seconds: "Seconds",
      arrived: "The day has arrived",
    },

    buttons: {
      addToCalendar: "Add to Calendar",
      getDirections: "Get Directions",
    },

    mapTitlePrefix: "Map showing the venue for",

    calendarDescription: "With the grace of Almighty Allah, you are cordially invited.",
  },

  /** Venue timezone used to interpret every `event.date`. */
  timezone: {
    iana: "Asia/Kolkata",
    offset: "+05:30",
  },

  /** Default length of each function in calendar entries (hours). */
  calendarDurationHours: 4,

  maxEvents: 4,

  events: [
    {
      id: 1,

      title: "NIKAH CEREMONY",

      date: "2026-12-27T11:00:00",

      displayDate: "27 Dec 2026, 11:00 AM onwards",

      countdownLabel: "Until the Nikah",

      venue: "Captain House, Dapoli, Maharashtra-415712",

      mapQuery: "Captain House, Dapoli, Maharashtra 415712",

      mapEmbedQuery: "Captain House, Dapoli, Maharashtra 415712",
    },

    {
      id: 2,

      title: "WALIMA RECEPTION",

      date: "2026-12-29T11:00:00",

      displayDate: "29 Dec 2026, 11:00 AM onwards",

      countdownLabel: "Until the Walima",

      venue: "Royal Banquet Hall, JK Files, MIDC Road, Ratnagiri, Maharashtra - 415639",

      mapQuery: "Royal Banquet Hall, MIDC Road, Ratnagiri, Maharashtra 415639",

      mapEmbedQuery: "Royal Banquet Hall, MIDC Road, Ratnagiri, Maharashtra 415639",
    },
  ] satisfies WeddingEvent[],

  footer: {
    credit: "designed by @makemyposter_",

    whatsapp:
      "https://wa.me/917666950814?text=Hi%20%40makemyposter_%2C%20I%20saw%20your%20wedding%20invitation%20website%20design%20and%20would%20like%20to%20get%20one%20created%20for%20my%20upcoming%20wedding.%20Could%20you%20please%20share%20the%20details%2C%20pricing%2C%20and%20process%3F",

    creditAriaLabel: "Contact @makemyposter_ on WhatsApp (opens in a new tab)",
  },
};

export type WeddingData = typeof weddingData;
